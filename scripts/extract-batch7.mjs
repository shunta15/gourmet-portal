#!/usr/bin/env node
// newGuideFeatures7.ts を解析し、脱テンプレ改修用の入力ファイルを作る。
// 画像・スポットは触らない。タイトル/lede/closing/quote/subtitle/articleType だけ作り直す対象。
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'lib', 'newGuideFeatures7.ts');
const DIR = join(ROOT, 'automation', 'detmpl7');
mkdirSync(DIR, { recursive: true });

const txt = readFileSync(SRC, 'utf-8');
const featM = txt.match(/NEWGUIDE7_FEATURES:\s*Feature\[\]\s*=\s*(\[[\s\S]*?\n\]);/);
const artM = txt.match(/NEWGUIDE7_FEATURE_ARTICLES:\s*Record<string,\s*FeatureArticle>\s*=\s*(\{[\s\S]*\n\});/);
if (!featM || !artM) { console.error('解析失敗'); process.exit(1); }
const features = JSON.parse(featM[1]);
const articles = JSON.parse(artM[1]);
writeFileSync(join(ROOT, 'automation', 'batch7-parsed.json'), JSON.stringify({ features, articles }, null, 2));

const tagById = Object.fromEntries(features.map((f) => [f.id, f.tag]));
// ペルソナ配分（多様化）: C多め＋A/D/Bを散らす
const ROT = ['C', 'A', 'C', 'D', 'B', 'C', 'A', 'D', 'C', 'B'];
const ids = Object.keys(articles);
ids.forEach((id, i) => {
  const a = articles[id];
  const persona = ROT[i % ROT.length];
  writeFileSync(join(DIR, `${id}.json`), JSON.stringify({
    id, persona, tag: tagById[id] || '',
    currentTitle: a.title, currentSubtitle: a.subtitle, currentLede: a.lede,
    currentQuote: a.quote, currentClosing: a.closing,
    spots: (a.ranking || []).map((r) => ({ name: r.name, area: r.area, purpose: r.purpose })),
  }, null, 2));
});
writeFileSync(join(DIR, '_ids.json'), JSON.stringify(ids));
console.log(`第7弾 ${ids.length}本を解析・改修入力を作成`);
const dist = {};
ids.forEach((id, i) => { const p = ROT[i % ROT.length]; dist[p] = (dist[p] || 0) + 1; });
console.log('ペルソナ配分:', JSON.stringify(dist));
