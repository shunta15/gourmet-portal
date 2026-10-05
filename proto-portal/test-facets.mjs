#!/usr/bin/env node
/**
 * 「こだわり条件で絞る」の判定（lib/portal/facetParse.ts・facetRow.ts・facetDefs.ts）の単体テスト。
 * 実行: node proto-portal/test-facets.mjs   （Node 22.18 以降。TypeScript をそのまま読み込む）
 *
 * 文字列は、すべて実データ（getAllRestaurants() の budget / seats / hours / closed / nearest / 本文）の表記。
 * 期待値は、元の文字列を人が読んで決めたもの（関数の出力を写していない）。判定の決まりは proto-portal/FILTERS-BRIEF.md。
 * 現在時刻は使わない。
 */
import { register } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith('.')&&!/\\.[a-z]+$/.test(s))return n(s+'.ts',c);throw e}}`,
    ),
);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (f) => path.join(ROOT, f);
const { budgetYen, budgetBand, seatRange, seatsAtLeast, hourFlags, detectFeatures, featuresStated } = await import(P("lib/portal/facetParse.ts"));
const { walk5Of, stationWalkMinutes, facetRowOf, featureTexts } = await import(P("lib/portal/facetRow.ts"));
const { weekFromText } = await import(P("lib/portal/openNow.ts"));
const { parseSelection, selectionParams, BUDGET_BANDS, FACET_DEFS, BOOL_FACETS, hasBit, rowOf } = await import(P("lib/portal/facetDefs.ts"));
const storeStations = JSON.parse(fs.readFileSync(P("lib/stations/storeStations.json"), "utf8"));

let pass = 0;
let fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`}`);
};

/* ───────── 1. 予算（文字列 → 帯を決める金額 → 帯。帯: 0=〜1,000 1=〜3,000 2=〜5,000 3=〜10,000 4=10,001〜） ───────── */
console.log("\n# 予算");
const budgets = [
  // [実データの文字列, 金額, 帯]
  ["¥2,000〜¥4,000", 4000, 2],
  ["¥3,000〜3,999", 3999, 2],
  ["〜¥1,999", 1999, 1],
  ["〜¥1,000", 1000, 0],
  ["〜￥999", 999, 0],
  ["¥999以下", 999, 0],
  ["3,000円〜", 3000, 1], // 上限が無ければ下限
  ["¥10,000〜14,999", 14999, 4],
  ["¥20,000〜", 20000, 4],
  ["夜 ￥3,000〜￥3,999", 3999, 2],
  ["夜 ￥3,000〜￥3,999 / 昼 〜￥1,999", 3999, 2], // 昼と夜 → 夜
  ["夜 ￥10,000〜￥14,999 / 昼 ￥4,000〜￥4,999", 14999, 4],
  ["ランチ¥1,000〜1,999 / ディナー¥3,000〜3,999", 3999, 2],
  ["ランチ ¥2,000〜¥3,000／ディナー ¥5,000〜¥6,000", 6000, 3],
  ["ランチ ¥1,000〜¥2,000 / ディナー ¥2,000前後", 2000, 1],
  ["昼 ￥1,000前後 / 夜 ￥1,500〜￥2,000", 2000, 1],
  ["昼 ￥1,200〜￥1,800", 1800, 1], // 夜が無ければ昼
  ["¥1,000〜¥1,999（昼）／¥4,000〜¥4,999（夜）", 4999, 2], // 括弧つきの昼夜
  ["3,001〜4,000円", 4000, 2],
  ["1,000円〜1,999円", 1999, 1],
  ["4,000円~4,999円", 4999, 2],
  ["¥2,000〜¥2,999（食べログ掲載情報）", 2999, 1], // 括弧の注記は読み飛ばす
  ["2,000〜3,000円（テーブルチャージ220円）", 3000, 1],
  ["3,000～4,000円程度（飲み放題+1,600円/90分）", 4000, 2], // 括弧の中の「/」で分けない
  ["夜 平均 ￥4,500", 4500, 2],
  ["3,000円前後", 3000, 1],
  ["500円〜1,000円（モーニング600円〜、ランチ定食880円〜）", 1000, 0],
  ["昼1000-1500円 / 夜2500-3300円", 3300, 2],
  ["ランチ約1,000円／ディナー約4,000円", 4000, 2],
  // 読み取れない（不明）
  ["要確認", null, null],
  ["ランチ 1,000〜1,999円 / ディナー 予約制", null, null], // 夜が書いてあるのに金額が無い → 昼で代用しない
  ["ディナー 6,000〜10,000円台", null, null], // 「円台」は曖昧
  ["ランチ千円前後〜／訪問前に確認を推奨", null, null],
  ["3,000円台〜5,000円台程度（訪問前に要確認）", null, null],
  ["数千円程度（訪問前に要確認）", null, null],
  ["昼は千円台、夜の予約利用は三千円台が目安", null, null],
  ["ドリンク ￥2,000〜￥2,999", null, null], // ドリンクだけの値段
  ["コーヒー豆 100g〜￥500", null, null],
  ["501円~1,000円/2,001円~4,000円", null, null], // 昼夜の表示が無い値が2つ → どちらが夜か分からない
  ["オムライスS 880円 / 手ごねハンバーグ 990円 / かつ・トンテキ・サイコロステーキ 各1,320円 / ステーキ 2,420円", null, null], // 単品の値段
  ["ランチ1,200円~・夜は要問い合わせ", null, null],
];
for (const [s, yen, band] of budgets) {
  t(`予算「${s}」の金額`, budgetYen(s), yen);
  t(`予算「${s}」の帯`, budgetBand(s), band);
}
t("予算が空は不明", [budgetYen(""), budgetYen(undefined), budgetYen(null)], [null, null, null]);

/* ───────── 2. 席数 ───────── */
console.log("\n# 席数");
const seats = [
  ["17席", [17, 17]],
  ["26", [26, 26]],
  ["32席（カウンター10・テーブル22）", [32, 32]],
  ["50席 / 個室2室（24名・8名）/ 貸切24-50名対応", [50, 50]],
  ["10〜12席（カウンター8席・テーブル2名用）", [10, 12]],
  ["29〜30席 / カウンターあり / 貸切相談可", [29, 30]],
  ["カウンター6席のみ", [6, 6]],
  ["U字型カウンター9席のみ", [9, 9]],
  ["全44席。カウンター席・座敷・ソファー席・個室あり。貸切対応、分煙、Wi-Fiあり", [44, 44]],
  ["総席数30席（個室8名用・6名用）", [30, 30]],
  ["総26席(カウンター2・座敷4名/6名)", [26, 26]],
  ["カウンター4席・テーブル14席(計18席)", [18, 18]],
  ["個室13室ほか、全100席", [100, 100]],
  ["計16席（カウンター6・テーブル10）", [16, 16]],
  ["18席（カウンター含む）/ 全席禁煙", [18, 18]],
  ["34席 / 全席禁煙", [34, 34]],
  ["全53席 / カウンター・ソファーシート・半個室あり / 個室4名・6名・20〜30名・30名以上", [53, 53]],
  ["カウンター席と小上がり席で計19席。全席喫煙可", [19, 19]],
  ["カウンター6席、テーブル6席、計12席", [12, 12]],
  ["全56席(カウンター8席・テーブル16席・個室32席)", [56, 56]],
  // 読めない（不明）
  ["—", null],
  ["—（訪問前に公式確認）", null],
  ["要確認", null],
  ["カウンター・テーブル", null],
  ["カウンター中心", null],
  ["20席程度", null], // 概数は読まない
  ["約100席(醸造樽の個室複数)", null],
  ["総席数140席（現在80席で営業）", null], // 食い違う書き方
  ["通常40席（最大80席）", null],
  ["カウンター6席＋テーブル3卓", null], // 内訳だけ。総席数ではない
  ["カウンター7席", null],
  ["テーブル席16席（全席禁煙）", null],
  ["カウンター・1〜2人席・3〜4人席・10人席・30人席（合計1〜30名）/ 貸切可", null],
  ["カウンター8席＋テーブル55席（最大28名個室・掘りごたつあり）", null],
  ["カウンター7席・座敷・テーブル計20席", null], // 「テーブル計20席」は席の種類の合計
  ["0", null],
];
for (const [s, want] of seats) t(`席数「${s}」`, seatRange(s) && [seatRange(s).min, seatRange(s).max], want);
t("席数 20席以上: 20 ちょうど", seatsAtLeast(seatRange("20"), 20), true);
t("席数 20席以上: 18席", seatsAtLeast(seatRange("18席"), 20), false);
t("席数 20席以上: 10〜12席", seatsAtLeast(seatRange("10〜12席（…）"), 20), false);
t("席数 20席以上: 19〜20席は決められない", seatsAtLeast(seatRange("19〜20席"), 20), null);
t("席数 20席以上: 読めない", seatsAtLeast(seatRange("要確認"), 20), null);
t("席数 50席以上: 29〜30席", seatsAtLeast(seatRange("29〜30席 / カウンターあり"), 50), false);
t("席数 50席以上: 50席", seatsAtLeast(seatRange("50席 / 個室2室"), 50), true);
t("席数 50席以上: 49席", seatsAtLeast(seatRange("49席（一階 立ち呑みスタンド / 二階 カウンター・ソファー・座敷）/ 個室あり"), 50), false);

/* ───────── 3. 営業時間帯（営業時間・定休日 → lunch / late / morning / sunday） ───────── */
console.log("\n# 営業時間帯");
const hf = (hours, closed) => hourFlags(weekFromText(hours, closed).week);
const hours = [
  // [営業時間, 定休日, lunch, late, morning, sunday]
  ["11:00〜14:00 / 17:00〜20:00", "水・木曜", true, false, false, true],
  ["17:00〜翌2:00", "火曜", false, true, false, true],
  ["8:00〜17:00（L.O. 16:30）", "不定休（事前確認推奨）", true, false, true, true],
  ["月〜土 18:00〜23:00", "日曜（不定休あり）", false, false, false, false],
  ["月〜水・金〜日 18:00〜翌0:00（L.O.23:00）", "木曜", false, true, false, true],
  ["毎日 11:30–15:00, 18:00–23:00", "なし（Googleマップの営業時間による）", true, false, false, true],
  ["10:00〜24:00", "無休", true, true, false, true],
  ["月〜金 11:00–18:00 / 日 11:00–17:00", "土曜日", true, false, false, true],
  ["月・火・木〜土 08:00–17:00", "水曜・日曜", true, false, true, false],
  ["月・水〜日 11:30–14:30, 18:00–22:00", "火曜日", true, false, false, true],
  ["月・火・金〜日 21:00〜翌6:00、木 21:00〜翌0:00", "水曜", false, true, false, true], // 翌6:00 閉店 → 8:00 は営業外
  // 境界
  ["11:30〜12:00", "無休", false, false, false, true], // 12:00 ちょうどに閉店 → 12:00 は営業外
  ["12:00〜14:00", "無休", true, false, false, true],
  ["17:00〜23:30", "無休", false, false, false, true], // 23:30 ちょうどに閉店 → 「23:30 以降も営業」ではない
  ["17:00〜翌0:00", "無休", false, true, false, true],
  ["8:00〜10:00", "無休", false, false, true, true],
  ["6:00〜8:00", "無休", false, false, false, true], // 8:00 ちょうどに閉店
  // 読み取れない
  ["要確認", "要確認", null, null, null, null],
  ["店舗にお問い合わせください（公式サイトを参照）", "公式サイトを参照", null, null, null, null],
];
for (const [h, c, lunch, late, morning, sunday] of hours) t(`営業時間「${h}」／定休日「${c}」`, hf(h, c), { lunch, late, morning, sunday });
// 曜日が一部しか読めない書き方: 「はい」は言えるが「いいえ」は言えない
t("営業時間の一部の曜日だけ（火〜木 17:30〜24:00）: 深夜はいえるが昼は不明", hf("火〜木 17:30〜24:00（L.O. 23:00）", "不明"), { lunch: null, late: true, morning: null, sunday: null });

/* ───────── 4. 駅から徒歩5分以内（stated の walkMin ＋ 案内文の「駅から徒歩N分」） ───────── */
console.log("\n# 駅徒歩5分以内");
const st = (id) => storeStations[id];
const walk = [
  // [店ID, 最寄り（実データ）, 期待]
  ["r03", "大阪メトロ堺筋線・谷町線・阪急千里線 天神橋筋六丁目駅 11番出口 徒歩6分", false],
  ["r04", "名鉄常滑線 豊田本町駅 徒歩5分", true],
  ["r218", "阪堺電車 御陵前駅 徒歩2分", true],
  ["r130", "阪急京都河原町駅徒歩2分", true],
  ["r465", "阪急池田駅直結（徒歩0分）", true],
  ["r347", "八戸駅から約200m・徒歩3分。バス停は駅通りから約130m。無料駐車場あり", true],
  ["r458", "蒲生駅東口から徒歩1分・埼玉りそな銀行隣・越谷市蒲生寿町17-1藤波ビル1F", true],
  ["r489", "阪急伊丹駅から徒歩10分・JR伊丹駅から徒歩13分", false],
  // storeStations の walkMin が、バス停・駐車場までの徒歩を拾っている店 → 不明にする
  ["r294", "野町駅から徒歩約11分／片町バス停から徒歩5分", null],
  ["r290", "JR山陰本線 太秦駅 徒歩約10分 / 京都市営バス 太秦北路町バス停 徒歩1分", null],
  ["r301", "JR旭川駅からバス約15分+徒歩5分", null],
  ["r382", "東武伊勢崎線・桐生線 太田駅から車で約5分 / 徒歩2分の場所に7台分の駐車場", null],
  // stated はあるが walkMin が無い（「徒歩約5分」など）→ 決まりどおり不明
  ["r327", "JR茅ヶ崎駅南口から徒歩約5分", null],
  ["r277", "大阪メトロ御堂筋線「梅田駅」徒歩約5分／谷町線「東梅田駅」徒歩約5分", null],
  ["r463", "—", null],
];
for (const [id, nearest, want] of walk) {
  // 最寄りの文字列は実データのとおりか（storeStations 側の walkMin と合わせて判定する）
  t(`${id}「${nearest}」 stated=${JSON.stringify((st(id)?.stated ?? []).map((s) => s.walkMin ?? null))}`, walk5Of(nearest, st(id)), want);
}
t("stated が無い店は不明", walk5Of("駅 徒歩3分", undefined), null);
t("stationWalkMinutes: バス・車・徒歩だけの区切りは数えない", stationWalkMinutes("JR旭川駅からバス約15分+徒歩5分 / 太田駅から車で約5分 / 徒歩2分の場所に駐車場"), []);
t("stationWalkMinutes: 駅の後ろの「徒歩約N分」", stationWalkMinutes("野町駅から徒歩約11分／片町バス停から徒歩5分"), [11]);

/* ───────── 5. 設備・特徴（記載あり）— 肯定の文脈だけを拾い、否定・断定でない言い方は拾わない ───────── */
console.log("\n# 設備・特徴");
const feat = (...texts) => featuresStated(texts);
// 実データの文（店ID・出どころは FILTERS-COVERAGE.md の検査表）
t("個室: タグ「個室」", feat("個室"), ["private"]);
t("個室: r03 desc", feat("50席・最大50名貸切可、個室2室を備え、一人飲みから宴会まで応える一軒。"), ["private"]);
t("個室: r450 個室焼肉（業態）", feat("個室焼肉"), ["private"]);
t("個室: 半個室は個室に数えない（r30）", feat("26席に半個室を備え、一人飲みから小グループの宴会まで対応。"), []);
t("個室: r308「個室はなく」", feat("個室はなく、居心地の良さを掲げる店内"), []);
t("個室: r315「個室なし」", feat("席はテーブル席中心・個室なし。"), []);
t("個室: r250「個室は設けていない」（カウンターは肯定）", feat("カウンター席とテーブル席を合わせて44席で、個室は設けていない。"), ["counter"]);
t("個室: r394「個室で仕切らず」", feat("個室で仕切らず、貸切には応じる店"), []);
t("個室: 相談・確認は断定ではない（r259）", feat("コースの内容や個室の利用については来店前に直接電話で確認しておくとよい。"), []);
t("個室: 肯定と否定が食い違う（r380: タグ「個室」＋本文「個室なし」）", feat("個室", "席は総席数10席・カウンターあり（個室/座敷/テラスなし）/ 貸切は事前相談で可。"), []);
t("個室: r456 離れの和個室", feat("苔の庭を眺めながら過ごす、離れの和個室"), ["private"]);
t("駐車場: r04 タグ", feat("駐車場あり"), ["parking"]);
t("駐車場: r288 20台完備", feat("ディナーは予約制、駐車場20台完備の隠れ家的な一軒です。"), ["parking"]);
t("駐車場: r241 2台分＋近隣のコインパーキング", feat("店内は全席禁煙で、駐車場2台分と近隣のコインパーキングが利用できます。"), ["parking", "smokefree"]);
t("駐車場: r256「備えていない」", feat("駐車場は備えていないため、徒歩や近隣のコインパーキングを利用したい。"), []);
t("駐車場: r253「専用駐車場はない」", feat("店舗専用駐車場はないため、車での来訪時は周辺のコインパーキングを利用することになります。"), []);
t("駐車場: r417「駐車場なし」", feat("石橋阪大前西口から徒歩三分、駐車場なし。"), []);
t("駐車場: r438「確認を推奨」は断定ではない", feat("最寄りは岡部町・駐車場の確認を推奨。"), []);
t("駐車場: r442「駐車場情報」は断定ではない", feat("阪神宝塚線池田駅からのアクセス、駐車場情報と来店のしやすさ"), []);
t("駐車場: r421「相談可能」は断定ではない", feat("最寄りは北野白梅町駅から徒歩3〜5分、駐車場相談可能です。"), []);
t("駐車場: コインパーキングだけ（駐車場の語が無い）", feat("近隣のコインパーキングをご利用ください。"), []);
t("駐車場: 周辺の有料駐車場は店のものではない", feat("周辺の有料駐車場を利用してください。"), []);
t("駐車場: r367", feat("駐車場と換気対策があるから、家族でも入りやすい"), ["parking"]);
t("テイクアウト: r218", feat("テイクアウトも充実"), ["takeout"]);
t("テイクアウト: r365 持ち帰り", feat("月〜土の全6品ランチ、冬のもつ鍋、予約制の持ち帰り"), ["takeout"]);
t("テイクアウト: r517", feat("店内でも、持ち帰りでも。"), ["takeout"]);
t("テラス: r48", feat("テラス席に大型犬まで入店可"), ["terrace"]);
t("テラス: r523 の建物名「青山テラス」は席ではない", feat("サービス付き高齢者住宅「青山テラス」に併設という立地"), []);
t("テラス: r403 テラス喫煙所は席ではない", feat("テラス喫煙所を備えた、分煙の店内"), []);
t("カウンター: r88", feat("カウンター4席・テーブル2卓の8席のみながら、昼夜通しで固定ファンが集う"), ["counter"]);
t("カウンター: r44 カウンター越し", feat("季節の食材を一本ずつカウンター越しに揚げてくれる。"), ["counter"]);
t("カウンター: r288 カウンターに並ぶドルチェは席ではない", feat("ホタテを使った前菜やカウンターに並ぶ自家製ドルチェも見どころです"), []);
t("禁煙: r13", feat("34席は全席禁煙、ランチもディナーも同じ温度感で過ごせる構えだ。"), ["smokefree"]);
t("禁煙: r278 昼は禁煙・夜は喫煙可は食い違い", feat("昼は全席禁煙で家族での食事に向き、夜は喫煙可となるため使い分けが可能です。"), []);
t("禁煙: r347 全席喫煙可", feat("全席が喫煙可という前提"), []);
t("禁煙: r366 分煙は禁煙ではない", feat("貸切対応、分煙、Wi-Fiあり。"), []);
t("子連れ: r245 タグ", feat("子連れ歓迎"), ["kids"]);
t("子連れ: r353 子供椅子", feat("席は座敷席あり、子供椅子・カトラリー完備。"), ["kids"]);
t("子連れ: r245 ベビーカー", feat("ベビーカーのまま入店できるテーブル間隔が確保されており、家族連れでも訪れやすい設計です。"), ["kids"]);
t("子連れ: r243 お子様ランチは対象外", feat("看板メニューは大人サイズの「お子様ランチ」で、ポークロースカツやビーフカツなど6種類のバリエーションが用意されている。"), []);
t("子連れ: r489 ファミリーマンション（建物名）は対象外", feat("所在地は兵庫県伊丹市中央2丁目7-13 ファミリーマンション 1階、最寄りは阪急伊丹駅から徒歩10分です。"), []);
t("子連れ: r28 子どもの頃は対象外", feat("土木系会社員から転身した木村氏は、子どもの頃からの中国カルチャーへの憧れをきっかけにアジア各地を旅し、中国の茶農家・市場へ自ら赴いて茶葉を仕入れる。"), []);
t("子連れ: r473 子ども連れにも対応", feat("全面禁煙で子ども連れにも対応する店内"), ["smokefree", "kids"]);
// 同じ文に複数の特徴があるとき、否定はその特徴だけに付く
t("複数: r363「個室なし、全席禁煙」（読点で区切られている）", feat("座敷とテーブル席、個室なし、全席禁煙。"), ["smokefree"]);
{
  const d = detectFeatures(["席は総席数10席・カウンターあり（個室/座敷/テラスなし）/ 貸切は事前相談で可。"]);
  t("否定が付いた特徴は negated になる（個室・テラス）", [d.private.negated, d.terrace.negated], [true, true]);
}

// highlights（特集記事の見出し）は店ページに出ない文なので、設備・特徴の判定に使わない（r413: 見出しだけに「共用駐車場100台」）
t(
  "highlights だけに書かれた駐車場は拾わない（r413）",
  facetRowOf({ id: "r413", highlights: ["駅から徒歩7分、共用駐車場100台"], tags: ["居酒屋", "個室"], desc: "愛知県刈谷市の居酒屋。", body: ["イタリアンバルAvantiは、愛知県刈谷市にあるお店です。"] }, undefined).has,
  ["private"],
);
t("featureTexts は tags・desc・body の順", featureTexts({ id: "x", tags: ["a"], desc: "b", body: ["c", "d"], highlights: ["z"] }), ["a", "b", "c", "d"]);

/* ───────── 6. URL（?budget= ?f=）の読み書き ───────── */
console.log("\n# URL");
const shown = { shown: ["lunch", "late", "walk5", "private", "open"], shownBands: [0, 1, 2, 3, 4] };
t("?budget=3000&f=late,walk5", parseSelection("3000", "late,walk5", shown), { band: 1, ids: ["late", "walk5"] });
t("順序は定義の順に直る", parseSelection(null, "walk5,late,private", shown), { band: null, ids: ["late", "walk5", "private"] });
t("出していない条件・知らない値は無視", parseSelection("999", "late,zzz,kids,morning", shown), { band: null, ids: ["late"] });
t("budget=10001 は最後の帯", parseSelection("10001", null, shown), { band: 4, ids: [] });
t("出していない帯は無視", parseSelection("3000", null, { ...shown, shownBands: [0, 2] }), { band: null, ids: [] });
t("書き戻し", selectionParams({ band: 1, ids: ["late", "walk5"] }), { budget: "3000", f: "late,walk5" });
t("何も選んでいなければ null", selectionParams({ band: null, ids: [] }), { budget: null, f: null });
t("帯の定義は5つ", BUDGET_BANDS.map((b) => b.value), [1000, 3000, 5000, 10000, 10001]);
t("判定ビット: 位置は BOOL_FACETS の並び", [hasBit(0b1, "lunch"), hasBit(0b10, "lunch"), hasBit(0b10, "late")], [true, false, true]);
t("rowOf: 表に無い店はすべて不明", rowOf({ rows: {} }, "r999"), [-1, 0]);
t("すべての条件に定義がある（open 以外はビットあり）", FACET_DEFS.filter((d) => d.id !== "open").every((d) => BOOL_FACETS.includes(d.id)) && BOOL_FACETS.every((id) => FACET_DEFS.some((d) => d.id === id)), true);
t("設備・特徴の札はすべて「〜の記載あり」", FACET_DEFS.filter((d) => d.group === "feature").every((d) => d.badge.endsWith("の記載あり")), true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
