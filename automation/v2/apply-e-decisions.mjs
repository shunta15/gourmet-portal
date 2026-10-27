#!/usr/bin/env node
/**
 * apply-e-decisions.mjs — 第1段の「要確認」に、オーナーの決定(2026-10-28)を判定として反映する(シート・マップには触らない)
 *
 * 決まり(脳 2026-10-28): シートの E 列(店名+住所の Google 検索 URL。オーナーが店を調べて書いた)の q= を手がかりに使う。
 *   E1 Google マップの店の店名(表記違い可)と番地までの住所が E 列と合えば、店名+住所の 2 点として確定(電話が違ってもよい。シートの電話は店主の携帯のことが多い)
 *   E2 E 列の店名がマップの店名と同じで、シートの電話がマップの電話と同じ → 確定(店名+電話)
 *   E3 E 列の電話がマップの電話と同じで店名が合う → 確定
 *   E4 マップに電話が無く店名が表記違いだけで明らかに同じ店(オーナー決定「こういう案件はOK」)で、住所も E 列と合う → 確定
 * 候補(rec.candidates)のうち、下の表の cid の店を選び直して、rec の mapName/mapAddress/mapPhone/mapUrl/cid を差し替える。
 * 表に無い行・当てはまらない行(66 臨時休業・177 番地ちがい・201 住所ちがい)は「要確認」のまま。今までの結果は verdictOriginal/reasonOriginal に残す。冪等。
 *
 * 使い方: node automation/v2/apply-e-decisions.mjs [--file out/verify-2026-10-27.json] [--dry]
 */
import path from "node:path";
import { OUT_DIR, readJson, writeJson, parseArgs } from "./lib/util.mjs";

const args = parseArgs(process.argv.slice(2));
const file = path.resolve(args.file || path.join(OUT_DIR, "verify-2026-10-27.json"));
const store = readJson(file);
const BY = "オーナー 2026-10-28(E 列=オーナーが調べた店名+住所を手がかりにしてよい・電話のちがいは可)";

// row → { name: シートの店名(取り違え防止), cid: 選ぶ候補の cid(省略はいまの best), rule, label }
const TABLE = {
  58: { name: "若鰤", rule: "E2", label: "E 列の店名「鮮魚料理 若鰤」がマップの店名と同じ・シートの電話がマップの電話と一致" },
  74: { name: "アイラッシュアンドネイルサロンAiris", cidName: "アイラッシュ&ネイルサロン アイリス", rule: "E1", label: "店名(Airis=アイリス・アンド=&)+住所(番地まで)が E 列と一致" },
  119: { name: "から揚げドラゴンチキンハイボールきむにぃ", rule: "E1", label: "店名(ひらがな/カタカナの違い)+住所(番地まで)が E 列と一致" },
  166: { name: "陽月", cid: "2359388906071726402", rule: "E1", label: "店名「陽月 kagezuki」+住所(千葉市花見川区花園1-6-5)が E 列と一致(同名の埼玉の店は住所がちがうので除く)" },
  185: { name: "KOGUMACOFFEE", cidName: "コグマコーヒー", rule: "E4", label: "店名(ローマ字/カタカナの違い)+住所(天王寺区下寺町1-3-68)が E 列と一致(同名の立川の店は住所がちがうので除く)" },
  186: { name: "麺処清水", phone: "025-788-0882", rule: "E3", label: "E 列の電話 025-788-0882 がマップ(新潟県南魚沼市の「麺処 清水」)の電話と一致+店名(スペースの違いだけ)" },
  220: { name: "壱", rule: "E1", label: "店名(「一汁おにぎり 壱」に「壱」を含む)+住所(松山市萱町1-2-6)が E 列と一致" },
  225: { name: "焼き菓子ほつほつ", rule: "E4", label: "店名「菓子Hotsu Hotsu」(読みが同じ)+住所(表町1-10-23)が E 列と一致・マップに電話の表示なし(オーナー決定)" },
  250: { name: "一丸", rule: "E1", label: "店名(「餃子らーめん一丸本店」に「一丸」を含む)+住所(名東区一社4-1-1 第二名昭ビル1F)が E 列と一致" },
};
const digits = (s) => String(s ?? "").replace(/\D/g, "");
let n = 0;
for (const rec of Object.values(store.results)) {
  const t = TABLE[rec.row];
  if (!t || rec.tab !== "トリニティアポ") continue;
  if (rec.name !== t.name) { console.log(`行${rec.row}: 店名がちがう(${rec.name})ので飛ばす`); continue; }
  if (rec.decisionE) { console.log(`行${rec.row}: 反映済み`); continue; }
  const pool = rec.candidates || [];
  let c = null;
  if (t.cid) c = pool.find((x) => x.cid === t.cid);
  else if (t.phone) c = pool.find((x) => digits(x.phone) === digits(t.phone));
  else if (t.cidName) c = pool.find((x) => x.name === t.cidName && ["exact", "near"].includes(x.addressLevel));
  else c = pool.find((x) => x.cid === rec.cid) || pool.find((x) => x.name === rec.mapName);
  if (!c) { console.log(`行${rec.row}: 候補が見つからない`); continue; }
  console.log(`行${rec.row} ${rec.name} ⇒ ${c.name} / ${c.address} / ${c.phone ?? "電話なし"} : ${t.rule} ${t.label}`);
  if (args.dry) continue;
  rec.verdictOriginal = rec.verdict;
  rec.reasonOriginal = rec.reason;
  rec.verdict = "確認済み";
  rec.decisionE = { rule: t.rule, label: t.label, by: BY };
  rec.cid = c.cid;
  rec.mapName = c.name;
  rec.mapAddress = c.address;
  rec.mapPhone = c.phone ?? null;
  rec.mapUrl = c.cid ? `https://maps.google.com/?cid=${c.cid}` : c.url;
  rec.signals = { ...(rec.signals || {}), phoneMatch: c.phoneMatch ?? null, nameRelation: c.nameRelation, addressLevel: c.addressLevel, clues: [t.rule + ": " + t.label] };
  rec.reason = `${BY}: ${t.label}(第1段の元の判定: ${rec.reasonOriginal})`;
  n++;
}
if (!args.dry) writeJson(file, store);
console.log(`${args.dry ? "[dry] " : ""}確定にした行: ${n}`);
