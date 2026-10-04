#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../.."); // リポジトリのルート（worktree でも main でも動くよう、スクリプトの位置から求める）
const OUTPUT_DIR = path.join(ROOT_DIR, "lib/stations");

const stationsFile = path.join(OUTPUT_DIR, "stations.json");
const storeStationsFile = path.join(OUTPUT_DIR, "storeStations.json");

console.log("QA検査を実行します...\n");

// stations.json を読み込む
const stations = JSON.parse(fs.readFileSync(stationsFile, "utf-8"));
console.log("クラスタ数:", Object.keys(stations).length);

// pref null の数
const noPrefCount = Object.values(stations).filter(s => !s.pref).length;
console.log("pref null のクラスタ数:", noPrefCount);

// slug 重複
const slugCount = {};
Object.values(stations).forEach(s => {
  slugCount[s.slug] = (slugCount[s.slug] || 0) + 1;
});
const slugDuplicates = Object.entries(slugCount).filter(([_, count]) => count > 1);
console.log("slug が衝突するクラスタ:", slugDuplicates.length);
if (slugDuplicates.length > 0) {
  slugDuplicates.forEach(([slug, count]) => {
    console.log("  ❌ " + slug + ": " + count + "個");
  });
}

// storeStations.json を読み込む
const storeStations = JSON.parse(fs.readFileSync(storeStationsFile, "utf-8"));

// GEO を読み込む
const GEO_FILE = path.join(ROOT_DIR, "lib/geo.ts");
const content = fs.readFileSync(GEO_FILE, "utf-8");
const geo = {};
const geoMatch = content.matchAll(/"([a-z0-9]+)":\s*\{\s*"lat":\s*([\d.-]+),\s*"lng":\s*([\d.-]+)/g);
[...geoMatch].forEach(m => {
  geo[m[1]] = [parseFloat(m[2]), parseFloat(m[3])];
});

// stated の駅が店から 3km 超の件数
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

const statedOver3km = [];
Object.entries(storeStations).forEach(([storeId, entry]) => {
  const storeCoords = geo[storeId];
  if (!storeCoords || !entry.stated) return;

  entry.stated.forEach(s => {
    const cluster = stations[s.clusterId];
    if (!cluster) {
      console.warn("警告: クラスタが見つかりません:", s.clusterId);
      return;
    }
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

console.log("stated の駅が店から 3km 超の件数:", statedOver3km.length, "(0が正常)");
if (statedOver3km.length > 0) {
  console.log("  ⚠️  例（最初の5件）:");
  statedOver3km.slice(0, 5).forEach(item => {
    console.log("    " + item.storeId + " → " + item.clusterName + " (" + item.distance + "m)");
  });
}

console.log("\n✅ QA検査完了");
