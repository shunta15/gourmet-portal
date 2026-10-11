/**
 * 「さがす」の入口の札（入口 /gourmet の「店を、さがす。」・検索のトップ /search・地域のページ・シーンのページの絞り込みの帯）に渡すデータを、店の一覧から数える
 * （サーバー側。クライアントに全店のデータは渡さない）。軽い関数だけ（fs・process.cwd() を使わない）。
 * - 業種の件数は lib/cuisineBroad.ts の matchesBroad（検索の ?cuisine= の絞り込みと同じ判定）
 * - シーンの件数は lib/portal/noren/sceneMatch.ts の shopInScene（シーンのページ・検索の ?scene= と同じ判定）
 * - エリアは、店のある地域すべて（店の数の多い順、同数は REGIONS の順）
 */
import { REGIONS, type RegionKey } from "@/lib/regions";
import { BROAD_GROUPS, countByBroad } from "@/lib/cuisineBroad";
import { SCENES } from "@/lib/scenes";
import { shopInScene } from "./sceneMatch";

export type ShopLite = { id: string; region: string; cuisine: string; tags?: readonly string[] };

export type CuisineCount = { key: string; kanji: string; label: string; count: number };
export type SceneCount = { slug: string; name: string; count: number };
export type RegionCount = { key: string; name: string; count: number };

export type OpenSearchData = {
  total: number;
  regions: RegionCount[];
  /** 業種の 7 つの大分類（暖簾の章と同じ並び）。kanji は暖簾の一文字、key は章の key */
  cuisines: CuisineCount[];
  scenes: SceneCount[];
};

/** 業種 7 つの大分類ごとの店の数 */
export function countCuisines(shops: readonly ShopLite[]): CuisineCount[] {
  return countByBroad(shops).map((c, i) => ({ key: BROAD_GROUPS[i].key, kanji: BROAD_GROUPS[i].kanji, label: c.label, count: c.count }));
}

/** 利用シーン 12 種ごとの店の数 */
export function countScenes(shops: readonly ShopLite[]): SceneCount[] {
  return SCENES.map((s) => ({ slug: s.slug, name: s.name, count: shops.filter((r) => shopInScene(s.matchTags, r.tags)).length }));
}

/** 店のある地域すべて（店の数の多い順、同数は REGIONS の順） */
export function countRegions(shops: readonly ShopLite[]): RegionCount[] {
  const byRegion = new Map<string, number>();
  for (const r of shops) byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + 1);
  const order = Object.keys(REGIONS);
  return [...byRegion.entries()]
    .filter(([k]) => k in REGIONS)
    .sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([k, count]) => ({ key: k, name: REGIONS[k as RegionKey].name, count }));
}

export function buildOpenSearchData(shops: readonly ShopLite[]): OpenSearchData {
  return { total: shops.length, regions: countRegions(shops), cuisines: countCuisines(shops), scenes: countScenes(shops) };
}
