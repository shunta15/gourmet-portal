/**
 * 入口（/gourmet）の「地図で見つける」の帯の全国の地図（components/portal/noren/BlockTopMap.tsx）の、地域の目印の置き方（軽い純関数だけ。fs・process.cwd() を使わない）。
 * - 地図の絵は、あらかじめ画像にした全国図（public/_portal/illust-map/<e|g>-japan.webp。lib/portal/noren/illustMaps.generated.ts の ILLUST_JAPAN と同じ範囲）。ウェブメルカトルなので、緯度経度から画像の中の位置が決まる。
 * - 目印 = 掲載店のある地域ごとに 1 つ（ピン + 地域名 + 件数）。本当の位置（その地域の店の座標の中央値。「さがす」の全国の丸と同じ）に置くと、関西・関東で重なって押せないので、
 *   重ならないよう（押す範囲は 44px 以上・目印どうしにすきま）ずらして置き、元の位置とは点線でつなぐ。置き方は、店の多い地域ほど動かさない。毎回同じ形（乱数を使わない）。
 * - 画面の形が 2 つ: 縦長（スマホ。p）と横長（広い画面。l）。どちらも「設計の大きさ」（px）で置いてから割合（%）にして出す。画面は設計の大きさ以上に広げて使う（目印の大きさは px のまま）ので、設計どおりなら重ならない。
 */

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

export type JpRegion = { key: string; name: string; count: number; lat: number; lng: number };

/** 目印 1 つの大きさ（px）。ピン（26×31。先が下）の下に地域名（12px）。押す範囲はこの箱ぜんぶ（高さ 46・幅は 44 以上） */
export const MK_H = 46;
export const MK_TIP_Y = 30;
/** 目印の箱の中心の y から、ピンの先の y（箱の上から MK_TIP_Y のところ） */
export const tipY = (cy: number) => cy - MK_H / 2 + MK_TIP_Y;
const MK_MIN_W = 44;
/** 字の幅の見積もり（12px の字 + 字間）。「・」も 1 字ぶん */
const CH_W = 12.2;
const mkWidth = (name: string) => Math.max(MK_MIN_W, Math.ceil(Array.from(name).length * CH_W + 6));

export type Rect = { x: number; y: number; w: number; h: number };

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
  /** 升目の横の幅・縦のすきま（px）・店の多い地域を重く見る度合い・距離のべき */
  cellW: number;
  gapY: number;
  heavy: number;
  pow: number;
};

/** 出典の表記（「地図: 国土地理院ベクトルタイルをもとに作成」。12px・22 字）の箱。画面の右下 */
const CREDIT_W = 286;
const CREDIT_H = 24;

export const SPECS: Record<"p" | "l", Spec> = {
  // 縦長（スマホ。360 幅から）
  p: { id: "p", W: 360, H: 600, lng0: 127, lng1: 144.6, latMid: 35.2, keepOut: [{ x: 360 - CREDIT_W, y: 600 - CREDIT_H, w: CREDIT_W, h: CREDIT_H }], pad: 2, padY: 2, cellW: 48, gapY: 4, heavy: 0.15, pow: 2 },
  // 横長
  l: { id: "l", W: 600, H: 500, lng0: 120, lng1: 150.2, latMid: 35.2, keepOut: [{ x: 600 - CREDIT_W, y: 500 - CREDIT_H, w: CREDIT_W, h: CREDIT_H }], pad: 2, padY: 34, cellW: 54, gapY: 14, heavy: 0.15, pow: 2 },
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

/**
 * 最小費用の割り当て（ハンガリー法。行 n ≦ 列 m。費用の合計が最小になる列を各行に 1 つ）。毎回同じ結果（乱数なし）。
 */
function assign(cost: number[][]): number[] {
  const n = cost.length;
  const m = cost[0]?.length ?? 0;
  const INF = 1e18;
  const u = new Array<number>(n + 1).fill(0);
  const v = new Array<number>(m + 1).fill(0);
  const p = new Array<number>(m + 1).fill(0);
  const way = new Array<number>(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array<number>(m + 1).fill(INF);
    const used = new Array<boolean>(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }
  const ans = new Array<number>(n).fill(-1);
  for (let j = 1; j <= m; j++) if (p[j]) ans[p[j] - 1] = j - 1;
  return ans;
}

/**
 * 目印を重ならないように置く。画面を「目印 1 つぶんの升目」（蜂の巣のようにずらした並び）に区切り、
 * 各地域を、本当の位置からの距離の合計（店の多い地域ほど重く）が最小になる升目に 1 つずつ割り当てる（ハンガリー法）。升目どうしは重ならないので、目印も重ならない。
 * 名前が長い目印（5 字の「神戸・兵庫」）は、先に隣り合う 2 升を使って置く。
 */
export function layoutJp(regions: readonly JpRegion[], spec: Spec): JpLayout {
  const xspan = (spec.lng1 - spec.lng0) / (JP_IMG.east - JP_IMG.west);
  const imgW = spec.W / xspan;
  const imgH = (imgW * JP_IMG.h) / JP_IMG.w;
  const x0 = ((spec.lng0 - JP_IMG.west) / (JP_IMG.east - JP_IMG.west)) * imgW;
  const y0 = imgPos(spec.latMid, spec.lng0).y * imgH - spec.H / 2;
  const toPx = (lat: number, lng: number) => {
    const p = imgPos(lat, lng);
    return { x: p.x * imgW - x0, y: p.y * imgH - y0 };
  };

  type B = { r: JpRegion; w: number; ax: number; ay: number; x: number; y: number };
  const bs: B[] = [...regions]
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .map((r) => {
      const a = toPx(r.lat, r.lng);
      return { r, w: mkWidth(r.name), ax: a.x, ay: a.y, x: 0, y: 0 };
    });

  // 升目（蜂の巣のずらし。偶数の行は端から、奇数の行は半分ずらす）
  const PX = spec.cellW;
  const PY = MK_H + spec.gapY;
  const cols = Math.floor((spec.W - 2 * spec.pad) / PX);
  const rows = Math.floor((spec.H - 2 * spec.padY + spec.gapY) / PY);
  const left = (spec.W - cols * PX) / 2;
  const top = (spec.H - (rows * PY - spec.gapY)) / 2;
  type Cell = { x: number; y: number; r: number; c: number };
  let cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    const n = r % 2 ? cols - 1 : cols;
    for (let c = 0; c < n; c++) cells.push({ x: left + PX / 2 + c * PX + (r % 2 ? PX / 2 : 0), y: top + MK_H / 2 + r * PY, r, c });
  }
  const inWall = (x: number, y: number, w: number) => spec.keepOut.some((k) => Math.abs(x - (k.x + k.w / 2)) < (w + k.w) / 2 && Math.abs(y - (k.y + k.h / 2)) < (MK_H + k.h) / 2);
  cells = cells.filter((c) => !inWall(c.x, c.y, PX - 2));

  const tipDist = (b: B, x: number, y: number) => Math.hypot(x - b.ax, tipY(y) - b.ay);
  const weight = (b: B) => 1 + spec.heavy * Math.sqrt(b.r.count);

  // 長い名前（升目より広い）: 隣り合う 2 升の真ん中へ、先に置く
  const wide = bs.filter((b) => b.w > PX - 2);
  const used = new Set<Cell>();
  for (const b of wide) {
    let best: { x: number; y: number; a: Cell; b: Cell } | null = null;
    let bd = Infinity;
    for (const a of cells) {
      if (used.has(a)) continue;
      const nb = cells.find((q) => !used.has(q) && q.r === a.r && q.c === a.c + 1);
      if (!nb) continue;
      const x = (a.x + nb.x) / 2;
      const d = tipDist(b, x, a.y);
      if (d < bd) {
        bd = d;
        best = { x, y: a.y, a, b: nb };
      }
    }
    if (best) {
      b.x = best.x;
      b.y = best.y;
      used.add(best.a);
      used.add(best.b);
    }
  }
  const rest = bs.filter((b) => !wide.includes(b) || (b.x === 0 && b.y === 0));
  const free = cells.filter((c) => !used.has(c));
  const cost = rest.map((b) => free.map((c) => weight(b) * Math.pow(tipDist(b, c.x, c.y), spec.pow)));
  const pick = assign(cost);
  rest.forEach((b, i) => {
    b.x = free[pick[i]].x;
    b.y = free[pick[i]].y;
  });

  const markers: JpMarker[] = bs.map((b) => ({
    key: b.r.key,
    name: b.r.name,
    count: b.r.count,
    w: b.w,
    cx: Math.round(b.x * 10) / 10,
    cy: Math.round(b.y * 10) / 10,
    ax: Math.round(b.ax * 10) / 10,
    ay: Math.round(b.ay * 10) / 10,
    lead: tipDist(b, b.x, b.y) > 24,
  }));

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
