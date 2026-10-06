#!/usr/bin/env node
/**
 * 「おまかせ提案」の数え直し。店の表（lib/portal/omakaseRows.ts。画面と同じ関数）を作り、
 *   1. 質問ごとの選択肢の店数
 *   2. 気分・誰とが結び付けた先（業態の表記と当てはまる店の例。どの気分にも入らない業態の一覧）
 *   3. 4 問の全組み合わせのうち、結果が 0 軒・1〜2 軒・3 軒以上になる数
 * を出す。実行: node --env-file=.env.local proto-portal/count-omakase.mjs [--md 出力.md]
 *   - 店は本番と同じ getAllRestaurants()（.env.local の中身は表示しない）。Node 22.18 以降（TypeScript をそのまま読み込む）。
 *   - こだわり条件で画面に出す設備（カウンター・個室・子連れ）は、lib/portal/facets.ts と同じ基準（記載あり 10 店以上＋検査済み）で決める。
 *     facets.ts は server-only で node から読めないため、ここでは数え直して同じ基準を当てている。
 */
import { register } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
register(
  "data:text/javascript," +
    encodeURIComponent(`
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
const ROOT = ${JSON.stringify(ROOT)};
export async function resolve(s, c, n) {
  if (s.startsWith("@/")) {
    const base = path.join(ROOT, s.slice(2));
    for (const cand of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return n(pathToFileURL(cand).href, c);
    }
  }
  try { return await n(s, c); } catch (e) {
    if (s.startsWith(".") && !/\\.[a-z]+$/.test(s)) {
      try { return await n(s + ".ts", c); } catch { return n(s + "/index.ts", c); }
    }
    throw e;
  }
}
`),
);

const args = process.argv.slice(2);
const MD = args.includes("--md") ? args[args.indexOf("--md") + 1] : null;

const { getAllRestaurants } = await import(path.join(ROOT, "lib/db/restaurants.ts"));
const { facetRowOf } = await import(path.join(ROOT, "lib/portal/facetRow.ts"));
const { BOOL_FACETS, BUDGET_BANDS } = await import(path.join(ROOT, "lib/portal/facetDefs.ts"));
const { buildOmakaseData } = await import(path.join(ROOT, "lib/portal/omakaseRows.ts"));
const D = await import(path.join(ROOT, "lib/portal/omakaseDefs.ts"));
const { prefOfGourmetRegion } = await import(path.join(ROOT, "lib/areas/gourmet.ts"));
const storeStations = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/stations/storeStations.json"), "utf8"));

const shops = await getAllRestaurants();
const frows = shops.map((r) => ({ id: r.id, row: facetRowOf(r, storeStations[r.id]) }));

// buildFacetPayload（lib/portal/facets.ts）と同じ基準で、画面に出す設備と予算の帯を決める
const VERIFIED = ["private", "parking", "takeout", "terrace", "counter", "smokefree", "kids"];
const shown = [];
for (const f of ["counter", "private", "kids"]) {
  const yes = frows.filter(({ row }) => row.has.includes(f)).length;
  if (VERIFIED.includes(f) && yes >= 10) shown.push(f);
}
const bandN = [0, 0, 0, 0, 0];
let judged = 0;
for (const { row } of frows) if (row.budget !== null) (judged++, bandN[row.budget]++);
const shownBands = judged >= 100 ? bandN.map((n, i) => (n >= 10 ? i : -1)).filter((i) => i >= 0) : [];
const facetRows = {};
for (const { id, row } of frows) {
  let mask = 0;
  BOOL_FACETS.forEach((f, i) => {
    const v = ["lunch", "late", "morning", "sunday", "walk5", "seats20", "seats50"].includes(f) ? row[f] : f === "reserve" ? row.reserve : row.has.includes(f);
    if (v === true) mask |= 1 << i;
  });
  facetRows[id] = [row.budget === null ? -1 : row.budget, mask];
}

const data = buildOmakaseData({ restaurants: shops, facetRows, shown, shownBands, prefOfRegion: prefOfGourmetRegion });
const rows = data.rows;

const out = [];
const log = (s = "") => {
  out.push(s);
  console.log(s);
};

log(`全店 ${rows.length} 店 / 画面に出す設備: ${shown.join(", ")} / 画面に出す予算の帯: ${shownBands.join(",")}（予算が判定できた店 ${judged}）`);
log("");

/* 1. 選択肢ごとの店数 */
const none = { region: null, pref: null, who: null, band: null, mood: null };
const oc = D.optionCounts(rows, none);
log("## 1. 選択肢ごとの店数（ほかの答えをかけない）");
log("");
log("### どこで（地方）");
log("| 地方 | 店数 | 県ごと（店数） |");
log("|---|---:|---|");
const ocPref = {};
for (const reg of D.OMAKASE_REGIONS) {
  const o = D.optionCounts(rows, { ...none, region: reg.slug });
  ocPref[reg.slug] = o.where.pref;
  const prefs = D.prefsOfRegion(reg.slug).map((i) => `${D.OMAKASE_PREFS[i].short} ${o.where.pref[D.OMAKASE_PREFS[i].slug] ?? 0}`);
  log(`| ${reg.label} | ${oc.where.region[reg.slug] ?? 0} | ${prefs.join(" / ")} |`);
}
const noPref = rows.filter((r) => r[1] < 0).length;
log(`\n県が分からない店（どの地方にも入らない）: ${noPref} 店 / どこでも: ${oc.where.any} 店`);
log("");
log("### 誰と");
log("| 選択肢 | 店数 | 根拠の事実（店数） |");
log("|---|---:|---|");
for (const w of D.WHO_OPTIONS) {
  const parts = w.atoms.map((a) => `${D.FACT_ATOMS.find((x) => x.id === a).label} ${rows.filter((r) => r[4] & D.ATOM_BIT[a]).length}`);
  log(`| ${w.label} | ${oc.who.who[w.id] ?? 0} | ${parts.join(" / ")} |`);
}
log(`\nどれでも: ${oc.who.any} 店 / どの選択肢にも当てはまらない店: ${rows.filter((r) => D.WHO_OPTIONS.every((w) => (r[4] & D.WHO_MASK[w.id]) === 0)).length} 店`);
log("");
log("### 予算");
log("| 帯 | 店数 |");
log("|---|---:|");
for (const b of shownBands) log(`| ${BUDGET_BANDS[b].label} | ${oc.budget.band[b] ?? 0} |`);
log(`\n予算が分かる店 ${rows.filter((r) => r[2] >= 0).length} 店 / 不明 ${rows.filter((r) => r[2] < 0).length} 店（予算を選ぶと不明の店は含まれない）`);
log("");
log("### 気分");
log("| 選択肢 | 店数 | 結び付けた業態の語 |");
log("|---|---:|---|");
for (const m of D.MOODS) log(`| ${m.label} | ${oc.mood.mood[m.id] ?? 0} | ${m.words.join("・")} |`);
const noMood = shops.filter((r) => D.moodMaskOf(r.cuisine) === 0);
const multiMood = shops.filter((r) => D.MOODS.filter((m, i) => D.moodMaskOf(r.cuisine) & (1 << i)).length > 1);
log(`\nどの気分にも入らない店: ${noMood.length} 店 / 2 つ以上の気分に入る店: ${multiMood.length} 店`);
log("");

/* 2. 結び付けの確認用 */
log("## 2. 結び付けの確認");
log("");
log("### 気分ごとの業態の表記（当てはまった店の cuisine の種類と店数）");
for (const m of D.MOODS) {
  const c = new Map();
  for (const r of shops) if (D.moodMaskOf(r.cuisine) & D.MOOD_BIT[m.id]) c.set(r.cuisine, (c.get(r.cuisine) ?? 0) + 1);
  log(`- ${m.label}（${[...c.values()].reduce((a, b) => a + b, 0)} 店）: ${[...c.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => (v > 1 ? `${k}×${v}` : k)).join(" / ")}`);
}
log("");
{
  const c = new Map();
  for (const r of noMood) c.set(r.cuisine, (c.get(r.cuisine) ?? 0) + 1);
  log(`### どの気分にも入らない業態（${noMood.length} 店）`);
  log([...c.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => (v > 1 ? `${k}×${v}` : k)).join(" / "));
  log("");
}

/* 3. 全組み合わせ */
function tally(whereVals, whoVals, bandVals, moodVals) {
  let n0 = 0, n12 = 0, n3 = 0, total = 0;
  for (const w of whereVals) for (const who of whoVals) for (const b of bandVals) for (const m of moodVals) {
    const st = { ...w, who, band: b, mood: m };
    let c = 0;
    for (const r of rows) if (D.rowMatches(r, st)) c++;
    total++;
    if (c === 0) n0++;
    else if (c <= 2) n12++;
    else n3++;
  }
  return { total, n0, n12, n3 };
}
const WHERE_ANY = [{ region: "all", pref: null }];
const WHERE_REG = D.OMAKASE_REGIONS.map((r) => ({ region: r.slug, pref: null }));
const WHERE_PREF = D.OMAKASE_PREFS.map((p) => ({ region: D.REGION_OF_PREF[D.PREF_INDEX[p.slug]], pref: p.slug }));
const WHO_SPEC = D.WHO_OPTIONS.map((w) => w.id);
const BAND_SPEC = shownBands;
const MOOD_SPEC = D.MOODS.map((m) => m.id);
const fmt = (t) => `${t.total} 通り: 0 軒 ${t.n0}（${((t.n0 / t.total) * 100).toFixed(1)}%）/ 1〜2 軒 ${t.n12}（${((t.n12 / t.total) * 100).toFixed(1)}%）/ 3 軒以上 ${t.n3}（${((t.n3 / t.total) * 100).toFixed(1)}%）`;
log("## 3. 4 問の組み合わせ（結果が出る軒数）");
log("");
const T = {
  all: tally([...WHERE_ANY, ...WHERE_REG, ...WHERE_PREF], [...WHO_SPEC, "any"], [...BAND_SPEC, "any"], [...MOOD_SPEC, "any"]),
  regionOnly: tally([...WHERE_ANY, ...WHERE_REG], [...WHO_SPEC, "any"], [...BAND_SPEC, "any"], [...MOOD_SPEC, "any"]),
  strictAll: tally([...WHERE_REG, ...WHERE_PREF], WHO_SPEC, BAND_SPEC, MOOD_SPEC),
  strictRegion: tally(WHERE_REG, WHO_SPEC, BAND_SPEC, MOOD_SPEC),
  strictPref: tally(WHERE_PREF, WHO_SPEC, BAND_SPEC, MOOD_SPEC),
};
log(`- 全部（「どれでもよい」「どこでも」を含む。場所は どこでも・地方・県）: ${fmt(T.all)}`);
log(`- 場所が どこでも・地方 までの組み合わせ（「どれでもよい」を含む）: ${fmt(T.regionOnly)}`);
log(`- 4 問すべてに具体的に答えた組み合わせ（場所は地方か県）: ${fmt(T.strictAll)}`);
log(`    うち 場所が地方 : ${fmt(T.strictRegion)}`);
log(`    うち 場所が県   : ${fmt(T.strictPref)}`);
log("");

/* 画面で実際にたどれる道すじ: 各質問で、それまでの答えをかけて 1 店以上ある選択肢だけ押せる（0 店の選択肢は押せない） */
{
  const whereOpts = [{ region: "all", pref: null }, ...WHERE_REG, ...WHERE_PREF];
  const paths = { total: 0, n12: 0, n3: 0, n0: 0, perCount: {} };
  const cnt = (st) => rows.reduce((n, r) => n + (D.rowMatches(r, st) ? 1 : 0), 0);
  for (const w of whereOpts) {
    const s1 = { ...w, who: null, band: null, mood: null };
    if (cnt(s1) === 0) continue;
    for (const who of [...WHO_SPEC, "any"]) {
      const s2 = { ...s1, who };
      if (cnt(s2) === 0) continue;
      for (const b of [...BAND_SPEC, "any"]) {
        const s3 = { ...s2, band: b };
        if (cnt(s3) === 0) continue;
        for (const m of [...MOOD_SPEC, "any"]) {
          const c = cnt({ ...s3, mood: m });
          if (c === 0) continue;
          paths.total++;
          if (c <= 2) paths.n12++;
          else paths.n3++;
        }
      }
    }
  }
  log(`- 画面でたどれる道すじ（各質問で、それまでの答えで 1 店以上ある選択肢だけ押せる。場所は どこでも・地方・県）: ${paths.total} 通り: 1〜2 軒 ${paths.n12}（${((paths.n12 / paths.total) * 100).toFixed(1)}%）/ 3 軒以上 ${paths.n3}（${((paths.n3 / paths.total) * 100).toFixed(1)}%）/ 0 軒 0（押せない）`);
  log("");
}

if (MD) fs.writeFileSync(MD, out.join("\n") + "\n");
