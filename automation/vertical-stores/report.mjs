#!/usr/bin/env node
/**
 * report.mjs  —  automation/vertical-stores/gbp/*.json を数えて表にする（stdout のみ。ファイルは書かない）
 *
 *   タブ別 × 判定別の件数 / URLの種類 × 判定の件数 / 一致以外の行の一覧 /
 *   「一致」でも店名が完全一致でない行 / 読めた項目の埋まり具合 / 1件あたりの秒数
 *
 * 使い方: node automation/vertical-stores/report.mjs [--list automation/vertical-stores/trial30.json] [--range beauty:2-129,bodycare:2-133] [--dir <gbp のフォルダ>]
 *   --list を付けると、その一覧に載っている行だけを数える
 *   --range を付けると、タブ（beauty/bodycare/pet/lodging）ごとの行の範囲に入る行だけを数える（例 beauty:2-129,bodycare:2-133）。書かなかったタブは数えない
 *   --dir を付けると、別のフォルダの gbp/*.json を数える（取り直す前の控えとの比較用）
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const di = process.argv.indexOf("--dir");
const GBP = di >= 0 ? path.resolve(process.argv[di + 1]) : path.join(HERE, "gbp");
const TAB_EN = { ビューティ: "beauty", ボディケア: "bodycare", ペット: "pet", 宿泊施設: "lodging" };
const VERDICTS = ["一致", "住所は一致で店名がちがう", "住所が粗く確認不十分", "不一致", "見つからない", "閉業の表示あり", "止められた", "エラー"];

const li = process.argv.indexOf("--list");
let only = null;
if (li >= 0) {
  only = new Set(JSON.parse(readFileSync(path.resolve(process.argv[li + 1]), "utf8")).map((x) => `${TAB_EN[x.tab]}-${x.row}`));
}
// --range beauty:2-129,bodycare:2-133 → [{tabEn:"beauty", a:2, b:129}, …]
const ri = process.argv.indexOf("--range");
let ranges = null;
if (ri >= 0) {
  ranges = [];
  for (const part of process.argv[ri + 1].split(",")) {
    const m = part.trim().match(/^(beauty|bodycare|pet|lodging):(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`--range の書き方が読めない: ${part}（例 beauty:2-129,bodycare:2-133）`);
    ranges.push({ tabEn: m[1], a: Number(m[2]), b: Number(m[3] || m[2]) });
  }
}
const inRange = (r) => !ranges || ranges.some((x) => x.tabEn === r.tabEn && r.row >= x.a && r.row <= x.b);
const recs = existsSync(GBP)
  ? readdirSync(GBP)
      .filter((f) => f.endsWith(".json"))
      .filter((f) => !only || only.has(f.replace(/\.json$/, "")))
      .map((f) => JSON.parse(readFileSync(path.join(GBP, f), "utf8")))
      .filter(inRange)
  : [];
recs.sort((a, b) => (a.tabEn > b.tabEn ? 1 : a.tabEn < b.tabEn ? -1 : a.row - b.row));
console.log(`保存済み: ${recs.length} 件\n`);

function table(title, rowKey, colKeys, getRow, getCol) {
  console.log(`## ${title}`);
  const rows = [...new Set(recs.map(getRow))];
  console.log(`| ${rowKey} | ${colKeys.join(" | ")} | 計 |`);
  console.log(`|---|${colKeys.map(() => "---:").join("|")}|---:|`);
  const tot = Object.fromEntries(colKeys.map((c) => [c, 0]));
  for (const rk of rows) {
    const sub = recs.filter((r) => getRow(r) === rk);
    const cells = colKeys.map((c) => sub.filter((r) => getCol(r) === c).length);
    colKeys.forEach((c, i) => (tot[c] += cells[i]));
    console.log(`| ${rk} | ${cells.join(" | ")} | ${sub.length} |`);
  }
  console.log(`| 計 | ${colKeys.map((c) => tot[c]).join(" | ")} | ${recs.length} |\n`);
}
const usedVerdicts = VERDICTS.filter((v) => recs.some((r) => r.verdict === v));
table("タブ × 判定", "タブ", usedVerdicts, (r) => r.tab, (r) => r.verdict);
table("URLの種類 × 判定", "URLの種類", usedVerdicts, (r) => r.urlKind, (r) => r.verdict);

console.log("## 一致以外の行");
const non = recs.filter((r) => r.verdict !== "一致");
if (!non.length) console.log("なし");
for (const r of non) {
  console.log(`- ${r.tabEn}-${r.row} [${r.urlKind}] ${r.verdict}: シート「${r.sheet.name}」 ${r.sheet.address}`);
  console.log(`    理由: ${r.verdictReason}`);
}
console.log("\n## 「一致」だが店名が完全一致でない行（住所が決め手。目視用）");
const soft = recs.filter((r) => r.verdict === "一致" && r.nameRelation !== "exact");
if (!soft.length) console.log("なし");
for (const r of soft) console.log(`- ${r.tabEn}-${r.row} シート「${r.sheet.name}」 / マップ「${r.place?.name}」 (${r.nameRelation})${r.acceptedByOwnerCheck ? " ※発注者が確認して受け入れ（--accept）" : ""}`);
console.log(`\n「一致」のうち、発注者が確認して受け入れた行（acceptedByOwnerCheck）: ${recs.filter((r) => r.verdict === "一致" && r.acceptedByOwnerCheck).length} 件`);

const good = recs.filter((r) => r.place);
console.log(`\n## 読めた項目の埋まり具合（店の特定ができた ${good.length} 件のうち）`);
const cnt = (f) => good.filter(f).length;
console.log(`- 営業時間（7曜日そろった）: ${cnt((r) => r.place.hours)}`);
console.log(`- 電話: ${cnt((r) => r.place.phone)}`);
console.log(`- 公式サイト: ${cnt((r) => r.place.website)}`);
console.log(`- 予約リンク: ${cnt((r) => r.place.reserveLinks?.length)}`);
console.log(`- 業種の表示（category）: ${cnt((r) => r.place.category)}`);
console.log(`- 緯度経度（URLから）: ${cnt((r) => r.place.lat != null)}`);
console.log(`- オーナーの投稿の抜粋（提供元: オーナー。紹介文とは限らない）: ${cnt((r) => r.place.ownerPost)}`);
console.log(`- 閉業・臨時休業などの表示: ${cnt((r) => r.place.statusSignals?.length)}`);

const secs = recs.map((r) => r.seconds).filter((x) => typeof x === "number");
if (secs.length) {
  const avg = secs.reduce((a, b) => a + b, 0) / secs.length;
  console.log(`\n## 1件あたりの秒数（店の間の待ち 3〜6秒は含まない）`);
  console.log(`- 平均 ${avg.toFixed(1)} 秒 / 最大 ${Math.max(...secs)} 秒 / 最小 ${Math.min(...secs)} 秒（${secs.length} 件）`);
  const byKind = {};
  for (const r of recs) if (typeof r.seconds === "number") (byKind[r.urlKind] ||= []).push(r.seconds);
  for (const [k, v] of Object.entries(byKind)) console.log(`  - ${k}: 平均 ${(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)} 秒 (${v.length}件)`);
  const per = avg + 4.5; // 店の間の待ちの平均
  console.log(`- 待ち込み（平均+4.5秒）の 1 件: ${per.toFixed(1)} 秒 → 666 件で ${(per * 666 / 3600).toFixed(1)} 時間`);
}
