#!/usr/bin/env node
/**
 * merge-fixes.mjs
 *
 * 修正ワークフロー（machinowa-fix-flagged）の出力から corrected[] を取り出し、
 * new-articles-raw.json（全30本・画像メタ付き）にマージする。
 *
 * - テキスト系フィールド（titleHTML/subtitle/reading/heroSpotIndex/lede/quote/closing）は修正版で上書き
 * - spots はインデックスで突き合わせ、テキスト（name/type/area/purpose/desc/transit/specs）は修正版、
 *   imageFile/imageQuery は元データを温存（画像は番号で結合するので名称修正に強い）
 * - 修正対象外の記事（監査OK）はそのまま
 *
 * 使い方: node scripts/merge-fixes.mjs <fix-workflow-output-file> [出力]
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXOUT = process.argv[2];
const OUT = process.argv[3] || join(ROOT, 'automation', 'new-articles-merged.json');
if (!FIXOUT) { console.error('usage: node merge-fixes.mjs <fix-output-file> [out]'); process.exit(1); }

const raw = JSON.parse(readFileSync(join(ROOT, 'automation', 'new-articles-raw.json'), 'utf-8'));
const articles = raw.articles;

const parsed = JSON.parse(readFileSync(FIXOUT, 'utf-8'));
const fixData = parsed.result || parsed;
const corrected = fixData.corrected || [];
const cmap = Object.fromEntries(corrected.map((c) => [c.id, c]));

const TEXT_FIELDS = ['titleHTML', 'subtitle', 'reading', 'heroSpotIndex', 'lede', 'quote', 'closing'];
const SPOT_TEXT = ['name', 'type', 'area', 'purpose', 'desc', 'transit', 'specs'];

let merged = 0, warned = 0;
for (const a of articles) {
  const c = cmap[a.id];
  if (!c) continue;
  for (const f of TEXT_FIELDS) if (c[f] !== undefined) a[f] = c[f];
  if (Array.isArray(c.spots)) {
    if (c.spots.length !== a.spots.length) {
      console.warn(`⚠ ${a.id}: spots数が不一致 (元${a.spots.length} / 修正${c.spots.length}) — 画像を保つため min で突合`);
      warned++;
    }
    const n = Math.min(c.spots.length, a.spots.length);
    for (let i = 0; i < n; i++) {
      for (const f of SPOT_TEXT) if (c.spots[i][f] !== undefined) a.spots[i][f] = c.spots[i][f];
      // imageFile / imageQuery は元のまま温存
    }
  }
  merged++;
}

writeFileSync(OUT, JSON.stringify({ articles }, null, 2), 'utf-8');
console.log(`=== マージ完了 ===`);
console.log(`修正反映: ${merged}本 / 修正対象外(監査OKそのまま): ${articles.length - merged}本`);
if (warned) console.log(`⚠ spots数不一致: ${warned}本（要確認）`);
console.log(`出力: ${OUT}`);
const requested = corrected.length;
const missing = articles.filter((a) => !cmap[a.id]).map((a) => a.id);
console.log(`修正版受領: ${requested}本`);
