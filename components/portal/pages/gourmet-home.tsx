import HomeClient from "@/components/HomeClient";
import { SHORT_VIDEOS, NEIGHBORHOODS, REGIONS, toCardItem, type RegionKey, type Stat } from "@/lib/regions";
import { FEATURES, getNationalStats, getRegionStats } from "@/lib/data";
import { getAllRestaurants } from "@/lib/db/restaurants";

/**
 * グルメのトップの中身（旧 `/` の page.tsx をそのまま移したもの。サーバーコンポーネント）。
 * - スイッチ OFF のとき: `/`（app/page.tsx）が出す。metadata は旧 `/` と同じ。
 * - スイッチ ON のとき: `/gourmet`（app/gourmet/page.tsx）が出す。
 * ここは旧 `/` の中身なので、挙動を変えない（変えると OFF の `/` が main と食い違う。proto-portal/compare-off.mjs で検査）。
 */
export default async function GourmetHome() {
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
