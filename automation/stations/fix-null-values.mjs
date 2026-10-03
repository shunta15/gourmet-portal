#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT_DIR = "/Users/shunta/claude/gp-portal";
const OUTPUT_DIR = path.join(ROOT_DIR, "lib/stations");
const storeStationsFile = path.join(OUTPUT_DIR, "storeStations.json");

console.log("null 値を修正します...\n");

const storeStations = JSON.parse(fs.readFileSync(storeStationsFile, "utf-8"));

let nullCount = 0;

Object.values(storeStations).forEach(entry => {
  if (entry.stated) {
    entry.stated = entry.stated.map(s => {
      if (s.walkMin === null) {
        nullCount++;
        const { walkMin, ...rest } = s;
        return rest;
      }
      return s;
    });
  }
});

console.log("削除した null 値:", nullCount);
console.log("✅ storeStations.json を更新しました");

fs.writeFileSync(storeStationsFile, JSON.stringify(storeStations, null, 2));
