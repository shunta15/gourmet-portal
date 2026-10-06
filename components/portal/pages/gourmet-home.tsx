import HomeClient from "@/components/HomeClient";
import { SHORT_VIDEOS, NEIGHBORHOODS, REGIONS, toCardItem, type RegionKey, type Stat } from "@/lib/regions";
import { FEATURES, getNationalStats, getRegionStats } from "@/lib/data";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { isPortalLive } from "@/lib/portal/launch";
import { buildWall, entrancePhotos } from "@/lib/portal/photoWall";
import PhotosEntrance from "@/components/portal/PhotosEntrance";
import FacetEntrance from "../FacetEntrance";
import OmakaseEntrance from "../OmakaseEntrance";

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

  // 総合サイトの入口（公開スイッチ ON のときだけ。OFF のときは undefined で、出力は従来と同じ）。
  // 「おまかせ提案」「こだわり条件でさがす」「写真から探す」を、HomeClient の1つのスロット（portalEntrances）にまとめて渡す。
  let portalEntrances: React.ReactNode;
  if (isPortalLive()) {
    const wall = buildWall(restaurants);
    portalEntrances = (
      <>
        <OmakaseEntrance total={restaurants.length} />
        <FacetEntrance />
        <PhotosEntrance photos={entrancePhotos(wall, 6)} total={wall.items.length} />
      </>
    );
  }

  return (
    <HomeClient
      features={FEATURES}
      shortVideos={SHORT_VIDEOS}
      neighborhoods={NEIGHBORHOODS}
      restaurants={cardItems}
      cuisines={cuisines}
      stats={stats}
      regionStats={regionStats}
      portalEntrances={portalEntrances}
    />
  );
}
