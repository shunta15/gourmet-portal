#!/usr/bin/env node
/**
 * add-article-store.mjs
 *
 * 新しく作った記事（/feature/<記事ID>）を、店舗ページ（/restaurant/<店ID>）にもするための「店のデータ」の段。
 * local-pipeline.sh の記事生成のあとに、既定では無効のスイッチ（MACHINOWA_STORE_PAGE=1）で呼ぶ。
 * 店の追加になるので、オーナーの承認があるまでスイッチは入れない（automation/申し送り.md）。
 *
 * やること（git は一切触らない。commit / push は呼び出し側＝claude の手順 7b が行う）:
 *   1. automation/stores500/map.json に {articleId, sheetName, mapsUrl} を追加（記事IDの完全一致で upsert・NFC）
 *   2. automation/stores500/gbp/<記事ID>.json が無ければ、Google マップの店舗パネルを読む
 *      （scripts/fetch-gbp-details.mjs --batch --offset <i> --limit 1 / Playwright。有料APIは使わない。1件・6〜10秒・CAPTCHA が出たら即停止）
 *   3. automation/stores500/build-stores.mjs を実行（lib/articleStores.ts・lib/articleRegions.ts・lib/geo.ts・
 *      automation/stores500/ids.json ほかを作り直す。ID は ids.json で固定なので、既存の店は変わらない）
 *   4. 既存の店のデータが 1 つでも変わっていたら（生成器のずれ）、出力を全部元に戻して止まる
 *   5. 追加した店 ID を出力。除外された（閉業・住所の食い違い等）場合はその理由を出す（記事だけが残る）
 *
 * 触らないもの: 1 店 1 ページの表（lib/portal/noren/onePage.ts）・写真の情報（lib/portal/photoFeature/photoMeta.generated.ts）。
 *   これらは lib/portal の持ち主の領分。足りないものは automation/stores500/onepage-status.mjs が数えて出す。
 *
 * 使い方:
 *   node automation/stores500/add-article-store.mjs --id=<記事ID> --sheetName=<スプシD列の店名> --mapsUrl=<Maps URL> [--no-fetch] [--dry]
 *     --no-fetch  GBP を取りに行かない（gbp/<記事ID>.json が既にあるときの試験用）
 *     --dry       何も書かない（map.json に追加する内容と、GBP が必要かだけ出す）
 *
 * 終了コード: 0=店を追加した / 3=GBP を取れなかった（記事だけで続行してよい） / 4=build-stores が除外した（同左） /
 *            5=生成器のずれを検知して元に戻した / 2=使い方の誤り・記事が無い
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const abs = (...p) => path.join(ROOT, ...p);
const nfc = (s) => (s == null ? s : String(s).normalize("NFC"));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...rest] = a.replace(/^--/, "").split("=");
    return [k, rest.length ? rest.join("=") : true];
  }),
);
const id = nfc(args.id);
const sheetName = nfc(args.sheetName) || "";
const rawUrl = typeof args.mapsUrl === "string" ? args.mapsUrl : "";
const DRY = !!args.dry;
const NO_FETCH = !!args["no-fetch"];

const say = (m) => console.error(`[add-article-store] ${m}`);
const die = (code, m) => { say(m); process.exit(code); };

if (!id || !rawUrl) die(2, "usage: --id=<記事ID> --sheetName=<店名> --mapsUrl=<Maps URL> [--no-fetch] [--dry]");

// ---- 記事が実在すること（NFC 完全一致）
const featSrc = readFileSync(abs("lib/teleapo-features.ts"), "utf8");
const articleIds = new Set([...featSrc.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)].map((m) => nfc(m[1])));
if (!articleIds.has(id)) die(2, `記事ID「${id}」が lib/teleapo-features.ts に無い`);

// ---- Maps URL: cid があれば正準形に（map.json の既存形式 https://maps.google.com/?cid=NNN）
const cid = (rawUrl.match(/[?&]cid=(\d+)/) || [])[1];
const mapsUrl = cid ? `https://maps.google.com/?cid=${cid}` : rawUrl;

// ---- 1. map.json の upsert
const mapPath = abs("automation/stores500/map.json");
const map = JSON.parse(readFileSync(mapPath, "utf8"));
let index = map.findIndex((m) => nfc(m.articleId) === id);
const mapChanged = index === -1 || map[index].mapsUrl !== mapsUrl || nfc(map[index].sheetName) !== sheetName;
if (index === -1) {
  map.push({ articleId: id, sheetName, mapsUrl });
  index = map.length - 1;
} else {
  map[index] = { ...map[index], articleId: map[index].articleId, sheetName: sheetName || map[index].sheetName, mapsUrl };
}
const gbpFile = abs("automation/stores500/gbp", `${id}.json`);
const needGbp = !existsSync(gbpFile);

if (DRY) {
  console.log(JSON.stringify({ dry: true, articleId: id, mapEntry: map[index], mapIndex: index, mapChanged, needGbpFetch: needGbp }, null, 2));
  process.exit(0);
}

// ---- 出力ファイルの退避（ずれを検知したら元に戻す）
const OUTPUTS = [
  "lib/articleStores.ts", "lib/articleRegions.ts", "lib/geo.ts",
  "automation/stores500/ids.json", "automation/stores500/excluded.json", "automation/stores500/tag-evidence.json",
  "automation/stores500/warnings.json", "automation/stores500/region-mismatch.json", "automation/stores500/map.json",
];
const backup = new Map(OUTPUTS.map((f) => [f, existsSync(abs(f)) ? readFileSync(abs(f), "utf8") : null]));
const restoreAll = () => {
  for (const [f, body] of backup) if (body !== null) writeFileSync(abs(f), body);
};

const importFresh = async (rel) => import(pathToFileURL(abs(rel)).href + `?t=${Date.now()}${Math.random()}`);
const storesBefore = (await importFresh("lib/articleStores.ts")).ARTICLE_STORES;

if (mapChanged) writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n");

// ---- 2. GBP（無料。Playwright で店舗パネルを読む）
if (needGbp) {
  if (NO_FETCH) { restoreAll(); die(3, "gbp/<記事ID>.json が無く、--no-fetch なので取りに行かない"); }
  say(`GBP を取得: index=${index}（Playwright・1件・6〜10秒）`);
  const r = spawnSync("node", ["scripts/fetch-gbp-details.mjs", "--batch", "--offset", String(index), "--limit", "1"], {
    cwd: ROOT, encoding: "utf8", timeout: 240000,
  });
  if (r.stderr) process.stderr.write(r.stderr);
  if (!existsSync(gbpFile)) { restoreAll(); die(3, "GBP を取得できなかった（CAPTCHA・取得失敗）。店ページ化せず記事だけで続行する"); }
}

// ---- 3. build-stores
const b = spawnSync("node", ["automation/stores500/build-stores.mjs"], { cwd: ROOT, encoding: "utf8", timeout: 300000 });
if (b.status !== 0) { restoreAll(); die(5, `build-stores.mjs が失敗（exit ${b.status}）。出力を元に戻した: ${(b.stderr || "").slice(0, 400)}`); }

// ---- 4. 既存の店が変わっていないこと（生成器のずれの検知）
const storesAfter = (await importFresh("lib/articleStores.ts")).ARTICLE_STORES;
const before = new Map(storesBefore.map((s) => [s.id, JSON.stringify(s)]));
const drift = [];
for (const s of storesAfter) {
  if (before.has(s.id) && before.get(s.id) !== JSON.stringify(s)) drift.push(s.id);
}
for (const bid of before.keys()) if (!storesAfter.some((s) => s.id === bid)) drift.push(`${bid}(消えた)`);
if (drift.length) {
  restoreAll();
  die(5, `既存の店 ${drift.length} 件のデータが変わった（生成器のずれ）: ${drift.slice(0, 8).join(", ")} … 出力を全部元に戻した。店ページ化せず記事だけで続行する`);
}

// ---- 5. 結果
const added = storesAfter.filter((s) => !before.has(s.id));
const ids = JSON.parse(readFileSync(abs("automation/stores500/ids.json"), "utf8"));
const excluded = JSON.parse(readFileSync(abs("automation/stores500/excluded.json"), "utf8")).find((e) => nfc(e.articleId) === id);
if (!added.length) {
  const why = excluded ? `build-stores が除外: ${excluded.reason}` : "店データに出なかった（理由は automation/stores500/warnings.json / excluded.json）";
  console.log(JSON.stringify({ ok: false, articleId: id, storeId: ids[id] ?? null, reason: why }));
  die(4, `${why}。記事だけが残る（出力は元に戻さず、map.json / gbp にだけ記録が残る）`);
}
if (added.length !== 1 || nfc(added[0].featureId) !== id) {
  restoreAll();
  die(5, `追加された店が想定と違う（${added.map((s) => `${s.id}/${s.featureId}`).join(", ")}）。出力を全部元に戻した`);
}
console.log(JSON.stringify({
  ok: true, articleId: id, storeId: added[0].id, name: added[0].name,
  changedFiles: OUTPUTS.filter((f) => existsSync(abs(f)) && readFileSync(abs(f), "utf8") !== backup.get(f)),
  nextForOnePage: `lib/portal/noren/onePage.ts の ONE_PAGE_SHOP_OF_FEATURE に "${id}": "${added[0].id}" を足す（lib/portal の持ち主の作業・automation/stores500/onepage-status.mjs が行を出す）`,
}, null, 2));
