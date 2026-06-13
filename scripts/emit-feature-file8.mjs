#!/usr/bin/env node
/**
 * emit-feature-file8.mjs ── batch8（脱テンプレ・可変スポット数・per-article articleType）用エミッタ
 * 入力: automation/batch8-resolved.json（spots[].imageUrl + heroImageUrl, articleType, reading 済）
 * 出力: lib/newGuideFeatures8.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IN = process.argv[2] || join(ROOT, 'automation', 'batch8-resolved.json');
const OUT = process.argv[3] || join(ROOT, 'lib', 'newGuideFeatures8.ts');
const DATE = process.argv[4] || '2026-06-14';
const AUTHOR = 'マチノワ編集部';

const data = JSON.parse(readFileSync(IN, 'utf-8'));
const all = data.articles || data;
const isReady = (a) => a.heroImageUrl && Array.isArray(a.spots) && a.spots.length >= 3 && a.spots.every((s) => s.imageUrl);
const ready = all.filter(isReady);
const incomplete = all.filter((a) => !isReady(a));

function pickSides(art) {
  const others = ready.filter((x) => x.id !== art.id);
  const same = others.filter((x) => x.region === art.region);
  const pool = [...same, ...others.filter((x) => x.region !== art.region)];
  return pool.slice(0, 2).map((x) => ({ t: x.title, h: `/feature/${x.id}`, img: x.heroImageUrl }));
}

const features = ready.map((a) => ({ id: a.id, no: a.no, tag: a.tag, kicker: a.kicker, title: a.title, sub: a.subtitle, image: a.heroImageUrl }));
const articlesObj = {};
for (const a of ready) {
  articlesObj[a.id] = {
    id: a.id, no: a.no, articleType: a.articleType || 'guide', kicker: a.kicker,
    title: a.title, titleHTML: a.titleHTML, subtitle: a.subtitle, lede: a.lede,
    date: DATE, reading: a.reading, author: AUTHOR, heroImage: a.heroImageUrl,
    ranking: a.spots.map((s, i) => ({
      rank: `SPOT ${String(i + 1).padStart(2, '0')}`, rankNum: i + 1,
      name: s.name, cuisine: s.type, area: s.area, purpose: s.purpose, desc: s.desc,
      images: [s.imageUrl], specs: s.specs, transit: s.transit,
    })),
    sideArticles: pickSides(a), quote: a.quote, quoteCite: AUTHOR, closing: a.closing,
  };
}
const header = `import type { Feature, FeatureArticle } from "./data";

// ═══════════════════════════════════════════════════════
// 街ガイド特集 第8弾 — 自動生成（脱テンプレ・複数ペルソナ）
//   画像: Wikimedia Commons をビジョン照合（被写体・地域一致を確認）で採用・HTTP200確認済み
//   事実: 各スポットを WebSearch 検証＋監査＋個別校閲
// ═══════════════════════════════════════════════════════

`;
const body =
  `export const NEWGUIDE8_FEATURES: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
  `export const NEWGUIDE8_FEATURE_ARTICLES: Record<string, FeatureArticle> = ${JSON.stringify(articlesObj, null, 2)};\n`;
writeFileSync(OUT, header + body, 'utf-8');
console.log(`=== batch8 TS生成 ===`);
console.log(`公開対象(画像完備): ${ready.length}本`);
console.log(`  ${ready.map((a) => `${a.id}(${a.articleType})`).join(', ')}`);
if (incomplete.length) { console.log(`⚠ 画像未完備で除外: ${incomplete.length}本`); for (const a of incomplete) { const miss = (a.spots || []).filter((s) => !s.imageUrl).map((s) => s.name); console.log(`  - ${a.id}: ${a.heroImageUrl ? '' : 'hero無 '}${miss.join('/')}`); } }
