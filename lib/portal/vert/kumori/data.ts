import { beauty } from "@/lib/verticals/beauty";

export type KumoriEntry = { slug: string; name: string; href: string; num: string };

/** 種類 6 つ。名前と行き先は lib/verticals/beauty.ts から取る */
export const KUMORI_ENTRIES: KumoriEntry[] = beauty.categories.map((c, i) => ({
  slug: c.slug,
  name: c.name,
  href: `/beauty/${c.slug}`,
  num: String(i + 1).padStart(2, "0"),
}));

export const KUMORI_LEAD =
  "美容室・ヘアサロン、ネイル、まつげ・眉、エステ、脱毛、ヘッドスパの店を、エリア・種類・利用シーンから探せる入口です。";

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
