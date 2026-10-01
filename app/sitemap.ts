import type { MetadataRoute } from "next";
import { REGIONS, type RegionKey } from "@/lib/data";
import { SCENES } from "@/lib/scenes";
import { getFeatureCountsByRegion } from "@/lib/featureRegions";
import { getAllRestaurantIdsWithUpdatedAt, getAllRestaurants } from "@/lib/db/restaurants";
import { getAllFeatureArticleIdsWithUpdatedAt, isFeatureIndexable } from "@/lib/db/features";
import { isRegionHubIndexable, isRestaurantIndexable } from "@/lib/restaurantIndexable";

const BASE = "https://machinowa.tokyo";

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

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${BASE}/feature`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
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

  // 掲載店が少ない地域ハブは sitemap から外す（ページは残り、noindex。店が増えれば自動で戻る）
  const regionStoreCounts: Record<string, number> = {};
  for (const r of await getAllRestaurants()) regionStoreCounts[r.region] = (regionStoreCounts[r.region] || 0) + 1;
  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS)
    .filter((k) => isRegionHubIndexable(regionStoreCounts[k] || 0))
    .map((k) => ({
      url: `${BASE}/region/${k}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // 特集記事 ID は DB から取得し、indexable のみ含める
  // Feature ID は URL パスセグメントなので percent-encode が必要
  const featureData = await getAllFeatureArticleIdsWithUpdatedAt();
  const features: MetadataRoute.Sitemap = featureData
    .filter((f) => isFeatureIndexable(f.id))
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

  const scenes: MetadataRoute.Sitemap = SCENES.map((s) => ({
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
    ...features,
    ...scenes,
    ...featureRegionHubs,
  ];
}
