#!/usr/bin/env node
/**
 * finalize-images8.mjs ── ビジョン照合の採用結果を画像URLに確定する
 * 入力: automation/batch8-candidates.json（spots[].candidates[]）
 *       + vision-verify WF出力（.result.verdicts = [{id, picks:[{spot, chosen}]}]）
 * 出力: automation/batch8-resolved.json（spots[].imageUrl + heroImageUrl）
 *       採用できなかったスポットを報告
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VOUT = process.argv[2];
const cand = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-candidates.json'), 'utf-8'));
const articles = cand.articles;
const parsed = JSON.parse(readFileSync(VOUT, 'utf-8'));
const verdicts = (parsed.result || parsed).verdicts || [];
const vmap = Object.fromEntries(verdicts.map((v) => [v.id, v]));

let solved = 0, total = 0;
const unresolved = [];
for (const a of articles) {
  const v = vmap[a.id];
  const pickBySpot = {};
  if (v) for (const p of (v.picks || [])) pickBySpot[p.spot] = p.chosen;
  for (let i = 0; i < a.spots.length; i++) {
    total++;
    const s = a.spots[i];
    const chosen = pickBySpot[i + 1];
    if (chosen !== undefined && chosen >= 0 && s.candidates && s.candidates[chosen]) {
      s.imageUrl = s.candidates[chosen].url;
      s.imageFile = s.candidates[chosen].file;
      solved++;
    } else {
      s.imageUrl = null;
      unresolved.push({ id: a.id, idx: i + 1, name: s.name, subject: s.imageSubject, cands: (s.candidates || []).length });
    }
    delete s.candidates; // 出力を軽く
  }
  const hi = Number.isInteger(a.heroSpotIndex) ? a.heroSpotIndex : 0;
  a.heroImageUrl = a.spots[hi]?.imageUrl || a.spots.find((s) => s.imageUrl)?.imageUrl || null;
}
writeFileSync(join(ROOT, 'automation', 'batch8-resolved.json'), JSON.stringify({ articles, unresolved }, null, 2));
console.log(`採用 ${solved}/${total} スポット`);
console.log(`出力: automation/batch8-resolved.json`);
if (unresolved.length) { console.log(`\n⚠ 未採用(${unresolved.length})（被写体一致の候補なし）:`); for (const u of unresolved) console.log(`  - ${u.id} #${u.idx} ${u.name} [${u.subject}] 候補${u.cands}枚`); }
const noHero = articles.filter((a) => !a.heroImageUrl).map((a) => a.id);
if (noHero.length) console.log(`\n⚠ ヒーロー無: ${noHero.join(', ')}`);
