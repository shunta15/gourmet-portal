#!/usr/bin/env node
/**
 * 「おまかせ提案」の判定（lib/portal/omakaseDefs.ts・omakaseRows.ts）の単体テスト。
 * 実行: node proto-portal/test-omakase.mjs   （Node 22.18 以降。TypeScript をそのまま読み込む。DB・環境変数は使わない）
 *
 * 気分の表は、すべて実データ（getAllRestaurants() の cuisine）の表記。期待値は、表記を人が読んで決めたもの（関数の出力を写していない）。
 * 結び付けの決まりは proto-portal/OMAKASE-COVERAGE.md。
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
const P = (f) => path.join(ROOT, f);
const D = await import(P("lib/portal/omakaseDefs.ts"));
const R = await import(P("lib/portal/omakaseRows.ts"));
const { BOOL_FACETS } = await import(P("lib/portal/facetDefs.ts"));

let pass = 0;
let fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`}`);
};
const moodsOf = (c) => D.MOODS.filter((m) => D.moodMaskOf(c) & D.MOOD_BIT[m.id]).map((m) => m.id);

/* ───────── 1. 気分（業態の文字列 → 気分） ───────── */
console.log("\n# 気分");
const moods = [
  ["ラーメン屋", ["men"]],
  ["蕎麦店", ["men"]], // CUISINE_GROUPS の「そば」では当たらない漢字表記
  ["うどん屋", ["men"]],
  ["台湾まぜそば・ラーメン", ["men"]],
  ["焼きそば専門店", ["men"]],
  ["焼肉店", ["niku"]],
  ["焼き鳥・居酒屋", ["niku", "sake"]],
  ["ステーキハウス", ["niku"]],
  ["とんかつ店", ["niku"]],
  ["寿司店", ["sakana"]],
  ["海鮮丼", ["sakana", "teishoku"]],
  ["うなぎ料理店", ["sakana"]],
  ["和食店", ["wa"]],
  ["会席・懐石料理店", ["wa"]],
  ["京料理・会席", ["wa"]],
  ["イタリア料理店", ["yo"]], // 「イタリアン」では当たらない表記
  ["フランス料理店", ["yo"]],
  ["洋食レストラン", ["yo"]],
  ["ビストロ・ワインバー", ["yo", "sake"]],
  ["中華料理", ["chuka"]],
  ["韓国料理店", ["chuka"]],
  ["ベトナム料理", ["chuka"]],
  ["居酒屋", ["sake"]],
  ["バー", ["sake"]],
  ["バー＆グリル", ["sake"]],
  ["ハンバーガー", []], // 「バー」を酒場と取り違えない
  ["カフェ・喫茶", ["kafe"]],
  ["コーヒーショップ・喫茶店", ["kafe"]],
  ["カフェ・バー", ["sake", "kafe"]], // 並びは MOODS の定義の順
  ["定食屋", ["teishoku"]],
  ["お好み焼き", ["teppan"]],
  ["お好み焼き・鉄板焼き", ["teppan"]],
  ["イタリアン（マルケ州郷土料理）", ["yo"]], // 「郷土料理」で和に入れない
  ["レストラン", []],
  ["パン", []],
  ["ナイトクラブ", []],
  ["", []],
];
for (const [c, want] of moods) t(`気分: ${c || "(空)"}`, moodsOf(c), want);
t("null/undefined は 0", [D.moodMaskOf(null), D.moodMaskOf(undefined)], [0, 0]);

/* ───────── 2. 店の表（誰と・予算・県） ───────── */
console.log("\n# 店の表");
const input = {
  facetRows: {
    a: [2, 1 << BOOL_FACETS.indexOf("counter")],
    b: [3, 1 << BOOL_FACETS.indexOf("private")],
    c: [-1, 1 << BOOL_FACETS.indexOf("kids")],
    d: [0, 1 << BOOL_FACETS.indexOf("parking")], // おまかせでは使わない設備
  },
  shown: ["counter", "private", "kids", "parking"],
  shownBands: [0, 1, 2, 3, 4],
  prefOfRegion: R.prefOfRegionKey,
};
const row = (id, region, cuisine, tags) => R.omakaseRowOf({ id, region, cuisine, tags }, input);
const labelsOf = (r, who) => D.WHO_OPTIONS.find((w) => w.id === who).atoms.filter((a) => r[4] & D.ATOM_BIT[a]);
t("カウンターの記載あり → ひとり", labelsOf(row("a", "osaka", "居酒屋", []), "solo"), ["counter"]);
t("タグ「一人飲み」→ ひとり", labelsOf(row("x", "osaka", "バー", ["一人飲み", "宴会"]), "solo"), ["tag:一人飲み"]);
t("個室の記載あり → ふたり", labelsOf(row("b", "kyoto", "和食店", []), "pair"), ["private"]);
t("タグ「デート」「記念日」→ ふたり", labelsOf(row("x", "kyoto", "フレンチ", ["デート", "記念日"]), "pair"), ["tag:デート", "tag:記念日"]);
t("子連れ・家族連れの記載あり → 家族", labelsOf(row("c", "tokyo", "洋食", []), "family"), ["kids"]);
t("タグ「座敷あり」→ 家族", labelsOf(row("x", "tokyo", "和食", ["座敷あり"]), "family"), ["tag:座敷あり"]);
t("タグ「宴会」「貸切可」→ 仲間・会社", labelsOf(row("x", "nagoya", "居酒屋", ["宴会", "貸切可"]), "group"), ["tag:宴会", "tag:貸切可"]);
t("タグ「接待」→ 仲間・会社", labelsOf(row("x", "nagoya", "和食", ["接待"]), "group"), ["tag:接待"]);
t("使わない設備（駐車場）は事実にならない", row("d", "osaka", "うどん", []).slice(4), [0]);
t("タグは文字が完全に同じものだけ（「個室焼肉」は 個室 のタグではない）", row("x", "osaka", "焼肉", ["個室焼肉"])[4], 0);
t("出していない設備は使わない", R.omakaseRowOf({ id: "a", region: "osaka", cuisine: "居酒屋", tags: [] }, { ...input, shown: ["private", "kids"] })[4], 0);
t("予算の帯", [row("a", "osaka", "x", [])[2], row("b", "osaka", "x", [])[2], row("c", "osaka", "x", [])[2], row("zz", "osaka", "x", [])[2]], [2, 3, -1, -1]);
t("出していない帯は不明にする", R.omakaseRowOf({ id: "a", region: "osaka", cuisine: "x" }, { ...input, shownBands: [0, 1] })[2], -1);
t("県: nagoya は愛知", D.OMAKASE_PREFS[row("a", "nagoya", "x", [])[1]].slug, "aichi");
t("県: osaka は大阪", D.OMAKASE_PREFS[row("a", "osaka", "x", [])[1]].slug, "osaka");
t("県が分からない region は -1", row("a", "zzz", "x", [])[1], -1);
t("気分のビット", row("a", "osaka", "ラーメン屋", [])[3], D.MOOD_BIT.men);

/* ───────── 3. 地方と県 ───────── */
console.log("\n# 地方");
t("地方は 8 つ", D.OMAKASE_REGIONS.map((r) => r.slug), ["hokkaido", "tohoku", "kanto", "chubu", "kinki", "chugoku", "shikoku", "kyushu"]);
t("47 都道府県すべてがどれかの地方に入る", D.REGION_OF_PREF.every((r) => D.OMAKASE_REGIONS.some((x) => x.slug === r)) && D.REGION_OF_PREF.length === 47, true);
t("関東は 7 都県", D.prefsOfRegion("kanto").length, 7);
t("近畿の県", D.prefsOfRegion("kinki").map((i) => D.OMAKASE_PREFS[i].slug), ["mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"]);
t("九州沖縄は 8 県", D.prefsOfRegion("kyushu").length, 8);
t("grammar: 愛知は中部", D.REGION_OF_PREF[D.PREF_INDEX.aichi], "chubu");

/* ───────── 4. 絞り込みと数え方 ───────── */
console.log("\n# 絞り込み");
const rows = [
  ["r1", D.PREF_INDEX.osaka, 2, D.MOOD_BIT.men, D.ATOM_BIT.counter],
  ["r2", D.PREF_INDEX.osaka, 3, D.MOOD_BIT.sake, D.ATOM_BIT.private | D.ATOM_BIT["tag:デート"]],
  ["r3", D.PREF_INDEX.kyoto, 2, D.MOOD_BIT.men | D.MOOD_BIT.sake, D.ATOM_BIT.counter],
  ["r4", D.PREF_INDEX.tokyo, -1, D.MOOD_BIT.wa, 0],
  ["r5", D.PREF_INDEX.tokyo, 2, 0, D.ATOM_BIT["tag:宴会"]],
  ["r6", -1, 2, D.MOOD_BIT.men, D.ATOM_BIT.counter],
];
const S = (o) => ({ ...D.EMPTY_STATE, ...o });
t("条件なし（未回答）は全店", D.matchIds(rows, D.EMPTY_STATE), ["r1", "r2", "r3", "r4", "r5", "r6"]);
t("どこでも/どれでも は全店", D.matchIds(rows, S({ region: "all", who: "any", band: "any", mood: "any" })), ["r1", "r2", "r3", "r4", "r5", "r6"]);
t("地方: 近畿", D.matchIds(rows, S({ region: "kinki" })), ["r1", "r2", "r3"]);
t("県: 大阪", D.matchIds(rows, S({ region: "kinki", pref: "osaka" })), ["r1", "r2"]);
t("県が分からない店は、場所を選ぶと出ない", D.matchIds(rows, S({ region: "kanto" })), ["r4", "r5"]);
t("誰と: ひとり", D.matchIds(rows, S({ who: "solo" })), ["r1", "r3", "r6"]);
t("誰と: ふたり（個室 または デート）", D.matchIds(rows, S({ who: "pair" })), ["r2"]);
t("誰と: 仲間・会社（タグ宴会）", D.matchIds(rows, S({ who: "group" })), ["r5"]);
t("誰と: 家族 は該当なし", D.matchIds(rows, S({ who: "family" })), []);
t("予算: 帯 2（3,001〜5,000円）", D.matchIds(rows, S({ band: 2 })), ["r1", "r3", "r5", "r6"]);
t("予算が不明の店は、予算を選ぶと出ない", D.matchIds(rows, S({ band: 3 })), ["r2"]);
t("気分: 麺", D.matchIds(rows, S({ mood: "men" })), ["r1", "r3", "r6"]);
t("気分: 酒（複数の気分に入る店）", D.matchIds(rows, S({ mood: "sake" })), ["r2", "r3"]);
t("どの気分にも入らない店は、気分を選ぶと出ない", D.matchIds(rows, S({ mood: "wa" })), ["r4"]);
t("組み合わせは全部を満たす店", D.matchIds(rows, S({ region: "kinki", who: "solo", band: 2, mood: "men" })), ["r1", "r3"]);
t("4 つで 0 軒", D.matchIds(rows, S({ region: "kanto", who: "solo", band: 2, mood: "men" })), []);
t("skip: その質問だけ無いものとして数える", rows.filter((r) => D.rowMatches(r, S({ region: "kinki", who: "solo", band: 3 }), "budget")).map((r) => r[0]), ["r1", "r3"]);

console.log("\n# 選択肢ごとの店数");
const st1 = S({ region: "kinki", who: "solo" });
const oc = D.optionCounts(rows, st1);
const brute = (patch) => D.matchIds(rows, { ...st1, ...patch }).length;
t("どこで: 地方ごと（ほかの答えをかけた店数）", [oc.where.region.kinki, oc.where.region.kanto ?? 0, oc.where.any], [2 + 0, 0, 3]);
t("どこで: 各地方の店数は、その地方を選んだときの店数と一致", D.OMAKASE_REGIONS.every((r) => (oc.where.region[r.slug] ?? 0) === D.matchIds(rows, { ...st1, region: r.slug, pref: null }).length), true);
t("どこで: 地方を選んでいるとき、県ごとの店数", oc.where.pref, { osaka: 1, kyoto: 1 });
t("誰と: 各選択肢の店数は、選んだときの店数と一致", D.WHO_OPTIONS.every((w) => (oc.who.who[w.id] ?? 0) === brute({ who: w.id })), true);
t("予算: 各帯の店数は、選んだときの店数と一致", [0, 1, 2, 3, 4].every((b) => (oc.budget.band[b] ?? 0) === brute({ band: b })), true);
t("気分: 各選択肢の店数は、選んだときの店数と一致", D.MOODS.every((m) => (oc.mood.mood[m.id] ?? 0) === brute({ mood: m.id })), true);
t("どれでもよい の店数は、その質問を外したときの店数（近畿×ひとり。誰と を外す→近畿の3店、予算・気分を外す→ r1・r3 の2店）", [oc.who.any, oc.budget.any, oc.mood.any], [3, 2, 2]);

console.log("\n# 条件をゆるめる");
const rx = D.relaxations(rows, S({ region: "kinki", pref: "osaka", who: "solo", band: 3, mood: "men" }));
t("ゆるめる案は、答えた質問の数だけ（県→地方、誰と、予算、気分）", rx.map((r) => r.step), ["where", "who", "budget", "mood"]);
t("県をゆるめる → 地方ぜんぶ", rx[0].next, S({ region: "kinki", pref: null, who: "solo", band: 3, mood: "men" }));
t("件数は、ゆるめた答えで数え直した店数", rx.map((r) => r.count), rx.map((r) => D.matchIds(rows, r.next).length));
t("地方（県なし）をゆるめる → どこでも", D.relaxations(rows, S({ region: "kinki", who: "any", band: "any", mood: "any" }))[0].next.region, "all");
t("どれでもよい・どこでも の質問は、ゆるめる案に出ない", D.relaxations(rows, S({ region: "all", who: "any", band: "any", mood: "men" })).map((r) => r.step), ["mood"]);

/* ───────── 5. URL ───────── */
console.log("\n# URL");
const get = (qs) => { const p = new URLSearchParams(qs); return (k) => p.get(k); };
const pa = (qs, bands) => D.parseOmakase(get(qs), bands);
t("空は未回答", pa("").st, D.EMPTY_STATE);
t("4 つの答え", pa("r=kinki&who=solo&b=3000&m=men").st, { region: "kinki", pref: null, who: "solo", band: 1, mood: "men" });
t("県つき", pa("r=kanto&p=tokyo").st.pref, "tokyo");
t("地方に属さない県は捨てる", pa("r=kanto&p=osaka").st.pref, null);
t("どこでも・どれでも", pa("r=all&who=any&b=any&m=any").st, { region: "all", pref: null, who: "any", band: "any", mood: "any" });
t("知らない値は未回答", pa("r=mars&who=alone&b=7&m=ramen").st, D.EMPTY_STATE);
t("出していない帯は未回答", pa("b=3000", [0, 2]).st.band, null);
t("帯 10001", pa("b=10001").st.band, 4);
t("見直し q=2 → 1", pa("q=2").edit, 1);
t("q が範囲外は無視", [pa("q=0").edit, pa("q=5").edit, pa("q=x").edit], [null, null, null]);
t("種と頁", [pa("s=ab12&n=3").seed, pa("s=ab12&n=3").page], ["ab12", 3]);
t("種は英数字だけ・12 文字まで", pa("s=a-b_c<script>12345678901234").seed, "abcscript123");
t("n が変なら 0", [pa("n=-1").page, pa("n=abc").page], [0, 0]);
const sts = [
  S({ region: "kinki", pref: "osaka", who: "solo", band: 1, mood: "men" }),
  S({ region: "all", who: "any", band: "any", mood: "any" }),
  S({ region: "kanto" }),
  D.EMPTY_STATE,
];
for (const s of sts) t(`書いて読むと元に戻る: ${D.omakaseQuery(s) || "(空)"}`, pa(D.omakaseQuery(s)).st, s);
t("クエリの形", D.omakaseQuery(sts[0], { edit: 2, seed: "k3f", page: 1 }), "r=kinki&p=osaka&who=solo&b=3000&m=men&q=3&s=k3f&n=1");
t("地方が all のとき p は書かない", D.omakaseQuery({ ...sts[1], pref: "tokyo" }), "r=all&who=any&b=any&m=any");

/* ───────── 6. 結果の選び方 ───────── */
console.log("\n# 結果の選び方");
const ids = Array.from({ length: 10 }, (_, i) => `r${i + 1}`);
t("同じ種なら同じ並び", D.shuffled(ids, "abc"), D.shuffled([...ids].reverse(), "abc"));
t("並べ替えても店は増減しない", [...D.shuffled(ids, "abc")].sort(), [...ids].sort());
t("種が違えば並びが変わる", D.shuffled(ids, "abc").join() !== D.shuffled(ids, "abd").join(), true);
const order = D.shuffled(ids, "x1");
t("1 ページは 3 軒", D.pageOf(order, 0).length, 3);
t("最後のページは余りだけ", D.pageOf(order, 3).length, 1);
t("ページをひとめぐりして戻る", D.pageOf(order, 4), D.pageOf(order, 0));
t("全ページをつなぐと全店", [0, 1, 2, 3].flatMap((p) => D.pageOf(order, p)), order);
t("0 軒なら空", D.pageOf([], 0), []);

/* ───────── 7. 言葉 ───────── */
console.log("\n# 言葉");
const stx = S({ region: "kinki", pref: "kyoto", who: "family", band: 2, mood: "teppan" });
t("答えの文字", D.STEPS.map((s) => D.answerText(stx, s)), ["京都", "家族で", "3,001〜5,000円", "鉄板"]);
t("地方ぜんぶ", D.answerText(S({ region: "kanto" }), "where"), "関東ぜんぶ");
t("問わない", [D.answerText(S({ region: "all" }), "where"), D.answerText(S({ who: "any" }), "who"), D.answerText(S({ band: "any" }), "budget"), D.answerText(S({ mood: "any" }), "mood")], ["どこでも", "問わない", "問わない", "問わない"]);
t("未回答は null", D.STEPS.map((s) => D.answerText(D.EMPTY_STATE, s)), [null, null, null, null]);
t("設備の事実は必ず「〜の記載あり」", D.FACT_ATOMS.filter((a) => a.kind === "facet").every((a) => a.label.endsWith("の記載あり")), true);
t("事実は 31 個以内（ビット）", D.FACT_ATOMS.length <= 31, true);
t("すべての根拠が事実の表にある", D.WHO_OPTIONS.every((w) => w.atoms.every((a) => a in D.ATOM_BIT)), true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
