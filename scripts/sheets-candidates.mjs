#!/usr/bin/env node
// 未処理候補を抽出して表示するだけ（dry-run）
// 使い方: node scripts/sheets-candidates.mjs

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

console.log('🔍 候補検出 (dry-run)');
console.log('');

// 1. トスアップ元シートから D, J, P, U列を batchGet
const src = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: SHEET_ID,
  ranges: [
    'トスアップ元シート!D2:D',  // 店舗名
    'トスアップ元シート!J2:J',  // Maps URL
    'トスアップ元シート!P2:P',  // 詰めステータス
    'トスアップ元シート!U2:U',  // ステータス
  ],
});
const cols = src.data.valueRanges.map(vr =>
  (vr.values || []).map(r => (r[0] || '').toString().trim())
);
const [names, urls, pStats, uStats] = cols;
const maxLen = Math.max(...cols.map(c => c.length));
console.log(`📊 トスアップ元シート: ${maxLen}行`);

// 2. 処理履歴から (店舗名, URL) のセットを取得
const hist = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: SHEET_ID,
  ranges: ['処理履歴!B:B', '処理履歴!C:C', '処理履歴!D:D'],
});
const hTypes = (hist.data.valueRanges[0].values || []).map(r => (r[0] || '').toString().trim());
const hNames = (hist.data.valueRanges[1].values || []).map(r => (r[0] || '').toString().trim());
const hUrls  = (hist.data.valueRanges[2].values || []).map(r => (r[0] || '').toString().trim());
const processed = new Set();
for (let i = 1; i < hNames.length; i++) {
  // identity = "type|name"  (URLは空のこともあるので name メイン)
  processed.add(`${hTypes[i]}|${hNames[i]}`);
}
console.log(`📋 処理履歴: ${processed.size}件 登録済み`);
console.log('');

// 3. 候補抽出
const featCandidates = [];
const restCandidates = [];
let featOkTotal = 0, restOkTotal = 0;

for (let i = 0; i < maxLen; i++) {
  const name = names[i] || '';
  if (!name) continue;
  const url = urls[i] || '';
  const p = pStats[i] || '';
  const u = uStats[i] || '';
  const sourceRow = i + 2;

  if (p === '詰めOK') {
    featOkTotal++;
    if (!processed.has(`feature|${name}`)) {
      featCandidates.push({ sourceRow, name, url, pStat: p, uStat: u });
    }
  }
  if (u === '商談完了') {
    restOkTotal++;
    if (!processed.has(`restaurant|${name}`)) {
      restCandidates.push({ sourceRow, name, url, pStat: p, uStat: u });
    }
  }
}

console.log(`📊 ステータス別:`);
console.log(`   詰めOK: ${featOkTotal}件 (うち未処理: ${featCandidates.length}件)`);
console.log(`   商談完了: ${restOkTotal}件 (うち未処理: ${restCandidates.length}件)`);
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
