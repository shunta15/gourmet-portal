/**
 * 駅エリアごとの店の集計（業種横断）。サーバー専用（lib/places を読むのでクライアントから import しない）。
 *
 * 店 ↔ 駅エリアの対応は lib/stations/storeStations.json（完成済み）をそのまま使う。
 *  - stated : 店の案内に最寄り駅として書かれている駅
 *  - nearby : 駅から直線距離で近い駅（保存は 1000m 以内・最大3駅）。ここでは 800m 以内だけを採る。
 * 店 ID は業種をまたいで一意として扱う（今はグルメの r01〜 だけ。新業種は掲載ができたら同じ表に載る）。
 * 件数・距離・徒歩分数はすべて実データから。徒歩分数は距離から計算しない（lib/stations/walk.ts）。
 */
import { getPlaces, type Place } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals/types";
import { PREFECTURES, type Prefecture } from "@/lib/areas/prefectures";
import { STATIONS, STORE_STATIONS, type StationCluster } from "./index";
import { stationMentionNames, walkMinutesFromText } from "./walk";

/** nearby を採る最大の直線距離（m） */
export const NEARBY_MAX_METERS = 800;
/** 「近くの駅エリア」の最大の直線距離（m） */
export const NEAR_STATIONS_METERS = 2000;

export interface StationStore {
  place: Place;
  vertical: Vertical;
  kind: "stated" | "nearby";
  /** stated のとき、店の案内文から取れた徒歩分数（取れなければ無し） */
  walkMin?: number;
  /** nearby のとき、駅エリアの中心からの直線距離（m） */
  meters?: number;
}

export interface StationSummary {
  station: StationCluster;
  /** stated＋nearby（800m以内）の店数（同じ店は1回） */
  count: number;
  statedCount: number;
  nearbyCount: number;
  stores: StationStore[];
}

export interface StationIndex {
  /** 店のある駅エリア（件数の多い順、同数は駅名順） */
  all: StationSummary[];
  bySlug: Map<string, StationSummary>;
  byPref: Map<string, StationSummary[]>;
  /** 県ごとの店数（同じ店は1回） */
  storesInPref: Map<string, number>;
  totalStores: number;
}

/** slug の駅名部分（slug = `{pref}/{name}`） */
export function stationNameOf(st: StationCluster): string {
  return st.name;
}

export function stationHref(st: StationCluster): string {
  return `/station/${st.pref}/${st.name}`;
}

/** 「{name}駅周辺」。name がすでに「駅」で終わるときは重ねない */
export function stationHeading(st: StationCluster): string {
  return st.name.endsWith("駅") ? `${st.name}周辺` : `${st.name}駅周辺`;
}

/** 別名（name と同じ表記は除く）。「駅」の有無だけが違うものも除く */
export function stationAliases(st: StationCluster): string[] {
  const base = st.name.replace(/駅$/, "");
  return st.aliases.filter((a) => a !== st.name && a.replace(/駅$/, "") !== base);
}

/** 別名の併記（「三宮・三ノ宮・神戸三宮」。別名のあとに駅名）。別名の中に「・」があるときは区切りが紛れないよう「／」でつなぐ。別名が無ければ空 */
export function aliasText(st: StationCluster): string {
  const aliases = stationAliases(st);
  if (aliases.length === 0) return "";
  const names = [...aliases, st.name];
  return names.join(names.some((n) => n.includes("・")) ? "／" : "・");
}

/** 路線（重複なし。同じ路線名でも事業者が違えば別） */
export function uniqueLines(st: StationCluster): { line: string; operator: string }[] {
  const seen = new Set<string>();
  const out: { line: string; operator: string }[] = [];
  for (const l of st.lines) {
    const k = `${l.line}|${l.operator}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(l);
  }
  return out;
}

/** 店のページ。グルメは既存の /restaurant/{id}、新業種は /{v}/shop/{id} */
export function placeHref(v: Vertical, p: Place): string {
  return v.key === "gourmet" ? `/restaurant/${p.id}` : `${v.path}/shop/${p.id}`;
}

/** 店カードに出す種類名。グルメは業態の文字列そのまま、新業種は種類の表示名 */
export function placeCategoryName(v: Vertical, p: Place): string {
  if (v.key === "gourmet") return p.category;
  return v.categories.find((c) => c.slug === p.category)?.name ?? "";
}

/** 直線距離（m） */
export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 表示する距離（50m単位に丸める。最小は 50） */
export function roundMeters(m: number): number {
  return Math.max(50, Math.round(m / 50) * 50);
}

async function build(): Promise<StationIndex> {
  const found = new Map<string, { place: Place; vertical: Vertical }>();
  for (const v of Object.values(VERTICALS)) {
    for (const place of await getPlaces(v.key)) {
      if (!found.has(place.id)) found.set(place.id, { place, vertical: v });
    }
  }

  const stores = new Map<string, StationStore[]>();
  const push = (clusterId: string, s: StationStore) => {
    const list = stores.get(clusterId);
    if (list) list.push(s);
    else stores.set(clusterId, [s]);
  };

  for (const [id, entry] of Object.entries(STORE_STATIONS)) {
    const hit = found.get(id);
    if (!hit) continue;
    const { place, vertical } = hit;
    const seen = new Set<string>();
    for (const s of entry.stated ?? []) {
      const st = STATIONS[s.clusterId];
      if (!st || !st.pref || seen.has(s.clusterId)) continue;
      seen.add(s.clusterId);
      push(s.clusterId, {
        place,
        vertical,
        kind: "stated",
        walkMin: walkMinutesFromText(place.station, stationMentionNames(st)),
      });
    }
    for (const n of entry.nearby ?? []) {
      const st = STATIONS[n.clusterId];
      if (!st || !st.pref || seen.has(n.clusterId) || n.meters > NEARBY_MAX_METERS) continue;
      seen.add(n.clusterId);
      push(n.clusterId, { place, vertical, kind: "nearby", meters: n.meters });
    }
  }

  const all: StationSummary[] = [];
  for (const [clusterId, list] of stores) {
    const station = STATIONS[clusterId];
    const stated = list
      .filter((s) => s.kind === "stated")
      .sort((a, b) => (a.walkMin ?? 999) - (b.walkMin ?? 999) || a.place.id.localeCompare(b.place.id, "en", { numeric: true }));
    const nearby = list
      .filter((s) => s.kind === "nearby")
      .sort((a, b) => (a.meters ?? 0) - (b.meters ?? 0) || a.place.id.localeCompare(b.place.id, "en", { numeric: true }));
    all.push({
      station,
      count: stated.length + nearby.length,
      statedCount: stated.length,
      nearbyCount: nearby.length,
      stores: [...stated, ...nearby],
    });
  }
  all.sort((a, b) => b.count - a.count || a.station.name.localeCompare(b.station.name, "ja"));

  const bySlug = new Map<string, StationSummary>();
  const byPref = new Map<string, StationSummary[]>();
  const prefStoreIds = new Map<string, Set<string>>();
  const allStoreIds = new Set<string>();
  for (const s of all) {
    bySlug.set(s.station.slug, s);
    const pref = s.station.pref!;
    byPref.set(pref, [...(byPref.get(pref) ?? []), s]);
    const ids = prefStoreIds.get(pref) ?? new Set<string>();
    for (const x of s.stores) {
      ids.add(x.place.id);
      allStoreIds.add(x.place.id);
    }
    prefStoreIds.set(pref, ids);
  }
  const storesInPref = new Map<string, number>();
  for (const [pref, ids] of prefStoreIds) storesInPref.set(pref, ids.size);

  return { all, bySlug, byPref, storesInPref, totalStores: allStoreIds.size };
}

// ビルド中は大量のページが同じ集計を使うので、短い時間だけ使い回す（ISR の再生成では取り直す）
let memo: { at: number; p: Promise<StationIndex> } | null = null;
export function getStationIndex(): Promise<StationIndex> {
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

/** 件数の多い駅エリア（上位 n） */
export async function topStations(n: number): Promise<StationSummary[]> {
  return (await getStationIndex()).all.slice(0, n);
}

/** 県の駅エリア（件数の多い順） */
export async function stationsInPref(pref: string, limit?: number): Promise<StationSummary[]> {
  const list = (await getStationIndex()).byPref.get(pref) ?? [];
  return limit ? list.slice(0, limit) : list;
}

/** 近くの駅エリア（中心どうしの直線距離が 2km 以内、近い順、最大 n） */
export function nearStations(idx: StationIndex, from: StationCluster, n = 8): (StationSummary & { meters: number })[] {
  return idx.all
    .filter((s) => s.station.id !== from.id)
    .map((s) => ({ ...s, meters: distanceMeters(from.lat, from.lng, s.station.lat, s.station.lng) }))
    .filter((s) => s.meters <= NEAR_STATIONS_METERS)
    .sort((a, b) => a.meters - b.meters)
    .slice(0, n);
}

/** 県の表示順（地方ブロック順）に、店のある県だけを返す */
export function prefsWithStations(idx: StationIndex): Prefecture[] {
  return PREFECTURES.filter((p) => idx.byPref.has(p.slug));
}

/** URL の slug の日本語が、環境によってデコードされないまま渡ることがある（lib/db/features.ts と同じ対策） */
export function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
