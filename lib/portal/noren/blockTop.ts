/**
 * 入口（/gourmet）の「店を、さがす。」の block の見た目（components/portal/noren/OpenSearchBlock.tsx）に渡すデータを作る（サーバー側）。
 * 軽い関数だけ（fs・process.cwd() を使わない）。店・写真は実在の掲載店。店との対応は ID・地域キーの完全一致（店名の部分一致は使わない）。
 * - 業種のタイル: 暖簾の章（lib/portal/noren/picks.ts の CATS）の、手で選んだ店の写真（章の先頭から、使える写真のある最初の店）
 * - 地図の帯（全国図）の目印: 掲載店のある地域ごとに 1 つ（件数は openSearchData.regions = 「さがす」の地域の一覧と同じ数え方）。
 *   位置は、その地域の店の座標（lib/geo.ts）の中央値（「さがす」の全国の丸と同じ）。座標のある店が 1 軒も無い地域は、FALLBACK_CENTER の県庁所在地のおおよその位置
 *   （automation/illust-map/build.mjs の FALLBACK_CENTER と同じ。店の位置ではなく地域の目印の位置。ここに無い地域は目印を出さない）。
 */
import type { Restaurant } from "@/lib/regions";
import { GEO } from "@/lib/geo";
import { sized } from "@/lib/imageUrl";
import { CATS, photoFor } from "./picks";
import type { JpRegion } from "./jpBand";

export type BlockTile = { key: string; label: string; count: number; img: string };

/** 位置のある店が 1 軒も無い地域の、目印の位置（県庁所在地のおおよその位置） */
const FALLBACK_CENTER: Record<string, [number, number]> = { wakayama: [34.2261, 135.1675] };

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/** 全国図の目印（掲載店のある地域ごと）。regions は店の数を数えた地域の一覧（lib/portal/noren/openSearch.ts の countRegions）。件数 0 の地域は来ない */
export function buildBandRegions(restaurants: readonly Restaurant[], regions: readonly { key: string; name: string; count: number }[]): JpRegion[] {
  const pts = new Map<string, { lat: number[]; lng: number[] }>();
  for (const r of restaurants) {
    const g = GEO[r.id];
    if (!g) continue;
    const e = pts.get(r.region) ?? { lat: [], lng: [] };
    e.lat.push(g.lat);
    e.lng.push(g.lng);
    pts.set(r.region, e);
  }
  const out: JpRegion[] = [];
  for (const rg of regions) {
    if (rg.count <= 0) continue;
    const e = pts.get(rg.key);
    const at = e && e.lat.length > 0 ? { lat: median(e.lat), lng: median(e.lng) } : FALLBACK_CENTER[rg.key] ? { lat: FALLBACK_CENTER[rg.key][0], lng: FALLBACK_CENTER[rg.key][1] } : null;
    if (!at) continue;
    out.push({ key: rg.key, name: rg.name, count: rg.count, lat: Math.round(at.lat * 1e5) / 1e5, lng: Math.round(at.lng * 1e5) / 1e5 });
  }
  return out;
}

export function buildBlockTop(restaurants: Restaurant[], cuisines: { key: string; label: string; count: number }[], regions: readonly { key: string; name: string; count: number }[]): { tiles: BlockTile[]; bandRegions: JpRegion[] } {
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
  return { tiles, bandRegions: buildBandRegions(restaurants, regions) };
}
