#!/usr/bin/env node
// 旧7ファイルの index対象記事を脱テンプレ改修＋画像被写体抽出の入力にする。
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIR = join(ROOT, 'automation', 'detmpl61');
mkdirSync(DIR, { recursive: true });
const FILES = ['newGuideFeatures', 'newGuideFeatures2', 'newGuideFeatures4', 'newGuideFeatures5', 'newGuideFeatures6', 'newGuideFeaturesKansai', 'newGuideFeaturesChubu'];
const ROT = ['C', 'A', 'C', 'D', 'B', 'C', 'A', 'D', 'C', 'B'];
let n = 0; const ids = []; const fileOfId = {};
for (const f of FILES) {
  const d = JSON.parse(readFileSync(join(ROOT, 'automation', 'old', `${f}.json`), 'utf-8'));
  const idxIds = new Set(d.features.map((x) => x.id));
  const tagById = Object.fromEntries(d.features.map((x) => [x.id, x.tag]));
  for (const id of Object.keys(d.articles)) {
    if (!idxIds.has(id)) continue; // index対象のみ
    const a = d.articles[id];
    const persona = ROT[n % ROT.length];
    writeFileSync(join(DIR, `${id}.json`), JSON.stringify({
      id, file: f, persona, tag: tagById[id] || '',
      currentTitle: a.title, currentSubtitle: a.subtitle, currentLede: a.lede,
      currentQuote: a.quote, currentClosing: a.closing,
      spots: (a.ranking || []).map((r) => ({ name: r.name, area: r.area, descHead: (r.desc || '').slice(0, 90), currentImage: (r.images || [])[0] || '' })),
    }, null, 2));
    ids.push(id); fileOfId[id] = f; n++;
  }
}
writeFileSync(join(DIR, '_ids.json'), JSON.stringify(ids));
writeFileSync(join(DIR, '_fileOf.json'), JSON.stringify(fileOfId));
console.log(`改修入力 ${ids.length}本（index対象）`);
const dist = {}; ids.forEach((id, i) => { const p = ROT[i % ROT.length]; dist[p] = (dist[p] || 0) + 1; });
console.log('ペルソナ配分:', JSON.stringify(dist));
