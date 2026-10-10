/**
 * 暖簾のシーンのページ・店をさがすページの「店カード」用の純関数と型（サーバー・クライアントのどちらからも使える。データは読まない）。
 * 写真の判定は暖簾の特集ページ・店ページと同じ（isUsableFeatureImage）。使える写真が 1 枚も無い店は img が空文字（カードは布だけで出る。空の枠・壊れた画像は出さない）。
 */
import type { Restaurant, SearchItem } from "@/lib/regions";
import { heroImagesOf } from "./shop";
import { isUsableFeatureImage } from "./usableImage";

/** 店カード 1 枚ぶん。評価の数字・口コミの件数は持たない（出さない） */
export type ShopCardItem = {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  /** 使える写真。無ければ空文字 */
  img: string;
};

/** カードの写真。image が使えればそれ、無ければ店ページと同じ並び（heroImages → gallery → image）と gallery から、使える最初の 1 枚。無ければ空文字 */
export function shopCardPhoto(r: Pick<Restaurant, "image" | "heroImages" | "gallery">): string {
  if (isUsableFeatureImage(r.image)) return r.image;
  const a = heroImagesOf(r).find(isUsableFeatureImage);
  if (a) return a;
  return (r.gallery ?? []).find(isUsableFeatureImage) ?? "";
}

export function toShopCard(r: Restaurant): ShopCardItem {
  return { id: r.id, name: r.name, cuisine: r.cuisine, area: r.area, img: shopCardPhoto(r) };
}

/** 検索の部品へ渡す 1 店。キーワード検索に使う項目（住所・紹介文・タグ）は今の /search と同じ。写真は使えるものだけ（image が空なら写真なし）。評価の数字は渡さない */
export function toSearchShop(r: Restaurant): SearchItem {
  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
    region: r.region,
    address: r.address,
    desc: r.desc,
    tags: r.tags,
    shape: r.shape,
    image: shopCardPhoto(r),
  };
}

/** カードの番号（r12 → 12）。r＋数字の ID だけ。記事由来の店など、それ以外の ID は出さない（空文字） */
export function shopNo(id: string): string {
  return /^r\d+$/.test(id) ? id.slice(1).padStart(2, "0") : "";
}
