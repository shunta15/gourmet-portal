/**
 * 業種の大分類（7 つ + その他）。入口の「業種からさがす」の札・検索（/search?cuisine=…）の「業種」・暖簾の 7 つの章（和・洋・中・麺・肉・酒・茶）が、この 1 つの表を見る。
 * 店の cuisine（業種の表記）に、keywords のどれかが含まれていれば、その大分類に入る（1 軒が複数の大分類に入ってよい）。店名の中間一致は使わない（業種の表記だけで分類）。
 * 「その他」の分類は無い。語に当たらない店は、店の ID ごとの対応表 BROAD_BY_ID で振り分ける（根拠は、その店自身のデータ＝本文・見出し・タグ・説明。ID の完全一致だけ）。
 *   本文を読んでも系統を決められなかった店は、この表に入れない（どの分類にも出ない）。automation/check-cuisine-broad.mjs が、どの分類にも入らない店を一覧にする。
 *
 * - label: 表示名であり、検索の URL（?cuisine=）の値。平易な言葉にする（造語は使わない）
 * - kanji: 暖簾の一文字（章・店の布）。no: 章の番号（漢数字）。en: 章の英語の小見出し
 * - exclude: 判定の前に cuisine から取り除く語（例: 「中華そば」「まぜそば」の「そば」「中華」で、和食・中華に入らないように）
 * - 細かい分類（lib/cuisineGroups.ts の 14 分類。居酒屋・和食・割烹・定食・洋食 など）の名前を URL に持つ古いリンクも、matchesCuisineFilter でそのまま動く
 * ※ fs・process.cwd() を使わない（クライアントの部品からも読まれる）
 */
import { CUISINE_GROUPS } from "@/lib/cuisineGroups";

export type BroadGroup = {
  key: string;
  label: string;
  kanji: string;
  no: string;
  en: string;
  keywords: readonly string[];
  exclude?: readonly string[];
};

/** 7 つの大分類。並びは暖簾の章の順（和・洋・中・麺・肉・酒・茶） */
export const BROAD_GROUPS: readonly BroadGroup[] = [
  {
    key: "wa", label: "和食", kanji: "和", no: "一", en: "Washoku",
    keywords: ["寿司", "鮨", "海鮮", "和食", "割烹", "日本料理", "懐石", "会席", "京料理", "郷土料理", "天ぷら", "うなぎ", "小料理", "おばんざい", "すき焼き", "しゃぶしゃぶ", "そば", "蕎麦", "うどん", "定食", "食堂", "とんかつ", "お好み焼き", "もんじゃ", "たこ焼き", "おでん", "鍋"],
    exclude: ["まぜそば", "焼きそば", "中華そば"],
  },
  {
    key: "yo", label: "洋食", kanji: "洋", no: "二", en: "Western",
    keywords: ["イタリアン", "イタリア料理", "パスタ", "ピッツァ", "ピザ", "フレンチ", "フランス料理", "ビストロ", "洋食", "ハンバーグ", "ハンバーガー", "オムライス", "スペイン", "欧風", "西洋"],
  },
  {
    key: "chu", label: "中華・アジア", kanji: "中", no: "三", en: "Chinese & Asian",
    keywords: ["中華", "中国料理", "餃子", "四川", "広東", "点心", "小籠包", "カレー", "エスニック", "ベトナム", "インド", "韓国", "メキシコ", "アジア", "ハワイアン", "タイ", "台湾"],
    exclude: ["中華そば"],
  },
  {
    key: "men", label: "ラーメン", kanji: "麺", no: "四", en: "Ramen",
    keywords: ["ラーメン", "担々麺", "担担麺", "まぜそば", "中華そば", "つけ麺", "拉麺", "麺類", "焼きそば"],
  },
  {
    key: "niku", label: "焼肉・焼鳥", kanji: "肉", no: "五", en: "Yakiniku & Yakitori",
    keywords: ["焼肉", "焼き肉", "ホルモン", "ジンギスカン", "焼き鳥", "焼鳥", "炭火焼", "串焼", "串揚げ", "串カツ", "ステーキ", "鉄板", "ローストビーフ", "肉料理", "グリル"],
  },
  {
    key: "sake", label: "居酒屋・バー", kanji: "酒", no: "六", en: "Izakaya & Bar",
    keywords: ["居酒屋", "酒場", "立ち飲み", "炉端", "バー", "バル", "bar", "ワイン", "ビール", "日本酒"],
    exclude: ["ハンバーガー"],
  },
  {
    key: "cha", label: "カフェ・甘味", kanji: "茶", no: "七", en: "Café & Sweets",
    keywords: ["カフェ", "喫茶", "コーヒー", "珈琲", "紅茶", "中国茶", "パーラー", "スイーツ", "ケーキ", "タルト", "洋菓子", "和菓子", "フランス菓子", "甘味", "パン", "ベーカリー", "ジェラート", "アイス", "チョコ", "ドーナツ"],
  },
];

/**
 * 業種の表記（cuisine）の語に当たらない店の振り分け（店 ID → 分類の key。複数可）。ID の完全一致だけ（店名の一致は使わない）。
 * 根拠は、その店のデータ（desc・body・highlights・tags）の記述。2026-10-11 に振り分けた。
 *   r168 e9uipe nine(創作料理): 「イタリアン・和食・フレンチの技法を組み合わせた」 → 洋・和
 *   r304 kaneko coffee beans 旭川(レストラン): 「自家焙煎のコーヒーと食事」「農園カフェ」 → 茶
 *   r331 Plaisir プレジール(レストラン): 「ビーフシチューから東欧の郷土料理まで」「天然酵母パン」 → 洋
 *   r342 火と時(レストラン): 「パスタが昼の軸になっている」 → 洋
 *   r359 魚美 本店(鮮魚店): 「舟盛り8,640円から」「月200本売れるうなぎ」 → 和
 *   r375 幌馬車 樹樹(レストラン): 「3日以上かけて作る、熟成・凝縮したスパイスカレー」 → 中
 *   r376 Steak House G-Base(レストラン): 「オリジナルステーキソース」「肉の産地学」 → 肉
 *   r397 キッチン おばた(創作料理店): 「和と洋の技術を行き来しながら料理を組み立てる」 → 和・洋
 *   r418 souvenir-スヴニール-(レストラン): 「和牛ステーキの一皿」「鉄板焼き」 → 肉
 *   r424 喜重軒(レストラン): 「赤城どりと手揉み麺」「ワンタン麺、まぜそば、ほたて出汁の塩」 → 麺
 *   r441 shokusha(レストラン): 「精肉店の目利きで選ぶ、肉料理の基本」 → 肉
 *   r442 神宮茶処あじゃり(レストラン): 「精進料理の軸になる、発酵と有機食材の力」 → 和
 *   r463 肉のまるたか(精肉店): 「讃岐オリーブ豚の脂が持つ甘さ」（精肉店。近い分類が肉） → 肉
 *   r466 dining kitchen LIFE(レストラン): 「フランス人シェフが手がける、本格フレンチコース」 → 洋
 *   r477 赤れんが(レストラン): 「手ごねハンバーグ」「ハンバーグから定食まで、洋食と和の中間」 → 洋・和
 *   r486 レストラン･ブルボン(レストラン): 「自家製あんかけスパソース」「鉄板スパ」 → 洋
 *   r489 Kazuのちゅーぼー(レストラン): 「創作イタリアン」「100種を超えるイタリアワイン」 → 洋
 *   r509 BeatoKitchen(レストラン): 「パスタとキッズルームを掛け合わせたカフェ」 → 洋・茶
 * 振り分けていない店（本文を読んでも系統を決められなかった。オーナー確認待ち）: r72 Kitchen Sunny(惣菜・デリ)・r277 OWL(ナイトクラブ)・r330 Nulla(レストラン)・r368 やさいやVege TABLE(レストラン)
 *   → 2026-10-12 オーナー決定「これ削除でいいよ一旦めんどいから」で、この 4 店は非表示にした（lib/hiddenStores.ts。データは消していない）。
 */
export const BROAD_BY_ID: Record<string, readonly string[]> = {
  r168: ["yo", "wa"],
  r304: ["cha"],
  r331: ["yo"],
  r342: ["yo"],
  r359: ["wa"],
  r375: ["chu"],
  r376: ["niku"],
  r397: ["wa", "yo"],
  r418: ["niku"],
  r424: ["men"],
  r441: ["niku"],
  r442: ["wa"],
  r463: ["niku"],
  r466: ["yo"],
  r477: ["yo", "wa"],
  r486: ["yo"],
  r489: ["yo"],
  r509: ["yo", "cha"],
};

/** 絞り込みの選択肢（検索の「業種」・入口の「業種からさがす」）: 7 つの大分類 */
export const CUISINE_FILTER_LABELS: readonly string[] = BROAD_GROUPS.map((g) => g.label);

/** 店（id と cuisine）が入る大分類の key（語に当たったもの + BROAD_BY_ID。章の並びの順） */
export function broadKeysOf(shop: { id: string; cuisine: string }): string[] {
  const byId = BROAD_BY_ID[shop.id] ?? [];
  return BROAD_GROUPS.filter((g) => hits(g, shop.cuisine ?? "") || byId.includes(g.key)).map((g) => g.key);
}

function hits(g: Pick<BroadGroup, "keywords" | "exclude">, cuisine: string): boolean {
  let c = cuisine.toLowerCase();
  for (const ex of g.exclude ?? []) c = c.split(ex.toLowerCase()).join(" ");
  return g.keywords.some((kw) => c.includes(kw.toLowerCase()));
}

/** 店が、その大分類（label）に入るか */
export function matchesBroad(label: string, shop: { id: string; cuisine: string }): boolean {
  const g = BROAD_GROUPS.find((x) => x.label === label);
  return !!g && broadKeysOf(shop).includes(g.key);
}

/** 店が、その大分類（key。章の key）に入るか */
export function matchesBroadKey(key: string, shop: { id: string; cuisine: string }): boolean {
  return broadKeysOf(shop).includes(key);
}

/**
 * 検索の「業種」の絞り込み。label が大分類（7 つ）ならそれで、
 * 古い細かい分類の名前（lib/cuisineGroups.ts の 14 分類。以前の URL）ならその語で判定する。知らない label は絞り込まない（true）。
 */
export function matchesCuisineFilter(label: string, shop: { id: string; cuisine: string }): boolean {
  if (CUISINE_FILTER_LABELS.includes(label)) return matchesBroad(label, shop);
  const old = CUISINE_GROUPS.find((g) => g.label === label);
  return old ? old.keywords.some((kw) => shop.cuisine.includes(kw)) : true;
}

/** 古い細かい分類の名前か（その名前の URL で開いたとき、選択の表示を保つために選択肢へ 1 つだけ足す判断に使う） */
export function isLegacyCuisineLabel(label: string): boolean {
  return !CUISINE_FILTER_LABELS.includes(label) && CUISINE_GROUPS.some((g) => g.label === label);
}

/** 大分類ごとの店の数（合計は店の数を超えてよい） */
export function countByBroad(shops: readonly { id: string; cuisine: string }[]): { label: string; count: number }[] {
  return BROAD_GROUPS.map((g) => ({ label: g.label, count: shops.filter((s) => broadKeysOf(s).includes(g.key)).length }));
}

/** どの大分類にも入らない店（点検用） */
export function unclassifiedShops<T extends { id: string; cuisine: string }>(shops: readonly T[]): T[] {
  return shops.filter((s) => broadKeysOf(s).length === 0);
}
