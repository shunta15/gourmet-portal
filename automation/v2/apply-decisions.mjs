#!/usr/bin/env node
/**
 * apply-decisions.mjs — 第1段の「要確認」に、オーナーの決定(2026-10-26「OK進めていいよ」)を判定として反映する
 *
 * 対象: 行 50〜201 の verdict が「要確認」の店(80〜201 は 24 店、50〜79 は 2026-10-27 に追加)。シート・マップには触らない(第1段の結果ファイルだけを書き換える)。
 * 決定:
 *   D1 シートの URL が Google マップの店のページへの直接のリンク(シートのマップURLの経路)で、店名が一致 → 確定
 *   D2 電話と住所の両方が第1段で一致(電話一致 かつ 住所 exact/near)で、店名の書き方だけちがう → 確定
 *   D3 シートの店名が電話番号で、第1段で電話が一致 → 確定(店名・記事 ID は Google マップの店名)
 *   どれにも当たらない店(電話も住所も合わない・片方が不明)は作らない(判定は「要確認」のまま)
 * 確定にした店には verdict を「確認済み」に直し、verdictOriginal・decision(どの決定か)を残す。元の reason は reasonOriginal に残す。
 * 今までの結果は消さない。同じコマンドを何度回しても結果は同じ(冪等)。
 *
 * 使い方: node automation/v2/apply-decisions.mjs [--file out/verify-2026-10-26.json] [--dry]
 */
import path from "node:path";
import { OUT_DIR, readJson, writeJson, parseArgs, today } from "./lib/util.mjs";

const args = parseArgs(process.argv.slice(2));
const file = path.resolve(args.file || path.join(OUT_DIR, "verify-2026-10-27.json"));
const store = readJson(file);
const AT = today();
const BY = "オーナー 2026-10-26「OK進めていいよ」/ 2026-10-27「50〜79行目も同じ決まりで」";
const isPhoneName = (n) => /^[\d\-－ー\s()（）+]{9,}$/.test(String(n ?? ""));

function decide(r) {
  const sg = r.signals || {};
  const addrBoth = sg.addressLevel === "exact" || sg.addressLevel === "near";
  if ((r.urlKind === "place" || r.urlKind === "cid") && String(r.route || "").startsWith("シートのマップURL") && sg.nameRelation === "exact")
    return { rule: "D1", label: "シートのURLが Google マップの店のページへの直接のリンク(店名一致)" };
  if (isPhoneName(r.name)) {
    if (sg.phoneMatch === true) return { rule: "D3", label: "店名が電話番号・第1段で電話が一致(店名は Google マップの店名)" };
    return null;
  }
  if (/臨時休業|一時休業|移転準備|閉業/.test(`${r.reason} ${(r.statusSignals || []).join(" ")}`)) return null; // 休業・移転の表示がある店は確定にしない
  if (sg.phoneMatch === true && addrBoth) return { rule: "D2", label: "電話と住所の両方が一致・店名の書き方だけちがう" };
  return null;
}
function whyNot(r) {
  const sg = r.signals || {};
  const bits = [];
  if (sg.phoneMatch === true) bits.push("電話は一致");
  else if (sg.phoneMatch === false) bits.push("電話が不一致");
  else bits.push("電話は照合できず(マップに電話の表示なし)");
  if (sg.addressLevel === "exact" || sg.addressLevel === "near") bits.push("住所は一致");
  else if (sg.addressLevel) bits.push(`住所が不一致(${sg.addressDetail})`);
  else bits.push("住所は照合できず(シートに住所なし)");
  return bits.join("・");
}

const out = [];
// D4: 行を名指しした決定(オーナー 2026-10-26 の2回目)。電話が一致していることを条件にする
const D4 = {
  219: "シートの検索文字「やき鳥 ツギノキタザワ」のマップの店と電話(05088834415)が一致 → 同じ店(店名・記事IDはマップの店名)",
  229: "電話が一致・マップの店名「生」 → 同じ店として作る(店名・記事IDはマップの店名)",
};
for (const r of Object.values(store.results)) {
  if (r.tab === "トリニティアポ" && D4[r.row] && r.verdict === "要確認" && r.verdictOriginal === undefined) {
    if (r.signals?.phoneMatch !== true) { out.push({ row: r.row, name: r.name, applied: "対象外", why: "電話が一致していない" }); continue; }
    r.verdictOriginal = r.verdict;
    r.reasonOriginal = r.reason;
    r.verdict = "確認済み";
    r.decision = { rule: "D4", label: D4[r.row], at: AT, by: "オーナー 2026-10-26(行を名指しの決定)" };
    r.reason = `${D4[r.row]}。元の判定の理由: ${r.reasonOriginal}`;
    out.push({ row: r.row, name: r.name, mapName: r.mapName, applied: "D4", label: D4[r.row] });
    continue;
  }
  if (r.tab !== "トリニティアポ" || r.row < 50 || r.row > 201) continue;
  if (r.verdictOriginal !== undefined || r.decisionReview) {
    out.push({ row: r.row, name: r.name, applied: r.decision ? r.decision.rule : "対象外", already: true });
    continue;
  }
  if (r.verdict !== "要確認") continue;
  const d = decide(r);
  if (d) {
    r.verdictOriginal = r.verdict;
    r.reasonOriginal = r.reason;
    r.verdict = "確認済み";
    r.reason = `${d.label}(${BY})。元の判定の理由: ${r.reasonOriginal}`;
    r.decision = { rule: d.rule, label: d.label, at: AT, by: BY };
    out.push({ row: r.row, name: r.name, mapName: r.mapName, applied: d.rule, label: d.label });
  } else {
    r.decisionReview = { at: AT, result: "対象外(作らない)", why: whyNot(r), by: BY };
    out.push({ row: r.row, name: r.name, mapName: r.mapName, applied: "対象外", why: whyNot(r) });
  }
}
store.meta.decisionsAppliedAt = new Date().toISOString();
store.meta.decisionsNote = "行 80〜201 の「要確認」にオーナーの決定(2026-10-26)を反映。確定にした店は decision に D1/D2/D3 を記録、元の判定は verdictOriginal";
if (!args.dry) writeJson(file, store);
for (const o of out) console.log(`行${o.row} ${o.name} ⇒ ${o.mapName || ""}: ${o.applied}${o.label ? " " + o.label : ""}${o.why ? " / " + o.why : ""}${o.already ? " (反映済み)" : ""}`);
console.log(`${args.dry ? "[dry] " : ""}確定 ${out.filter((o) => /^D/.test(o.applied)).length} / 対象外 ${out.filter((o) => o.applied === "対象外").length}`);
