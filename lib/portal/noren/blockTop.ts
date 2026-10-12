/**
 * 入口（/gourmet）の「店を、さがす。」の block の見た目（components/portal/noren/OpenSearchBlock.tsx）に渡すデータを作る（サーバー側）。
 * 軽い関数だけ（fs・process.cwd() を使わない）。店・写真は実在の掲載店。店との対応は ID の完全一致（店名の部分一致は使わない）。
 * - 業種のタイル: 暖簾の章（lib/portal/noren/picks.ts の CATS）の、手で選んだ店の写真（章の先頭から、使える写真のある最初の店）
 * - 地図の帯: 店の多い地域 BAND_REGION（大阪。時間で替わらない固定）の、位置と写真のある店のうち、いちばん集まっている所（lib/portal/noren/mapFit.ts の densestFit）の中で、ばらけて立つ BAND_MAX 軒
 */
import type { Restaurant } from "@/lib/regions";
import { GEO } from "@/lib/geo";
import { parseTown } from "@/lib/towns";
import { sized } from "@/lib/imageUrl";
import { CATS, photoFor } from "./picks";
import { densestFit } from "./mapFit";
import { shopCardPhoto } from "./sceneShop";
import type { MapPt } from "@/components/portal/noren/ShopMap";

/** 帯の地図に出す地域。掲載店がいちばん多い地域（大阪 85 軒）に固定する */
export const BAND_REGION = "osaka";
/** 帯に立てる店の数の上限（飾りに近い地図。ピンが多すぎないように） */
export const BAND_MAX = 12;

export type BlockTile = { key: string; label: string; count: number; img: string };

export function buildBlockTop(restaurants: Restaurant[], cuisines: { key: string; label: string; count: number }[]): { tiles: BlockTile[]; bandPts: MapPt[]; bandRegion: string } {
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

  const cands = restaurants.filter((r) => r.region === BAND_REGION && GEO[r.id] && shopCardPhoto(r));
  const box = cands.length > BAND_MAX ? densestFit(cands.map((r) => GEO[r.id])) : null;
  const inside = box ? cands.filter((r) => GEO[r.id].lat >= box.minLat && GEO[r.id].lat <= box.maxLat && GEO[r.id].lng >= box.minLng && GEO[r.id].lng <= box.maxLng) : cands;
  const base = inside.length >= 6 ? inside : cands;
  const cx = box ? (box.minLng + box.maxLng) / 2 : base.reduce((a, r) => a + GEO[r.id].lng, 0) / Math.max(1, base.length);
  const cy = box ? (box.minLat + box.maxLat) / 2 : base.reduce((a, r) => a + GEO[r.id].lat, 0) / Math.max(1, base.length);
  // 中心にいちばん近い店から始め、あとは「すでに選んだ店からいちばん遠い店」を足していく（ID の順で同点を決める）。帯の中に、ばらけて立つ
  const dist = (a: Restaurant, b: Restaurant) => Math.hypot(GEO[a.id].lat - GEO[b.id].lat, (GEO[a.id].lng - GEO[b.id].lng) * 0.82);
  const sorted = [...base].sort((a, b) => Math.hypot(GEO[a.id].lat - cy, (GEO[a.id].lng - cx) * 0.82) - Math.hypot(GEO[b.id].lat - cy, (GEO[b.id].lng - cx) * 0.82) || a.id.localeCompare(b.id));
  const chosen: Restaurant[] = sorted.slice(0, 1);
  while (chosen.length < Math.min(BAND_MAX, sorted.length)) {
    let best: Restaurant | null = null;
    let bestD = -1;
    for (const r of sorted) {
      if (chosen.includes(r)) continue;
      const d = Math.min(...chosen.map((c) => dist(r, c)));
      if (d > bestD) {
        bestD = d;
        best = r;
      }
    }
    if (!best) break;
    chosen.push(best);
  }
  const bandPts: MapPt[] = chosen.map((r) => ({
    id: r.id,
    name: r.name,
    lat: Math.round(GEO[r.id].lat * 1e5) / 1e5,
    lng: Math.round(GEO[r.id].lng * 1e5) / 1e5,
    area: r.area,
    cuisine: r.cuisine,
    photo: sized(shopCardPhoto(r), 360),
    town: parseTown(r.address || "", r.region)?.town ?? "",
    region: r.region,
  }));
  return { tiles, bandPts, bandRegion: BAND_REGION };
}
