/**
 * 特集記事の「店を地図でまとめて見る」（巡り図）の、型と計算。クライアントでもサーバーでも使える（server-only の import はしない）。
 *
 * - 位置は店の座標（lib/geo.ts の GEO。Google マップのピン座標か国土地理院の住所検索）だけ。座標は作らない・推測しない。
 * - 図は実際の地図タイルを使わず、緯度経度から計算した相対位置（北が上・縦横同じ縮尺）で描く。
 * - 順番は「出発の店から、まだ訪ねていない一番近い店へ」を繰り返すだけの機械的な目安。
 * - 距離は直線距離だけ。道のり・徒歩の時間は出さない（推測になるため）。
 *
 * 区画を出す線引き（最大の店間距離 = 座標のある店どうしの直線距離の最大）:
 *   座標のある店が 2 軒未満            → 出さない
 *   最大の店間距離 ≤ HOP_MAX_M (10 km)  → "hop"  近い順にたどる図（順路を描く・店と店の間の直線距離を出す）
 *   HOP_MAX_M 超 〜 WIDE_MAX_M (150 km) → "wide" 散らばる店の図（順路は描かない・出発の店からの直線距離を出す）
 *   WIDE_MAX_M 超（別の県・遠い街にまたがる）→ 出さない
 */

export type FmapMode = "hop" | "wide";

export interface FmapStop {
  id: string;
  name: string;
  /** 店のページ（/restaurant/<id>） */
  href: string;
  lat: number;
  lng: number;
  cuisine: string;
  area: string;
  /** 記事の中の番号（"STORE 02" など） */
  rank: string;
  /** 店の案内に最寄り駅として書かれている駅（手元のデータにあるときだけ） */
  station?: string;
  /** 記事に載っている店の写真（1 枚。表示禁止・食べログ・仮画像は除いてある） */
  image?: string;
  /** 座標が住所の検索（街区単位）から得たもの。Google マップのピンなら false */
  approx: boolean;
}

/** 図に出せない項目 */
export interface FmapAside {
  name: string;
  /** 店のページがあるときだけ */
  href?: string;
  reason: "nogeo" | "nostore";
}

export interface FmapStation {
  name: string;
  lat: number;
  lng: number;
}

export interface FmapData {
  mode: FmapMode;
  /** 座標のある店どうしの最大の直線距離（m） */
  spanM: number;
  stops: FmapStop[];
  aside: FmapAside[];
  stations: FmapStation[];
}

/** これ以下なら「近い順にたどる」。9.6 km の記事まで含み、次が 15.4 km（実データの間のあき） */
export const HOP_MAX_M = 10_000;
/** これを超えたら区画を出さない（別の県にまたがる距離） */
export const WIDE_MAX_M = 150_000;

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** 2 点間の直線距離（m。球面・haversine） */
export function distM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 座標のある店どうしの最大の直線距離（m） */
export function spanOf(pts: readonly { lat: number; lng: number }[]): number {
  let m = 0;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) m = Math.max(m, distM(pts[i], pts[j]));
  return m;
}

/** 線引き。null は区画を出さない */
export function fmapMode(spanM: number, geoCount: number): FmapMode | null {
  if (geoCount < 2) return null;
  if (spanM <= HOP_MAX_M) return "hop";
  if (spanM <= WIDE_MAX_M) return "wide";
  return null;
}

export interface FmapOrder {
  /** 並べた店 */
  stops: FmapStop[];
  /**
   * 距離（m）。hop は「ひとつ前の店から」（先頭は 0）、wide は「出発の店から」（先頭は 0）。
   * どちらも直線距離。
   */
  d: number[];
}

/**
 * 並び順。
 * hop: 出発の店から、まだ訪ねていない一番近い店へ。同じ近さなら記事の順。
 * wide: 出発の店からの近い順。
 */
export function orderFrom(mode: FmapMode, stops: readonly FmapStop[], startId: string): FmapOrder {
  const start = stops.find((s) => s.id === startId) ?? stops[0];
  if (!start) return { stops: [], d: [] };
  if (mode === "wide") {
    const rest = stops
      .filter((s) => s.id !== start.id)
      .map((s, i) => ({ s, i, dist: distM(start, s) }))
      .sort((a, b) => a.dist - b.dist || a.i - b.i);
    return { stops: [start, ...rest.map((r) => r.s)], d: [0, ...rest.map((r) => r.dist)] };
  }
  const out: FmapStop[] = [start];
  const d: number[] = [0];
  const left = stops.filter((s) => s.id !== start.id);
  let cur = start;
  while (left.length) {
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i < left.length; i++) {
      const x = distM(cur, left[i]);
      if (x < bd) {
        bd = x;
        bi = i;
      }
    }
    const [nx] = left.splice(bi, 1);
    out.push(nx);
    d.push(bd);
    cur = nx;
  }
  return { stops: out, d };
}

/** 距離の表記。短いほど細かく（座標は街区単位の誤差があるので、細かすぎる桁は出さない） */
export function fmtDist(m: number): string {
  if (m < 1000) return `${Math.max(50, Math.round(m / 50) * 50)} m`;
  if (m < 10_000) return `${(Math.round(m / 100) / 10).toFixed(1)} km`;
  return `${Math.round(m / 1000)} km`;
}

/** 「直線で約 2.3 km」 */
export function fmtStraight(m: number): string {
  return `直線で約 ${fmtDist(m)}`;
}

/* ───────── 図の座標計算（北が上・縦横同じ縮尺。実際の地図は使わない） ───────── */

export interface Projector {
  /** 1 px が何 m か */
  mpp: number;
  /** 緯度経度 → 図の px */
  xy: (lat: number, lng: number) => { x: number; y: number };
  /** 図の端から端までが何 m か（横・縦） */
  wM: number;
  hM: number;
}

/**
 * 図に収める。点の外接矩形を、余白 pad を残して中央に置く。縦横の縮尺は同じ（緯度で経度の長さを補正）。
 * 点が 1 か所に近くても拡大しすぎないよう、外接矩形の最小は minM（m）。
 */
export function fit(
  pts: readonly { lat: number; lng: number }[],
  w: number,
  h: number,
  pad: { l: number; r: number; t: number; b: number },
  minM = 600,
): Projector {
  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng0 = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  const kx = 111320 * Math.cos(rad(lat0));
  const ky = 110574;
  const mx = pts.map((p) => (p.lng - lng0) * kx);
  const my = pts.map((p) => (p.lat - lat0) * ky);
  const minX = Math.min(...mx);
  const maxX = Math.max(...mx);
  const minY = Math.min(...my);
  const maxY = Math.max(...my);
  const bw = Math.max(maxX - minX, minM);
  const bh = Math.max(maxY - minY, minM);
  const aw = Math.max(40, w - pad.l - pad.r);
  const ah = Math.max(40, h - pad.t - pad.b);
  const mpp = Math.max(bw / aw, bh / ah);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const ox = pad.l + aw / 2;
  const oy = pad.t + ah / 2;
  return {
    mpp,
    wM: w * mpp,
    hM: h * mpp,
    xy: (lat, lng) => ({
      x: ox + ((lng - lng0) * kx - cx) / mpp,
      y: oy - ((lat - lat0) * ky - cy) / mpp,
    }),
  };
}

/**
 * 図の高さ（px）。点の外接矩形の縦横比に合わせ、店が少ないほど低く抑える（2〜3 軒で大きな図に点が散って間延びしないように）。
 * 余白は layoutFmap と同じ。
 */
export function frameHeight(pts: readonly { lat: number; lng: number }[], w: number): number {
  const mobile = w < 560;
  const pad = mobile ? { l: 46, r: 46, t: 84, b: 58 } : { l: 92, r: 92, t: 86, b: 62 };
  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const kx = 111320 * Math.cos(rad(lat0));
  const xs = pts.map((p) => p.lng * kx);
  const ys = pts.map((p) => p.lat * 110574);
  const bw = Math.max(Math.max(...xs) - Math.min(...xs), 600);
  const bh = Math.max(Math.max(...ys) - Math.min(...ys), 600);
  const aw = Math.max(40, w - pad.l - pad.r);
  const want = (aw * bh) / bw + pad.t + pad.b;
  const n = pts.length;
  const cap = n <= 3 ? (mobile ? 330 : 320) : n === 4 ? (mobile ? 400 : 380) : mobile ? 440 : 430;
  return Math.round(Math.min(cap, Math.max(300, want)));
}

const NICE = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000];

/** 格子の一目の長さ（m）。1 目が minPx 以上になる、いちばん短い切りのよい長さ */
export function niceStep(mpp: number, minPx: number): number {
  for (const n of NICE) if (n / mpp >= minPx) return n;
  return NICE[NICE.length - 1];
}

/** 格子・縮尺の表記 */
export function fmtUnit(m: number): string {
  return m >= 1000 ? `${m / 1000} km` : `${m} m`;
}

/* ───────── 文字の置き場所（重ならないように） ───────── */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const hit = (a: Box, b: Box, gap = 2): boolean =>
  a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;

/** 文字の幅の見積もり（全角は 1em。半角は大文字 0.74em・小文字 0.58em・数字 0.6em・その他 0.42em） */
export function textW(s: string, size: number): number {
  let w = 0;
  for (const ch of s) {
    if (/[A-Z]/.test(ch)) w += 0.74;
    else if (/[a-z]/.test(ch)) w += 0.58;
    else if (/[0-9]/.test(ch)) w += 0.6;
    else if (/[\u0000-\u00ff\uff61-\uff9f]/.test(ch)) w += 0.42;
    else w += 1;
  }
  return w * size;
}

/** 長い名前を図用に詰める（一覧・札には全文を出す） */
export function clip(s: string, max: number): string {
  const a = Array.from(s);
  return a.length > max ? a.slice(0, max - 1).join("") + "…" : s;
}
