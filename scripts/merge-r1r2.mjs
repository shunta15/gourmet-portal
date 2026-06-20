#!/usr/bin/env node
// round1(厳格)を優先し、round1で-1だったspotのみround2(緩和)の採用で補完。
// 結合した {verdicts:[{id,picks}]} を出力（finalize-images8 にそのまま渡せる）。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const R2OUT = process.argv[2];
const r1 = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-verdicts-r1.json'), 'utf-8'));
const r2raw = JSON.parse(readFileSync(R2OUT, 'utf-8'));
const r2 = (r2raw.result || r2raw).verdicts || [];
const r1map = Object.fromEntries(r1.map((v) => [v.id, v]));
const r2map = Object.fromEntries(r2.map((v) => [v.id, v]));

let filled = 0, kept = 0;
const ids = new Set([...r1.map((v) => v.id), ...r2.map((v) => v.id)]);
const combined = [];
for (const id of ids) {
  const p1 = r1map[id]?.picks || [];
  const p2 = r2map[id]?.picks || [];
  const p2byspot = Object.fromEntries(p2.map((p) => [p.spot, p]));
  const p1byspot = Object.fromEntries(p1.map((p) => [p.spot, p]));
  const spots = new Set([...p1.map((p) => p.spot), ...p2.map((p) => p.spot)]);
  const picks = [];
  for (const s of [...spots].sort((a, b) => a - b)) {
    const a = p1byspot[s]; const b = p2byspot[s];
    if (a && a.chosen >= 0) { picks.push(a); kept++; }
    else if (b && b.chosen >= 0) { picks.push({ spot: s, chosen: b.chosen, reason: '[r2] ' + b.reason }); filled++; }
    else picks.push(a || b || { spot: s, chosen: -1, reason: 'none' });
  }
  combined.push({ id, picks });
}
writeFileSync(join(ROOT, 'automation', 'p2-verdicts-combined.json'), JSON.stringify({ verdicts: combined }));
console.log(`結合: round1維持 ${kept}スポット / round2補完 ${filled}スポット`);
