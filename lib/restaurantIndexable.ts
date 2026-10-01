/**
 * 店舗ページを検索エンジンに出してよいか（index / noindex）の判定。
 *
 * 対象は記事由来の店（lib/articleStores.ts・r299〜）だけ。
 * 材料がそろわない薄いページを大量に index させるとサイト全体の評価を落とすため（PLAN.md Phase 1-6）、
 *   ① 実写画像がある（プレースホルダでない）
 *   ② 住所がある
 *   ③ 営業時間がある
 * の3つがすべて満たされたときだけ index。どれか欠けたら noindex（URL は有効・リンクと地図は使える）。
 * 材料が増えて（自動生成の再実行で）条件を満たせば、自動で index になる。
 *
 * 既存の店（r01〜r298）は従来どおり index（判定の対象外）。
 * 店舗ページの <meta robots> と app/sitemap.ts の両方がこの関数を使う（基準を一つにするため）。
 */
import { ARTICLE_STORES } from "./articleStores";
import type { Restaurant } from "./regions";

const PLACEHOLDER_DIR = "/restaurants/_placeholder/";
/** 「—」「—（訪問前に公式確認）」は、取れなかった値の印 */
const isUnknown = (v: string | undefined) => !v || !v.trim() || /^[—-]/.test(v.trim());

export function passesStoreQualityGate(r: Pick<Restaurant, "image" | "address" | "hours">): boolean {
  return !!r.image && !r.image.includes(PLACEHOLDER_DIR) && !isUnknown(r.address) && !isUnknown(r.hours);
}

const NOINDEX_IDS: ReadonlySet<string> = new Set(
  ARTICLE_STORES.filter((s) => !passesStoreQualityGate(s)).map((s) => s.id),
);

export function isRestaurantIndexable(id: string): boolean {
  return !NOINDEX_IDS.has(id);
}

/**
 * 地域ハブ（/region/<key>）を index してよいか。掲載店が少なすぎるハブは薄いページなので noindex にし、
 * sitemap からも外す（ページ自体は残す。店が増えて MIN_STORES_FOR_REGION_INDEX に達すれば自動で index に戻る）。
 * 店数は DB とコードの和集合（getRestaurantsByRegion / getAllRestaurants）で数える。
 */
export const MIN_STORES_FOR_REGION_INDEX = 3;

export function isRegionHubIndexable(storeCount: number): boolean {
  return storeCount >= MIN_STORES_FOR_REGION_INDEX;
}
