/**
 * 入口（/gourmet）の「店を、さがす。」の block の見た目（components/portal/noren/OpenSearchBlock.tsx）に渡すデータを作る（サーバー側）。
 * 軽い関数だけ（fs・process.cwd() を使わない）。店・写真は実在の掲載店。店との対応は ID・地域キーの完全一致（店名の部分一致は使わない）。
 * - 業種のタイル: 暖簾の章（lib/portal/noren/picks.ts の CATS）の、手で選んだ店の写真（章の先頭から、使える写真のある最初の店）
 * - 地図の帯（全国図）の目印: 掲載店のある地方ごとに 1 つ（北海道・東北／関東／中部／近畿／中国・四国／九州・沖縄。区分は lib/portal/noren/areaGroups.ts）。件数 = その地方の地域の件数
 *   （openSearchData.regions = 「さがす」の地域の一覧と同じ数え方）の合計 = 「さがす」の ?area=<地方> の件数（絞り込み無し）。位置は、その地方の店の座標（lib/geo.ts）の中央値
 *   （「さがす」の地方の日本の図の丸と同じ）。座標のある店が 1 軒も無い地方は、地域の目印の位置（lib/portal/noren/regionCenters.ts の FALLBACK_CENTER。ここに無い地域は数えない）の平均。
 */
import type { Restaurant } from "@/lib/regions";
import { GEO } from "@/lib/geo";
import { sized } from "@/lib/imageUrl";
import { CATS, photoFor } from "./picks";
import type { JpArea } from "./jpBand";
import { AREA_DEFS } from "./areaGroups";
import { FALLBACK_CENTER, median } from "./regionCenters";

export type BlockTile = { key: string; label: string; count: number; img: string };

/** 全国図の目印（掲載店のある地方ごと）。regions は店の数を数えた地域の一覧（lib/portal/noren/openSearch.ts の countRegions）。件数 0 の地方は出さない */
export function buildBandAreas(restaurants: readonly Restaurant[], regions: readonly { key: string; name: string; count: number }[]): JpArea[] {
  const countOf = new Map(regions.map((r) => [r.key, r.count]));
  const out: JpArea[] = [];
  for (const a of AREA_DEFS) {
    const count = a.regions.reduce((n, k) => n + (countOf.get(k) ?? 0), 0);
    if (count <= 0) continue;
    const inArea = new Set(a.regions);
    const lat: number[] = [];
    const lng: number[] = [];
    for (const r of restaurants) {
      const g = inArea.has(r.region) ? GEO[r.id] : undefined;
      if (!g) continue;
      lat.push(g.lat);
      lng.push(g.lng);
    }
    let at: { lat: number; lng: number } | null = lat.length > 0 ? { lat: median(lat), lng: median(lng) } : null;
    if (!at) {
      const cs = a.regions.filter((k) => (countOf.get(k) ?? 0) > 0 && FALLBACK_CENTER[k]).map((k) => FALLBACK_CENTER[k]);
      if (cs.length > 0) at = { lat: cs.reduce((x, c) => x + c[0], 0) / cs.length, lng: cs.reduce((x, c) => x + c[1], 0) / cs.length };
    }
    if (!at) continue;
    out.push({ key: a.key, name: a.label, count, lat: Math.round(at.lat * 1e5) / 1e5, lng: Math.round(at.lng * 1e5) / 1e5 });
  }
  return out;
}

export function buildBlockTop(restaurants: Restaurant[], cuisines: { key: string; label: string; count: number }[], regions: readonly { key: string; name: string; count: number }[]): { tiles: BlockTile[]; bandAreas: JpArea[] } {
  const byId = new Map(restaurants.map((r) => [r.id, r]));
  const tiles: BlockTile[] = cuisines.map((c) => {
    const cat = CATS.find((x) => x.key === c.key);
    let img = "";
    for (const [id, path] of cat?.picks ?? []) {
      const r = byId.get(id);
      const p = r ? photoFor(r, path) : null;
      if (p) {
        img = sized(p, 640);
        break;
      }
    }
    return { key: c.key, label: c.label, count: c.count, img };
  });
  return { tiles, bandAreas: buildBandAreas(restaurants, regions) };
}
