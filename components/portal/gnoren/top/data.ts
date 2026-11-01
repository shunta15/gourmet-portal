// 見本 1(トップ)の仮の中身。見本のとおり(実データへの置き換えは後の工程)。
export const TOP_SEARCH = "/proto-gourmet/n/search";
export const TOP_FEATURE = "/proto-gourmet/n/feature";
export const TOP_FEATURE_SAMPLE = "/proto-gourmet/n/feature/sample";

/** 料理から探す(暖簾 7 枚)。tone = 麻地の色(green=深緑 / linen=生成り / red=赤) */
export const CATS = [
  { key: "washoku", label: "和食", tone: "green" },
  { key: "yoshoku", label: "洋食", tone: "linen" },
  { key: "chuka", label: "中華・アジア", tone: "red" },
  { key: "ramen", label: "ラーメン", tone: "linen" },
  { key: "yakiniku", label: "焼肉・焼鳥", tone: "green" },
  { key: "izakaya", label: "居酒屋・バー", tone: "red" },
  { key: "cafe", label: "カフェ・甘味", tone: "linen" },
] as const;

/** エリアから探す(縦のバナー 8 枚)。tone = 文字の色(light=白 / dark=墨) */
export const AREAS = [
  { name: "駅周辺", tone: "light" },
  { name: "中心街", tone: "dark" },
  { name: "東エリア", tone: "dark", rod: "dark" },
  { name: "西エリア", tone: "light" },
  { name: "南エリア", tone: "dark" },
  { name: "北エリア", tone: "dark" },
  { name: "海辺エリア", tone: "dark" },
  { name: "山手エリア", tone: "dark" },
] as const;

export const SCENES = [
  { title: "ひとりで", lines: ["気軽に、", "自分だけのごはん時間"] },
  { title: "友人と", lines: ["気の合う仲間と", "おいしい時間を"] },
  { title: "デートに", lines: ["特別な一日を", "もっと素敵に"] },
  { title: "家族で", lines: ["みんなの笑顔が集まる", "楽しい食事"] },
  { title: "仕事仲間と", lines: ["仕事のあとの", "大切なひととき"] },
  { title: "カフェでひと息", lines: ["こだわりの一杯で", "やすらぐ時間"] },
] as const;

/** 特集から読む(4 枚)。tone = 文字の色(light=白 / dark=墨) */
export const FEATURES = [
  { title: ["この街の", "名店の味"], sub: ["地元で愛される、", "本物の一皿を訪ねて"], tone: "light", big: true },
  { title: ["あの人の", "行きつけ"], sub: ["店主・料理人・まちの人たちの", "とっておきの一軒"], tone: "dark" },
  { title: ["今、食べたい", "あの味"], sub: ["編集部が選ぶ", "注目のグルメトレンド"], tone: "light" },
  { title: ["街のカフェ時間"], sub: ["日常を少し特別にする", "とっておきのカフェ"], tone: "dark" },
] as const;

/** 見本の実測位置(x 座標・見本 1 画素)。手描き風でグリッドから 1〜4px ずれているので、見本どおりに置く。PC のみ(スマホは並べるだけ) */
export const CAT_X = [54, 197, 334, 475, 619, 761, 903];
export const AREA_X = [54, 143, 234, 324, 414, 504, 595, 686]; // バナー(布)の左 = 写真の左 - 3
export const SCENE_X = [44, 213, 383, 553, 723, 893];
export const FEAT_X = [51, 302, 551, 800];
