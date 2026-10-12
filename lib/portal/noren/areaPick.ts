/**
 * 「さがす」の入口（地方も地域も選んでいないとき）の小さな日本の図（components/portal/noren/AreaPicker.tsx）: 地方ごとの丸（件数）の置き方（軽い純関数だけ。fs・process.cwd() を使わない）。
 * 図は、あらかじめ作った地方ごとの輪郭（areaFigure.generated.ts。automation/illust-map/figure.mjs）。丸の本当の位置 = その地方の店の座標の中央値。重なるときは、近くの空きへずらす（placeMarkers.ts）。
 */
import { AREA_FIGURE } from "./areaFigure.generated";
import { placeMarkers, type PlaceItem } from "./placeMarkers";

const RAD = Math.PI / 180;

/** 緯度経度 → 図の箱の中の位置（図の単位。0〜w・0〜h） */
export function figPos(lat: number, lng: number): { x: number; y: number } {
  const { z, x0, y0, unit } = AREA_FIGURE.proj;
  const n = 256 * 2 ** z;
  const wx = ((lng + 180) / 360) * n;
  const wy = ((1 - Math.log(Math.tan(lat * RAD) + 1 / Math.cos(lat * RAD)) / Math.PI) / 2) * n;
  return { x: (wx - x0) / unit, y: (wy - y0) / unit };
}

export type PickArea = { key: string; count: number; lat: number; lng: number };
export type PickMarker = { key: string; count: number; d: number; cx: number; cy: number; ax: number; ay: number; lead: boolean };
export type PickLayout = { W: number; H: number; markers: PickMarker[] };

/** 丸の押す範囲（px。見える丸はこの中の 32px。押す範囲は 44px 以上で、丸どうしの押す範囲は重ならない） */
export const pickSize = (_count: number) => 44;
export const PICK_DESIGN_W = 280;

export function layoutPick(areas: readonly PickArea[], W = PICK_DESIGN_W): PickLayout {
  const H = Math.round((W * AREA_FIGURE.h) / AREA_FIGURE.w);
  const items: PlaceItem[] = areas.map((a) => {
    const p = figPos(a.lat, a.lng);
    const d = pickSize(a.count);
    return { key: a.key, w: d, h: d, up: d / 2, ax: (p.x / AREA_FIGURE.w) * W, ay: (p.y / AREA_FIGURE.h) * H, weight: a.count };
  });
  const placed = placeMarkers(items, W, H, { padX: 2, padY: 2, gap: 4 });
  return {
    W,
    H,
    markers: areas.map((a, i) => ({ key: a.key, count: a.count, d: items[i].w, cx: placed[i].cx, cy: placed[i].cy, ax: placed[i].ax, ay: placed[i].ay, lead: placed[i].moved > 20 })),
  };
}
