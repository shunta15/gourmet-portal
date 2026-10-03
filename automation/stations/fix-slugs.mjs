#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT_DIR = "/Users/shunta/claude/gp-portal";
const OUTPUT_DIR = path.join(ROOT_DIR, "lib/stations");
const stationsFile = path.join(OUTPUT_DIR, "stations.json");

console.log("slug 衝突を修正します...\n");

const stations = JSON.parse(fs.readFileSync(stationsFile, "utf-8"));

// slug の重複をチェック
const slugCount = {};
Object.entries(stations).forEach(([clusterId, cluster]) => {
  slugCount[cluster.slug] = (slugCount[cluster.slug] || []).concat(clusterId);
});

const conflicts = Object.entries(slugCount).filter(([_, ids]) => ids.length > 1);

console.log("slug 衝突数:", conflicts.length);
console.log("修正前:");
conflicts.forEach(([slug, clusterIds]) => {
  console.log("  " + slug + ": " + clusterIds.length + "個");
});

// 衝突を修正
conflicts.forEach(([slug, clusterIds]) => {
  clusterIds.forEach((clusterId, index) => {
    const cluster = stations[clusterId];

    if (index > 0) {
      // 2番目以降は市区町村名を追加
      if (cluster.cityName) {
        cluster.slug = (cluster.pref ? cluster.pref + "/" : "unknown/") + cluster.name + "-" + cluster.cityName;
      } else if (cluster.muniCd) {
        cluster.slug = (cluster.pref ? cluster.pref + "/" : "unknown/") + cluster.name + "-" + cluster.muniCd;
      } else {
        // muniCd も無い場合はクラスタID を使用
        cluster.slug = (cluster.pref ? cluster.pref + "/" : "unknown/") + cluster.name + "-" + clusterId;
      }
    }
  });
});

// 修正後の状態を確認
const newSlugCount = {};
Object.values(stations).forEach(cluster => {
  newSlugCount[cluster.slug] = (newSlugCount[cluster.slug] || 0) + 1;
});

const newConflicts = Object.entries(newSlugCount).filter(([_, count]) => count > 1);
console.log("\n修正後:");
if (newConflicts.length === 0) {
  console.log("  ✅ slug 衝突なし");
} else {
  console.log("  ❌ 残存する衝突:");
  newConflicts.forEach(([slug, count]) => {
    console.log("    " + slug + ": " + count + "個");
  });
}

// 保存
fs.writeFileSync(stationsFile, JSON.stringify(stations, null, 2));
console.log("\n✅ stations.json を更新しました");
