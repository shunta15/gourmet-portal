// 暖簾3 さがす(見本 2_さがす.png)のデータ。店名・文・駅・タグは見本の文字そのまま(仮)。
// 本物への置き換えは後。まず見本の再現。

export const TOTAL = 509; // 見本の「509件」(絞り込み無しのとき)

export type Genre = { key: string; label: string; cx: number; tone: "navy" | "sand" | "red"; x0: number; x1: number };
// 料理の暖簾 7 枚。cx = 見本での暖簾の中心 x、x0〜x1 = 帯と写真を合わせた幅(見本の x)。
export const GENRES: Genre[] = [
  { key: "washoku", label: "和食", cx: 118.5, tone: "navy", x0: 51, x1: 187 },
  { key: "yoshoku", label: "洋食", cx: 256.5, tone: "sand", x0: 189, x1: 336 },
  { key: "chuka", label: "中華・アジア", cx: 399, tone: "navy", x0: 332, x1: 471 },
  { key: "ramen", label: "ラーメン", cx: 543.5, tone: "sand", x0: 472, x1: 615 },
  { key: "yaki", label: "焼肉・焼鳥", cx: 687, tone: "red", x0: 617, x1: 756 },
  { key: "izakaya", label: "居酒屋・バー", cx: 830.5, tone: "navy", x0: 758, x1: 900 },
  { key: "cafe", label: "カフェ・甘味", cx: 973, tone: "sand", x0: 903, x1: 1040 },
];

export type AreaNoren = { key: string; label: string; value: string; cx: number; tone: "navy" | "sand" | "red" };
// エリアの縦暖簾 7 枚。label は見本の字(6 枚目は見本のまま「駅周辺リア」)。value はフィルタ値。
export const AREA_NOREN: AreaNoren[] = [
  { key: "chuo", label: "中央エリア", value: "中央エリア", cx: 169.5, tone: "navy" },
  { key: "tokyo", label: "東京エリア", value: "東京エリア", cx: 290, tone: "sand" },
  { key: "nishi", label: "西エリア", value: "西エリア", cx: 413, tone: "red" },
  { key: "minami", label: "南エリア", value: "南エリア", cx: 533, tone: "navy" },
  { key: "kita", label: "北エリア", value: "北エリア", cx: 653.5, tone: "sand" },
  { key: "ekishu", label: "駅周辺リア", value: "駅周辺エリア", cx: 771.5, tone: "navy" },
  { key: "kogai", label: "郊外エリア", value: "郊外エリア", cx: 893.5, tone: "sand" },
];

// 利用シーン(見本には選択肢が出ていない。カードのタグの言い方から起こした)
export const SCENES = ["接待", "デート", "宴会", "女子会", "仕事帰り", "お一人様", "ランチ"] as const;

export type Shop = {
  id: string;
  name: string;
  cat: string; // 分類ラベル = Genre.label
  area: string; // 「中央エリア」など = AREA_NOREN.value
  station: string; // 「東京駅 徒歩5分」
  walk: number; // 徒歩の分(並べ替え用)
  desc: string;
  tags: string[];
  scenes: string[]; // 利用シーン(タグから)
  photoH: number; // 見本での写真の高さ(1 行目 117.5・2 行目 110)
  chipW: number; // 見本での分類ラベルの幅(写真に焼き込まれた元のラベルと同じ幅にする)
  liked?: boolean;
};

export const SHOPS: Shop[] = [
  { id: "s1", name: "酒処 うみのや", cat: "和食", area: "東京エリア", station: "東京駅 徒歩5分", walk: 5, desc: "旬の魚と地酒が楽しめる大人の和食処", tags: ["個室あり", "日本酒", "接待におすすめ"], scenes: ["接待"], photoH: 117.5, chipW: 46 },
  { id: "s2", name: "ビストロ ルヴァン", cat: "洋食", area: "中央エリア", station: "銀座駅 徒歩3分", walk: 3, desc: "本格フレンチを気軽に楽しめるビストロ", tags: ["デートにおすすめ", "ワイン豊富", "カウンター席"], scenes: ["デート"], photoH: 117.5, chipW: 48 },
  { id: "s3", name: "麺や 一灯", cat: "ラーメン", area: "南エリア", station: "横浜駅 徒歩2分", walk: 2, desc: "香り高いスープが自慢の人気ラーメン店", tags: ["駅近", "深夜営業", "お一人様歓迎"], scenes: ["お一人様"], photoH: 117.5, chipW: 62 },
  { id: "s4", name: "炭火 やき鳥 一徹", cat: "焼肉・焼鳥", area: "中央エリア", station: "新橋駅 徒歩1分", walk: 1, desc: "備長炭で焼き上げるこだわりのやき鳥", tags: ["個室あり", "喫煙可", "仕事帰りに"], scenes: ["仕事帰り"], photoH: 117.5, chipW: 77 },
  { id: "s5", name: "酒場 マチノワ", cat: "居酒屋・バー", area: "南エリア", station: "梅田駅 徒歩3分", walk: 3, desc: "地元の食材とお酒を楽しむ大衆酒場", tags: ["飲み放題あり", "宴会におすすめ", "駅近"], scenes: ["宴会"], photoH: 110, chipW: 86 },
  { id: "s6", name: "カフェ やすらぎ", cat: "カフェ・甘味", area: "中央エリア", station: "表参道駅 徒歩6分", walk: 6, desc: "こだわりのスイーツと珈琲でゆったりと", tags: ["カフェ利用", "テラス席", "女子会におすすめ"], scenes: ["女子会"], photoH: 110, chipW: 84 },
  { id: "s7", name: "中華食堂 龍門", cat: "中華・アジア", area: "北エリア", station: "上野駅 徒歩4分", walk: 4, desc: "本場の味を気軽に楽しめる中華食堂", tags: ["ランチ営業", "コスパ抜群", "お一人様歓迎"], scenes: ["ランチ", "お一人様"], photoH: 110, chipW: 86 },
  { id: "s8", name: "BAR 月の雫", cat: "居酒屋・バー", area: "南エリア", station: "横浜駅 徒歩5分", walk: 5, desc: "こだわりのカクテルと落ち着いた空間", tags: ["カウンター席", "デートにおすすめ", "隠れ家"], scenes: ["デート"], photoH: 110, chipW: 84 },
];
