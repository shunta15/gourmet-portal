/**
 * 駅クラスタマスター＆店→駅対応
 * 自動生成ファイル（automation/stations/build-stations.mjs で再生成）
 * 出典：国土数値情報（鉄道データ）N02-25（2025年度版）国土交通省／国土地理院
 */

import stations from "./stations.json";
import storeStations from "./storeStations.json";

export type StationCluster = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  pref: string | null;
  muniCd: string | null;
  cityName: string | null;
  lat: number;
  lng: number;
  lines: { line: string; operator: string }[];
  groups: string[];
};

export type StoreStations = {
  stated?: { clusterId: string; walkMin?: number }[];
  nearby?: { clusterId: string; meters: number }[];
};

export function getStationBySlug(pref: string, name: string): StationCluster | undefined {
  const slug = pref + "/" + name;
  return Object.values(stations).find((st) => st.slug === slug);
}

export function getStationsByPref(pref: string): StationCluster[] {
  return Object.values(stations).filter((st) => st.pref === pref);
}

export function getStoreIdsByStation(clusterId: string): string[] {
  const storeIds: string[] = [];
  Object.entries(storeStations).forEach(([storeId, entry]) => {
    if (entry.stated?.some(s => s.clusterId === clusterId)) {
      storeIds.push(storeId);
    } else if (entry.nearby?.some(n => n.clusterId === clusterId)) {
      if (!storeIds.includes(storeId)) {
        storeIds.push(storeId);
      }
    }
  });
  return storeIds;
}

export function getStationsForStore(storeId: string): (StationCluster & { type: 'stated' | 'nearby'; walkMin?: number; meters?: number })[] {
  const entry = storeStations[storeId as keyof typeof storeStations] as any;
  if (!entry) return [];

  const result: any[] = [];
  if (entry.stated) {
    entry.stated.forEach((s: any) => {
      const station = stations[s.clusterId as keyof typeof stations];
      if (station) {
        const item: any = {
          ...station,
          type: 'stated' as const,
        };
        if (s.walkMin !== undefined) {
          item.walkMin = s.walkMin;
        }
        result.push(item);
      }
    });
  }
  if (entry.nearby) {
    entry.nearby.forEach((n: any) => {
      const station = stations[n.clusterId as keyof typeof stations];
      if (station) {
        result.push({
          ...station,
          type: 'nearby' as const,
          meters: n.meters,
        });
      }
    });
  }
  return result;
}

export function findStationByName(name: string, pref?: string): StationCluster | undefined {
  return Object.values(stations).find((st) => {
    if (st.name === name) {
      return !pref || st.pref === pref;
    }
    if ((st.aliases as string[]).includes(name)) {
      return !pref || st.pref === pref;
    }
    return false;
  });
}

export function stationPath(station: StationCluster | { slug: string }): string {
  return '/station/' + station.slug;
}

export const STATIONS = stations as Record<string, StationCluster>;
export const STORE_STATIONS = storeStations as Record<string, StoreStations>;
