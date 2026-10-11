/**
 * グルメの入口の「店をさがす」の節（components/portal/noren/OpenSearch.tsx）に渡すデータを、店の一覧から数える（サーバー側。クライアントに全店のデータは渡さない）。
 * 軽い関数だけ（fs・process.cwd() を使わない）。
 * - 業種の件数は lib/cuisineBroad.ts の matchesBroad で数える＝検索（/search?cuisine=）の絞り込みと同じ判定
 * - エリアは、店のある地域すべて（店の数の多い順、同数は REGIONS の順）
 * - シーンは lib/scenes.ts の 12 種（/scene/<slug>）
 */
import { REGIONS, type RegionKey } from "@/lib/regions";
import { countByBroad } from "@/lib/cuisineBroad";
import { SCENES } from "@/lib/scenes";

export type OpenSearchData = {
  total: number;
  regions: { key: string; name: string; count: number }[];
  cuisines: { label: string; count: number }[];
  scenes: { slug: string; name: string }[];
};

export function buildOpenSearchData(restaurants: readonly { id: string; region: string; cuisine: string }[]): OpenSearchData {
  const byRegion = new Map<string, number>();
  for (const r of restaurants) byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + 1);
  const order = Object.keys(REGIONS);
  const regions = [...byRegion.entries()]
    .filter(([k]) => k in REGIONS)
    .sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([k, count]) => ({ key: k, name: REGIONS[k as RegionKey].name, count }));
  return {
    total: restaurants.length,
    regions,
    cuisines: countByBroad(restaurants),
    scenes: SCENES.map((s) => ({ slug: s.slug, name: s.name })),
  };
}
