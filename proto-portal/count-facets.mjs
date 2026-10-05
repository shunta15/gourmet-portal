#!/usr/bin/env node
/**
 * 「こだわり条件で絞る」の数え直し（手順1の集計）。全店について、条件ごとの 判定できた店／はい／不明 と、
 * 元の文字列の例（判定つき）、設備・特徴の「記載あり」と、無作為30件の検査用の表を出す。
 *
 * 実行: node --env-file=.env.local proto-portal/count-facets.mjs [--md 出力.md] [--seed 20261005] [--sample 30]
 *   - 店は本番と同じ getAllRestaurants()（Supabase の公開行 ＋ DB に行が無いコード側の店）。.env.local の中身は表示しない。
 *   - 判定は lib/portal/facetRow.ts（画面と同じ関数）。数字をここで別に作らない。
 *   - Node 22.18 以降（TypeScript をそのまま読み込む）。`@/` と拡張子なしの相対 import を .ts に解決する hook を登録している。
 *   - 乱数は seed 固定（同じデータなら同じ30件が出る）。
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
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const MD = arg("--md", null);
const SEED = Number(arg("--seed", 20261005));
const SAMPLE = Number(arg("--sample", 30));

const { getAllRestaurants } = await import(path.join(ROOT, "lib/db/restaurants.ts"));
const { facetRowOf, featureTexts } = await import(path.join(ROOT, "lib/portal/facetRow.ts"));
const { detectFeatures, FEATURE_KEYS, budgetYen, seatRange, BUDGET_BAND_MAX } = await import(path.join(ROOT, "lib/portal/facetParse.ts"));
const { weekFromText } = await import(path.join(ROOT, "lib/portal/openNow.ts"));
const storeStations = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/stations/storeStations.json"), "utf8"));

const shops = await getAllRestaurants();
const rows = shops.map((r) => ({ r, row: facetRowOf(r, storeStations[r.id]) }));

// seed 固定の乱数
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sample(arr, n, seed) {
  const rand = rng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const out = [];
const log = (s = "") => {
  out.push(s);
  console.log(s);
};
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const BAND = ["〜1,000円", "〜3,000円", "〜5,000円", "〜10,000円", "10,001円〜"];

log(`# 集計結果（count-facets.mjs）`);
log(`全店数: ${shops.length}（getAllRestaurants()。ID重複 ${shops.length - new Set(shops.map((s) => s.id)).size}）`);
log();

const tally = (name, judge, yes) => {
  const j = rows.filter((x) => judge(x.row)).length;
  const y = rows.filter((x) => yes(x.row)).length;
  return { name, judged: j, yes: y, unknown: shops.length - j };
};

/* 条件ごとの集計 */
const conds = [
  ["予算の帯（判定できた店）", (w) => w.budget !== null, () => false],
  ["昼に開いている", (w) => w.lunch !== null, (w) => w.lunch === true],
  ["深夜まで", (w) => w.late !== null, (w) => w.late === true],
  ["朝から", (w) => w.morning !== null, (w) => w.morning === true],
  ["日曜に開いている", (w) => w.sunday !== null, (w) => w.sunday === true],
  ["駅から徒歩5分以内", (w) => w.walk5 !== null, (w) => w.walk5 === true],
  ["予約ページのリンクあり", () => true, (w) => w.reserve === true],
  ["20席以上", (w) => w.seats20 !== null, (w) => w.seats20 === true],
  ["50席以上", (w) => w.seats50 !== null, (w) => w.seats50 === true],
];
log(`## 条件ごとの集計`);
log(`| 条件 | 判定できた店（はい＋いいえ） | はい | いいえ | 不明 |`);
log(`|---|---:|---:|---:|---:|`);
for (const [name, judge, yes] of conds) {
  const t = tally(name, judge, yes);
  log(`| ${name} | ${t.judged} | ${name.startsWith("予算") ? "（帯別は下）" : t.yes} | ${name.startsWith("予算") ? "-" : t.judged - t.yes} | ${t.unknown} |`);
}
log();
log(`### 予算の帯別（はい）`);
for (let b = 0; b < 5; b++) log(`- ${BAND[b]}: ${rows.filter((x) => x.row.budget === b).length} 店`);
log();

/* 参考: 「いま営業中」（既存）。時刻に依存するので、集計した時点の値 */
{
  const { getOpenStatus, isOpenState } = await import(path.join(ROOT, "lib/portal/openNow.ts"));
  const now = new Date();
  let known = 0;
  let open = 0;
  for (const { r } of rows) {
    const st = getOpenStatus(weekFromText(r.hours, r.closed).week, now);
    if (st.state !== "unknown") known++;
    if (isOpenState(st.state)) open++;
  }
  log(`### いま営業中（既存の getOpenStatus。${now.toISOString()} 時点）: 判定できた店 ${known} / 営業中（まもなく閉店を含む）${open} / 不明 ${shops.length - known}`);
  log();
}

/* 元の文字列の例 15 件（はい・いいえ・不明をまぜる） */
function examples(title, items, show, seed) {
  // items: { r, cls: 'はい'|'いいえ'|'不明', raw }
  const by = { はい: [], いいえ: [], 不明: [] };
  for (const it of items) by[it.cls].push(it);
  const picked = [];
  const want = { はい: 5, いいえ: 5, 不明: 5 };
  const classes = Object.keys(want).filter((c) => by[c].length > 0);
  // 取れない区分の分を、取れる区分に回す
  let spare = 15 - classes.reduce((s, c) => s + Math.min(want[c], by[c].length), 0);
  for (const c of classes) picked.push(...sample(by[c], Math.min(want[c], by[c].length), seed + c.length));
  for (const c of classes) {
    if (spare <= 0) break;
    const rest = by[c].filter((x) => !picked.includes(x));
    const add = sample(rest, spare, seed + 7);
    picked.push(...add);
    spare -= add.length;
  }
  log(`#### ${title}の例（${picked.length}件。seed ${seed}）`);
  log(`| 店ID | 元の文字列 | 判定 |`);
  log(`|---|---|---|`);
  for (const it of picked) log(`| ${it.r.id} | ${esc(show(it))} | ${it.cls} |`);
  log();
}
const cls3 = (v) => (v === null ? "不明" : v ? "はい" : "いいえ");
log(`## 元の文字列の例`);
examples(
  "予算",
  rows.filter((x) => x.r.budget).map((x) => ({ r: x.r, cls: x.row.budget === null ? "不明" : "はい", raw: x.r.budget, band: x.row.budget })),
  (it) => `${it.raw}${it.band !== null ? `  →  ${BAND[it.band]}（読んだ金額 ${budgetYen(it.raw)}円）` : ""}`,
  11,
);
const hoursShow = (key) => (it) => `営業時間「${it.r.hours}」／定休日「${it.r.closed}」`;
for (const [key, label] of [["lunch", "昼に開いている"], ["late", "深夜まで"], ["morning", "朝から"], ["sunday", "日曜に開いている"]]) {
  examples(label, rows.map((x) => ({ r: x.r, cls: cls3(x.row[key]) })), hoursShow(key), 21);
}
examples(
  "駅から徒歩5分以内",
  rows.filter((x) => x.r.nearest).map((x) => ({ r: x.r, cls: cls3(x.row.walk5) })),
  (it) => `最寄り「${it.r.nearest}」（stated の walkMin: ${JSON.stringify((storeStations[it.r.id]?.stated ?? []).map((s) => s.walkMin ?? null))}）`,
  31,
);
examples("予約ページのリンクあり", rows.map((x) => ({ r: x.r, cls: cls3(x.row.reserve) })), (it) => `reservationUrl「${it.r.reservationUrl ?? ""}」`, 41);
examples(
  "席数（20席以上）",
  rows.map((x) => ({ r: x.r, cls: cls3(x.row.seats20) })),
  (it) => `seats「${it.r.seats}」→ ${JSON.stringify(seatRange(it.r.seats))}`,
  51,
);
examples(
  "席数（50席以上）",
  rows.map((x) => ({ r: x.r, cls: cls3(x.row.seats50) })),
  (it) => `seats「${it.r.seats}」→ ${JSON.stringify(seatRange(it.r.seats))}`,
  61,
);

/* 設備・特徴 */
log(`## 設備・特徴（tags・desc・body の肯定の記載。highlights は店ページに出ないので使わない）`);
const featHits = {};
for (const k of FEATURE_KEYS) featHits[k] = [];
const featNeg = {};
for (const k of FEATURE_KEYS) featNeg[k] = [];
for (const { r } of rows) {
  const det = detectFeatures(featureTexts(r));
  for (const k of FEATURE_KEYS) {
    if (det[k].evidence && !det[k].negated) featHits[k].push({ r, evidence: det[k].evidence });
    else if (det[k].negated) featNeg[k].push({ r, evidence: det[k].evidence });
  }
}
log(`| 特徴 | 記載あり | 肯定と否定がぶつかって外した店 |`);
log(`|---|---:|---:|`);
for (const k of FEATURE_KEYS) log(`| ${k} | ${featHits[k].length} | ${featNeg[k].filter((x) => x.evidence).length} |`);
log();

const detail = args.includes("--detail");
if (detail) {
  for (const k of FEATURE_KEYS) {
    log(`#### ${k}: 記載あり ${featHits[k].length} 店（全件）`);
    for (const h of featHits[k]) log(`- ${h.r.id} ${h.r.name} | ${h.evidence.slice(0, 120)}`);
    log();
    log(`#### ${k}: 否定または食い違いで外した店`);
    for (const h of featNeg[k]) log(`- ${h.r.id} ${h.r.name} | ${(h.evidence ?? "(肯定なし)").slice(0, 100)}`);
    log();
  }
}

log(`## 設備・特徴の検査用（無作為 ${SAMPLE} 件・seed ${SEED}）`);
for (const k of FEATURE_KEYS) {
  const pick = sample(featHits[k], SAMPLE, SEED + k.length * 101);
  log(`### ${k}（記載あり ${featHits[k].length} 店から ${pick.length} 件）`);
  log(`| # | 店ID | 拾った文 | 判定（目視） |`);
  log(`|---:|---|---|---|`);
  pick.forEach((h, i) => log(`| ${i + 1} | ${h.r.id} | ${esc(h.evidence)} | （未） |`));
  log();
}

if (MD) fs.writeFileSync(MD, out.join("\n") + "\n");
