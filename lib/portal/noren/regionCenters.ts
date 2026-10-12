/**
 * 地域・地方の目印の位置（軽い純関数だけ。fs・process.cwd() を使わない。サーバー・クライアントのどちらからでも読める）。
 * 位置 = その店たちの座標（lib/geo.ts）の中央値（緯度・経度を別々に）。座標のある店が 1 軒も無い地域は、県庁所在地のおおよその位置（FALLBACK_CENTER。店の位置ではなく地域の目印の位置。
 * automation/illust-map/build.mjs の FALLBACK_CENTER と同じ。ここに無い地域は目印を出さない）。
 */
export const FALLBACK_CENTER: Readonly<Record<string, readonly [number, number]>> = { wakayama: [34.2261, 135.1675] };

export const median = (a: readonly number[]): number => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

export type LatLng = { lat: number; lng: number };

/** 店の一覧と座標から、地域ごとの目印の位置（座標のある店の中央値。無ければ FALLBACK_CENTER。どちらも無い地域は入らない） */
export function regionCenters(shops: readonly { id: string; region: string }[], coords: Readonly<Record<string, readonly [number, number]>>): Map<string, LatLng> {
  const pts = new Map<string, { lat: number[]; lng: number[] }>();
  const regions = new Set<string>();
  for (const r of shops) {
    regions.add(r.region);
    const g = coords[r.id];
    if (!g) continue;
    const e = pts.get(r.region) ?? { lat: [], lng: [] };
    e.lat.push(g[0]);
    e.lng.push(g[1]);
    pts.set(r.region, e);
  }
  const out = new Map<string, LatLng>();
  for (const k of regions) {
    const e = pts.get(k);
    if (e && e.lat.length > 0) out.set(k, { lat: median(e.lat), lng: median(e.lng) });
    else if (FALLBACK_CENTER[k]) out.set(k, { lat: FALLBACK_CENTER[k][0], lng: FALLBACK_CENTER[k][1] });
  }
  return out;
}
