/**
 * 「地図で探す」の地方（8つ）と、デフォルメ日本地図（タイルグリッド）の並び・形状の計算。
 * 純粋なデータと関数だけ（サーバー・クライアントのどちらからでも import できる）。
 *
 * 地方の区分はサイトの既存のもの（lib/areas/prefectures の block）に合わせる。表示名もサイトと同じ。
 * デフォルメ地図は実測の海岸線を使わず、都道府県を 1 マスのタイルにして、おおよその位置関係で並べた自作のもの
 * （北海道だけ 2×2）。マスの座標は [列, 行]（左上が 0,0）。実際に接している県が隣り合うように並べた概念図で、
 * 距離・面積は表さない。10 列 × 11 行。
 *
 * 並べ方は、各県の代表点（緯度・経度）に近いマスと、実際の県境の隣接（86 組）を保つように焼きなまし法で求めた配置を
 * 土台にして、地方ごとにまとまるように手で直したもの。実際に接している 86 組のうち 54 組が、マスでも隣り合う
 * （検査は proto-portal/check-map-grid.mjs。すべての地方が 1 つの塊になっている）。
 * 座標の無い県が出ないよう、PREFECTURES の全 47 件が CELLS にあることを同じ検査で確かめる。
 */
import { PREFECTURES, type PrefBlockName } from "@/lib/areas/prefectures";

export interface MapRegion {
  /** URL に出す名前（?r=kanto） */
  slug: string;
  /** サイトの地方ブロック名（PrefBlockName）。表示名にも使う */
  block: PrefBlockName;
  /** 読み上げ・見出し用（北海道以外は「〜地方」） */
  label: string;
  /** この地方の県（地方ブロック順＝PREFECTURES の並び） */
  prefs: { slug: string; short: string; name: string }[];
}

const DEFS: { slug: string; block: PrefBlockName; label: string }[] = [
  { slug: "hokkaido", block: "北海道", label: "北海道" },
  { slug: "tohoku", block: "東北", label: "東北地方" },
  { slug: "kanto", block: "関東", label: "関東地方" },
  { slug: "chubu", block: "中部", label: "中部地方" },
  { slug: "kinki", block: "近畿", label: "近畿地方" },
  { slug: "chugoku", block: "中国", label: "中国地方" },
  { slug: "shikoku", block: "四国", label: "四国地方" },
  { slug: "kyushu", block: "九州沖縄", label: "九州沖縄地方" },
];

export const MAP_REGIONS: MapRegion[] = DEFS.map((d) => ({
  ...d,
  prefs: PREFECTURES.filter((p) => p.block === d.block).map((p) => ({ slug: p.slug, short: p.short, name: p.name })),
}));

export function getRegionBySlug(slug: string | undefined): MapRegion | undefined {
  return slug ? MAP_REGIONS.find((r) => r.slug === slug) : undefined;
}

export function regionOfPref(prefSlug: string): MapRegion | undefined {
  return MAP_REGIONS.find((r) => r.prefs.some((p) => p.slug === prefSlug));
}

/** 県の注記に使う、駅の名前と位置（店の案内に最寄り駅として書かれている駅。n はその県でその駅を書いている店の数） */
export interface StationLabel {
  name: string;
  lat: number;
  lng: number;
  n: number;
}

/* ───────────── タイルグリッド ───────────── */

/** ブロックの並び（列, 行, 幅, 高さ。幅・高さは省略すると 1）。10 列 × 11 行 */
export const MAP_GRID = { cols: 10, rows: 11 } as const;
export const CELLS: Record<string, [number, number, number?, number?]> = {
  hokkaido: [8, 0, 2, 2],
  aomori: [7, 1],
  akita: [7, 2],
  iwate: [8, 2],
  yamagata: [7, 3],
  miyagi: [8, 3],
  fukushima: [8, 4],
  niigata: [7, 4],
  gunma: [7, 5],
  tochigi: [8, 5],
  ibaraki: [9, 5],
  saitama: [7, 6],
  tokyo: [8, 6],
  chiba: [9, 6],
  kanagawa: [8, 7],
  toyama: [6, 4],
  ishikawa: [5, 4],
  fukui: [5, 5],
  nagano: [6, 5],
  gifu: [6, 6],
  aichi: [6, 7],
  yamanashi: [7, 7],
  shizuoka: [7, 8],
  hyogo: [4, 5],
  kyoto: [4, 6],
  shiga: [5, 6],
  osaka: [4, 7],
  mie: [5, 7],
  wakayama: [4, 8],
  nara: [5, 8],
  shimane: [2, 4],
  tottori: [3, 4],
  yamaguchi: [1, 5],
  hiroshima: [2, 5],
  okayama: [3, 5],
  kagawa: [3, 6],
  ehime: [2, 6],
  tokushima: [3, 7],
  kochi: [2, 7],
  saga: [0, 8],
  fukuoka: [1, 8],
  oita: [2, 8],
  nagasaki: [0, 9],
  kumamoto: [1, 9],
  miyazaki: [2, 9],
  kagoshima: [1, 10],
  okinawa: [0, 10],
};

/** 1 マスの SVG 上の大きさ（viewBox の単位） */
export const CELL_U = 40;
/** マスの間の線の太さ（SVG の単位） */
export const GAP_U = 3;

export interface CellRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 県のマスの位置（マス単位） */
export function cellRect(slug: string): CellRect | null {
  const c = CELLS[slug];
  return c ? { x: c[0], y: c[1], w: c[2] ?? 1, h: c[3] ?? 1 } : null;
}

/** 範囲（マス単位。x1・y1 は含まない端） */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export function boxOfPrefs(slugs: string[]): Box | null {
  let b: Box | null = null;
  for (const s of slugs) {
    const r = cellRect(s);
    if (!r) continue;
    b = b
      ? { x0: Math.min(b.x0, r.x), y0: Math.min(b.y0, r.y), x1: Math.max(b.x1, r.x + r.w), y1: Math.max(b.y1, r.y + r.h) }
      : { x0: r.x, y0: r.y, x1: r.x + r.w, y1: r.y + r.h };
  }
  return b;
}

/** 見る位置（カメラ）。z は拡大率、x・y は拡大したあとの平行移動（マス単位） */
export interface Cam {
  z: number;
  x: number;
  y: number;
}

export const CAM_HOME: Cam = { z: 1, x: 0, y: 0 };

/**
 * 範囲 box が枠いっぱいに収まるカメラ。pad は周りの余白（マス）、zMax は拡大の上限、
 * topExtra は上だけ足す余白（マス。枠の左上に出す見出しの板と重ならないように）
 */
export function cameraFor(box: Box, pad: number, zMax: number, topExtra = 0): Cam {
  const bw = box.x1 - box.x0 + pad * 2;
  const bh = box.y1 - box.y0 + pad * 2 + topExtra;
  const z = Math.max(1, Math.min(MAP_GRID.cols / bw, MAP_GRID.rows / bh, zMax));
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2 - topExtra / 2;
  return { z, x: MAP_GRID.cols / 2 - cx * z, y: MAP_GRID.rows / 2 - cy * z };
}

/** 地方ごとの、地図に出す名前の置き場所（その地方のマスのうち、重心にいちばん近いマスの中心。マス単位） */
export function regionAnchor(r: MapRegion): { x: number; y: number } {
  const cells = r.prefs.flatMap((p) => {
    const c = cellRect(p.slug);
    return c ? [c] : [];
  });
  const mx = cells.reduce((a, c) => a + c.x + c.w / 2, 0) / cells.length;
  const my = cells.reduce((a, c) => a + c.y + c.h / 2, 0) / cells.length;
  let best = { x: mx, y: my };
  let bd = Infinity;
  for (const c of cells) {
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    const d = (cx - mx) ** 2 + (cy - my) ** 2;
    if (d < bd) {
      bd = d;
      best = { x: cx, y: cy };
    }
  }
  return best;
}

/** 地方の外側の輪郭（隣の地方や海との境のマスの辺）。SVG の path（viewBox の単位） */
export function regionOutline(r: MapRegion): string {
  const own = new Set<string>();
  for (const p of r.prefs) {
    const c = cellRect(p.slug);
    if (!c) continue;
    for (let i = 0; i < c.w; i++) for (let j = 0; j < c.h; j++) own.add(`${c.x + i},${c.y + j}`);
  }
  const segs: string[] = [];
  const u = CELL_U;
  own.forEach((k) => {
    const [x, y] = k.split(",").map(Number);
    if (!own.has(`${x},${y - 1}`)) segs.push(`M${x * u} ${y * u}H${(x + 1) * u}`);
    if (!own.has(`${x},${y + 1}`)) segs.push(`M${x * u} ${(y + 1) * u}H${(x + 1) * u}`);
    if (!own.has(`${x - 1},${y}`)) segs.push(`M${x * u} ${y * u}V${(y + 1) * u}`);
    if (!own.has(`${x + 1},${y}`)) segs.push(`M${(x + 1) * u} ${y * u}V${(y + 1) * u}`);
  });
  return segs.join("");
}
