/**
 * 駅マスター＆店→駅対応
 * 自動生成ファイル（build-stations.mjs で再生成）
 * 出典：国土数値情報（鉄道データ）国土交通省 N02-25（2025年度版）
 */

import stations_raw from "./stations.json";
import storeStations_raw from "./storeStations.json";

export type Station = {
  id: string;
  name: string;
  pref: string | null;
  lat: number;
  lng: number;
  lines: { line: string; operator: string }[];
  slug: string;
};

export type StoreStation = {
  stated?: { stationId: string; walkMin?: number | null }[];
  nearby?: { stationId: string; meters: number }[];
};

const stations = stations_raw as Record<string, Station>;
const storeStations = storeStations_raw as Record<string, StoreStation>;

export function getStation(stationId: string): Station | undefined {
  return stations[stationId];
}

export function getStationsByPref(pref: string): Station[] {
  return Object.values(stations).filter((st) => st.pref === pref);
}

export function getStoresByStation(stationId: string): string[] {
  const storeIds: string[] = [];
  Object.entries(storeStations).forEach(([storeId, entry]) => {
    if (entry.stated?.some(s => s.stationId === stationId)) {
      storeIds.push(storeId);
    } else if (entry.nearby?.some(n => n.stationId === stationId)) {
      if (!storeIds.includes(storeId)) {
        storeIds.push(storeId);
      }
    }
  });
  return storeIds;
}

export function stationPath(station: Station | { slug: string }): string {
  return '/station/' + station.slug;
}

export const STATIONS = stations;
export const STORE_STATIONS = storeStations;
