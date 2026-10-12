/**
 * 「さがす」の地図（a・e・f・g・h）の、初期表示で寄せる範囲（軽い純関数。クライアントの ShopMap.tsx と、描き起こしのスクリプト automation/illust-map/build.mjs の両方が使う。fs・process.cwd() を使わない）。
 * a と同じ決め方: 店が 13 軒以上のときは、遠く離れた数軒（外れ値）を除いた中央の約 88%（緯度・経度とも、上下 6% を除く）。12 軒以下は、すべての店が入る範囲。
 * 除いた店は、地図を動かす・縮めると見える（h は動かせない）。
 */
export type LL = { lat: number; lng: number };
export type Box = { minLat: number; maxLat: number; minLng: number; maxLng: number };

export function bboxOf(pts: readonly LL[]): Box {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const p of pts) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}

const quant = (a: number[], t: number) => {
  const v = [...a].sort((x, y) => x - y);
  const i = (v.length - 1) * t;
  return v[Math.floor(i)] + (v[Math.ceil(i)] - v[Math.floor(i)]) * (i - Math.floor(i));
};

export function quantFit(pts: readonly LL[]): Box {
  if (pts.length <= 12) return bboxOf(pts);
  const la = pts.map((p) => p.lat);
  const ln = pts.map((p) => p.lng);
  return { minLat: quant(la, 0.06), maxLat: quant(la, 0.94), minLng: quant(ln, 0.06), maxLng: quant(ln, 0.94) };
}
