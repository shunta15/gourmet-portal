#!/usr/bin/env node
// 30件の試し用の行を sheet.json から選ぶ（URLの種類ごとの枠 × タブ。同じ種類・タブの中では等間隔で選ぶ）。
// 出力: automation/vertical-stores/trial30.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { kindOf } from "./resolve.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sheet = JSON.parse(readFileSync(path.join(HERE, "sheet.json"), "utf8"));
const QUOTA = [
  ["share", "ビューティ", 5], ["share", "ボディケア", 6], ["share", "ペット", 1],
  ["search", "ビューティ", 4], ["search", "ボディケア", 3], ["search", "宿泊施設", 1],
  ["maps.app", "ビューティ", 1], ["maps.app", "ペット", 1], ["maps.app", "宿泊施設", 1],
  ["cid", "ビューティ", 1], ["cid", "ボディケア", 1],
  ["place", "ビューティ", 1], ["place", "ボディケア", 1],
  ["hotpepper", "ビューティ", 1], ["hotpepper", "ボディケア", 1],
  ["official", "ビューティ", 1],
];
const picks = [];
for (const [kind, tab, n] of QUOTA) {
  const rows = sheet[tab].filter((r) => kindOf(r.url) === kind);
  for (let i = 0; i < n; i++) {
    const r = rows[Math.floor(((i + 0.5) * rows.length) / n)];
    picks.push({ tab, row: r.row, urlKind: kind, name: r.name });
  }
}
writeFileSync(path.join(HERE, "trial30.json"), JSON.stringify(picks, null, 2) + "\n");
console.log(picks.length, "件");
const c = {};
for (const p of picks) c[p.tab] = (c[p.tab] || 0) + 1;
console.log(c);
