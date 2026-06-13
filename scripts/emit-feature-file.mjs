#!/usr/bin/env node
/**
 * emit-feature-file.mjs
 *
 * resolve-commons-images.mjs が出力した解決済みJSONから、
 * lib/newGuideFeatures7.ts（Feature[] と Record<string,FeatureArticle>）を生成する。
 *
 * - 画像が全て解決済み（hero + 5spot 全て imageUrl あり）の記事だけを出力対象にする。
 *   1枚でも未解決の記事は published せず、incomplete として報告（手当て後に再実行）。
 * - 文字列は JSON.stringify で安全にエスケープ（日本語・引用符・<br> もそのまま）。
 *
 * 使い方: node scripts/emit-feature-file.mjs [入力resolved.json] [出力.ts] [date]
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IN = process.argv[2] || join(ROOT, 'automation', 'new-articles-resolved.json');
const OUT = process.argv[3] || join(ROOT, 'lib', 'newGuideFeatures7.ts');
const DATE = process.argv[4] || '2026-06-13';
const AUTHOR = 'マチノワ編集部';

const data = JSON.parse(readFileSync(IN, 'utf-8'));
const all = data.articles || data;

const isReady = (a) => a.heroImageUrl && Array.isArray(a.spots) && a.spots.length === 5 && a.spots.every((s) => s.imageUrl);
const ready = all.filter(isReady);
const incomplete = all.filter((a) => !isReady(a));

// sideArticles: 同リージョン優先で2本（無ければ他リージョンのready）
function pickSides(art) {
  const others = ready.filter((x) => x.id !== art.id);
  const sameRegion = others.filter((x) => x.region === art.region);
  const pool = [...sameRegion, ...others.filter((x) => x.region !== art.region)];
  return pool.slice(0, 2).map((x) => ({ t: x.title, h: `/feature/${x.id}`, img: x.heroImageUrl }));
}

const features = ready.map((a) => ({
  id: a.id, no: a.no, tag: a.tag, kicker: a.kicker, title: a.title, sub: a.subtitle, image: a.heroImageUrl,
}));

const articlesObj = {};
for (const a of ready) {
  articlesObj[a.id] = {
    id: a.id,
    no: a.no,
    articleType: 'guide',
    kicker: a.kicker,
    title: a.title,
    titleHTML: a.titleHTML,
    subtitle: a.subtitle,
    lede: a.lede,
    date: DATE,
    reading: a.reading,
    author: AUTHOR,
    heroImage: a.heroImageUrl,
    ranking: a.spots.map((s, i) => ({
      rank: `SPOT ${String(i + 1).padStart(2, '0')}`,
      rankNum: i + 1,
      name: s.name,
      cuisine: s.type,
      area: s.area,
      purpose: s.purpose,
      desc: s.desc,
      images: [s.imageUrl],
      specs: s.specs,
      transit: s.transit,
    })),
    sideArticles: pickSides(a),
    quote: a.quote,
    quoteCite: AUTHOR,
    closing: a.closing,
  };
}

const header = `import type { Feature, FeatureArticle } from "./data";

// ═══════════════════════════════════════════════════════
// 街ガイド特集 第7弾（30本・全国エリア拡張）— 自動生成
//   生成: scripts/emit-feature-file.mjs
//   画像: Wikimedia Commons を Commons API で実URL解決・HTTP200確認済み
//   事実: 各スポットを WebSearch で検証（営業・正式名称・エリア・最寄り駅）
//   ※ 料金・営業時間など変動情報は本文内で「公式確認」を明記
// ═══════════════════════════════════════════════════════

`;

const body =
  `// ─── 一覧カード（FEATURES にスプレッド＝検索インデックス対象）───\n` +
  `export const NEWGUIDE7_FEATURES: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
  `// ─── 記事本体（FEATURE_ARTICLES にスプレッド）───\n` +
  `export const NEWGUIDE7_FEATURE_ARTICLES: Record<string, FeatureArticle> = ${JSON.stringify(articlesObj, null, 2)};\n`;

writeFileSync(OUT, header + body, 'utf-8');

console.log(`=== TS生成完了 ===`);
console.log(`出力: ${OUT}`);
console.log(`公開対象(画像完備): ${ready.length}本`);
console.log(`  ${ready.map((a) => a.id).join(', ')}`);
if (incomplete.length) {
  console.log(`\n⚠ 画像未完備で除外: ${incomplete.length}本（手当て後に再実行）`);
  for (const a of incomplete) {
    const miss = (a.spots || []).filter((s) => !s.imageUrl).map((s) => s.name);
    console.log(`  - ${a.id}: 未解決[${miss.join(' / ') || (a.heroImageUrl ? '' : 'hero')}]`);
  }
}
