#!/usr/bin/env node
/**
 * report.mjs  —  オーナーに見せる一覧(markdown)を作る。読むだけ(intake-<日付>.json と verify-<日付>.json から)
 *   node automation/v2/report.mjs [--date YYYY-MM-DD]
 * 出力: automation/v2/out/一覧_<日付>.md
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { OUT_DIR, today } from "./intake.mjs";

const di = process.argv.indexOf("--date");
const date = di > 0 ? process.argv[di + 1] : today();
const intake = JSON.parse(readFileSync(path.join(OUT_DIR, `intake-${date}.json`), "utf8"));
const verify = JSON.parse(readFileSync(path.join(OUT_DIR, `verify-${date}.json`), "utf8"));

const VERTS = ["グルメ", "ビューティー", "ボディケア", "ペット", "ステイ", "アクティビティ", "スポーツ", "くらし", "要確認"];
const VERDICTS = ["確認済み", "要確認", "見つからない", "閉業・移転"];
const TAB = "トリニティアポ";
const cands = intake.candidates.filter((c) => c.tab === TAB);
const resOf = (c) => verify.results[`${c.tab}:${c.row}`];
const verdictOf = (c) => resOf(c)?.verdict ?? "未実行";
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

const L = [];
L.push(`# 記事の自動作成(新) 第1段の結果 ${date}`);
L.push("");
L.push("読み込み → 業種の振り分け → Googleマップでの実在確認。シートへの書き込みはしていない。");
L.push("");

// 1. 台帳との突き合わせ
L.push("## 1. 台帳にまだ無い店(候補)");
L.push("");
L.push("| タブ | 店の行 | 台帳にあり | 作らない | 候補 |");
L.push("|---|---|---|---|---|");
for (const [tab, s] of Object.entries(intake.tabs)) L.push(`| ${tab} | ${s.rows} | ${s.registered} | ${s.excluded} | ${s.candidates} |`);
L.push("");
if (intake.excluded.length) {
  L.push("作らない店: " + intake.excluded.map((e) => `${e.tab}の行${e.row}「${e.name}」(${e.reason})`).join(" / "));
  L.push("");
}

// 2. 業種 x 判定
L.push(`## 2. ${TAB} の業種ごとの店数と確認結果`);
L.push("");
const extra = [...new Set(cands.map(verdictOf))].filter((v) => !VERDICTS.includes(v));
const cols = [...VERDICTS, ...extra];
L.push(`| 業種 | 店数 | ${cols.join(" | ")} |`);
L.push(`|---|---|${cols.map(() => "---").join("|")}|`);
const tot = Object.fromEntries(cols.map((v) => [v, 0]));
for (const v of VERTS) {
  const xs = cands.filter((c) => c.vertical === v);
  if (!xs.length) continue;
  const n = Object.fromEntries(cols.map((k) => [k, xs.filter((c) => verdictOf(c) === k).length]));
  cols.forEach((k) => (tot[k] += n[k]));
  L.push(`| ${v} | ${xs.length} | ${cols.map((k) => n[k]).join(" | ")} |`);
}
L.push(`| **合計** | **${cands.length}** | ${cols.map((k) => `**${tot[k]}**`).join(" | ")} |`);
L.push("");
if (verify.meta?.stoppedBy) L.push(`**途中で止まった**: ${verify.meta.stoppedBy}`, "");

// 3. 要確認・見つからない・閉業
const section = (title, verdict) => {
  const xs = cands.filter((c) => verdictOf(c) === verdict);
  L.push(`## ${title}(${xs.length}件)`);
  L.push("");
  if (!xs.length) {
    L.push("なし", "");
    return;
  }
  L.push("| 行 | 店名 | 業種 | 電話 | マップの店 | 理由 |");
  L.push("|---|---|---|---|---|---|");
  for (const c of xs) {
    const r = resOf(c);
    const map = r?.mapName ? `${r.mapName}${r.mapAddress ? `(${r.mapAddress})` : ""}` : "";
    L.push(`| ${c.row} | ${esc(c.name)} | ${c.vertical} | ${esc(c.phone)} | ${esc(map)} | ${esc(r?.reason)} |`);
  }
  L.push("");
};
section("3. 要確認の店", "要確認");
section("4. 見つからない店", "見つからない");
section("5. 閉業・移転の表示がある店", "閉業・移転");
const other = cands.filter((c) => !VERDICTS.includes(verdictOf(c)));
if (other.length) {
  L.push(`## 6. 未実行・エラー・止められた店(${other.length}件)`, "");
  L.push("| 行 | 店名 | 状態 | 理由 |", "|---|---|---|---|");
  for (const c of other) L.push(`| ${c.row} | ${esc(c.name)} | ${verdictOf(c)} | ${esc(resOf(c)?.reason)} |`);
  L.push("");
}

// 7. 振り分けで迷った店
L.push("## 7. 業種の振り分けで迷った店(オーナーに聞く)");
L.push("");
const unsure = cands.filter((c) => c.vertical === "要確認");
if (!unsure.length) L.push("なし");
else {
  L.push("| 行 | 店名 | 業種の欄 | 理由 | マップ上のカテゴリ |");
  L.push("|---|---|---|---|---|");
  for (const c of unsure) L.push(`| ${c.row} | ${esc(c.name)} | ${esc(c.industryRaw)} | ${esc(c.verticalReason)} | ${esc(resOf(c)?.category)} |`);
}
L.push("");
L.push("答えをもらったら `automation/v2/vertical-map.json` の `storeDecisions` に足して覚える。");
L.push("");

// 8. 店名が電話番号の店
const phoneNames = cands.filter((c) => c.nameIsPhone);
if (phoneNames.length) {
  L.push("## 8. シートの店名が電話番号になっている店");
  L.push("");
  L.push("記事の店名にできないので、マップで電話から出た店の名前を添える。店名の確認が要る。");
  L.push("");
  L.push("| 行 | シートの店名 | 業種の欄→業種 | マップで出た店 | 判定 |");
  L.push("|---|---|---|---|---|");
  for (const c of phoneNames) {
    const r = resOf(c);
    L.push(`| ${c.row} | ${esc(c.name)} | ${esc(c.industryRaw)}→${c.vertical} | ${esc(r?.mapName)} | ${verdictOf(c)} |`);
  }
  L.push("");
}

// 9. 業種を店名ルール/決定で付けた店(参考)
L.push("## 9. 業種を『店名』『店ごとの決定』で付けた店(参考)");
L.push("");
L.push("| 行 | 店名 | 業種の欄 | 付けた業種 | 根拠 |");
L.push("|---|---|---|---|---|");
for (const c of cands.filter((c) => c.verticalSource === "店名" || c.verticalSource === "店ごとの決定"))
  L.push(`| ${c.row} | ${esc(c.name)} | ${esc(c.industryRaw)} | ${c.vertical} | ${esc(c.verticalReason)} |`);
L.push("");

const file = path.join(OUT_DIR, `一覧_${date}.md`);
writeFileSync(file, L.join("\n") + "\n");
console.log(file);
