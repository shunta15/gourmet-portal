/**
 * 「地図で探す」の地方（8つ）と、デフォルメ日本地図の並び。純粋なデータ（サーバー・クライアントのどちらからでも import できる）。
 *
 * 地方の区分はサイトの既存のもの（lib/areas/prefectures の block）に合わせる。表示名もサイトと同じ（「九州沖縄」。中点なし）。
 * デフォルメ地図は実測の海岸線を使わず、都道府県を 1 マスのブロックにして、おおよその位置関係で並べた自作のもの
 * （北海道だけ 2×2）。マスの座標は [列, 行]（左上が 0,0）。隣り合う県が隣になるように並べた概念図で、距離・面積は表さない。
 * 座標の無い県が出ないよう、PREFECTURES の全 47 件が CELLS にあることをブラウザ検査で確かめる。
 */
import { PREFECTURES, type PrefBlockName } from "@/lib/areas/prefectures";

export interface MapRegion {
  /** URL に出す名前（?r=kanto） */
  slug: string;
  /** サイトの地方ブロック名（PrefBlockName）。表示名にも使う */
  block: PrefBlockName;
  /** 読み上げ・見出し用（北海道以外は「〜地方」） */
  label: string;
  /** 地図の塗り（インク色の文字が AA を満たす明るさ） */
  fill: string;
  /** この地方の県（地方ブロック順＝PREFECTURES の並び） */
  prefs: { slug: string; short: string; name: string }[];
}

const DEFS: { slug: string; block: PrefBlockName; label: string; fill: string }[] = [
  { slug: "hokkaido", block: "北海道", label: "北海道", fill: "#c9d9cf" },
  { slug: "tohoku", block: "東北", label: "東北地方", fill: "#d5d3e6" },
  { slug: "kanto", block: "関東", label: "関東地方", fill: "#efd2bd" },
  { slug: "chubu", block: "中部", label: "中部地方", fill: "#e6dcae" },
  { slug: "kinki", block: "近畿", label: "近畿地方", fill: "#e8c5c8" },
  { slug: "chugoku", block: "中国", label: "中国地方", fill: "#c3d9e0" },
  { slug: "shikoku", block: "四国", label: "四国地方", fill: "#d2e0b8" },
  { slug: "kyushu", block: "九州沖縄", label: "九州沖縄地方", fill: "#ecceaa" },
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

/** ブロックの並び（列, 行, 幅, 高さ。幅・高さは省略すると 1）。13 列 × 11 行 */
export const MAP_GRID = { cols: 13, rows: 11 } as const;
export const CELLS: Record<string, [number, number, number?, number?]> = {
  hokkaido: [11, 0, 2, 2],
  aomori: [11, 2],
  akita: [10, 3],
  iwate: [11, 3],
  yamagata: [10, 4],
  miyagi: [11, 4],
  niigata: [10, 5],
  fukushima: [11, 5],
  gunma: [11, 6],
  tochigi: [12, 6],
  saitama: [11, 7],
  ibaraki: [12, 7],
  tokyo: [11, 8],
  chiba: [12, 8],
  kanagawa: [11, 9],
  ishikawa: [8, 5],
  toyama: [9, 5],
  fukui: [8, 6],
  gifu: [9, 6],
  nagano: [10, 6],
  yamanashi: [10, 7],
  aichi: [9, 7],
  shizuoka: [10, 8],
  mie: [9, 8],
  shiga: [8, 7],
  kyoto: [7, 7],
  hyogo: [6, 7],
  osaka: [7, 8],
  nara: [8, 8],
  wakayama: [8, 9],
  shimane: [4, 6],
  tottori: [5, 6],
  hiroshima: [4, 7],
  okayama: [5, 7],
  yamaguchi: [3, 7],
  ehime: [4, 8],
  kagawa: [5, 8],
  tokushima: [6, 8],
  kochi: [5, 9],
  saga: [1, 7],
  fukuoka: [2, 7],
  nagasaki: [1, 8],
  kumamoto: [2, 8],
  oita: [3, 8],
  kagoshima: [2, 9],
  miyazaki: [3, 9],
  okinawa: [1, 10],
};
