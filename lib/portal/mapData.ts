/**
 * 地図に出す店のデータ（業種横断）。サーバー専用（lib/places と lib/geo を読むのでクライアントから import しない）。
 *
 * クライアントへ渡すのは最小限の項目だけ（id, name, lat, lng, vertical, category, stationName, href と、県の絞り込み用の pref）。
 * 営業時間は文字列ではなく、解析済みの週の営業予定（lib/portal/openNow の Week）を重複排除した表にして渡す。
 *
 * 座標: Place に lat/lng があればそれ、無ければ lib/geo.ts の GEO（店ID → 緯度経度。Google Maps のピン座標か国土地理院の住所検索）。
 * 座標の無い店は地図に出さない（missing として数える）。座標を作らない・推測しない。
 */
import { getPlaces, type Place } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { GEO } from "@/lib/geo";
import { prefOfGourmetRegion } from "@/lib/areas/gourmet";
import { STATIONS, STORE_STATIONS } from "@/lib/stations";
import { placeCategoryName, placeHref } from "@/lib/stations/query";
import { packWeeks, type Week } from "./openNow";
import type { StationLabel } from "./mapRegions";

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vertical: VerticalKey;
  /** 業態・種類の表示名（グルメは業態の文字列そのまま） */
  category: string;
  /** 店の案内に最寄り駅として書かれている駅（stated）。無ければ無し */
  stationName?: string;
  href: string;
  /** 都道府県 slug（グルメの region キーは県に直してある。県が分からなければ空） */
  pref: string;
}

/** 営業予定の表。table は重複排除済み、index は 店ID → table の番号 */
export interface WeekTable {
  table: (Week | null)[];
  index: Record<string, number>;
}

export interface MapDataset {
  points: MapPoint[];
  weeks: WeekTable;
  /** 掲載している店の数（座標の有無を問わない） */
  total: number;
  /** 座標が無くて地図に出せない店の数 */
  missing: number;
  /** 業種ごとの、地図に出せる店の数 */
  byVertical: Record<VerticalKey, number>;
  /** 県 slug → その県の店が最寄り駅として書いている駅（名前・位置・書いている店の数）。県の地図の注記に使う */
  stationsByPref: Record<string, StationLabel[]>;
}

/** 駅名の表記（「駅」で終わっていなければ付ける） */
function stationLabel(name: string): string {
  return name.endsWith("駅") ? name : `${name}駅`;
}

function coordsOf(p: Place): { lat: number; lng: number } | null {
  if (typeof p.lat === "number" && typeof p.lng === "number") return { lat: p.lat, lng: p.lng };
  const g = GEO[p.id];
  return g ? { lat: g.lat, lng: g.lng } : null;
}

async function build(): Promise<MapDataset> {
  const points: MapPoint[] = [];
  const hours: { id: string; hours?: string; closed?: string }[] = [];
  const byVertical = Object.fromEntries(Object.keys(VERTICALS).map((k) => [k, 0])) as Record<VerticalKey, number>;
  const seen = new Set<string>();
  const stationAcc = new Map<string, { name: string; lat: number; lng: number; n: Record<string, number> }>();
  let total = 0;
  let missing = 0;

  for (const v of Object.values(VERTICALS)) {
    for (const p of await getPlaces(v.key)) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      total++;
      const c = coordsOf(p);
      if (!c) {
        missing++;
        continue;
      }
      const stated = STORE_STATIONS[p.id]?.stated?.[0];
      const st = stated ? STATIONS[stated.clusterId] : undefined;
      const pref = (v.key === "gourmet" ? prefOfGourmetRegion(p.pref) : p.pref) ?? "";
      if (st && stated) {
        let acc = stationAcc.get(stated.clusterId);
        if (!acc) {
          acc = { name: stationLabel(st.name), lat: st.lat, lng: st.lng, n: {} };
          stationAcc.set(stated.clusterId, acc);
        }
        acc.n[pref] = (acc.n[pref] ?? 0) + 1;
      }
      points.push({
        id: p.id,
        name: p.name,
        lat: c.lat,
        lng: c.lng,
        vertical: v.key,
        category: placeCategoryName(v, p),
        ...(st ? { stationName: stationLabel(st.name) } : {}),
        href: placeHref(v, p),
        pref,
      });
      hours.push({ id: p.id, hours: p.hours, closed: p.holidays });
      byVertical[v.key]++;
    }
  }
  const stationsByPref: Record<string, StationLabel[]> = {};
  stationAcc.forEach((acc) => {
    for (const [pref, n] of Object.entries(acc.n)) {
      if (!pref) continue;
      (stationsByPref[pref] ??= []).push({ name: acc.name, lat: acc.lat, lng: acc.lng, n });
    }
  });
  return { points, weeks: packWeeks(hours), total, missing, byVertical, stationsByPref };
}

// ビルド中は大量のページが同じ集計を使うので、短い時間だけ使い回す（ISR の再生成では取り直す）
let memo: { at: number; p: Promise<MapDataset> } | null = null;
export function loadMapData(): Promise<MapDataset> {
  const now = Date.now();
  if (!memo || now - memo.at > 60_000) {
    const p = build();
    memo = { at: now, p };
    p.catch(() => {
      if (memo?.p === p) memo = null;
    });
  }
  return memo.p;
}

/** 指定の店だけに絞った点と、その店の営業予定の表（表も絞って小さくする） */
export function subsetOf(data: MapDataset, ids: Iterable<string>): { points: MapPoint[]; weeks: WeekTable } {
  const want = new Set(ids);
  const points = data.points.filter((p) => want.has(p.id));
  return { points, weeks: subsetWeeks(data.weeks, points.map((p) => p.id)) };
}

/** 県の店だけに絞った点と営業予定の表 */
export function subsetOfPref(data: MapDataset, pref: string): { points: MapPoint[]; weeks: WeekTable } {
  const points = data.points.filter((p) => p.pref === pref);
  return { points, weeks: subsetWeeks(data.weeks, points.map((p) => p.id)) };
}

function subsetWeeks(all: WeekTable, ids: string[]): WeekTable {
  const table: (Week | null)[] = [];
  const remap = new Map<number, number>();
  const index: Record<string, number> = {};
  for (const id of ids) {
    const old = all.index[id];
    if (old === undefined) continue;
    let n = remap.get(old);
    if (n === undefined) {
      n = table.length;
      table.push(all.table[old]);
      remap.set(old, n);
    }
    index[id] = n;
  }
  return { table, index };
}
