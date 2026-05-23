#!/usr/bin/env node
// 処理履歴 タブを作成し、既存6記事を初期データとして登録
// 使い方: node scripts/sheets-init.mjs

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const TAB_NAME = '処理履歴';

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

// 既存6記事の情報
// 注意: source_row（トスアップ元シートの行）は実データを見て後で埋める
const existingArticles = [
  { type: 'feature', name: 'ルーラル', mapsUrl: '', url: 'https://machinowa.tokyo/feature/%E3%83%AB%E3%83%BC%E3%83%A9%E3%83%AB' },
  { type: 'feature', name: '炭や。よつ葉', mapsUrl: '', url: 'https://machinowa.tokyo/feature/%E7%82%AD%E3%82%84%E3%82%88%E3%81%A4%E8%91%89' },
  { type: 'feature', name: 'OWL(営業時間状況で変わります)', mapsUrl: '', url: 'https://machinowa.tokyo/feature/OWL' },
  { type: 'feature', name: 'あんばい 食楽厨房', mapsUrl: '', url: 'https://machinowa.tokyo/feature/%E3%81%82%E3%82%93%E3%81%B0%E3%81%84%E9%A3%9F%E6%A5%BD%E5%8E%A8%E6%88%BF' },
  { type: 'feature', name: '久留米 和洋/創作酒場 晩餐-Bansun-', mapsUrl: '', url: 'https://machinowa.tokyo/feature/%E6%99%A9%E9%A4%90-Bansun' },
  { type: 'feature', name: '炭火家本舗 なんばや', mapsUrl: '', url: 'https://machinowa.tokyo/feature/%E7%82%AD%E7%81%AB%E5%AE%B6%E6%9C%AC%E8%88%97%E3%81%AA%E3%82%93%E3%81%B0%E3%82%84' },
];

// 1. タブが既に存在するかチェック
const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
const existingTab = meta.data.sheets.find(s => s.properties.title === TAB_NAME);

if (existingTab) {
  console.log(`⚠️  タブ「${TAB_NAME}」は既に存在します。スキップ。`);
} else {
  // 2. タブ作成
  console.log(`📝 タブ「${TAB_NAME}」を作成中...`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: TAB_NAME,
            gridProperties: { rowCount: 1000, columnCount: 10 },
          },
        },
      }],
    },
  });
  console.log('✅ タブ作成完了');
}

// 3. ヘッダー書き込み
const headers = [
  '処理ID', '種別', '店舗名', 'Maps URL', 'source_row',
  '処理状態', '生成URL', '処理日時', 'メモ',
];
await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: `${TAB_NAME}!A1:I1`,
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: [headers] },
});
console.log('✅ ヘッダー書き込み完了');

// 4. 既存6記事を Maps URL 付きで初期登録
//    トスアップ元シートから店舗名で検索してURLを取得
const sourceData = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: SHEET_ID,
  ranges: ['トスアップ元シート!D:D', 'トスアップ元シート!J:J'],
});
const storeNames = sourceData.data.valueRanges[0].values || [];
const urls = sourceData.data.valueRanges[1].values || [];

const initRows = existingArticles.map((article, i) => {
  // 店舗名でマッチング
  let sourceRow = '';
  let mapsUrl = '';
  for (let row = 1; row < storeNames.length; row++) {
    const name = (storeNames[row]?.[0] || '').trim();
    if (name === article.name) {
      sourceRow = row + 1; // 1-indexed
      mapsUrl = urls[row]?.[0] || '';
      break;
    }
  }
  return [
    i + 1,                          // 処理ID
    article.type,                   // 種別
    article.name,                   // 店舗名
    mapsUrl,                        // Maps URL
    sourceRow,                      // source_row
    '済',                            // 処理状態
    article.url,                    // 生成URL
    '2026-05-22 ~ 2026-05-23',      // 処理日時
    '初期登録（過去生成済み）',         // メモ
  ];
});

await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: `${TAB_NAME}!A2:I${1 + initRows.length}`,
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: initRows },
});

console.log(`✅ 既存${initRows.length}記事を初期登録`);
initRows.forEach(r => console.log(`   ${r[0]}. [${r[1]}] ${r[2]} (source_row=${r[4]})`));

console.log('');
console.log('🎉 セットアップ完了');
