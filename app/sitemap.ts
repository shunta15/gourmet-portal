import { onePageShopOf } from "@/lib/portal/noren/onePage";
import type { MetadataRoute } from "next";
import { RELEASE_REST } from "@/lib/portal/noren/release";
import { REGIONS, type RegionKey } from "@/lib/data";
import { SCENES } from "@/lib/scenes";
import { getFeatureCountsByRegion } from "@/lib/featureRegions";
import { getAllRestaurantIdsWithUpdatedAt, getAllRestaurants } from "@/lib/db/restaurants";
import { getAllFeatureArticleIdsWithUpdatedAt, isFeatureIndexable } from "@/lib/db/features";
import { isRegionHubIndexable, isRestaurantIndexable, isTownIndexable } from "@/lib/restaurantIndexable";
import { getAllTowns } from "@/lib/db/towns";
import { isPortalLive } from "@/lib/portal/launch";
import { NOREN_REGION_TO_SEARCH, NOREN_SCENE_TO_SEARCH } from "@/lib/portal/noren/rewrites";

const BASE = "https://machinowa.tokyo";

/** 総合トップ・特集のトップ・グルメのトップを最後に大きく変えた日時（2026-10-09: 総合サイトの公開と、特集のトップの暖簾化）。 */
const ENTRANCE_UPDATED = new Date("2026-10-09T18:13:00+09:00");

/**
 * 動的サイトマップ
 *
 * - 店舗/特集記事 ID は DB（Supabase）を真実の源として取得し、updated_at をサイトマップに反映
 *   data.ts の hardcoded リストは廃止し、フォールバック経由でのみ吸収
 * - REGIONS / SCENES はコード定数なので data.ts を参照
 * - 特集記事は isFeatureIndexable で noindex 扱いをフィルタリング
 *
 * revalidate で ISR を設定し、キャッシュ時間ごとに再生成。
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 公開スイッチ ON のときだけ、トップ・特集のトップ・グルメのトップに更新日を付ける（OFF の出力は従来と同一）。
  // 検索エンジンに「このページは変わった」と伝えるための日付。これらのページの題・デザインを大きく変えたら、ENTRANCE_UPDATED を手で直す。
  const entranceUpdated = RELEASE_REST && isPortalLive() ? { lastModified: ENTRANCE_UPDATED } : {};
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0, ...entranceUpdated },
    {
      url: `${BASE}/feature`,
      changeFrequency: "weekly",
      priority: 0.7,
      ...entranceUpdated,
    },
    // /gourmet（旧トップの移設先）は公開スイッチ ON のときだけ存在する。OFF では 404 なので載せない（出力は従来と同一）
    ...(isPortalLive() ? [{ url: `${BASE}/gourmet`, changeFrequency: "daily" as const, priority: 0.9, ...entranceUpdated }] : []),
  ];

  // 店舗 ID は DB から取得し、updated_at がある場合は lastModified に反映
  const restaurantData = await getAllRestaurantIdsWithUpdatedAt();
  // 記事由来の店は、実写画像・住所・営業時間がそろうものだけ載せる（店舗ページの noindex と同じ基準）
  const restaurants: MetadataRoute.Sitemap = restaurantData
    .filter((r) => isRestaurantIndexable(r.id))
    .map((r) => {
      const entry: Record<string, unknown> = {
        url: `${BASE}/restaurant/${r.id}`,
        changeFrequency: "weekly",
        priority: 0.8,
      };
      if (r.updatedAt) {
        entry.lastModified = new Date(r.updatedAt);
      }
      return entry as MetadataRoute.Sitemap[number];
    });

  // 地域・街のページを「さがす」へ統合したあと（2026-10-12 オーナー決定。公開スイッチ ON かつ NOREN_REGION_TO_SEARCH）は、/region 系を sitemap に載せない
  // （どれも /search へ恒久転送される。転送先の /search は noindex のまま触らない。index させるかはオーナーの判断待ち）
  const regionsRedirected = NOREN_REGION_TO_SEARCH && isPortalLive();
  // 掲載店が少ない地域ハブは sitemap から外す（ページは残り、noindex。店が増えれば自動で戻る）
  const regionStoreCounts: Record<string, number> = {};
  if (!regionsRedirected) for (const r of await getAllRestaurants()) regionStoreCounts[r.region] = (regionStoreCounts[r.region] || 0) + 1;
  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS)
    .filter((k) => !regionsRedirected && isRegionHubIndexable(regionStoreCounts[k] || 0))
    .map((k) => ({
      url: `${BASE}/region/${k}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // 街ページ（/region/<region>/<街>）は掲載店が3店以上の街だけ載せる（2店以下は noindex,follow でページだけ出す）
  const towns: MetadataRoute.Sitemap = (regionsRedirected ? [] : await getAllTowns())
    .filter((t) => isTownIndexable(t.count))
    .map((t) => ({
      url: `${BASE}${t.href}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // 特集記事 ID は DB から取得し、indexable のみ含める
  // Feature ID は URL パスセグメントなので percent-encode が必要
  const featureData = await getAllFeatureArticleIdsWithUpdatedAt();
  const features: MetadataRoute.Sitemap = featureData
    // 1 店 1 ページにした記事（lib/portal/noren/onePage.ts の表）は /feature/<ID> が /restaurant/<店の ID> への転送なので載せない（店の URL の側に 1 つだけ載る）
    .filter((f) => isFeatureIndexable(f.id) && !onePageShopOf(f.id))
    .map((f) => {
      const entry: Record<string, unknown> = {
        url: `${BASE}/feature/${encodeURIComponent(f.id)}`,
        changeFrequency: "monthly",
        priority: 0.6,
      };
      if (f.updatedAt) {
        entry.lastModified = new Date(f.updatedAt);
      }
      return entry as MetadataRoute.Sitemap[number];
    });

  // 利用シーンのページも「さがす」へ統合したあと（公開スイッチ ON かつ NOREN_SCENE_TO_SEARCH）は載せない（/search?scene=<slug> へ恒久転送される）
  const scenes: MetadataRoute.Sitemap = (NOREN_SCENE_TO_SEARCH && isPortalLive() ? [] : SCENES).map((s) => ({
    url: `${BASE}/scene/${s.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const featureCounts = getFeatureCountsByRegion();
  const featureRegionHubs: MetadataRoute.Sitemap = (
    Object.keys(REGIONS) as RegionKey[]
  )
    .filter((k) => featureCounts[k] > 0)
    .map((k) => ({
      url: `${BASE}/feature/region/${k}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...restaurants,
    ...regions,
    ...towns,
    ...features,
    ...scenes,
    ...featureRegionHubs,
  ];
}
