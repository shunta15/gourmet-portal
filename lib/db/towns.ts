/**
 * 街（市区町村）単位のデータアクセス層（サーバー専用）。
 *
 * 店の一覧は lib/db/restaurants.ts（DB の公開行 ＋ DB に行が無いコード側の店）をそのまま使い、
 * 住所から街を取り出して束ねる（lib/towns.ts）。街の判定はここ一か所。
 * 街を取り出せない店（住所が市までしか無い等）はどの街ページにも出ない。
 */
import { cache } from "react";
import type { Restaurant, RegionKey } from "@/lib/regions";
import { getAllRestaurants, getRestaurantsByRegion } from "@/lib/db/restaurants";
import { groupByTown, parseTown, townHref } from "@/lib/towns";

export type TownSummary = {
  region: RegionKey;
  town: string;
  pref: string;
  count: number;
  href: string;
};

function summarize(stores: Restaurant[]): TownSummary[] {
  const { groups } = groupByTown(stores);
  return groups
    .map((g) => ({
      region: g.region as RegionKey,
      town: g.town,
      pref: g.pref,
      count: g.items.length,
      href: townHref(g.region, g.town),
    }))
    .sort((a, b) => b.count - a.count || a.town.localeCompare(b.town, "ja"));
}

const regionStores = cache((region: RegionKey) => getRestaurantsByRegion(region));
const allStores = cache(() => getAllRestaurants());

/** 全地域の街（店数の多い順）。generateStaticParams / sitemap 用。 */
export async function getAllTowns(): Promise<TownSummary[]> {
  return summarize(await allStores());
}

/** 1 地域の街（店数の多い順）。 */
export async function getTownsByRegion(region: RegionKey): Promise<TownSummary[]> {
  return summarize(await regionStores(region));
}

/** 街の店（実写画像のある店を先に、あとは ID 順）。街が存在しなければ空配列。 */
export async function getRestaurantsByTown(region: RegionKey, town: string): Promise<Restaurant[]> {
  const stores = await regionStores(region);
  const hit = stores.filter((r) => parseTown(r.address, r.region)?.town === town);
  const real = (r: Restaurant) => (r.image && !r.image.includes("/restaurants/_placeholder/") ? 0 : 1);
  return hit.sort((a, b) => real(a) - real(b) || a.id.localeCompare(b.id, "en", { numeric: true }));
}

/**
 * 店舗ページ用: この店の街と、その街の店数。街を取り出せなければ null。
 * regionStores に、呼び出し側がすでに取得済みの同地域の店を渡せる（DB を二重に引かない）。
 */
export async function getTownOfRestaurant(
  r: Pick<Restaurant, "address" | "region">,
  regionStoresHint?: Restaurant[],
): Promise<{ town: string; pref: string; count: number; href: string } | null> {
  const p = parseTown(r.address, r.region);
  if (!p) return null;
  const stores = regionStoresHint ?? (await regionStores(r.region as RegionKey));
  const count = stores.filter((x) => parseTown(x.address, x.region)?.town === p.town).length;
  return { town: p.town, pref: p.pref, count, href: townHref(r.region, p.town) };
}
