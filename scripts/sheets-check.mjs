#!/usr/bin/env node
// Sheets API 接続確認スクリプト
// 使い方: node scripts/sheets-check.mjs

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const NEW_SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const authClient = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: authClient });

console.log('🔑 サービスアカウント:', credentials.client_email);
console.log('📊 対象スプシ:', NEW_SHEET_ID);
console.log('');

// スプシのメタデータ取得（タブ一覧）
const meta = await sheets.spreadsheets.get({ spreadsheetId: NEW_SHEET_ID });
console.log('📋 スプシ名:', meta.data.properties.title);
console.log('📑 タブ一覧:');
meta.data.sheets.forEach(s => {
  console.log(`   - ${s.properties.title} (${s.properties.gridProperties.rowCount}行 × ${s.properties.gridProperties.columnCount}列)`);
});
console.log('');

// トスアップ元シート のヘッダー取得
const header = await sheets.spreadsheets.values.get({
  spreadsheetId: NEW_SHEET_ID,
  range: 'トスアップ元シート!A1:V1',
});
console.log('📌 トスアップ元シート ヘッダー:');
(header.data.values?.[0] || []).forEach((h, i) => {
  const col = String.fromCharCode(65 + i);
  console.log(`   ${col}: ${h}`);
});
console.log('');

// 末尾近くの行数を確認
const lastRows = await sheets.spreadsheets.values.get({
  spreadsheetId: NEW_SHEET_ID,
  range: 'トスアップ元シート!D:D',
});
const lastRowNum = (lastRows.data.values || []).filter(r => r[0]).length;
console.log(`📈 トスアップ元シート データ行数: ${lastRowNum}行`);

console.log('');
console.log('✅ Sheets API アクセス OK');
