import type { MetadataRoute } from "next";
import { REGIONS, type RegionKey } from "@/lib/data";
import { SCENES } from "@/lib/scenes";
import { getFeatureCountsByRegion } from "@/lib/featureRegions";
import { getAllRestaurantIds } from "@/lib/db/restaurants";
import { getAllFeatureArticleIds, isFeatureIndexable } from "@/lib/db/features";

const BASE = "https://machinowa.tokyo";

/**
 * 動的サイトマップ
 *
 * - 店舗/特集記事 ID は DB（Supabase）を真実の源として取得する
 *   data.ts の hardcoded リストは廃止し、フォールバック経由でのみ吸収
 * - REGIONS / SCENES はコード定数なので data.ts を参照
 * - 特集記事は isFeatureIndexable で noindex 扱いをフィルタリング
 *
 * Next.js が `revalidate` を毎回再生成するように、export const dynamic を指定。
 */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${BASE}/feature`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // 店舗 ID は DB から取得（data.ts は fallback で union 済み）
  const restaurantIds = await getAllRestaurantIds();
  const restaurants: MetadataRoute.Sitemap = restaurantIds.map((id) => ({
    url: `${BASE}/restaurant/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS).map((k) => ({
    url: `${BASE}/region/${k}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 特集記事 ID は DB から取得し、indexable のみ含める
  const featureIds = await getAllFeatureArticleIds();
  const features: MetadataRoute.Sitemap = featureIds
    .filter((id) => isFeatureIndexable(id))
    .map((id) => ({
      url: `${BASE}/feature/${id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const scenes: MetadataRoute.Sitemap = SCENES.map((s) => ({
    url: `${BASE}/scene/${s.slug}`,
    lastModified: now,
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
      lastModified: now,
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
