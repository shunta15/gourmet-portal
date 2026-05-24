#!/usr/bin/env node
// 未処理候補を抽出して表示する (dry-run)
// 使い方: node scripts/sheets-candidates.mjs
//
// 監視シート: 「詰めOKリスト」（QUERY で詰めOKに絞り込み済み）
//   A〜V: QUERY 結果（読み取り専用）
//     D=店舗名 / J=Maps URL / P=詰めステータス / U=ステータス
//   W〜Z: 自動化が書き込む管理列
//     W=feature済フラグ / X=feature URL / Y=restaurant済フラグ / Z=restaurant URL
//
// 未処理判定:
//   feature    → P='詰めOK' かつ W が「未処理状態」
//   restaurant → U='商談完了' かつ Y が「未処理状態」
//
// 「未処理状態」とは:
//   - 空セル
//   - 「処理中:」（古いロック・破棄推奨だが当面は未処理扱いしない）
//   - 「エラー: ... (YYYY-MM-DD)」で日付が 24時間以上前（自動リトライ）
//
// 「処理済」とは:
//   - 「済」
//   - 「永久エラー: ...」（人手クリアまで再試行しない）
//   - 「エラー: ... (YYYY-MM-DD)」で日付が 24時間以内（直近の失敗・冷却中）
//   - 「処理中: ...」（他 routine 実行中）
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
const MIN_SOURCE_ROW = 146;
const RETRY_AFTER_HOURS = 24;

function normalize(v) {
  if (v == null) return '';
  return String(v)
    .replace(/^'+/, '')
    .replace(/[​-‍﻿]/g, '')
    .replace(/[　\s]+/g, ' ')
    .trim();
}

// セル値から状態を判定
// 返値: 'empty' | 'done' | 'processing' | 'error_cooldown' | 'error_retryable' | 'permanent_error'
function classifyStatus(cellRaw) {
  const v = normalize(cellRaw);
  if (!v) return 'empty';
  if (v === '済') return 'done';
  if (v.startsWith('永久エラー')) return 'permanent_error';
  if (v.startsWith('処理中')) return 'processing';
  if (v.startsWith('エラー')) {
    // 「エラー: 理由 (YYYY-MM-DD)」形式から日付を抽出
    const m = v.match(/\((\d{4}-\d{2}-\d{2})\)$/);
    if (!m) return 'error_cooldown';  // 日付なしの古いエラーは安全側で冷却扱い
    const errDate = new Date(`${m[1]}T00:00:00+09:00`);
    const ageHours = (Date.now() - errDate.getTime()) / 3600000;
    return ageHours >= RETRY_AFTER_HOURS ? 'error_retryable' : 'error_cooldown';
  }
  // 不明な値は冷却扱い（安全側）
  return 'error_cooldown';
}

const isUnprocessed = (s) => s === 'empty' || s === 'error_retryable';

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

console.log('🔍 候補検出 (dry-run)');
console.log(`📄 監視シート: 「${SHEET_NAME}」`);
console.log('');

const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${SHEET_NAME}!A2:Z`,
  valueRenderOption: 'FORMATTED_VALUE',
});
const rows = res.data.values || [];
console.log(`📊 「${SHEET_NAME}」: ${rows.length}行`);
console.log('');

const featCandidates = [];
const restCandidates = [];
const featErrors = [];
const restErrors = [];
let featOkTotal = 0, restOkTotal = 0;
let featDoneTotal = 0, restDoneTotal = 0;
let featPermErrTotal = 0, restPermErrTotal = 0;
let skippedOldRows = 0;

const IDX = { NAME: 3, URL: 9, P: 15, U: 20, W: 22, X: 23, Y: 24, Z: 25 };

for (let i = 0; i < rows.length; i++) {
  const r = rows[i] || [];
  const name = normalize(r[IDX.NAME]);
  const url  = normalize(r[IDX.URL]);
  const p    = normalize(r[IDX.P]);
  const u    = normalize(r[IDX.U]);
  const wRaw = r[IDX.W] || '';
  const yRaw = r[IDX.Y] || '';
  const sourceRow = i + 2;

  const isFeat = p === '詰めOK';
  const isRest = u === '商談完了';
  if (!isFeat && !isRest) continue;
  if (!name && !url) continue;

  if (sourceRow < MIN_SOURCE_ROW) {
    skippedOldRows++;
    continue;
  }

  if (isFeat) {
    featOkTotal++;
    const s = classifyStatus(wRaw);
    if (s === 'done') featDoneTotal++;
    else if (s === 'permanent_error') { featPermErrTotal++; featErrors.push({ sourceRow, name, raw: normalize(wRaw) }); }
    else if (s === 'error_cooldown') featErrors.push({ sourceRow, name, raw: normalize(wRaw) });
    else if (isUnprocessed(s)) featCandidates.push({ sourceRow, name, url, status: s });
  }
  if (isRest) {
    restOkTotal++;
    const s = classifyStatus(yRaw);
    if (s === 'done') restDoneTotal++;
    else if (s === 'permanent_error') { restPermErrTotal++; restErrors.push({ sourceRow, name, raw: normalize(yRaw) }); }
    else if (s === 'error_cooldown') restErrors.push({ sourceRow, name, raw: normalize(yRaw) });
    else if (isUnprocessed(s)) restCandidates.push({ sourceRow, name, url, status: s });
  }
}

if (skippedOldRows > 0) {
  console.log(`⏭️  row < ${MIN_SOURCE_ROW} の旧案件 ${skippedOldRows}件をスキップ`);
  console.log('');
}

console.log(`📊 ステータス別（row >= ${MIN_SOURCE_ROW}）:`);
console.log(`   詰めOK: ${featOkTotal}件 (済 ${featDoneTotal} / 永久エラー ${featPermErrTotal} / 未処理 ${featCandidates.length})`);
console.log(`   商談完了: ${restOkTotal}件 (済 ${restDoneTotal} / 永久エラー ${restPermErrTotal} / 未処理 ${restCandidates.length})`);
console.log(`   ※ 未処理 = 空 + エラー24h経過 / 処理済 = 済 + 永久エラー + 処理中 + エラー24h以内`);
console.log('');

if (featCandidates.length > 0) {
  console.log(`📝 特集記事(feature) 未処理候補 ${featCandidates.length}件:`);
  featCandidates.slice(0, 20).forEach(c => {
    const tag = c.status === 'error_retryable' ? '[リトライ] ' : '';
    console.log(`   row ${c.sourceRow}: ${tag}${c.name}`);
    if (c.url) console.log(`      ${c.url.slice(0, 70)}`);
  });
  if (featCandidates.length > 20) console.log(`   ...他 ${featCandidates.length - 20}件`);
  console.log('');
}

if (restCandidates.length > 0) {
  console.log(`🏪 店舗紹介(restaurant) 未処理候補 ${restCandidates.length}件:`);
  restCandidates.slice(0, 20).forEach(c => {
    const tag = c.status === 'error_retryable' ? '[リトライ] ' : '';
    console.log(`   row ${c.sourceRow}: ${tag}${c.name}`);
    if (c.url) console.log(`      ${c.url.slice(0, 70)}`);
  });
  if (restCandidates.length > 20) console.log(`   ...他 ${restCandidates.length - 20}件`);
  console.log('');
}

const totalErrors = featErrors.length + restErrors.length;
if (totalErrors > 0) {
  console.log(`⚠️  エラー累計 ${totalErrors}件（次回まで冷却 or 永久エラー）:`);
  [...featErrors.slice(0, 10), ...restErrors.slice(0, 10)].forEach(e => {
    console.log(`   row ${e.sourceRow}: ${e.name} - ${e.raw}`);
  });
  if (totalErrors > 20) console.log(`   ...他 ${totalErrors - 20}件`);
  console.log('');
}

if (featCandidates.length === 0 && restCandidates.length === 0) {
  console.log('✅ 未処理候補なし');
}
