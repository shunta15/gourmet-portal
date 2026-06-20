#!/usr/bin/env node
// 脱テンプレ改修の結果を newGuideFeatures7.ts に反映して再emit。
// スポット(ranking)・画像・sideArticles・heroImage・no/kicker/date等は保持。
// 差し替えるのは title/titleHTML/subtitle/lede/quote/closing/articleType と FEATURESカードの title/sub のみ。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WFOUT = process.argv[2];
const parsed = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch7-parsed.json'), 'utf-8'));
const { features, articles } = parsed;
const wf = JSON.parse(readFileSync(WFOUT, 'utf-8'));
const rewritten = (wf.result || wf).rewritten || [];
const rmap = Object.fromEntries(rewritten.map((r) => [r.id, r]));
const strip = (s) => typeof s === 'string' ? s.replace(/\s*(署名[：:／\/]?\s*)?マチノワ編集部[。.]?\s*$/, '').trim() : s;

let n = 0;
for (const id of Object.keys(articles)) {
  const r = rmap[id]; if (!r) continue;
  const a = articles[id];
  a.title = strip(r.title); a.titleHTML = r.titleHTML; a.subtitle = strip(r.subtitle);
  a.lede = strip(r.lede); a.quote = strip(r.quote); a.closing = strip(r.closing);
  if (r.articleType) a.articleType = r.articleType;
  const card = features.find((f) => f.id === id);
  if (card) { card.title = a.title; card.sub = a.subtitle; }
  n++;
}

const header = `import type { Feature, FeatureArticle } from "./data";

// ═══════════════════════════════════════════════════════
// 街ガイド特集 第7弾（30本・全国エリア拡張）— 自動生成
//   画像: Wikimedia Commons（HTTP200確認済み）／スポットは変更なし
//   2026-06-20 脱テンプレ改修: タイトル/lede/closing/文体/articleType を
//   4ペルソナで多様化（「5選」「対象は/標準動線/向くコースだ」の定型を撤去）
// ═══════════════════════════════════════════════════════

`;
const body =
  `export const NEWGUIDE7_FEATURES: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
  `export const NEWGUIDE7_FEATURE_ARTICLES: Record<string, FeatureArticle> = ${JSON.stringify(articles, null, 2)};\n`;
writeFileSync(join(ROOT, 'lib', 'newGuideFeatures7.ts'), header + body, 'utf-8');
console.log(`第7弾 ${n}本を脱テンプレ反映 → lib/newGuideFeatures7.ts 再生成`);
const dist = {};
for (const id of Object.keys(articles)) dist[articles[id].articleType] = (dist[articles[id].articleType] || 0) + 1;
console.log('articleType分布(改修後):', JSON.stringify(dist));
const five = Object.values(articles).filter((a) => /5選/.test(a.title)).length;
console.log('「5選」タイトル残存:', five);
