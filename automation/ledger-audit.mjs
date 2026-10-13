#!/usr/bin/env node
// 台帳の偽エントリ（記事が実在しないのに「生成済み」になっているもの）を検出・削除する。
//
// 事故例（2026-08-02）:
//   SEAFOODBOWL SHOP IN TANASHI が articleId "OWL" として台帳に登録されていた。
//   記事は存在しないのに isGenerated() が true を返すため、その行は候補抽出から
//   永久に除外され、二度と生成されなかった。W列には別要因のエラーが残るだけで、
//   候補一覧にも出てこないので誰も気づけない。
//
// 事故例（2026-10-09〜10-13・NFC / NFD）:
//   台帳の articleId が NFD（e + 結合文字 U+0302）、teleapo-features.ts の記事ID が NFC だった
//   French Restaurant rêve（レーヴ）を、文字列をそのまま比べて「記事が存在しない偽エントリ」と
//   判定して消していた。消えるたびに候補へ戻り、claude を約7分動かして何も変えずに
//   vercel --prod まで走る空回りが 1日2回続いた。
//   → 比べる前に両方を NFC に揃える。台帳に残る NFD は消さずに NFC へ寄せる。
//   照合を緩めるのは正規化だけ（中間一致・新しい丸めは足さない）。
//
// 使い方: node automation/ledger-audit.mjs [--dry]

import { readFileSync, writeFileSync } from 'fs';
import { loadLedgerRaw, canonicalizeLedger, nfc, LEDGER_PATH } from '../scripts/ledger.mjs';

const DRY = process.argv.includes('--dry');
const SRC = new URL('../lib/teleapo-features.ts', import.meta.url);

// teleapo-features.ts に実在する記事ID（NFC に揃えて持つ）
const src = readFileSync(SRC, 'utf-8');
const realIds = new Set([...src.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)].map((m) => nfc(m[1])));

const led = loadLedgerRaw();
// 偽エントリ判定の前に、台帳の NFD を NFC に寄せる（消さずに直す）
const fixed = canonicalizeLedger(led);
const fixedCount = fixed.cidsFixed + fixed.namesRekeyed + fixed.namesFieldsFixed + fixed.namesMerged;
const removed = [];

// 台帳には特集記事以外のエントリも正当に入っている。消してはいけないもの:
//   - r123 形式 … 店舗紹介(lib/data.ts / lib/teleapo-restaurants.ts)のID
//   - skip-row123 形式 … 意図的なスキップ印
// これらを除いた上で、特集記事IDのはずなのに記事が実在しないものだけを偽エントリとする。
const isRestaurantId = (id) => /^r\d+$/.test(id);
const isSkipMarker = (id) => /^skip-row\d+$/.test(id);

for (const map of ['cids', 'names']) {
  for (const [key, v] of Object.entries(led[map] || {})) {
    const id = v && nfc(v.articleId);
    if (!id) continue;
    if (isRestaurantId(id) || isSkipMarker(id)) continue;
    if (!realIds.has(id)) {
      removed.push({ map, key, articleId: id, name: v.name || '' });
      if (!DRY) delete led[map][key];
    }
  }
}

console.log(`📒 台帳監査: 実在記事 ${realIds.size}件 / 偽エントリ ${removed.length}件 / NFC に寄せた ${fixedCount}件`);
for (const r of removed) console.log(`   ✗ ${r.map}[${r.key}] → articleId "${r.articleId}" は記事が存在しない ${r.name}`);
for (const c of fixed.conflicts) console.log(`   ⚠️ NFC 化で店名キーが衝突し articleId が食い違う: ${c.key} 残 "${c.kept}" / 捨 "${c.dropped}"`);

if ((removed.length || fixedCount) && !DRY) {
  writeFileSync(LEDGER_PATH, JSON.stringify(led, null, 1));
  if (fixedCount) console.log(`✅ NFD の台帳エントリ ${fixedCount}件を NFC に寄せて保存`);
  if (removed.length) console.log(`✅ 偽エントリ ${removed.length}件を台帳から削除（次回から候補に復活する）`);
} else if (DRY && (removed.length || fixedCount)) {
  console.log('--dry のため書き込みはしていない');
}
