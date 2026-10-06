#!/usr/bin/env node
/**
 * 「地図で探す」のデフォルメ日本地図（lib/portal/mapRegions.ts の CELLS）の検査。サーバー不要。
 * 実行: node proto-portal/check-map-grid.mjs
 *
 * - 47 県がすべてあり、マスが重ならず、盤（10 列 × 11 行）の中に収まる
 * - 各地方のマスが 1 つの塊（上下左右でつながる）になっている
 * - 実際の県境で接している 86 組のうち、マスでも隣り合う組の数（概念図なので全部は保てない）を数える
 * 地方の区分は lib/areas/prefectures.ts の block から読む（mapRegions.ts と同じ）。
 */
import fs from "node:fs";

const src = fs.readFileSync(new URL("../lib/portal/mapRegions.ts", import.meta.url), "utf8");
const prefSrc = fs.readFileSync(new URL("../lib/areas/prefectures.ts", import.meta.url), "utf8");
const grid = src.match(/MAP_GRID = \{ cols: (\d+), rows: (\d+) \}/);
const COLS = Number(grid[1]);
const ROWS = Number(grid[2]);
const block = src.slice(src.indexOf("export const CELLS"));
const CELLS = {};
for (const m of block.matchAll(/(\w+): \[(\d+), (\d+)(?:, (\d+), (\d+))?\]/g)) CELLS[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4] ?? 1), Number(m[5] ?? 1)];
const REGION = {};
for (const m of prefSrc.matchAll(/slug: '([\w-]+)', block: '([^']+)'/g)) REGION[m[1]] = m[2];
// 実際の県境（陸で接している組）
const ADJ = `aomori-iwate aomori-akita iwate-akita iwate-miyagi akita-miyagi akita-yamagata miyagi-yamagata miyagi-fukushima yamagata-fukushima yamagata-niigata fukushima-niigata fukushima-gunma fukushima-tochigi fukushima-ibaraki ibaraki-tochigi ibaraki-saitama ibaraki-chiba tochigi-gunma tochigi-saitama gunma-niigata gunma-nagano gunma-saitama saitama-chiba saitama-tokyo saitama-yamanashi saitama-nagano chiba-tokyo tokyo-kanagawa tokyo-yamanashi kanagawa-yamanashi kanagawa-shizuoka niigata-nagano niigata-toyama toyama-nagano toyama-gifu toyama-ishikawa ishikawa-gifu ishikawa-fukui fukui-gifu fukui-shiga fukui-kyoto yamanashi-shizuoka yamanashi-nagano nagano-shizuoka nagano-aichi nagano-gifu gifu-shiga gifu-mie gifu-aichi shizuoka-aichi aichi-mie mie-shiga mie-kyoto mie-nara mie-wakayama shiga-kyoto kyoto-nara kyoto-osaka kyoto-hyogo osaka-hyogo osaka-nara osaka-wakayama nara-wakayama hyogo-tottori hyogo-okayama tottori-okayama tottori-hiroshima tottori-shimane shimane-hiroshima shimane-yamaguchi okayama-hiroshima hiroshima-yamaguchi tokushima-kagawa tokushima-ehime tokushima-kochi kagawa-ehime ehime-kochi fukuoka-saga fukuoka-kumamoto fukuoka-oita saga-nagasaki oita-kumamoto oita-miyazaki kumamoto-miyazaki kumamoto-kagoshima miyazaki-kagoshima`
  .split(" ")
  .map((s) => s.split("-"));

let ng = 0;
const check = (c, m) => {
  console.log(`${c ? "OK " : "NG "} ${m}`);
  if (!c) ng++;
};
const slugs = Object.keys(REGION);
check(slugs.length === 47, `県 47（prefectures.ts: ${slugs.length}）`);
check(slugs.every((s) => CELLS[s]) && Object.keys(CELLS).length === 47, `CELLS に 47 県がそろい、余分がない（${Object.keys(CELLS).length}）`);
const occ = new Map();
let dup = 0;
let out = 0;
const cellsOf = (s) => {
  const [x, y, w, h] = CELLS[s];
  const r = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) r.push([x + i, y + j]);
  return r;
};
for (const s of Object.keys(CELLS))
  for (const [x, y] of cellsOf(s)) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) out++;
    const k = `${x},${y}`;
    if (occ.has(k)) dup++;
    occ.set(k, s);
  }
check(dup === 0, `マスが重ならない（重複 ${dup}）`);
check(out === 0, `盤（${COLS} × ${ROWS}）の中に収まる（はみ出し ${out}）`);
const byR = {};
for (const s of slugs) (byR[REGION[s]] ??= []).push(s);
for (const [r, list] of Object.entries(byR)) {
  const set = new Set(list.flatMap((s) => cellsOf(s).map(([x, y]) => `${x},${y}`)));
  const seen = new Set();
  let comps = 0;
  for (const k of set) {
    if (seen.has(k)) continue;
    comps++;
    const st = [k];
    seen.add(k);
    while (st.length) {
      const [x, y] = st.pop().split(",").map(Number);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const kk = `${x + dx},${y + dy}`;
        if (set.has(kk) && !seen.has(kk)) {
          seen.add(kk);
          st.push(kk);
        }
      }
    }
  }
  check(comps === 1, `${r}: マスが 1 つの塊（${set.size} マス）`);
}
const adj = (a, b) => cellsOf(a).some(([x, y]) => cellsOf(b).some(([u, v]) => Math.abs(x - u) + Math.abs(y - v) === 1));
const kept = ADJ.filter(([a, b]) => adj(a, b)).length;
console.log(`情報: 実際の県境 ${ADJ.length} 組のうち、マスでも隣り合う ${kept} 組`);
console.log(ng ? `\n不合格 ${ng}` : "\n合格");
process.exit(ng ? 1 : 0);
