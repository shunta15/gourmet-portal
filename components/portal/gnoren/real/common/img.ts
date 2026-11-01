/**
 * 店・記事の写真を集める道具。サーバー用(lib/portal/noren/shop.ts・lib/imageBlocklist.ts を読む)。
 * 'use client' の部品からは import しない(結果の URL 文字列だけを props で渡す)。
 */
import type { Restaurant } from "@/lib/regions";
import { heroImagesOf } from "@/lib/portal/noren/shop";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { sized, sizedSrcSet, CARD_SIZES } from "@/lib/imageUrl";

/**
 * 店の全写真。heroImagesOf(r) → r.gallery → r.image の順の和集合(重複除去)。
 * 食べログ・_placeholder・表示禁止の画像(isUsableFeatureImage)は除く。空配列になることがある(0 枚の店は写真の節を出さない)。
 */
export function allShopPhotos(r: Restaurant): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [...heroImagesOf(r), ...(r.gallery ?? []), r.image]) {
    if (!u || seen.has(u) || !isUsableFeatureImage(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/**
 * <img> に渡す { src, srcSet, sizes }。/restaurants/ の自前の写真と Wikimedia・Unsplash は縮小版にし、それ以外の URL はそのまま(srcSet は付かない)。
 * w: 画面に出す最大の幅(px)。sizes: 既定は札の幅(CARD_SIZES)。ヒーローなど幅いっぱいの写真は "100vw" などを渡す。
 * 使い方: <img {...imgProps(src, 640)} alt="" loading="lazy" decoding="async" />(ファーストビューは loading を付けない)
 */
export function imgProps(src: string, w: number, sizes: string = CARD_SIZES): { src: string; srcSet?: string; sizes?: string } {
  const srcSet = sizedSrcSet(src);
  return srcSet ? { src: sized(src, w), srcSet, sizes } : { src: sized(src, w) };
}
