#!/usr/bin/env node
// round1判定 + round2再照合判定 を spot単位で統合（採用>=0が取れた方を優先）。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const R2OUT = process.argv[2];
const r1 = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-verdicts-r1.json'), 'utf-8'));
const parsed = JSON.parse(readFileSync(R2OUT, 'utf-8'));
const r2 = (parsed.result || parsed).verdicts || [];
const r2map = Object.fromEntries(r2.map((v) => [v.id, Object.fromEntries((v.picks || []).map((p) => [p.spot, p]))]));

const combined = r1.map((a) => {
  const r2spots = r2map[a.id];
  const picks = (a.picks || []).map((p) => {
    if (r2spots && r2spots[p.spot] && r2spots[p.spot].chosen >= 0) return r2spots[p.spot]; // round2で採用が取れたら優先
    return p; // それ以外はround1維持（採用済みは後退させない）
  });
  return { id: a.id, picks };
});
writeFileSync(join(ROOT, 'automation', 'batch8-verdicts.json'), JSON.stringify({ verdicts: combined }, null, 2));
let picked = 0, rej = 0;
for (const a of combined) for (const p of a.picks) (p.chosen >= 0 ? picked++ : rej++);
console.log(`統合判定: 採用 ${picked} / 却下 ${rej}`);
console.log('出力: automation/batch8-verdicts.json');
