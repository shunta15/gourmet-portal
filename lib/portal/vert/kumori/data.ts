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
