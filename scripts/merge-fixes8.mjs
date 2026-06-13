#!/usr/bin/env node
// batch8 修正WF出力(.result.corrected)を batch8-raw.json にマージ → batch8-merged.json
// テキスト＋imageSubject/imageRegion を上書き（spotsは番号で突合・件数/順番不変）。画像URLはまだ無い。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXOUT = process.argv[2];
const raw = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-raw.json'), 'utf-8'));
const articles = raw.articles;
const parsed = JSON.parse(readFileSync(FIXOUT, 'utf-8'));
const corrected = (parsed.result || parsed).corrected || [];
const cmap = Object.fromEntries(corrected.map((c) => [c.id, c]));

const TF = ['titleHTML', 'subtitle', 'lede', 'quote', 'closing', 'heroSpotIndex'];
const SF = ['name', 'type', 'area', 'transit', 'purpose', 'desc', 'specs', 'imageSubject', 'imageRegion'];
let merged = 0, warn = 0;
for (const a of articles) {
  const c = cmap[a.id]; if (!c) continue;
  for (const f of TF) if (c[f] !== undefined) a[f] = c[f];
  if (Array.isArray(c.spots)) {
    if (c.spots.length !== a.spots.length) { console.warn(`⚠ ${a.id}: spots数不一致 元${a.spots.length}/修正${c.spots.length}`); warn++; }
    const n = Math.min(c.spots.length, a.spots.length);
    for (let i = 0; i < n; i++) for (const f of SF) if (c.spots[i][f] !== undefined) a.spots[i][f] = c.spots[i][f];
  }
  merged++;
}
writeFileSync(join(ROOT, 'automation', 'batch8-merged.json'), JSON.stringify({ articles }, null, 2));
console.log(`マージ ${merged}本反映 / 対象外(クリーン) ${articles.length - merged}本 / spots不一致 ${warn}`);
console.log('出力: automation/batch8-merged.json');
