// 駅エリア（クラスタ）に都道府県・市区町村を付け、slug を確定する。
// 実行順: build-stations.mjs → fix-null-values.mjs → assign-pref.mjs（このファイルが最後）
//
// 出典: 国土地理院 逆ジオコーダ（LonLatToAddress）と市区町村コード表（maps.gsi.go.jp/js/muni.js）。
// 座標の範囲などから県を推測して埋めることはしない。取れなかった駅は pref=null のまま（駅ページを作らない）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATIONS = path.join(ROOT, "lib/stations/stations.json");
const CACHE_DIR = process.env.STATIONS_CACHE || path.join(ROOT, "automation/stations/.cache");
fs.mkdirSync(CACHE_DIR, { recursive: true });
const GSI_CACHE = path.join(CACHE_DIR, "gsi-cache.json");
const MUNI_JS = path.join(CACHE_DIR, "muni.js");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 都道府県コード → slug（lib/areas/prefectures.ts を正とする）
const prefTs = fs.readFileSync(path.join(ROOT, "lib/areas/prefectures.ts"), "utf8");
const prefByCode = Object.fromEntries(
  [...prefTs.matchAll(/code:\s*'(\d{2})'[^}]*?slug:\s*'([a-z]+)'/g)].map((m) => [m[1], m[2]]),
);
if (Object.keys(prefByCode).length !== 47) throw new Error(`都道府県コード表が47件でない: ${Object.keys(prefByCode).length}`);

// 市区町村コード → 市区町村名
if (!fs.existsSync(MUNI_JS)) {
  const res = await fetch("https://maps.gsi.go.jp/js/muni.js");
  if (!res.ok) throw new Error(`muni.js 取得失敗 ${res.status}`);
  fs.writeFileSync(MUNI_JS, await res.text());
}
const muniName = {};
for (const m of fs.readFileSync(MUNI_JS, "utf8").matchAll(/MUNI_ARRAY\["(\d+)"\]\s*=\s*'([^']*)'/g)) {
  const [, , code, name] = m[2].split(",");
  muniName[String(code).padStart(5, "0")] = (name || "").replace(/\s|　/g, "");
}

const cache = fs.existsSync(GSI_CACHE) ? JSON.parse(fs.readFileSync(GSI_CACHE, "utf8")) : {};
const stations = JSON.parse(fs.readFileSync(STATIONS, "utf8"));
let asked = 0, errors = 0;
for (const st of Object.values(stations)) {
  const key = `${st.lat},${st.lng}`;
  if (!(key in cache)) {
    try {
      const r = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${st.lat}&lon=${st.lng}`);
      const j = r.ok ? await r.json() : null;
      cache[key] = j?.results?.muniCd ? String(j.results.muniCd).padStart(5, "0") : null;
    } catch {
      errors++;
      continue; // キャッシュしない（次回やり直す）
    }
    asked++;
    if (asked % 50 === 0) fs.writeFileSync(GSI_CACHE, JSON.stringify(cache));
    await sleep(300);
  }
  const cd = cache[key];
  st.muniCd = cd;
  st.pref = cd ? prefByCode[cd.slice(0, 2)] || null : null;
  st.cityName = cd ? muniName[cd] || null : null;
}
fs.writeFileSync(GSI_CACHE, JSON.stringify(cache));

// 同じ県・同じ名前で 1.5km 以内の駅エリアは1つにまとめる（例: TX浅草と銀座線浅草、JR伊丹と阪急伊丹）。
// 検索する人にとっては同じ「浅草」「伊丹」なので、別ページにすると同じ店が重複した薄いページになる。
const STORE_STATIONS = path.join(ROOT, "lib/stations/storeStations.json");
const storeStations = JSON.parse(fs.readFileSync(STORE_STATIONS, "utf8"));
const distM = (a, b) => {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const mergedInto = {};
const byName = {};
for (const st of Object.values(stations)) if (st.pref) (byName[`${st.pref}/${st.name}`] ||= []).push(st);
for (const list of Object.values(byName)) {
  if (list.length < 2) continue;
  const keep = list[0];
  for (const other of list.slice(1)) {
    if (distM(keep, other) > 1500) continue;
    keep.aliases = [...new Set([...keep.aliases, ...other.aliases])].filter((n) => n !== keep.name);
    keep.lines = [...keep.lines, ...other.lines];
    keep.groups = [...(keep.groups || []), ...(other.groups || [])];
    mergedInto[other.id] = keep.id;
    delete stations[other.id];
  }
}
const remap = (arr, key) => {
  const out = new Map();
  for (const x of arr || []) {
    const id = mergedInto[x.clusterId] || x.clusterId;
    const prev = out.get(id);
    if (!prev || (key && x[key] != null && (prev[key] == null || x[key] < prev[key]))) out.set(id, { ...x, clusterId: id });
  }
  return [...out.values()];
};
for (const v of Object.values(storeStations)) {
  v.stated = remap(v.stated, "walkMin");
  v.nearby = remap(v.nearby, "meters");
}
fs.writeFileSync(STORE_STATIONS, JSON.stringify(storeStations, null, 2) + "\n");
console.log(`同名・近接でまとめた駅エリア ${Object.keys(mergedInto).length}`);

// slug を確定: {pref}/{代表名}。同じ県に同名の駅エリアが残れば {代表名}-{市区町村名}
const groups = {};
for (const st of Object.values(stations)) {
  if (!st.pref) { st.slug = null; continue; }
  (groups[`${st.pref}/${st.name}`] ||= []).push(st);
}
const collisions = [];
for (const [slug, list] of Object.entries(groups)) {
  if (list.length === 1) { list[0].slug = slug; continue; }
  for (const st of list) st.slug = `${st.pref}/${st.name}-${st.cityName || st.muniCd}`;
  collisions.push(`${slug} → ${list.map((s) => s.slug).join(" / ")}`);
}
fs.writeFileSync(STATIONS, JSON.stringify(stations, null, 2) + "\n");

const all = Object.values(stations);
console.log(`駅エリア ${all.length} / GSI 問い合わせ ${asked} / 通信エラー ${errors} / pref null ${all.filter((s) => !s.pref).length}`);
console.log(`同名の衝突 ${collisions.length}`);
for (const c of collisions) console.log("  " + c);
