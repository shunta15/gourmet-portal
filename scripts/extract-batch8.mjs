#!/usr/bin/env node
// batch8 生成WF出力から articles を取り出し、reading を所要分に補正、audit を flags へ分離。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = process.argv[2];
const parsed = JSON.parse(readFileSync(SRC, 'utf-8'));
const data = parsed.result || parsed;
const articles = data.articles || [];

const flags = [];
for (const a of articles) {
  // reading を「約N分」に補正（読み仮名で返ってきているため）
  const chars = (a.lede || '').length + (a.closing || '').length + (a.spots || []).reduce((s, x) => s + (x.desc || '').length, 0);
  const mins = Math.min(9, Math.max(4, Math.round(chars / 500)));
  a.reading = `約${mins}分`;
  // audit を分離
  if (a.audit && (a.audit.ok === false || a.audit.templatey)) {
    flags.push({ id: a.id, issues: a.audit.issues || [], factRisks: a.audit.factRisks || [], banned: a.audit.bannedExpressions || [], templatey: !!a.audit.templatey });
  }
  delete a.audit;
}
writeFileSync(join(ROOT, 'automation', 'batch8-raw.json'), JSON.stringify({ articles }, null, 2));
writeFileSync(join(ROOT, 'automation', 'batch8-flags.json'), JSON.stringify(flags, null, 2));

console.log(`記事 ${articles.length}本`);
console.log(`要修正(audit ok=false or templatey): ${flags.length}本`);
const tpl = flags.filter((f) => f.templatey).map((f) => f.id);
console.log(`templatey判定: ${tpl.length}本 ${tpl.join(',') || '-'}`);
let banned = 0, fr = 0;
for (const f of flags) { banned += f.banned.length; fr += f.factRisks.length; }
console.log(`禁止表現指摘 計${banned} / 事実リスク指摘 計${fr}`);
// ペルソナ別 articleType 分布で多様性を確認
const byType = {};
for (const a of articles) byType[a.articleType] = (byType[a.articleType] || 0) + 1;
console.log(`articleType分布:`, JSON.stringify(byType));
const spotCounts = {};
for (const a of articles) spotCounts[a.spots.length] = (spotCounts[a.spots.length] || 0) + 1;
console.log(`スポット数分布:`, JSON.stringify(spotCounts));
