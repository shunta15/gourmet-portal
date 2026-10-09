import { beauty } from "@/lib/verticals/beauty";

export type KumoriEntry = { slug: string; name: string; href: string; num: string };

/** 種類 6 つ。名前と行き先は lib/verticals/beauty.ts から取る */
export const KUMORI_ENTRIES: KumoriEntry[] = beauty.categories.map((c, i) => ({
  slug: c.slug,
  name: c.name,
  href: `/beauty/${c.slug}`,
  num: String(i + 1).padStart(2, "0"),
}));

/** 最初の画面のリード。今の /beauty（components/portal/VerticalHub.tsx）と同じ文を、種類の名前から作る */
export const KUMORI_LEAD = `${beauty.categories.map((c) => c.name).join("、")}の店を、エリア・種類・利用シーンから探せる入口です。`;

/**
 * 写真素材（Unsplash）を出すか、出さないか。**ここ 1 か所**で切り替える（既定 true。オーナーの返事待ち）。
 * false のとき: 次の写真がすべて出ず、写真の代わりに色面・絵だけで成り立つ（空の枠・壊れた画像・クレジット行は出ない）。
 *   1. 最初の画面の鏡の奥の店内写真（KumoriHero の .k-photo。KUMORI_PHOTO）と、動きを減らす設定のときの奥の場面の写真（.k-after-photo）
 *   2. 種類 6 つのガラスの奥の写真（KumoriBelow の KUMORI_PANES）
 *   3. エリアの地図の奥の写真と、タイルの丸い跡に見える同じ写真（KUMORI_AREA_PHOTO、--ph）
 *   4. 利用シーンのガラスの奥の写真（KUMORI_SCENE_PHOTO）
 *   5. 「Photo: Unsplash」のクレジット（最初の画面の隅と、下の撮影者の行）
 */
export const KUMORI_PHOTOS = true;

/** 映り込みの写真（photos2.json の v2-salon-02。approved: true。丸い鏡ごしの椅子と窓） */
export const KUMORI_PHOTO = {
  id: "v2-salon-02",
  base: "https://images.unsplash.com/photo-1626379499242-52863d313084",
  alt: "",
  pos: "50% 55%",
};

export const photoUrl = (w: number) => `${KUMORI_PHOTO.base}?auto=format&fit=crop&w=${w}&q=75`;

/** 曇りの下に映る灯りのぼけ（0〜1 の位置・半径は画面の短辺比）。曇りの層の下絵と映り込みの両方で使う */
export const KUMORI_BOKEH: { x: number; y: number; r: number; a: number }[] = [
  { x: 0.16, y: 0.2, r: 0.16, a: 0.5 },
  { x: 0.4, y: 0.1, r: 0.1, a: 0.42 },
  { x: 0.66, y: 0.16, r: 0.14, a: 0.46 },
  { x: 0.86, y: 0.34, r: 0.12, a: 0.4 },
  { x: 0.28, y: 0.62, r: 0.2, a: 0.3 },
  { x: 0.74, y: 0.74, r: 0.18, a: 0.34 },
  { x: 0.52, y: 0.46, r: 0.24, a: 0.22 },
];

/** 種類ごとのガラスの奥の写真（photos.json / photos2.json の approved: true。保存せず URL を <img> で）。同じ写真は 2 か所で使わない */
export type KumoriPane = {
  slug: string;
  photo: string; // 画像 URL（?auto=format&fit=crop&w=… を後ろに付ける）
  pos: string; // object-position
  scale: number; // 切り抜きの拡大（headspa は床のしみを外すため）
  origin: string; // 拡大の起点
  by: string; // 撮影者
  shape: string; // ガラスの形の名前（CSS クラス）
};

export const KUMORI_PANES: KumoriPane[] = [
  { slug: "hair", photo: "https://images.unsplash.com/photo-1560869713-bf165a9cfac1", pos: "50% 45%", scale: 1, origin: "50% 50%", by: "Baylee Gramling", shape: "arch" },
  { slug: "nail", photo: "https://images.unsplash.com/photo-1612887390768-fb02affea7a6", pos: "50% 40%", scale: 1, origin: "50% 40%", by: "Jodene Isakowitz", shape: "round" },
  { slug: "eyelash", photo: "https://images.unsplash.com/photo-1770999086860-143f54adf01b", pos: "40% 50%", scale: 1, origin: "40% 50%", by: "Jessica Donnelly", shape: "oval" },
  { slug: "esthetic", photo: "https://images.unsplash.com/photo-1589271243958-d61e12b61b97", pos: "50% 50%", scale: 1, origin: "50% 50%", by: "Thanos Pal", shape: "hand" },
  { slug: "hair-removal", photo: "https://images.unsplash.com/photo-1766727923658-ae4d4d837239", pos: "50% 50%", scale: 1, origin: "50% 50%", by: "Sohail Asim", shape: "tall" },
  { slug: "headspa", photo: "https://images.unsplash.com/photo-1695527081827-fdbc4e77be9b", pos: "45% 0%", scale: 1.42, origin: "45% 8%", by: "Daniel", shape: "port" },
];

/** 利用シーンの口紅の線(SVG パス。pathLength=1 で描く)。6 つ分 */
export const KUMORI_LIP_PATHS: string[] = [
  "M6 30 C 40 22, 76 36, 112 27 S 176 31, 194 21",
  "M22 22 C 20 6, 176 2, 188 20 C 198 38, 34 42, 16 24",
  "M8 26 C 60 20, 120 32, 192 24 M14 35 C 70 31, 130 38, 186 33",
  "M6 24 C 28 12, 44 36, 70 24 S 112 14, 134 26 S 176 34, 194 22",
  "M10 34 C 50 26, 98 38, 150 28 L 190 16",
  "M30 30 C 6 28, 10 8, 40 8 C 90 4, 168 6, 186 18 C 198 30, 150 40, 70 38",
];

export const KUMORI_PHOTO_BY = "Giorgio Trovato"; // 最初の画面の映り込み（v2-salon-02）

/** エリア・利用シーンの曇りガラスの奥の雰囲気写真（photos2.json の v2-light-02 / v2-light-03。approved: true）。ほかでは使わない */
export const KUMORI_AREA_PHOTO = { photo: "https://images.unsplash.com/photo-1574197635162-68e4b468e4e9", pos: "50% 36%", by: "Jonathan Borba" };
export const KUMORI_SCENE_PHOTO = { photo: "https://images.unsplash.com/photo-1578500467296-441a11d5d55a", pos: "40% 62%", by: "Katsia Jazwinska" };
/** 地方ごとの 1 行の列数(幅いっぱいに広げる) */
export const KUMORI_AREA_COLS: Record<string, number> = { 北海道: 1, 東北: 6, 関東: 7, 中部: 5, 近畿: 7, 中国: 5, 四国: 4, 九州沖縄: 8 };

/**
 * エリアのタイル地図(12 列 × 11 行)。1 県 = 1 升目。北海道が右上、沖縄が左下。
 * 升目の位置は地理に沿って決めた: 東(右)へ行くほど col が増え、南(下)へ行くほど row が増える。
 * 隣り合う県は、なるべく隣の升目に来るようにした(本州は北東から南西へ斜めに流れ、四国・九州は海を挟んだ位置に置く)。
 */
export const KUMORI_TILES: Record<string, [number, number]> = {
  hokkaido: [11, 0],
  aomori: [10, 1],
  akita: [9, 2], iwate: [10, 2],
  yamagata: [9, 3], miyagi: [10, 3],
  niigata: [8, 4], fukushima: [9, 4],
  gunma: [8, 5], tochigi: [9, 5], ibaraki: [10, 5],
  nagano: [8, 6], saitama: [9, 6], chiba: [10, 6],
  yamanashi: [8, 7], tokyo: [9, 7],
  shizuoka: [8, 8], kanagawa: [9, 8],
  toyama: [7, 5], ishikawa: [6, 5],
  gifu: [7, 6], fukui: [6, 6],
  aichi: [7, 7], shiga: [6, 7],
  mie: [7, 8], nara: [6, 8],
  kyoto: [5, 6], hyogo: [4, 6],
  osaka: [5, 7], wakayama: [5, 8],
  tottori: [3, 6], shimane: [2, 6],
  okayama: [4, 7], hiroshima: [3, 7], yamaguchi: [2, 7],
  kagawa: [4, 8], ehime: [3, 8], kochi: [4, 9], tokushima: [5, 9],
  fukuoka: [1, 7], saga: [0, 7],
  kumamoto: [1, 8], nagasaki: [0, 8], oita: [2, 8],
  kagoshima: [1, 9], miyazaki: [2, 9],
  okinawa: [0, 10],
};

/** 地方名(指で書いた字)を置く位置: 升目の単位(left, top, width)と、そろえ */
export const KUMORI_REGION_LABELS: Record<string, { l: number; t: number; w: number; a: "left" | "right" }> = {
  北海道: { l: 8, t: 0.3, w: 2.8, a: "right" },
  東北: { l: 6.2, t: 2.2, w: 2.6, a: "right" },
  関東: { l: 10.15, t: 7.1, w: 1.85, a: "left" },
  中部: { l: 4.8, t: 3.6, w: 3, a: "right" },
  近畿: { l: 6.15, t: 9.15, w: 2, a: "left" },
  中国: { l: 2, t: 5.1, w: 2.4, a: "left" },
  四国: { l: 4.1, t: 10.05, w: 2, a: "left" },
  九州沖縄: { l: 0, t: 5.95, w: 2, a: "left" },
};
