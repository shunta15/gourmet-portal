#!/usr/bin/env node
/**
 * trim-unresolved8.mjs ── 画像が検証採用できなかったスポットを記事から外す。
 * 正しい場所の実画像が無いスポットは、誤った写真を当てず削除する（精度最優先）。
 * 出力: batch8-trimmed.json（spotsから未採用を除去・heroSpotIndex補正）
 *       + 影響記事の本文整形用 automation/trim8/<id>.json（lede/closing/subtitle/quote + 削除spot名 + 新spot名）
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TDIR = join(ROOT, 'automation', 'trim8');
mkdirSync(TDIR, { recursive: true });
const data = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-resolved.json'), 'utf-8'));
const articles = data.articles;
const affectedIds = [];
for (const a of articles) {
  const removed = a.spots.filter((s) => !s.imageUrl);
  if (!removed.length) continue;
  const heroSpot = a.spots[a.heroSpotIndex];
  const kept = a.spots.filter((s) => s.imageUrl);
  a.spots = kept;
  // heroSpotIndex 再設定
  const hi = kept.indexOf(heroSpot);
  a.heroSpotIndex = hi >= 0 ? hi : 0;
  a.heroImageUrl = kept[a.heroSpotIndex]?.imageUrl || kept[0]?.imageUrl || null;
  writeFileSync(join(TDIR, `${a.id}.json`), JSON.stringify({
    id: a.id, articleType: a.articleType,
    removedSpotNames: removed.map((s) => s.name),
    keptSpotNames: kept.map((s) => s.name),
    keptCount: kept.length,
    subtitle: a.subtitle, lede: a.lede, quote: a.quote, closing: a.closing,
  }, null, 2));
  affectedIds.push(a.id);
}
writeFileSync(join(ROOT, 'automation', 'batch8-trimmed.json'), JSON.stringify({ articles }, null, 2));
writeFileSync(join(TDIR, '_ids.json'), JSON.stringify(affectedIds));
console.log(`トリム対象 ${affectedIds.length}本`);
for (const a of articles) { const c = a.spots.length; }
const tooFew = articles.filter((a) => a.spots.length < 3).map((a) => `${a.id}(${a.spots.length})`);
console.log(`削除後スポット数<3 の記事: ${tooFew.length ? tooFew.join(', ') : 'なし'}`);
console.log(`影響記事:`, affectedIds.join(', '));
const dist = {};
for (const a of articles) dist[a.spots.length] = (dist[a.spots.length] || 0) + 1;
console.log('スポット数分布(トリム後):', JSON.stringify(dist));
