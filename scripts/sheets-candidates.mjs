#!/usr/bin/env node
// 未処理候補を抽出して表示するだけ（dry-run）
// 使い方: node scripts/sheets-candidates.mjs
//
// 監視シート: 「詰めOKリスト」（IMPORTRANGE + QUERY で詰めOKに絞り込み済み）
//   A〜V: QUERY 結果（読み取り専用）
//     D 店舗名 / J Maps URL / P 詰めステータス / U ステータス
//   W〜Z: 自動化が書き込む管理列
//     W feature済フラグ / X feature URL / Y restaurant済フラグ / Z restaurant URL
//
// 未処理判定:
//   feature    → W列空（P=詰めOK は QUERY で暗黙絞り込み済）
//   restaurant → Y列空 かつ U=商談完了
//
// 行範囲: row >= MIN_SOURCE_ROW（145以下は永久スキップ）

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const SHEET_NAME = '詰めOKリスト';

// 自動化対象は row 146 以降のみ（ユーザー明言 2026-05-24）
// row 145 以下は「時すでに遅し」の旧案件のため永久スキップ
const MIN_SOURCE_ROW = 146;

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

console.log('🔍 候補検出 (dry-run)');
console.log(`📄 監視シート: 「${SHEET_NAME}」`);
console.log('');

// 詰めOKリストから D, J, P, U, W, X, Y, Z 列を batchGet
const src = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: SHEET_ID,
  ranges: [
    `${SHEET_NAME}!D2:D`,  // 店舗名
    `${SHEET_NAME}!J2:J`,  // Maps URL
    `${SHEET_NAME}!P2:P`,  // 詰めステータス
    `${SHEET_NAME}!U2:U`,  // ステータス
    `${SHEET_NAME}!W2:W`,  // feature 処理済
    `${SHEET_NAME}!X2:X`,  // feature URL
    `${SHEET_NAME}!Y2:Y`,  // restaurant 処理済
    `${SHEET_NAME}!Z2:Z`,  // restaurant URL
  ],
});
const cols = src.data.valueRanges.map(vr =>
  (vr.values || []).map(r => (r[0] || '').toString().trim())
);
const [names, urls, pStats, uStats, featDone, featUrl, restDone, restUrl] = cols;
const maxLen = Math.max(...cols.map(c => c.length));
console.log(`📊 「${SHEET_NAME}」: ${maxLen}行`);
console.log('');

const featCandidates = [];
const restCandidates = [];
let featOkTotal = 0, restOkTotal = 0;
let featDoneTotal = 0, restDoneTotal = 0;
let skippedOldRows = 0;

for (let i = 0; i < maxLen; i++) {
  const name = names[i] || '';
  if (!name) continue;
  const url = urls[i] || '';
  const p = pStats[i] || '';
  const u = uStats[i] || '';
  const wDone = featDone[i] || '';
  const yDone = restDone[i] || '';
  const sourceRow = i + 2;

  // 詰めOKリストは QUERY で詰めOKだけが入っている前提だが、念のため P列もチェック
  const isFeat = p === '詰めOK';
  const isRest = u === '商談完了';

  // row < MIN_SOURCE_ROW は永久スキップ
  if (sourceRow < MIN_SOURCE_ROW) {
    if (isFeat || isRest) skippedOldRows++;
    continue;
  }

  if (isFeat) {
    featOkTotal++;
    if (wDone) {
      featDoneTotal++;
    } else {
      featCandidates.push({ sourceRow, name, url, pStat: p, uStat: u });
    }
  }
  if (isRest) {
    restOkTotal++;
    if (yDone) {
      restDoneTotal++;
    } else {
      restCandidates.push({ sourceRow, name, url, pStat: p, uStat: u });
    }
  }
}

if (skippedOldRows > 0) {
  console.log(`⏭️  row < ${MIN_SOURCE_ROW} の旧案件 ${skippedOldRows}件をスキップ（永久対象外）`);
  console.log('');
}

console.log(`📊 ステータス別（row >= ${MIN_SOURCE_ROW}）:`);
console.log(`   詰めOK: ${featOkTotal}件 (済 ${featDoneTotal} / 未処理 ${featCandidates.length})`);
console.log(`   商談完了: ${restOkTotal}件 (済 ${restDoneTotal} / 未処理 ${restCandidates.length})`);
console.log('');

if (featCandidates.length > 0) {
  console.log(`📝 特集記事(feature) 未処理候補 ${featCandidates.length}件:`);
  featCandidates.slice(0, 20).forEach(c => {
    console.log(`   row ${c.sourceRow}: ${c.name}`);
    if (c.url) console.log(`      ${c.url.slice(0, 70)}`);
  });
  if (featCandidates.length > 20) console.log(`   ...他 ${featCandidates.length - 20}件`);
  console.log('');
}

if (restCandidates.length > 0) {
  console.log(`🏪 店舗紹介(restaurant) 未処理候補 ${restCandidates.length}件:`);
  restCandidates.slice(0, 20).forEach(c => {
    console.log(`   row ${c.sourceRow}: ${c.name}`);
    if (c.url) console.log(`      ${c.url.slice(0, 70)}`);
  });
  if (restCandidates.length > 20) console.log(`   ...他 ${restCandidates.length - 20}件`);
  console.log('');
}

if (featCandidates.length === 0 && restCandidates.length === 0) {
  console.log('✅ 未処理候補なし');
}
