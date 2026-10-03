import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { SHORT_VIDEOS, NEIGHBORHOODS, REGIONS, toCardItem, type RegionKey, type Stat } from "@/lib/regions";
import { FEATURES, getNationalStats, getRegionStats } from "@/lib/data";
import { getAllRestaurants } from "@/lib/db/restaurants";

// 旧トップ（/）の中身をそのまま移設したページ。変えるのは metadata だけ（canonical は自分自身の /gourmet）。
export const metadata: Metadata = {
  title: "グルメの店をエリア・特集・シーンから探す｜マチノワグルメ",
  description:
    "全国の街のいいお店を、エリア・業態・特集・利用シーンから巡れるグルメのポータル「マチノワグルメ」。",
  alternates: { canonical: "/gourmet" },
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
