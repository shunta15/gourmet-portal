#!/usr/bin/env node
// 未処理候補を抽出して表示するだけ（dry-run）
// 使い方: node scripts/sheets-candidates.mjs
//
// 監視シート: 「詰めOKリスト」（IMPORTRANGE + QUERY で詰めOKに絞り込み済み）
//   A〜V: QUERY 結果（読み取り専用）
//     D=店舗名 / J=Maps URL / P=詰めステータス / U=ステータス
//   W〜Z: 自動化が書き込む管理列
//     W=feature済フラグ / X=feature URL / Y=restaurant済フラグ / Z=restaurant URL
//
// 未処理判定:
//   feature    → P='詰めOK' かつ W が空
//   restaurant → U='商談完了' かつ Y が空
//   W/Y が「済」「エラー:」「処理中:」のいずれかで始まる行は処理済扱い（次回スキップ）
//
// 行範囲: row >= MIN_SOURCE_ROW（145以下は永久スキップ）
//
// race防止: A:Z を 1 リクエストで取得（行ズレ防止）

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

// 文字列正規化: trim + 全角空白除去 + 改行除去 + ゼロ幅除去 + 先頭シングルクォート除去
function normalize(v) {
  if (v == null) return '';
  return String(v)
    .replace(/^'+/, '')               // 先頭シングルクォート（Sheets が prefix する場合がある）
    .replace(/[​-‍﻿]/g, '')  // ゼロ幅文字
    .replace(/[　\s]+/g, ' ')     // 全角・半角空白を統合
    .trim();
}

// 処理済扱いとなるステータス（済 / エラー: / 処理中:）
function isProcessed(statusCell) {
  const v = normalize(statusCell);
  return v === '済' || v.startsWith('エラー') || v.startsWith('処理中');
}

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

console.log('🔍 候補検出 (dry-run)');
console.log(`📄 監視シート: 「${SHEET_NAME}」`);
console.log('');

// A:Z を 1 レンジで取得（race / 行ズレ防止）
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
let featOkTotal = 0, restOkTotal = 0;
let featDoneTotal = 0, restDoneTotal = 0;
let skippedOldRows = 0;

// 列 index（0始まり）: D=3, J=9, P=15, U=20, W=22, X=23, Y=24, Z=25
const IDX = { NAME: 3, URL: 9, P: 15, U: 20, W: 22, X: 23, Y: 24, Z: 25 };

for (let i = 0; i < rows.length; i++) {
  const r = rows[i] || [];
  const name = normalize(r[IDX.NAME]);
  const url  = normalize(r[IDX.URL]);
  const p    = normalize(r[IDX.P]);
  const u    = normalize(r[IDX.U]);
  const wDone = r[IDX.W] || '';
  const yDone = r[IDX.Y] || '';
  const sourceRow = i + 2;

  // 詰めOK / 商談完了 のどちらでもない行（空白行や別ステータス）はスキップ
  const isFeat = p === '詰めOK';
  const isRest = u === '商談完了';
  if (!isFeat && !isRest) continue;
  if (!name && !url) continue;  // どちらも空なら QUERY 異常行

  // row 145 以下は永久スキップ
  if (sourceRow < MIN_SOURCE_ROW) {
    skippedOldRows++;
    continue;
  }

  if (isFeat) {
    featOkTotal++;
    if (isProcessed(wDone)) {
      featDoneTotal++;
    } else {
      featCandidates.push({ sourceRow, name, url, pStat: p, uStat: u });
    }
  }
  if (isRest) {
    restOkTotal++;
    if (isProcessed(yDone)) {
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
console.log(`   詰めOK: ${featOkTotal}件 (処理済 ${featDoneTotal} / 未処理 ${featCandidates.length})`);
console.log(`   商談完了: ${restOkTotal}件 (処理済 ${restDoneTotal} / 未処理 ${restCandidates.length})`);
console.log(`   ※ 処理済 = 「済」「エラー:」「処理中:」のいずれか`);
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
