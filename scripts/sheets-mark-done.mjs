#!/usr/bin/env node
// 詰めOKリスト の W/X (feature) または Y/Z (restaurant) に 済 + URL を書き込む
// 使い方:
//   node scripts/sheets-mark-done.mjs --type=feature --row=146 --url=https://...
//   node scripts/sheets-mark-done.mjs --type=restaurant --row=146 --url=https://...

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';

// 引数パース
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const { type, row, url } = args;
if (!['feature', 'restaurant'].includes(type)) {
  console.error('❌ --type=feature or --type=restaurant');
  process.exit(1);
}
if (!row || isNaN(row)) {
  console.error('❌ --row=<行番号> 必要');
  process.exit(1);
}
if (!url) {
  console.error('❌ --url=<生成URL> 必要');
  process.exit(1);
}

// 列マッピング
const doneCol = type === 'feature' ? 'W' : 'Y';
const urlCol  = type === 'feature' ? 'X' : 'Z';

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SHEET_ID,
  requestBody: {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: `詰めOKリスト!${doneCol}${row}`, values: [['済']] },
      { range: `詰めOKリスト!${urlCol}${row}`, values: [[`=HYPERLINK("${url}","${url}")`]] },
    ],
  },
});

console.log(`✅ row ${row} ${type}: ${doneCol}=済, ${urlCol}=${url}`);
