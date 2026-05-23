#!/usr/bin/env node
// 詰めOKリスト 140-145 行に 生成済み済 + URL を書き込むテスト
// 使い方: node scripts/sheets-writeback-test.mjs

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

// 6記事の情報（行番号順）
const articles = [
  { row: 140, name: 'ルーラル', url: 'https://machinowa.tokyo/feature/teleapo-feat-ルラル' },
  { row: 141, name: '炭や。よつ葉', url: 'https://machinowa.tokyo/feature/teleapo-feat-炭やよつ葉' },
  { row: 142, name: 'OWL(営業時間状況で変わります)', url: 'https://machinowa.tokyo/feature/teleapo-feat-owl営業時間状況で変わります' },
  { row: 143, name: 'あんばい 食楽厨房', url: 'https://machinowa.tokyo/feature/teleapo-feat-あんばい-食楽厨房' },
  { row: 144, name: '久留米 和洋/創作酒場 晩餐-Bansun-', url: 'https://machinowa.tokyo/feature/teleapo-feat-久留米-和洋創作酒場-晩餐-bansun-' },
  { row: 145, name: '炭火家本舗 なんばや', url: 'https://machinowa.tokyo/feature/teleapo-feat-炭火家本舗-なんばや' },
];

// 1. W1 / X1 ヘッダー書き込み
console.log('📝 ヘッダー書き込み: W1=生成済み, X1=生成URL');
await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: '詰めOKリスト!W1:X1',
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: [['生成済み', '生成URL']] },
});

// 2. 各行に「済」+ HYPERLINK 書き込み
console.log('📝 6行に書き込み中...');
const data = articles.map(a => ([
  {
    range: `詰めOKリスト!W${a.row}`,
    values: [['済']],
  },
  {
    range: `詰めOKリスト!X${a.row}`,
    values: [[`=HYPERLINK("${a.url}","${a.url}")`]],
  },
])).flat();

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SHEET_ID,
  requestBody: {
    valueInputOption: 'USER_ENTERED',
    data: data,
  },
});

console.log('');
console.log('✅ 書き込み完了');
articles.forEach(a => {
  console.log(`   row ${a.row}: ${a.name}`);
  console.log(`      → ${a.url}`);
});

console.log('');
console.log('🎉 完了。スプシで確認してください。');
