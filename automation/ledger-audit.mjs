#!/usr/bin/env node
// 台帳の偽エントリ（記事が実在しないのに「生成済み」になっているもの）を検出・削除する。
//
// 事故例（2026-08-02）:
//   SEAFOODBOWL SHOP IN TANASHI が articleId "OWL" として台帳に登録されていた。
//   記事は存在しないのに isGenerated() が true を返すため、その行は候補抽出から
//   永久に除外され、二度と生成されなかった。W列には別要因のエラーが残るだけで、
//   候補一覧にも出てこないので誰も気づけない。
//
// 使い方: node automation/ledger-audit.mjs [--dry]

import { readFileSync, writeFileSync } from 'fs';

const DRY = process.argv.includes('--dry');
const LEDGER = 'automation/generated-ledger.json';
const SRC = 'lib/teleapo-features.ts';

// teleapo-features.ts に実在する記事ID
const src = readFileSync(SRC, 'utf-8');
const realIds = new Set([...src.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)].map((m) => m[1]));

const led = JSON.parse(readFileSync(LEDGER, 'utf-8'));
const removed = [];

// 台帳には特集記事以外のエントリも正当に入っている。消してはいけないもの:
//   - r123 形式 … 店舗紹介(lib/data.ts / lib/teleapo-restaurants.ts)のID
//   - skip-row123 形式 … 意図的なスキップ印
// これらを除いた上で、特集記事IDのはずなのに記事が実在しないものだけを偽エントリとする。
const isRestaurantId = (id) => /^r\d+$/.test(id);
const isSkipMarker = (id) => /^skip-row\d+$/.test(id);

for (const map of ['cids', 'names']) {
  for (const [key, v] of Object.entries(led[map] || {})) {
    const id = v && v.articleId;
    if (!id) continue;
    if (isRestaurantId(id) || isSkipMarker(id)) continue;
    if (!realIds.has(id)) {
      removed.push({ map, key, articleId: id, name: v.name || '' });
      if (!DRY) delete led[map][key];
    }
  }
}

console.log(`📒 台帳監査: 実在記事 ${realIds.size}件 / 偽エントリ ${removed.length}件`);
for (const r of removed) console.log(`   ✗ ${r.map}[${r.key}] → articleId "${r.articleId}" は記事が存在しない ${r.name}`);

if (removed.length && !DRY) {
  writeFileSync(LEDGER, JSON.stringify(led, null, 1));
  console.log(`✅ 偽エントリ ${removed.length}件を台帳から削除（次回から候補に復活する）`);
} else if (DRY && removed.length) {
  console.log('--dry のため削除はしていない');
}
