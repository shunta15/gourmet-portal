/**
 * ジャンル × 駅エリアの集計（/station/{pref}/{駅名}/{ジャンル}）。サーバー専用（lib/stations/query.ts を読む）。
 *
 * ジャンルは lib/cuisineGroups.ts の CUISINE_GROUPS（label がそのまま URL）。店がジャンルに当たるかは、
 * 既存の検索（/search?cuisine=）と同じ判定（店の業態の文字列に keywords のどれかが含まれる）。
 * 店 ↔ 駅エリアの対応・並び順は駅ページ（lib/stations/query.ts の StationSummary.stores）をそのまま使う。
 *
 * ページを作る条件（決まり。変えない）:
 *   1. その駅エリア × ジャンルの店が MIN_INDEXABLE（3）店以上
 *   2. その駅エリアの店がそのジャンルだけではない（＝駅ページと中身が同じにならない）
 * 満たさない組み合わせは作らない（404）。noindex の薄いページは作らない。
 */
import { CUISINE_GROUPS, type CuisineLabel } from "@/lib/cuisineGroups";
import { MIN_INDEXABLE } from "@/lib/seo/gate";
import {
  distanceMeters,
  getStationIndex,
  type StationIndex,
  type StationStore,
  type StationSummary,
} from "./query";

export interface GenrePage {
  genre: CuisineLabel;
  summary: StationSummary;
  /** 駅ページと同じ並び（stated → nearby）のまま、ジャンルに当たる店だけ */
  stores: StationStore[];
  statedCount: number;
  nearbyCount: number;
  count: number;
}

export interface GenreStats {
  /** 店のある駅エリアの数 */
  stationsTotal: number;
  /** 1 つ以上ジャンルのページがある駅エリアの数 */
  stationsWithPage: number;
  pages: number;
  /** ジャンル別のページ数（CUISINE_GROUPS の順） */
  pagesByGenre: { genre: CuisineLabel; pages: number }[];
  /** 作らなかった組み合わせ（店が 1 店以上ある駅エリア × ジャンルのみ数える） */
  skippedThin: number; // 1〜2 店
  skippedSame: number; // 3 店以上だが、駅エリアの店がすべてそのジャンル（駅ページと同じ）
  /** 店数の多い順の上位 */
  top: GenrePage[];
}

export interface GenreIndex {
  pages: GenrePage[];
  /** key = `${pref}/${駅名}/${ジャンル}` */
  byKey: Map<string, GenrePage>;
  /** 駅エリア id → その駅のジャンルのページ（店数の多い順、同数は CUISINE_GROUPS の順） */
  byStation: Map<string, GenrePage[]>;
  stats: GenreStats;
}

const GENRE_ORDER = new Map<string, number>(CUISINE_GROUPS.map((g, i) => [g.label, i]));

/** 店の業態の文字列（Place.category。グルメでは Restaurant.cuisine）が、そのジャンルに当たるか。/search?cuisine= と同じ判定 */
export function matchesGenre(category: string, genre: CuisineLabel): boolean {
  const group = CUISINE_GROUPS.find((g) => g.label === genre);
  return !!group && group.keywords.some((kw) => category.includes(kw));
}

export function genreKey(pref: string, name: string, genre: string): string {
  return `${pref}/${name}/${genre}`;
}

/** ジャンルのページの URL パス（日本語のまま。canonical・パンくず用。リンクの href は Next が encode する） */
export function genreHref(pref: string, name: string, genre: string): string {
  return `/station/${pref}/${name}/${genre}`;
}

export function isGenreLabel(s: string): s is CuisineLabel {
  return GENRE_ORDER.has(s);
}

function build(idx: StationIndex): GenreIndex {
  const pages: GenrePage[] = [];
  const byKey = new Map<string, GenrePage>();
  const byStation = new Map<string, GenrePage[]>();
  const pagesByGenre = new Map<string, number>(CUISINE_GROUPS.map((g) => [g.label, 0]));
  let skippedThin = 0;
  let skippedSame = 0;

  for (const summary of idx.all) {
    for (const g of CUISINE_GROUPS) {
      // グルメの業態だけが対象（CUISINE_GROUPS はグルメの分類）
      const stores = summary.stores.filter((s) => s.vertical.key === "gourmet" && matchesGenre(s.place.category, g.label));
      if (stores.length === 0) continue;
      if (stores.length < MIN_INDEXABLE) {
        skippedThin++;
        continue;
      }
      if (stores.length >= summary.count) {
        skippedSame++;
        continue;
      }
      const page: GenrePage = {
        genre: g.label,
        summary,
        stores,
        statedCount: stores.filter((s) => s.kind === "stated").length,
        nearbyCount: stores.filter((s) => s.kind === "nearby").length,
        count: stores.length,
      };
      pages.push(page);
      byKey.set(genreKey(summary.station.pref!, summary.station.name, g.label), page);
      byStation.set(summary.station.id, [...(byStation.get(summary.station.id) ?? []), page]);
      pagesByGenre.set(g.label, (pagesByGenre.get(g.label) ?? 0) + 1);
    }
  }
  for (const list of byStation.values()) {
    list.sort((a, b) => b.count - a.count || (GENRE_ORDER.get(a.genre) ?? 0) - (GENRE_ORDER.get(b.genre) ?? 0));
  }

  const top = [...pages].sort(
    (a, b) => b.count - a.count || a.summary.station.name.localeCompare(b.summary.station.name, "ja") || (GENRE_ORDER.get(a.genre) ?? 0) - (GENRE_ORDER.get(b.genre) ?? 0),
  );
  return {
    pages,
    byKey,
    byStation,
    stats: {
      stationsTotal: idx.all.length,
      stationsWithPage: byStation.size,
      pages: pages.length,
      pagesByGenre: CUISINE_GROUPS.map((g) => ({ genre: g.label, pages: pagesByGenre.get(g.label) ?? 0 })),
      skippedThin,
      skippedSame,
      top: top.slice(0, 10),
    },
  };
}

// 駅の集計（getStationIndex）と同じ寿命で使い回す。集計が取り直されたら、こちらも作り直す
const memo = new WeakMap<StationIndex, GenreIndex>();
export async function getGenreIndex(): Promise<GenreIndex> {
  const idx = await getStationIndex();
  let g = memo.get(idx);
  if (!g) {
    g = build(idx);
    memo.set(idx, g);
  }
  return g;
}

/** 同じ県で、そのジャンルのページがある駅エリア（from から近い順、最大 n。from 自身は除く） */
export function nearGenrePages(gi: GenreIndex, from: StationSummary, genre: CuisineLabel, n = 8): (GenrePage & { meters: number })[] {
  const pref = from.station.pref;
  return gi.pages
    .filter((p) => p.genre === genre && p.summary.station.pref === pref && p.summary.station.id !== from.station.id)
    .map((p) => ({
      ...p,
      meters: distanceMeters(from.station.lat, from.station.lng, p.summary.station.lat, p.summary.station.lng),
    }))
    .sort((a, b) => a.meters - b.meters || a.summary.station.name.localeCompare(b.summary.station.name, "ja"))
    .slice(0, n);
}
