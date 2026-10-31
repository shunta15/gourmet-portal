// 暖簾 3 特集一覧(見本 5)の中身。仮の題・文章・日付も見本のまま(本番には出さない試作)。
// x / y / w / h は見本(1086×1448px)の画素。y はページ上端からの値(ヘッダー 55u 込み)。CSS 側が y − 55 に直す。

export const FL_BASE = "/proto-gourmet/n3/feature";
export const FL_ARTICLE = "/proto-gourmet/n3/feature/sample";

export type FlTag = { id: string; label: string; x: number; w: number; cx: number; kind: "navy" | "linen" | "red"; href: string };
export const FL_TAGS: FlTag[] = [
  { id: "tag1", label: "シーンで選ぶ", x: 47, w: 167, cx: 131.5, kind: "navy", href: "#fl-scene" },
  { id: "tag2", label: "エリアで巡る", x: 213, w: 163, cx: 295, kind: "linen", href: "#fl-area" },
  { id: "tag3", label: "料理で深掘る", x: 375, w: 168, cx: 460, kind: "red", href: "#fl-ryori" },
  { id: "tag4", label: "ひとりごはん", x: 543, w: 172, cx: 630, kind: "navy", href: "#fl-new" },
  { id: "tag5", label: "接待・会食", x: 714, w: 165, cx: 798, kind: "linen", href: "#fl-scene" },
  { id: "tag6", label: "カフェ時間", x: 877, w: 163, cx: 962, kind: "red", href: "#fl-cafe" },
];

export const FL_SIDE = [
  { id: "feat-s1", img: "feat-s1", y: 426, h: 101, ty: 430, dt: 470.25, title: ["冬のごちそう。", "あったかおでんの名店"], desc: ["出汁が染みる、心もほどける。", "この冬行きたいおでんの名店を", "集めました。"], date: "2024.11.20", dy: 509.5 },
  { id: "feat-s2", img: "feat-s2", y: 539, h: 94, ty: 545, dt: 584.75, title: ["大人の肉時間", "— ご褒美ディナー特集"], desc: ["特別な夜に訪れたい、", "極上の肉料理と大人の空間。"], date: "2024.11.15", dy: 618.5 },
  { id: "feat-s3", img: "feat-s3", y: 643, h: 93, ty: 649, dt: 676.75, title: ["街のカフェで、ひと息。"], desc: ["こだわりのコーヒーと甘いもの。", "日常に寄り添うカフェを集めました。"], date: "2024.11.10", dy: 718.5 },
];

export type FlNew = { img: string; x: number; w: number; cat: string; kind: "red" | "navy" | "sand"; title: string[]; desc: string[]; date: string };
export const FL_NEW: FlNew[] = [
  { img: "new1", x: 50, w: 159, cat: "料理で深掘る", kind: "red", title: ["地元で愛される", "海鮮の名店"], desc: ["新鮮だからうまい。市場の", "そばで味わう、海の幸。"], date: "2024.11.28" },
  { img: "new2", x: 217, w: 158, cat: "シーンで選ぶ", kind: "navy", title: ["冬に行きたい", "鍋の名店"], desc: ["心も体もあたたまる、", "この季節だけの味わい。"], date: "2024.11.25" },
  { img: "new3", x: 383, w: 158, cat: "エリアで巡る", kind: "sand", title: ["下町で味わう", "昭和の名店"], desc: ["変わらない味と、", "あたたかい人情に出会う。"], date: "2024.11.22" },
  { img: "new4", x: 548, w: 158, cat: "接待・会食", kind: "sand", title: ["大切な人と行きたい", "名店"], desc: ["接待や会食にふさわしい、", "上質な時間と料理を。"], date: "2024.11.20" },
  { img: "new5", x: 714, w: 158, cat: "カフェ時間", kind: "red", title: ["こだわりのコーヒーで", "ゆるやかな時間を"], desc: ["街のカフェで見つけた、", "とっておきの一杯。"], date: "2024.11.18" },
  { img: "new6", x: 879, w: 159, cat: "ひとりごはん", kind: "navy", title: ["ひとりでも楽しめる", "大人の酒場"], desc: ["気ままに、ゆっくりと。", "ひとりの時間を豊かにする店。"], date: "2024.11.16" },
];

export const FL_SCENE = [
  { img: "scene1", x: 50, w: 240, title: "仕事帰りに一杯", desc: ["今日も一日、おつかれさま。", "仕事帰りに立ち寄りたいお店。"], count: "12 記事" },
  { img: "scene2", x: 298, w: 243, title: "デートにおすすめ", desc: ["大切な人と過ごす、", "特別なひとどき。"], count: "14 記事" },
  { img: "scene3", x: 549, w: 241, title: "家族で楽しむ", desc: ["みんなで囲む。", "笑顔の食卓。"], count: "9 記事" },
  { img: "scene4", x: 798, w: 240, title: "観光で訪れたい", desc: ["この街に来たら、", "ぜひ味わってほしい名店。"], count: "15 記事" },
];

export type FlGroup = { id: string; title: string; x: number; linkX: number; items: { img: string; x: number; w: number; title: string; count: string }[] };
export const FL_GROUPS: FlGroup[] = [
  {
    id: "fl-area", title: "エリアで選る", x: 50, linkX: 281, items: [
      { img: "bot1", x: 50, w: 103, title: "中央エリア", count: "8 記事" },
      { img: "bot2", x: 155, w: 100, title: "東エリア", count: "12 記事" },
      { img: "bot3", x: 257, w: 101, title: "西エリア", count: "10 記事" },
    ],
  },
  {
    id: "fl-ryori", title: "料理で深掘る", x: 395, linkX: 624, items: [
      { img: "bot4", x: 392, w: 100, title: "寿司", count: "11 記事" },
      { img: "bot5", x: 494, w: 104, title: "ラーメン", count: "9 記事" },
      { img: "bot6", x: 600, w: 102, title: "焼肉・焼鳥", count: "12 記事" },
    ],
  },
  {
    id: "fl-cafe", title: "カフェ時間", x: 733, linkX: 961, items: [
      { img: "bot7", x: 730, w: 99, title: "カフェ巡り", count: "14 記事" },
      { img: "bot8", x: 832, w: 100, title: "スイーツ", count: "9 記事" },
      { img: "bot9", x: 934, w: 105, title: "喫茶店", count: "8 記事" },
    ],
  },
];
