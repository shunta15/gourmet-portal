/**
 * 暖簾のエリアのページ（/region・/region/<key>・/region/<key>/<街>）用の純関数と型。サーバー・クライアントのどちらからも使える（データは読まない）。
 * 写真の判定は暖簾の特集・店ページと同じ（食べログの画像・仮の画像・空・表示禁止の画像は出さない。lib/portal/noren/usableImage.ts）。
 */
import { isUsableFeatureImage } from "./usableImage";
import { heroImagesOf } from "./shop";
import type { Restaurant } from "@/lib/regions";
import { AREA_DEFS } from "./areaGroups";

/** 店のカード 1 枚ぶん。img は「使える写真」だけ（無ければ空文字。カードは写真なしの布だけで出る） */
export type AreaShop = {
  id: string;
  /** #NN（店 ID の番号。今の店カード・店ページの「他の店」と同じ） */
  no: string;
  name: string;
  cuisine: string;
  area: string;
  img: string;
};

/**
 * カードの写真。今のカードと同じ一覧用の 1 枚（Restaurant.image）が使えるならそれ、使えなければ店ページの最初の写真
 * （heroImagesOf = 店ページと同じ並び）の先頭の「使える写真」。どちらも無ければ空文字（写真なしの布だけのカード）。
 */
export function shopPhoto(r: Pick<Restaurant, "image" | "heroImages" | "gallery">): string {
  if (isUsableFeatureImage(r.image)) return r.image;
  return heroImagesOf(r).find((u) => isUsableFeatureImage(u)) ?? "";
}

export function toAreaShop(r: Restaurant): AreaShop {
  return {
    id: r.id,
    no: `#${r.id.replace(/^r/, "").padStart(2, "0")}`,
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
    img: shopPhoto(r),
  };
}

/** 縦書きの名前（のぼり・店名）の字の大きさ（px）。字数が多いほど小さく */
export function flagFs(name: string, base = 34): number {
  const n = Array.from(name).length;
  if (n <= 3) return base;
  if (n <= 5) return Math.round(base * 0.82);
  if (n <= 7) return Math.round(base * 0.66);
  return Math.round(base * 0.54);
}

/** のぼりの大きさ（px）。幅・長さは軒数の平方根に比例（t = √(軒数 / 最大) = 0〜1）。長さは、縦書きの名前が収まる分を下限にする */
export function flagSize(name: string, t: number): { w: number; h: number } {
  const n = Array.from(name).length;
  const need = 36 + 16 + 40 + Math.ceil(n * flagFs(name) * 1.24);
  return { w: Math.round(62 + 36 * t), h: Math.max(Math.round(230 + 130 * t), need) };
}

/** エリア一覧を、地方ごとの区画に分ける（北から南へ。区分は areaGroups.ts の AREA_DEFS）。地域のキーは lib/regions.ts の RegionKey。ここに無いキーは最後の「その他」に入る */
export const AREA_BLOCKS: { key: string; label: string; en: string; keys: string[] }[] = AREA_DEFS.map((a) => ({ key: a.key, label: a.label, en: a.en, keys: [...a.regions] }));

/** 区画に入らなかったキーを「その他」の区画にして返す（地域が増えても、一覧から落ちないように） */
export function groupAreaKeys(allKeys: string[]): { key: string; label: string; en: string; keys: string[] }[] {
  const have = new Set(allKeys);
  const placed = new Set<string>();
  const blocks = AREA_BLOCKS.map((b) => {
    const keys = b.keys.filter((k) => have.has(k));
    keys.forEach((k) => placed.add(k));
    return { ...b, keys };
  }).filter((b) => b.keys.length > 0);
  const rest = allKeys.filter((k) => !placed.has(k));
  if (rest.length > 0) blocks.push({ key: "other", label: "その他", en: "Others", keys: rest });
  return blocks;
}
