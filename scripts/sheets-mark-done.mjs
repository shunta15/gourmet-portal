#!/usr/bin/env node
// 詰めOKリスト の W/X (feature) または Y/Z (restaurant) に処理結果を書き込む
//
// 成功:
//   node scripts/sheets-mark-done.mjs --type=feature --row=146 --url=https://...
//   node scripts/sheets-mark-done.mjs --type=restaurant --row=146 --url=https://...
//
// エラー:
//   node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=error --reason="GBP取得失敗"
//
// 列マッピング:
//   feature    → W=ステータス, X=URL（成功時のみ）
//   restaurant → Y=ステータス, Z=URL（成功時のみ）

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const { type, row, url, status = 'done', reason } = args;
if (!['feature', 'restaurant'].includes(type)) {
  console.error('❌ --type=feature or --type=restaurant');
  process.exit(1);
}
if (!row || isNaN(row)) {
  console.error('❌ --row=<行番号> 必要');
  process.exit(1);
}
if (status === 'done' && !url) {
  console.error('❌ 成功時は --url=<生成URL> 必要');
  process.exit(1);
}
if (status === 'error' && !reason) {
  console.error('❌ エラー時は --reason="..." 必要');
  process.exit(1);
}

const doneCol = type === 'feature' ? 'W' : 'Y';
const urlCol  = type === 'feature' ? 'X' : 'Z';

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

let updates;
if (status === 'done') {
  updates = [
    { range: `詰めOKリスト!${doneCol}${row}`, values: [['済']] },
    { range: `詰めOKリスト!${urlCol}${row}`, values: [[`=HYPERLINK("${url}","${url}")`]] },
  ];
} else {
  // エラー時は ステータス列だけ書く（URL列は空のまま）
  updates = [
    { range: `詰めOKリスト!${doneCol}${row}`, values: [[`エラー: ${reason}`]] },
  ];
}

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SHEET_ID,
  requestBody: {
    valueInputOption: 'USER_ENTERED',
    data: updates,
  },
});

if (status === 'done') {
  console.log(`✅ row ${row} ${type}: ${doneCol}=済, ${urlCol}=${url}`);
} else {
  console.log(`⚠️  row ${row} ${type}: ${doneCol}=エラー: ${reason}`);
}
