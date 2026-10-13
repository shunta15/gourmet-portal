#!/usr/bin/env node
/**
 * onepage-status.mjs（読むだけ。何も書かない）
 *
 * 「特集記事が 1 店 1 ページ（/feature/<記事ID> → /restaurant/<店ID> の 308）になっているか」を記事ごとに数え、
 * 足りないものを出す。新しい記事を作った後、または既存の記事を店ページにする前に走らせる。
 *
 * 1 店 1 ページに必要な物（lib/portal/noren/onePage.ts の「対象の決め方」）:
 *   ① 店のデータがある（lib/articleStores.ts の ARTICLE_STORE_ID_BY_FEATURE に記事IDの完全一致）
 *      ← automation/stores500/add-article-store.mjs（map.json → GBP → build-stores.mjs）が作る
 *   ② 店 ID が非表示でない（lib/hiddenStores.ts）
 *   ③ ONE_PAGE_SHOP_OF_FEATURE の表に "記事ID": "店ID" の行がある（手で書いた表）
 *   ④ 写真の情報（lib/portal/photoFeature/photoMeta.generated.ts）に、その記事の写真の行がある（無くても動く。重複判定がパスの一致だけになる）
 *   /feature → /restaurant の 308 は、③の表から next.config.ts が自動で作る（別に足す物は無い）。
 *
 * 使い方: node automation/stores500/onepage-status.mjs [--lines] [--json]
 *   --lines  ③に足す行（"記事ID": "店ID", // 店名）を出す（貼るのは lib/portal の持ち主）
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const abs = (...p) => path.join(ROOT, ...p);
const nfc = (s) => String(s).normalize("NFC");
const flags = new Set(process.argv.slice(2));

const feat = readFileSync(abs("lib/teleapo-features.ts"), "utf8");
const articles = [...new Set([...feat.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)].map((m) => nfc(m[1])))];

const as = readFileSync(abs("lib/articleStores.ts"), "utf8");
const pairBlock = as.slice(as.indexOf("export const ARTICLE_STORE_ID_BY_FEATURE"));
const pair = new Map([...pairBlock.matchAll(/^\s*"([^"]+)":\s*"(r\d+)"/gm)].map((m) => [nfc(m[1]), m[2]]));
const storeNameById = new Map([...as.matchAll(/"id":\s*"(r\d+)"[\s\S]{0,400}?"name":\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]));

const hiddenSrc = readFileSync(abs("lib/hiddenStores.ts"), "utf8");
const hidden = new Set([...hiddenSrc.matchAll(/id:\s*"(r\d+)"/g)].map((m) => m[1]));

const op = readFileSync(abs("lib/portal/noren/onePage.ts"), "utf8");
const tableStart = op.indexOf("export const ONE_PAGE_SHOP_OF_FEATURE");
const table = new Map([...op.slice(tableStart).matchAll(/^\s*"([^"]+)":\s*"(r\d+)"/gm)].map((m) => [nfc(m[1]), m[2]]));

const pm = existsSync(abs("lib/portal/photoFeature/photoMeta.generated.ts"))
  ? readFileSync(abs("lib/portal/photoFeature/photoMeta.generated.ts"), "utf8") : "";
const photoMetaHas = (id) => pm.includes(`"/restaurants/teleapo-${id}/`) || pm.includes(`"/restaurants/teleapo-${id.normalize("NFD")}/`);

const map = new Set(JSON.parse(readFileSync(abs("automation/stores500/map.json"), "utf8")).map((m) => nfc(m.articleId)));
const gbp = new Set(readdirSync(abs("automation/stores500/gbp")).map((f) => nfc(f.replace(/\.json$/, ""))));
const excluded = new Map(JSON.parse(readFileSync(abs("automation/stores500/excluded.json"), "utf8")).map((e) => [nfc(e.articleId), e.reason]));

const cats = { onePage: [], needTableRow: [], hiddenPair: [], excluded: [], noGbp: [], notInMap: [] };
for (const a of articles) {
  const sid = pair.get(a);
  if (table.has(a)) cats.onePage.push(a);
  else if (sid && hidden.has(sid)) cats.hiddenPair.push(a);
  else if (sid) cats.needTableRow.push(a);
  else if (excluded.has(a)) cats.excluded.push(a);
  else if (map.has(a) && !gbp.has(a)) cats.noGbp.push(a);
  else if (!map.has(a)) cats.notInMap.push(a);
  else cats.noGbp.push(a);
}
const derivedTable = [...pair].filter(([, sid]) => !hidden.has(sid)).map(([a]) => a);
const tableMatchesDerivation = derivedTable.length === table.size && derivedTable.every((a) => table.has(a));
const photoMetaMissing = [...table.keys()].filter((a) => !photoMetaHas(a));

const summary = {
  articles: articles.length,
  one_page_done: cats.onePage.length,                       // 表に行があり、308 で店ページへ届く
  has_store_but_no_table_row: cats.needTableRow.length,     // ①あり・③の表に行が無い（足す行を --lines で出せる）
  has_store_but_hidden: cats.hiddenPair.length,             // ①あり・店が非表示（lib/hiddenStores.ts）
  build_stores_excluded: cats.excluded.length,              // build-stores.mjs が除外（閉業・住所の食い違い等）
  in_map_but_no_gbp: cats.noGbp.length,                     // map.json にあるが gbp/*.json が無い
  not_in_map_json: cats.notInMap.length,                    // 店ページ化の入力（map.json）が未作成
  table_equals_pairs_minus_hidden: tableMatchesDerivation,  // 手書きの表 = ARTICLE_STORE_ID_BY_FEATURE から非表示を引いた物
  photo_meta_missing_in_table: photoMetaMissing.length,           // ④表の中で写真の情報が無い記事（無くても動く）
};

if (flags.has("--json")) {
  console.log(JSON.stringify({ summary, cats }, null, 2));
} else {
  console.log(JSON.stringify(summary, null, 2));
  if (cats.excluded.length) console.log("build-stores が除外:", cats.excluded.map((a) => `${a}（${excluded.get(a)}）`).join(" / "));
  if (cats.noGbp.length) console.log("gbp が無い:", cats.noGbp.join(" / "));
}
if (flags.has("--lines")) {
  console.log("\n// ③の表に足す行（記事ID順。貼るのは lib/portal の持ち主）");
  for (const a of cats.needTableRow) console.log(`  ${JSON.stringify(a)}: ${JSON.stringify(pair.get(a))}, // ${storeNameById.get(pair.get(a)) ?? ""}`);
}
