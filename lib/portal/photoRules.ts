/**
 * 総合サイトで使ってよい店写真かどうかの判定（純関数。サーバー・クライアント・生成スクリプトのどれからも読める）。
 * 食べログ系の画像・検閲済み画像・プレースホルダは使わない。
 * lib/portal/home.ts（総合トップ）と automation/portal/build-images.mjs（事前生成）が同じ判定を使う。
 */
import { isBlockedImage } from '@/lib/imageBlocklist';

export function isUsableImage(src: string | undefined | null): src is string {
  if (!src) return false;
  const s = src.toLowerCase();
  if (s.includes('tabelog') || s.includes('k-img.com') || s.includes('tblg')) return false;
  if (s.includes('_placeholder')) return false;
  if (isBlockedImage(src)) return false;
  return true;
}

/** 自サイトに置いてある店写真（public/restaurants/...）か。事前生成の対象はこれだけ */
export function isLocalShopPhoto(src: string | undefined | null): src is string {
  return !!src && src.startsWith('/restaurants/') && isUsableImage(src);
}
