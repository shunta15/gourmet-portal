#!/usr/bin/env node
// ワークフローの出力ファイル（返り値JSON）から articles[] と flaggedSummary[] を取り出す。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = process.argv[2];
if (!SRC) { console.error('usage: node extract-workflow-output.mjs <output-file>'); process.exit(1); }

const raw = readFileSync(SRC, 'utf-8');
const parsed = JSON.parse(raw);
const data = parsed.result || parsed; // ワークフロー出力は .result 配下
const articles = data.articles || [];
const flagged = data.flaggedSummary || [];

writeFileSync(join(ROOT, 'automation', 'new-articles-raw.json'), JSON.stringify({ articles }, null, 2), 'utf-8');
writeFileSync(join(ROOT, 'automation', 'new-articles-flags.json'), JSON.stringify(flagged, null, 2), 'utf-8');

const flaggedIds = new Set(flagged.map((f) => f.id));
const cleanIds = articles.filter((a) => !flaggedIds.has(a.id)).map((a) => a.id);

console.log(`総数: ${articles.length} / 監査OK: ${cleanIds.length} / 要修正: ${flagged.length}`);
console.log(`\n[監査OK] ${cleanIds.join(', ')}`);
console.log(`\n[要修正の内訳件数]`);
for (const f of flagged) {
  const nb = (f.banned || []).length, nr = (f.factRisks || []).length, ni = (f.issues || []).length;
  console.log(`  ${f.id}: issues ${ni} / factRisks ${nr} / banned ${nb}`);
}
// 各記事の本文サイズ感（args上限の見積り用）
const bytes = Buffer.byteLength(JSON.stringify(articles), 'utf-8');
console.log(`\narticles JSON サイズ: ${(bytes / 1024).toFixed(0)} KB`);
