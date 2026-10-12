/**
 * 入口（/gourmet）の「地図で見つける」の帯の全国の地図（components/portal/noren/BlockTopMap.tsx）の、地方の目印の置き方（軽い純関数だけ。fs・process.cwd() を使わない）。
 * - 地図の絵は、あらかじめ画像にした全国図（public/_portal/illust-map/<e|g>-japan.webp。lib/portal/noren/illustMaps.generated.ts の ILLUST_JAPAN と同じ範囲）。ウェブメルカトルなので、緯度経度から画像の中の位置が決まる。
 * - 目印 = 掲載店のある地方ごとに 1 つ（ピン + 地方名 + 件数。lib/portal/noren/areaGroups.ts の区分）。本当の位置（その地方の店の座標の中央値）に置き、重なるときだけ、近くの空きへずらして
 *   元の位置とは点線でつなぐ（lib/portal/noren/placeMarkers.ts。押す範囲は 44px 以上・目印どうしにすきま）。毎回同じ形（乱数を使わない）。
 * - 画面の形が 2 つ: 縦長（スマホ。p）と横長（広い画面。l）。どちらも「設計の大きさ」（px）で置いてから割合（%）にして出す。画面は設計の大きさ以上に広げて使う（目印の大きさは px のまま）ので、設計どおりなら重ならない。
 */
import { placeMarkers, type PlaceItem, type Rect } from "./placeMarkers";

/** 画像（全国図）の大きさと、敷く範囲（lib/portal/noren/illustMaps.generated.ts の ILLUST_JAPAN.bounds） */
export const JP_IMG = { w: 2600, h: 2022, south: 16.63619, west: 112.5, north: 48.9225, east: 163.125 } as const;

const RAD = Math.PI / 180;
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
const Y_N = mercY(JP_IMG.north);
const Y_S = mercY(JP_IMG.south);

/** 緯度経度 → 画像の中の位置（0〜1。左上が 0,0） */
export function imgPos(lat: number, lng: number): { x: number; y: number } {
  return { x: (lng - JP_IMG.west) / (JP_IMG.east - JP_IMG.west), y: (Y_N - mercY(lat)) / (Y_N - Y_S) };
}

/** 地方の目印 1 つ分（key = 地方のキー。lat・lng = その地方の店の座標の中央値） */
export type JpArea = { key: string; name: string; count: number; lat: number; lng: number };

/** 目印 1 つの大きさ（px）。ピン（30×34。先が下。件数は 3 桁まで入る）の下に地方名（12px）。押す範囲はこの箱ぜんぶ（高さ 50・幅は 44 以上） */
export const MK_H = 50;
export const MK_TIP_Y = 34;
/** 目印の箱の中心の y から、ピンの先の y（箱の上から MK_TIP_Y のところ） */
export const tipY = (cy: number) => cy - MK_H / 2 + MK_TIP_Y;
const MK_MIN_W = 44;
/** 字の幅の見積もり（12px の字 + 字間）。「・」も 1 字ぶん（「北海道・東北」は 6 字） */
const CH_W = 12.2;
const mkWidth = (name: string) => Math.max(MK_MIN_W, Math.ceil(Array.from(name).length * CH_W + 6));

type Spec = {
  id: "p" | "l";
  /** 設計の大きさ（px） */
  W: number;
  H: number;
  /** 窓の経度の範囲と、縦の中心（緯度）。窓の縦の長さは H から決まる（拡大は横の幅で決まる） */
  lng0: number;
  lng1: number;
  latMid: number;
  /** 目印を置かない所（出典の表記。設計の座標） */
  keepOut: Rect[];
  /** 舞台の縁から目印の箱をあける余白（左右・上下。上下は、帯の上下のぼかしに掛からないよう広げる） */
  pad: number;
  padY: number;
};

/** 出典の表記（「地図: 国土地理院ベクトルタイルをもとに作成」。12px・22 字）の箱。画面の右下 */
const CREDIT_W = 286;
const CREDIT_H = 24;

export const SPECS: Record<"p" | "l", Spec> = {
  // 縦長（スマホ。360 幅から）
  p: { id: "p", W: 360, H: 600, lng0: 127, lng1: 144.6, latMid: 35.2, keepOut: [{ x: 360 - CREDIT_W, y: 600 - CREDIT_H, w: CREDIT_W, h: CREDIT_H }], pad: 2, padY: 2 },
  // 横長
  l: { id: "l", W: 600, H: 500, lng0: 120, lng1: 150.2, latMid: 35.2, keepOut: [{ x: 600 - CREDIT_W, y: 500 - CREDIT_H, w: CREDIT_W, h: CREDIT_H }], pad: 2, padY: 34 },
};

export type JpMarker = {
  key: string;
  name: string;
  count: number;
  /** 目印の箱の幅（px） */
  w: number;
  /** 箱の中心（設計の px） */
  cx: number;
  cy: number;
  /** 本当の位置（設計の px） */
  ax: number;
  ay: number;
  /** ずらしたので、点線でつなぐか */
  lead: boolean;
};

export type JpLayout = {
  id: "p" | "l";
  W: number;
  H: number;
  /** 画像を敷く位置（舞台の幅・高さに対する %） */
  img: { left: number; top: number; width: number };
  markers: JpMarker[];
};

/** 目印を置く（本当の位置にいちばん近い空き。店の多い地方から先に） */
export function layoutJp(areas: readonly JpArea[], spec: Spec): JpLayout {
  const xspan = (spec.lng1 - spec.lng0) / (JP_IMG.east - JP_IMG.west);
  const imgW = spec.W / xspan;
  const imgH = (imgW * JP_IMG.h) / JP_IMG.w;
  const x0 = ((spec.lng0 - JP_IMG.west) / (JP_IMG.east - JP_IMG.west)) * imgW;
  const y0 = imgPos(spec.latMid, spec.lng0).y * imgH - spec.H / 2;
  const items: PlaceItem[] = areas.map((r) => {
    const p = imgPos(r.lat, r.lng);
    return { key: r.key, w: mkWidth(r.name), h: MK_H, up: MK_TIP_Y, ax: p.x * imgW - x0, ay: p.y * imgH - y0, weight: r.count };
  });
  const placed = placeMarkers(items, spec.W, spec.H, { padX: spec.pad, padY: spec.padY, gap: 6, keepOut: spec.keepOut });
  const markers: JpMarker[] = areas.map((r, i) => {
    const p = placed[i];
    return {
      key: r.key,
      name: r.name,
      count: r.count,
      w: items[i].w,
      // 箱の中心（placeMarkers が返すのはピンの先の位置。箱の上から MK_TIP_Y のところが先）
      cx: p.cx,
      cy: Math.round((p.cy - MK_TIP_Y + MK_H / 2) * 10) / 10,
      ax: p.ax,
      ay: p.ay,
      lead: p.moved > 24,
    };
  });
  return {
    id: spec.id,
    W: spec.W,
    H: spec.H,
    img: { left: Math.round((-x0 / spec.W) * 1e4) / 100, top: Math.round((-y0 / spec.H) * 1e4) / 100, width: Math.round((imgW / spec.W) * 1e4) / 100 },
    markers,
  };
}

/** 設計の箱の重なりの数（確かめ用。0 が正しい） */
export function countOverlaps(l: JpLayout): number {
  let n = 0;
  for (let i = 0; i < l.markers.length; i++)
    for (let j = i + 1; j < l.markers.length; j++) {
      const a = l.markers[i];
      const b = l.markers[j];
      if (Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 && Math.abs(a.cy - b.cy) < MK_H) n++;
    }
  return n;
}
