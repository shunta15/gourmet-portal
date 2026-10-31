/**
 * 暖簾 3 トップ(見本 1_最初.png・1086×1448)の座標と文言。
 * 座標はすべて「見本の画素 = u」。y は見本の絶対 y(ヘッダー 55u 込み)で書いてあり、
 * 各セクションの top(下の *_TOP)を引いてセクション内の y にする。
 * 仮の店名・文章・数字は見本のまま(本番には出さない)。
 */
export const IMG = "/_portal/gnoren3/top";
export const BASE = "/proto-gourmet/n3";

/** セクションの上端(見本の y)。main の先頭 = 見本の y=55。 */
export const HERO_TOP = 55;
export const CUISINE_TOP = 541;
export const AREA_TOP = 804;
export const SCENE_TOP = 1027;
export const FEATURE_TOP = 1226;
/** セクションの高さ(u)。合計 = 486 + 263 + 223 + 199 + 222 = 1393 = 1448 − 55 */
export const HERO_H = 486;
export const CUISINE_H = 263;
export const AREA_H = 223;
export const SCENE_H = 199;
export const FEATURE_H = 222;

export const STATS = [
  { icon: "shop", num: "509", label: "店舗", iconX: 315, iconY: 473.5, iconW: 27, iconH: 23.5, tx: 362.5, numCy: 474, labCy: 499, lf: 13.5, ls: 0.05 },
  { icon: "map", num: "41", label: "エリア", iconX: 486, iconY: 473, iconW: 29, iconH: 25, tx: 537.5, numCy: 474, labCy: 499.5, lf: 12.5, ls: 0.08 },
  { icon: "bowl", num: "7", label: "料理分類", iconX: 662, iconY: 473, iconW: 31, iconH: 25, tx: 714, numCy: 474, labCy: 499, lf: 14, ls: 0.07 },
] as const;

/** 料理からさがす(7 枚)。left/w は暖簾の左端・幅(白い継ぎ目の位置から測定)。cx は絵柄・文字の中心 x。 */
export const CUISINE = [
  { label: "和食", icon: "rice", tone: "navy", left: 49, w: 137, cx: 117 },
  { label: "洋食", icon: "fork", tone: "linen", left: 186, w: 147, cx: 255.5 },
  { label: "中華・アジア", icon: "bowl", tone: "navy", left: 333, w: 136, cx: 397 },
  { label: "ラーメン", icon: "ramen", tone: "linen", left: 469, w: 143, cx: 541 },
  { label: "焼肉・焼鳥", icon: "grill", tone: "red", left: 612, w: 143, cx: 684.5 },
  { label: "居酒屋・バー", icon: "bar", tone: "navy", left: 755, w: 144, cx: 827.5 },
  { label: "カフェ・甘味", icon: "cafe", tone: "linen", left: 899, w: 139, cx: 971 },
] as const;
export const CUISINE_CARD_Y = 589; // カードの上端(見本 y)
export const CUISINE_CARD_H = 199;
export const CUISINE_ICON_CY = 622.5; // 見本 y(絵柄の中心)
export const CUISINE_LABEL_CY = 651.5;

/** エリアからさがす(暖簾の旗 7 本)。rect = 旗の布。tx=文字の中心 x・ty=最初の字の em 上端 y・cx/cy=丸矢印の中心 */
export const AREAS = [
  { label: "中央エリア", tone: "navy", rect: [123, 867, 69, 147], tx: 158, ty: 895, ls: 0.11, cx: 155, cy: 987 },
  { label: "東エリア", tone: "linen", rect: [215, 869, 63, 146], tx: 247, ty: 896, ls: 0.16, cx: 246, cy: 988.5 },
  { label: "西エリア", tone: "red", rect: [310, 865, 63, 150], tx: 341, ty: 896, ls: 0.115, cx: 340, cy: 989 },
  { label: "南エリア", tone: "navy", rect: [405, 868, 62, 147], tx: 435.5, ty: 897.5, ls: 0.14, cx: 434.5, cy: 989 },
  { label: "北エリア", tone: "linen", rect: [497, 879, 57, 136], tx: 525, ty: 904, ls: 0.04, cx: 524.5, cy: 990 },
  { label: "駅周辺エリア", tone: "navy", rect: [588, 888, 55, 129], tx: 615, ty: 902, ls: 0.02, cx: 615, cy: 995 },
  { label: "郊外エリア", tone: "linen", rect: [680, 892, 54, 128], tx: 707, ty: 912, ls: 0.02, cx: 706.5, cy: 998 },
] as const;

export const SCENES = [
  { a: "仲間と", b: "にぎやかに", left: 51, w: 163, tx: 63.5 },
  { a: "大切な人と", b: "特別な時間", left: 221, w: 160, tx: 236.5 },
  { a: "ひとりで", b: "ふらっと", left: 386, w: 156, tx: 400 },
  { a: "家族で", b: "たのしく", left: 549, w: 159, tx: 563 },
  { a: "昼から", b: "ゆったり", left: 714, w: 156, tx: 730 },
  { a: "仕事帰りに", b: "一杯", left: 875, w: 162, tx: 892.5 },
] as const;
export const SCENE_CARD_Y = 1077;
export const SCENE_CARD_H = 136;

export const FEATURES = [
  { a: "この街の、", b: "うまいを つくる人たち", left: 51, w: 242, tx: 62 },
  { a: "あの店の、", b: "もうひとつの顔", left: 299, w: 237, tx: 315.5 },
  { a: "地元で愛される", b: "名店のはなし", left: 547, w: 236, tx: 565.5 },
  { a: "街と、店と、人と", b: "マチノワの楽しみ方", left: 791, w: 246, tx: 807.5 },
] as const;
export const FEATURE_CARD_Y = 1268;
export const FEATURE_CARD_H = 155;
