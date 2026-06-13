#!/usr/bin/env node
// トリム整形WF出力を batch8-trimmed.json に反映 → batch8-final.json
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOUT = process.argv[2];
const data = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-trimmed.json'), 'utf-8'));
const articles = data.articles;
const parsed = JSON.parse(readFileSync(TOUT, 'utf-8'));
const trimmed = (parsed.result || parsed).trimmed || [];
const tmap = Object.fromEntries(trimmed.map((t) => [t.id, t]));
let n = 0;
for (const a of articles) {
  const t = tmap[a.id]; if (!t) continue;
  for (const f of ['subtitle', 'lede', 'quote', 'closing']) if (t[f]) a[f] = t[f];
  n++;
}
writeFileSync(join(ROOT, 'automation', 'batch8-final.json'), JSON.stringify({ articles }, null, 2));
console.log(`整形反映 ${n}本 → automation/batch8-final.json`);
