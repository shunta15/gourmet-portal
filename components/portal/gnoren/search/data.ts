// さがす(見本 2)の仮データ。見本の仮の店名・文章をそのまま入れる。本物のデータへの置き換えは後の工程。

export const CUISINES = [
  { key: "和食", icon: "bowl", tone: "green", x: 187, w: 86, ty: 0, fs: 16 },
  { key: "洋食", icon: "fork", tone: "cream", x: 287, w: 92, ty: 0, fs: 15 },
  { key: "中華・アジア", icon: "steamer", tone: "red", x: 393, w: 106, ty: 1, fs: 13.5 },
  { key: "ラーメン", icon: "ramen", tone: "cream", x: 515, w: 104, ty: 2, fs: 14.5 },
  { key: "焼肉・焼鳥", icon: "skewer", tone: "green", x: 635, w: 117, ty: 5, fs: 14.5 },
  { key: "居酒屋・バー", icon: "bottle", tone: "red", x: 767, w: 139, ty: 5, fs: 14.5 },
  { key: "カフェ・甘味", icon: "cup", tone: "tan", x: 923, w: 118, ty: 3, fs: 14 },
] as const;
export type CuisineKey = (typeof CUISINES)[number]["key"];

export const AREAS = [
  { key: "駅周辺", x: 187, w: 99 },
  { key: "中心街", x: 291, w: 100 },
  { key: "東エリア", x: 397, w: 98 },
  { key: "西エリア", x: 501, w: 100 },
  { key: "北エリア", x: 607, w: 98 },
  { key: "南エリア", x: 712, w: 99 },
  { key: "海辺エリア", x: 817, w: 110 },
  { key: "山手エリア", x: 932, w: 112 },
] as const;
export type AreaKey = (typeof AREAS)[number]["key"];

export const SCENES = [
  { key: "ひとりで", x: 187, w: 102 },
  { key: "友人と", x: 305, w: 103 },
  { key: "デートに", x: 425, w: 104 },
  { key: "家族で", x: 545, w: 104 },
  { key: "仕事仲間と", x: 665, w: 119 },
  { key: "カフェでひと息", x: 801, w: 118 },
  { key: "特別な日に", x: 935, w: 108 },
] as const;
export type SceneKey = (typeof SCENES)[number]["key"];

export type TagIcon = "room" | "bulb" | "counter" | "heart" | "basket" | "clock" | "door" | "glass" | "awning" | "thumb" | "dome" | "bag";

export type Shop = {
  id: string;
  name: string;
  station: string;
  walk: number;
  desc: [string, string];
  tags: [{ icon: TagIcon; label: string }, { icon: TagIcon; label: string }];
  cuisine: CuisineKey;
  area: AreaKey;
  scenes: SceneKey[];
  liked: boolean;
  photo: number;
  chip: "green" | "cream" | "creamred" | "red" | "olive" | "creamgray";
};

export const SHOPS: Shop[] = [
  { id: "1", name: "四季の味 たなか", station: "代々木上原駅", walk: 5, desc: ["旬の食材を丁寧に仕立てた、", "季節を味わう和食店。"], tags: [{ icon: "room", label: "個室あり" }, { icon: "bulb", label: "落ち着いた雰囲気" }], cuisine: "和食", area: "駅周辺", scenes: ["ひとりで", "特別な日に"], liked: false, photo: 1, chip: "green" },
  { id: "2", name: "ビストロ ル・ソレイユ", station: "西口駅", walk: 3, desc: ["旬の食材を生かした、", "気軽に楽しめるフレンチビストロ。"], tags: [{ icon: "counter", label: "カウンター" }, { icon: "heart", label: "デートにおすすめ" }], cuisine: "洋食", area: "西エリア", scenes: ["デートに", "友人と"], liked: true, photo: 2, chip: "cream" },
  { id: "3", name: "上海点心楼", station: "中央駅", walk: 4, desc: ["本場の味を気軽に楽しめる", "点心と中華の名店。"], tags: [{ icon: "basket", label: "子連れOK" }, { icon: "clock", label: "ランチ人気" }], cuisine: "中華・アジア", area: "中心街", scenes: ["家族で", "友人と"], liked: false, photo: 3, chip: "creamred" },
  { id: "4", name: "麺や 風月", station: "南口駅", walk: 6, desc: ["こだわりの自家製麺と", "濃厚スープが自慢。"], tags: [{ icon: "door", label: "カウンター" }, { icon: "clock", label: "深夜営業" }], cuisine: "ラーメン", area: "南エリア", scenes: ["ひとりで"], liked: false, photo: 4, chip: "green" },
  { id: "5", name: "やきとり 鳥まる", station: "東口駅", walk: 2, desc: ["備長炭で焼き上げる、", "香ばしい焼き鳥と旬の一品料理。"], tags: [{ icon: "room", label: "個室あり" }, { icon: "bag", label: "仕事帰りに" }], cuisine: "焼肉・焼鳥", area: "東エリア", scenes: ["仕事仲間と", "友人と"], liked: false, photo: 5, chip: "red" },
  { id: "6", name: "大衆酒場 まちのや", station: "北口駅", walk: 3, desc: ["地元の人に愛される、", "気軽に立ち寄れる大衆酒場。"], tags: [{ icon: "glass", label: "飲み放題あり" }, { icon: "clock", label: "にぎやか" }], cuisine: "居酒屋・バー", area: "北エリア", scenes: ["仕事仲間と", "友人と"], liked: true, photo: 6, chip: "olive" },
  { id: "7", name: "カフェ ことり", station: "山手駅", walk: 7, desc: ["季節のフルーツを使った", "手作りスイーツが人気のカフェ。"], tags: [{ icon: "awning", label: "テラス席" }, { icon: "thumb", label: "女子会におすすめ" }], cuisine: "カフェ・甘味", area: "山手エリア", scenes: ["カフェでひと息", "友人と", "デートに"], liked: false, photo: 7, chip: "creamgray" },
  { id: "8", name: "旬菜 やまもと", station: "海辺駅", walk: 8, desc: ["海の恵みと季節の食材を味わう", "大人の隠れ家。"], tags: [{ icon: "dome", label: "夜景が見える" }, { icon: "clock", label: "特別な日に" }], cuisine: "和食", area: "海辺エリア", scenes: ["特別な日に", "デートに"], liked: false, photo: 8, chip: "green" },
];
