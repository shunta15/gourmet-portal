#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRATCHPAD = "/private/tmp/claude-501/-Users-shunta-claude/666109d7-a009-4dee-943a-cbc6676e581c/scratchpad/stations";
const STATION_DATA = path.join(SCRATCHPAD, "N02-25_GML/UTF-8/N02-25_Station.geojson");
const ROOT_DIR = "/Users/shunta/claude/gp-portal";
const OUTPUT_DIR = path.join(ROOT_DIR, "lib/stations");
const GEO_FILE = path.join(ROOT_DIR, "lib/geo.ts");
const PREF_FILE = path.join(ROOT_DIR, "lib/areas/prefectures.ts");

let gsiQueryCount = 0;
let gsiErrorCount = 0;

function loadPrefectures() {
  const content = fs.readFileSync(PREF_FILE, "utf-8");
  const prefsByCode = {};

  let currentCode = null;
  let currentSlug = null;

  content.split('\n').forEach(line => {
    const codeMatch = line.match(/code:\s*['"](\d+)['"]/);
    const slugMatch = line.match(/slug:\s*['"]([^'"]+)['"]/);

    if (codeMatch) {
      currentCode = codeMatch[1];
    }
    if (slugMatch && currentCode) {
      currentSlug = slugMatch[1];
      prefsByCode[currentCode] = currentSlug;
      currentCode = null;
    }
  });

  return prefsByCode;
}

function loadStations() {
  const data = JSON.parse(fs.readFileSync(STATION_DATA, "utf-8"));
  const stationsByGroup = {};

  data.features.forEach(feature => {
    const props = feature.properties;
    const groupCode = props.N02_005g;
    const line = props.N02_003;
    const operator = props.N02_004;
    const name = props.N02_005;

    const coords = feature.geometry.coordinates;

    let lat = 0, lng = 0;
    if (Array.isArray(coords) && coords.length > 0) {
      coords.forEach(c => {
        lng += c[0];
        lat += c[1];
      });
      lng /= coords.length;
      lat /= coords.length;
    }

    if (!stationsByGroup[groupCode]) {
      stationsByGroup[groupCode] = {
        name,
        coords: [],
        lines: {},
      };
    }

    stationsByGroup[groupCode].coords.push([lat, lng]);
    if (!stationsByGroup[groupCode].lines[line]) {
      stationsByGroup[groupCode].lines[line] = operator;
    }
  });

  // 代表座標を計算
  Object.keys(stationsByGroup).forEach(groupCode => {
    const group = stationsByGroup[groupCode];
    let lat = 0, lng = 0;
    group.coords.forEach(c => {
      lat += c[0];
      lng += c[1];
    });
    group.lat = lat / group.coords.length;
    group.lng = lng / group.coords.length;
    delete group.coords;
  });

  return stationsByGroup;
}

function loadGeoData() {
  const content = fs.readFileSync(GEO_FILE, "utf-8");
  const geo = {};

  const geoMatch = content.matchAll(/"([a-z0-9]+)":\s*\{\s*"lat":\s*([\d.-]+),\s*"lng":\s*([\d.-]+)/g);
  [...geoMatch].forEach(m => {
    geo[m[1]] = [parseFloat(m[2]), parseFloat(m[3])];
  });

  return geo;
}

async function loadRestaurants() {
  try {
    const { loadData } = await import(path.join(ROOT_DIR, "automation/lib/load-data.mjs"));
    const data = await loadData();
    return data.RESTAURANTS || [];
  } catch (e) {
    console.error("店舗データ読み込み失敗:", e.message);
    return [];
  }
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function tokenizeStationName(stationText) {
  const tokens = stationText
    .replace(/[・、／\s/]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 0);

  return tokens;
}

function normalizeStationToken(token) {
  return token
    .replace(/(駅|口|出口|広場|駅前|駅舎|構内|駅内|番出口).*$/, "")
    .trim();
}

// 店の案内に旧駅名で書かれていることがある改称駅（旧名 → 現名）。店から3km以内の駅にだけ当てる
const STATION_RENAMES = {
  河原町: "京都河原町", // 阪急 2019年改称
};

function matchStationsByTokens(stationText, stationsByGroup, storeCoords, storeRegion) {
  const tokens = tokenizeStationName(stationText);
  const candidates = [];

  const candidateGroups = storeCoords
    ? Object.entries(stationsByGroup).filter(([_, g]) => {
        const dist = haversineDistance(storeCoords[0], storeCoords[1], g.lat, g.lng);
        return dist <= 3000;
      })
    : Object.entries(stationsByGroup);

  tokens.forEach(token => {
    if (!token) return;

    const normalized = normalizeStationToken(token);
    if (!normalized) return;

    // 1) 駅名と完全一致（改称前の名前は STATION_RENAMES で今の名前に読み替える）
    // 2) 無ければ「トークンの末尾が駅名」（例「Osaka Metro野田阪神」→「野田阪神」）で最長のもの。
    //    逆向き（駅名の末尾がトークン）は禁止: 「白楽」→「東白楽」、「本町」→「大阪上本町」の取り違えが出た（2026-10-03）。
    const wanted = STATION_RENAMES[normalized] || normalized;
    let bestMatch = null;
    let bestLen = 0;

    candidateGroups.forEach(([groupCode, group]) => {
      const groupName = group.name;
      if (groupName === wanted && !(bestMatch && bestMatch.exact)) {
        bestMatch = { groupCode, groupName, exact: true };
        bestLen = groupName.length;
      }
    });
    if (!bestMatch) {
      candidateGroups.forEach(([groupCode, group]) => {
        const groupName = group.name;
        if (normalized.endsWith(groupName) && groupName.length > bestLen) {
          bestMatch = { groupCode, groupName };
          bestLen = groupName.length;
        }
      });
    }

    if (bestMatch) {
      if (!candidates.some(c => c.groupCode === bestMatch.groupCode)) {
        candidates.push(bestMatch);
      }
    }
  });

  return candidates;
}

function extractWalkingMinutes(stationText) {
  const match = stationText.match(/徒歩\s*(\d+)\s*分/);
  return match ? parseInt(match[1], 10) : null;
}

function clusterStations(stationsForOutput) {
  // 乗り換え駅をまとめる。路線数の多い駅を中心にして、その中心から 300m 以内の駅だけを同じエリアにする。
  // 「隣の隣」まで連鎖させると、路面電車のように 300m 間隔で駅が続く所（広島の市内線など）で
  // 市の中心部が丸ごと1エリアになってしまったため、連鎖はしない（2026-10-03）。
  const CLUSTER_RADIUS_M = 300;
  const clusters = [];
  const assigned = new Set();
  const ids = Object.keys(stationsForOutput).sort((x, y) => {
    const a = stationsForOutput[x], b = stationsForOutput[y];
    return (b.lines?.length || 0) - (a.lines?.length || 0) || a.name.length - b.name.length || x.localeCompare(y);
  });
  for (const seedId of ids) {
    if (assigned.has(seedId)) continue;
    const seed = stationsForOutput[seedId];
    const cluster = [seedId];
    assigned.add(seedId);
    for (const otherId of ids) {
      if (assigned.has(otherId)) continue;
      const o = stationsForOutput[otherId];
      if (haversineDistance(seed.lat, seed.lng, o.lat, o.lng) <= CLUSTER_RADIUS_M) {
        cluster.push(otherId);
        assigned.add(otherId);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function buildClusterOutput(clusters, stationsForOutput, prefsByCode) {
  const clustersForOutput = {};
  const clusterIdMap = {};
  let clusterIndex = 1;

  clusters.forEach(cluster => {
    let representative = cluster[0];
    let maxLines = stationsForOutput[representative].lines.length;
    let minNameLen = stationsForOutput[representative].name.length;

    cluster.forEach(stationId => {
      const st = stationsForOutput[stationId];
      const lineCount = st.lines.length;
      const nameLen = st.name.length;

      if (lineCount > maxLines || (lineCount === maxLines && nameLen < minNameLen)) {
        representative = stationId;
        maxLines = lineCount;
        minNameLen = nameLen;
      }
    });

    const repSt = stationsForOutput[representative];
    const clusterId = "c" + String(clusterIndex).padStart(4, "0");
    clusterIndex++;

    const aliases = cluster
      .filter(id => id !== representative)
      .map(id => stationsForOutput[id].name);

    const slug = (repSt.pref ? repSt.pref + "/" : "unknown/") + repSt.name;

    clustersForOutput[clusterId] = {
      id: clusterId,
      slug,
      name: repSt.name,
      aliases,
      pref: repSt.pref || null,
      muniCd: repSt.muniCd || null,
      cityName: repSt.cityName || null,
      lat: repSt.lat,
      lng: repSt.lng,
      lines: repSt.lines,
      groups: cluster,
    };

    cluster.forEach(stationId => {
      clusterIdMap[stationId] = clusterId;
    });
  });

  return { clustersForOutput, clusterIdMap };
}

async function main() {
  console.log("駅データ構築を開始します...\n");

  const stationsByGroup = loadStations();
  console.log("駅グループ数（N02-25から抽出）:", Object.keys(stationsByGroup).length);

  const geo = loadGeoData();
  console.log("店舗の座標データ数:", Object.keys(geo).length);

  const restaurants = await loadRestaurants();
  console.log("店舗総数:", restaurants.length);

  const stationsInUse = new Set();
  const storeStations = {};
  const unmatchedStations = new Set();
  const prefsByCode = loadPrefectures();

  // 店→駅の照合
  console.log("\n店→駅の照合を実行中...");
  restaurants.forEach(restaurant => {
    const storeId = restaurant.id;
    const stationText = restaurant.nearest || "";
    const storeCoords = geo[storeId];
    const storeRegion = restaurant.region;

    const stated = [];
    const nearby = [];

    if (stationText.trim()) {
      const matches = matchStationsByTokens(stationText, stationsByGroup, storeCoords, storeRegion);

      // 「徒歩N分」は駅が1つだけ書かれている時だけ、その駅の分数とする（複数駅の文で最初の分数を全駅に当てていた）
      const walkMin = matches.length === 1 ? extractWalkingMinutes(stationText) : null;
      if (matches.length > 0) {
        matches.forEach(match => {
          stated.push({ groupCode: match.groupCode, walkMin });
          stationsInUse.add(match.groupCode);
        });
      } else {
        unmatchedStations.add(stationText);
      }
    }

    if (storeCoords) {
      const distances = [];
      Object.entries(stationsByGroup).forEach(([groupCode, group]) => {
        const dist = haversineDistance(storeCoords[0], storeCoords[1], group.lat, group.lng);
        if (dist <= 1000) {
          distances.push({ groupCode, meters: Math.round(dist) });
          stationsInUse.add(groupCode);
        }
      });

      distances.sort((a, b) => a.meters - b.meters);
      const statedCodes = new Set(stated.map(s => s.groupCode));
      nearby.push(...distances.filter(d => !statedCodes.has(d.groupCode)).slice(0, 3));
    }

    if (stated.length > 0 || nearby.length > 0) {
      storeStations[storeId] = { stated, nearby };
    }
  });

  // 駅を県別に分類（既存の prefsByCode から推定）
  console.log("\n駅に県コードを割り当て中...");
  let noPrefCount = 0;

  stationsInUse.forEach(groupCode => {
    const group = stationsByGroup[groupCode];

    // 都道府県は assign-pref.mjs が国土地理院の逆ジオコーダで付ける（座標の範囲から推測しない）
    group.pref = null;

    if (!group.pref) {
      noPrefCount++;
    }
  });

  console.log("県が未決定の駅:", noPrefCount);

  // 駅マスター（旧形式）を作る
  const stationsForOutput = {};
  const groupCodeToId = {};
  let stationIndex = 1;

  [...stationsInUse].sort().forEach(groupCode => {
    const group = stationsByGroup[groupCode];
    const stationId = "st" + String(stationIndex).padStart(4, "0");

    stationsForOutput[stationId] = {
      id: stationId,
      name: group.name,
      pref: group.pref || null,
      muniCd: group.muniCd || null,
      cityName: group.cityName || null,
      lat: Math.round(group.lat * 100000) / 100000,
      lng: Math.round(group.lng * 100000) / 100000,
      lines: Object.entries(group.lines).map(([line, operator]) => ({ line, operator })),
    };

    groupCodeToId[groupCode] = stationId;
    stationIndex++;
  });

  // クラスタ化
  console.log("\n駅クラスタを構築中（中心駅から300m以内）...");
  const clusters = clusterStations(stationsForOutput);
  const { clustersForOutput, clusterIdMap } = buildClusterOutput(clusters, stationsForOutput, prefsByCode);

  console.log("クラスタ数（元の駅グループ " + stationsInUse.size + "→クラスタ " + clusters.length + "）");

  // storeStations を clusterId で再マップ
  Object.entries(storeStations).forEach(([storeId, entry]) => {
    entry.stated = entry.stated.map(s => {
      const stationId = groupCodeToId[s.groupCode];
      return {
        clusterId: clusterIdMap[stationId],
        walkMin: s.walkMin,
      };
    });
    entry.nearby = entry.nearby.map(n => {
      const stationId = groupCodeToId[n.groupCode];
      return {
        clusterId: clusterIdMap[stationId],
        meters: n.meters,
      };
    });

    const statedClusterIds = new Set(entry.stated.map(s => s.clusterId));
    entry.nearby = entry.nearby.filter(n => !statedClusterIds.has(n.clusterId));
  });

  // 統計
  console.log("\n========== 統計情報 ==========");

  const noPrefClustersCount = Object.values(clustersForOutput).filter(c => !c.pref).length;
  console.log("pref null のクラスタ数:", noPrefClustersCount);

  const clusterNameCount = {};
  Object.values(clustersForOutput).forEach(c => {
    clusterNameCount[c.slug] = (clusterNameCount[c.slug] || 0) + 1;
  });
  const slugConflicts = Object.entries(clusterNameCount).filter(([_, count]) => count > 1);
  console.log("slug が衝突するクラスタ:", slugConflicts.length);

  const storesWithStations = Object.keys(storeStations).length;
  const storesWithStated = Object.values(storeStations).filter(e => e.stated && e.stated.length > 0).length;
  const storesWithNearby = Object.values(storeStations).filter(e => e.nearby && e.nearby.length > 0).length;
  const storesWithBoth = Object.values(storeStations).filter(
    e => e.stated && e.stated.length > 0 && e.nearby && e.nearby.length > 0
  ).length;

  console.log("\n店舗マッチング:");
  console.log("  文字で結べた店:", storesWithStated);
  console.log("  距離で結べた店（文字なし）:", storesWithNearby - storesWithBoth);
  console.log("  両方で結べた店:", storesWithBoth);
  console.log("  どちらも無い店:", restaurants.length - storesWithStations);

  // 店3件以上のクラスタ
  const clusterStoreCount = {};
  Object.entries(storeStations).forEach(([storeId, entry]) => {
    if (entry.stated) {
      entry.stated.forEach(s => {
        clusterStoreCount[s.clusterId] = (clusterStoreCount[s.clusterId] || 0) + 1;
      });
    }
    if (entry.nearby) {
      entry.nearby.forEach(n => {
        if (!entry.stated || !entry.stated.some(s => s.clusterId === n.clusterId)) {
          clusterStoreCount[n.clusterId] = (clusterStoreCount[n.clusterId] || 0) + 1;
        }
      });
    }
  });

  const topClusters = Object.entries(clusterStoreCount)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log("\n店3件以上のクラスタ（上位15）:");
  topClusters.forEach(([clusterId, count]) => {
    const cluster = clustersForOutput[clusterId];
    const aliasStr = cluster.aliases.length > 0 ? " (別名: " + cluster.aliases.join("/") + ")" : "";
    console.log("  - " + cluster.name + aliasStr + ": " + count + "店");
  });

  // stated の駅が店から 3km 超の件数
  const statedOver3km = [];
  Object.entries(storeStations).forEach(([storeId, entry]) => {
    const storeCoords = geo[storeId];
    if (!storeCoords || !entry.stated) return;

    entry.stated.forEach(s => {
      const cluster = clustersForOutput[s.clusterId];
      const dist = haversineDistance(storeCoords[0], storeCoords[1], cluster.lat, cluster.lng);
      if (dist > 3000) {
        statedOver3km.push({
          storeId,
          clusterName: cluster.name,
          distance: Math.round(dist),
        });
      }
    });
  });
  console.log("\nstated の駅が店から 3km 超の件数:", statedOver3km.length, "(0が正常)");

  console.log("\n照合できなかった station 文字（件数: " + unmatchedStations.size + "）");
  const unmatchedArray = [...unmatchedStations].sort().slice(0, 5);
  console.log("  例（最初の5件）:");
  unmatchedArray.forEach(s => console.log("    - " + s));

  // 出力
  console.log("\n出力ファイルを生成中...");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "stations.json"),
    JSON.stringify(clustersForOutput, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "storeStations.json"),
    JSON.stringify(storeStations, null, 2)
  );

  const indexTs = `/**
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
  const entry = storeStations[storeId as keyof typeof storeStations];
  if (!entry) return [];

  const result: any[] = [];
  if (entry.stated) {
    entry.stated.forEach(s => {
      const station = stations[s.clusterId as keyof typeof stations];
      if (station) {
        result.push({
          ...station,
          type: 'stated' as const,
          walkMin: s.walkMin,
        });
      }
    });
  }
  if (entry.nearby) {
    entry.nearby.forEach(n => {
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
    if (st.aliases.includes(name)) {
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
`;

  // lib/stations/index.ts は手で保守するコード（型の明示・駅ページ用の関数）なので上書きしない（2026-10-03）

  console.log("✅ 出力完了:");
  console.log("  - " + OUTPUT_DIR + "/stations.json");
  console.log("  - " + OUTPUT_DIR + "/storeStations.json");


  fs.writeFileSync(
    path.join(__dirname, "unmatched.json"),
    JSON.stringify([...unmatchedStations].sort(), null, 2)
  );
  console.log("  - ./unmatched.json（照合できなかった station 文字、" + unmatchedStations.size + "件）");
}

main().catch(console.error);

// slug 衝突修正を追加で実装（buildClusterOutput内）
