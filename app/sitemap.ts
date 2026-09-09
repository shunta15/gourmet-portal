import type { MetadataRoute } from "next";
import { REGIONS, type RegionKey } from "@/lib/data";
import { SCENES } from "@/lib/scenes";
import { getFeatureCountsByRegion } from "@/lib/featureRegions";
import { getAllRestaurantIdsWithUpdatedAt } from "@/lib/db/restaurants";
import { getAllFeatureArticleIdsWithUpdatedAt, isFeatureIndexable } from "@/lib/db/features";

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
  const restaurants: MetadataRoute.Sitemap = restaurantData.map((r) => {
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

  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS).map((k) => ({
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
