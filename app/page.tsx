import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { SHORT_VIDEOS, NEIGHBORHOODS, REGIONS, toCardItem, type RegionKey, type Stat } from "@/lib/regions";
import { FEATURES, getNationalStats, getRegionStats } from "@/lib/data";
import { getAllRestaurants } from "@/lib/db/restaurants";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  const restaurants = await getAllRestaurants();
  const cuisines = ["ALL", ...new Set(restaurants.map((r) => r.cuisine))];
  const stats = getNationalStats();
  const cardItems = restaurants.map(toCardItem);
  // 地域カードの統計はサーバーで計算（RegionsShowcase は client 経由で描画されるため data.ts を持ち込まない）
  const regionStats = Object.fromEntries(
    (Object.keys(REGIONS) as RegionKey[]).map((k) => [k, getRegionStats(k)])
  ) as Record<RegionKey, Stat[]>;

  return (
    <HomeClient
      features={FEATURES}
      shortVideos={SHORT_VIDEOS}
      neighborhoods={NEIGHBORHOODS}
      restaurants={cardItems}
      cuisines={cuisines}
      stats={stats}
      regionStats={regionStats}
    />
  );
}
