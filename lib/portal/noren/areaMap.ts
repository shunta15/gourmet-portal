/**
 * 「さがす」の地方の地図（?area=<地方のキー>。components/portal/noren/AreaMap.tsx）: 地域ごとの丸（件数）と名前の置き方（軽い純関数だけ。fs・process.cwd() を使わない）。
 * - 地図の絵は、あらかじめ画像にした地方の図（public/_portal/illust-map/e-<地方のキー>.webp。範囲は illustMaps.generated.ts の ILLUST_AREA）。ウェブメルカトルなので、緯度経度から画像の中の位置が決まる。
 * - 丸の位置 = その地域の店の座標の中央値（regionCenters.ts）。重なるときは、近くの空いている所へずらし、本当の位置とは点線でつなぐ（placeMarkers.ts）。
 *   地図の範囲の外の地域（沖縄など。AreaDef.inset）は、縁に寄せて置き、向きの矢印を出す。
 * - 舞台の形が 2 つ: p（スマホ。設計の幅 320px）と l（広い画面。設計の幅 560px）。どちらも「設計の大きさ」（px）で置いてから割合（%）にして出す。画面は設計の大きさ以上に広げて使う
 *   （丸の大きさは px のまま）ので、設計どおりなら重ならない。毎回同じ形（乱数を使わない）。
 */
import { placeMarkers, type PlaceItem, type Placed } from "./placeMarkers";

export type AreaRegion = { key: string; name: string; count: number; lat: number; lng: number };
export type Bounds = [[number, number], [number, number]];

const RAD = Math.PI / 180;
export const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));

/** 丸の直径（px）。押す範囲は 44px 以上。店の多い地域ほど少し大きく（最大 62） */
export const circleSize = (count: number) => Math.round(Math.min(62, Math.max(44, 40 + 2.2 * Math.sqrt(Math.max(0, count)))));
/** 名前の字（12.5px の太字 + 字間）の幅の見積もり */
const CH_W = 13.4;
/** 丸の下の名前の行の高さ（px） */
export const NAME_H = 18;
export const nameWidth = (name: string) => Math.ceil(Array.from(name).length * CH_W + 8);

export type AreaMarker = {
  key: string;
  name: string;
  count: number;
  /** 丸の直径（px） */
  d: number;
  /** 箱の幅（丸と名前の広いほう。px）・高さ（丸 + 名前の行） */
  w: number;
  h: number;
  /** 丸の中心（設計の px。舞台の左上が 0,0） */
  cx: number;
  cy: number;
  /** 本当の位置（設計の px。舞台の中に収めた点） */
  ax: number;
  ay: number;
  /** ずらしたので、点線でつなぐか */
  lead: boolean;
  /** 地図の範囲の外の地域（縁に寄せて置いた）。向き（-1・0・1。西・北が負）。arw はその向きの矢印の字（名前の前に出す） */
  off: { dx: number; dy: number; arw: string } | null;
};

/** 向き → 矢印の字（画面の上が北） */
const ARROWS: Record<string, string> = { "-1,-1": "↖", "0,-1": "↑", "1,-1": "↗", "-1,0": "←", "1,0": "→", "-1,1": "↙", "0,1": "↓", "1,1": "↘" };

export type AreaLayout = {
  id: "p" | "l";
  /** 設計の舞台の大きさ（px） */
  W: number;
  H: number;
  markers: AreaMarker[];
};

export const DESIGN_W: Record<"p" | "l", number> = { p: 320, l: 560 };

/** 丸を置く（画像の大きさ imgW×imgH の縦横比のまま、幅 designW の舞台に） */
export function layoutArea(regions: readonly AreaRegion[], bounds: Bounds, imgW: number, imgH: number, id: "p" | "l"): AreaLayout {
  const W = DESIGN_W[id];
  const H = Math.round((W * imgH) / imgW);
  const [[s, w0], [n, e]] = bounds;
  const yN = mercY(n);
  const yS = mercY(s);
  const dir = (v: number, lim: number) => (v < 0 ? -1 : v > lim ? 1 : 0);
  const items: PlaceItem[] = regions.map((r) => {
    const d = circleSize(r.count);
    const ax = ((r.lng - w0) / (e - w0)) * W;
    const ay = ((yN - mercY(r.lat)) / (yN - yS)) * H;
    const out = dir(ax, W) !== 0 || dir(ay, H) !== 0;
    return { key: r.key, w: Math.max(d, nameWidth(r.name) + (out ? CH_W : 0)), h: d + NAME_H, up: d / 2, ax, ay, weight: r.count };
  });
  const placed = placeMarkers(items, W, H, { padX: 3, padY: 3, gap: 5 });
  const byKey = new Map<string, Placed>(placed.map((p) => [p.key, p]));
  const markers: AreaMarker[] = regions.map((r, i) => {
    const p = byKey.get(r.key)!;
    const it = items[i];
    const dx = dir(it.ax, W);
    const dy = dir(it.ay, H);
    return {
      key: r.key,
      name: r.name,
      count: r.count,
      d: circleSize(r.count),
      w: it.w,
      h: it.h,
      cx: p.cx,
      cy: p.cy,
      ax: p.ax,
      ay: p.ay,
      lead: !p.outside && p.moved > 22,
      off: p.outside ? { dx, dy, arw: ARROWS[`${dx},${dy}`] ?? "" } : null,
    };
  });
  return { id, W, H, markers };
}

/** 丸の箱どうしの重なりの数（確かめ用。0 が正しい） */
export function countAreaOverlaps(l: AreaLayout): number {
  let n = 0;
  for (let i = 0; i < l.markers.length; i++)
    for (let j = i + 1; j < l.markers.length; j++) {
      const a = l.markers[i];
      const b = l.markers[j];
      const ax0 = a.cx - a.w / 2, ay0 = a.cy - a.d / 2, bx0 = b.cx - b.w / 2, by0 = b.cy - b.d / 2;
      if (ax0 < bx0 + b.w && bx0 < ax0 + a.w && ay0 < by0 + b.h && by0 < ay0 + a.h) n++;
    }
  return n;
}
