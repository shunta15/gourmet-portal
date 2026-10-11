/**
 * 「さがす」の地図 e の、初期表示で寄せる範囲（軽い純関数。クライアントの ShopMap.tsx と、描き起こしのスクリプト automation/illust-map/build.mjs の両方が使う。fs・process.cwd() を使わない）。
 * 店が 13 軒以上のときは、店がいちばん集まっている所（中心の店から半径 R km の円に、店の 45% 以上が入る最小の R）に寄せる。そこが手本のような「街歩きの地図」の大きさになる。
 * 外れた店は、地図を動かす・縮めると見える。店が 12 軒以下なら、すべての店が入る範囲。
 */
export type LL = { lat: number; lng: number };
export type Box = { minLat: number; maxLat: number; minLng: number; maxLng: number };

export const DENSE_RADII_KM = [2.5, 4, 6, 9, 14, 22, 35];
export const DENSE_SHARE = 0.45;

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

const km = (a: LL, b: LL) => {
  const dy = (b.lat - a.lat) * 110.57;
  const dx = (b.lng - a.lng) * 111.32 * Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  return Math.hypot(dx, dy);
};

export function densestFit(pts: readonly LL[]): Box {
  const n = pts.length;
  if (n <= 12) return bboxOf(pts);
  const need = Math.ceil(n * DENSE_SHARE);
  let last: LL[] = [];
  for (const R of DENSE_RADII_KM) {
    let best = -1;
    let bestMembers: LL[] = [];
    for (const c of pts) {
      const members = pts.filter((p) => km(c, p) <= R);
      if (members.length > best) {
        best = members.length;
        bestMembers = members;
      }
    }
    last = bestMembers;
    if (best >= need) return bboxOf(bestMembers);
  }
  return bboxOf(last);
}
