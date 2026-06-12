#!/usr/bin/env node
// スプシの W列(済)/X列(URL) を台帳に合わせて再同期する
//
// 背景: IMPORTRANGE で D列(店名)/J列(Maps URL)が動的に入れ替わるため、
//   生成時に行番号で書いた「済」「URL」が、行ズレで別の店の行に取り残される。
//   → 生成済みの店なのに W/X が空に見え、「記事できてない」ように見える。
// 対策: 各行の「今いる店」が台帳(cid・店名)で生成済みなら、その行の W=済 / X=URL を
//   貼り直す。行がどこにズレても、今の位置に正しい済/URLが付く。
//
// 使い方: node scripts/sheets-sync-status.mjs

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadLedger, cidFromUrl, nameKey } from './ledger.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const SHEET_NAME = '詰めOKリスト';
const MIN_SOURCE_ROW = 146;
const IDX = { NAME: 3, URL: 9, P: 15, W: 22, X: 23 };

const norm = (v) => (v == null ? '' : String(v).replace(/^'+/, '').replace(/[　\s]+/g, ' ').trim());
const escapeQuote = (s) => String(s).replace(/"/g, '""');

// 台帳から、この行の店の公開URLを引く（cid優先、なければ店名キー）
function generatedUrl(led, url, name) {
  const cid = cidFromUrl(url);
  if (cid && led.cids[cid]?.url) return led.cids[cid].url;
  const nk = nameKey(name);
  if (nk && led.names[nk]?.url) return led.names[nk].url;
  // url が無い古い台帳エントリは articleId から組み立て
  if (cid && led.cids[cid]?.articleId) return `https://machinowa.tokyo/feature/${led.cids[cid].articleId}`;
  if (nk && led.names[nk]?.articleId) return `https://machinowa.tokyo/feature/${led.names[nk].articleId}`;
  if (nk && led.names[nk]) return null; // 生成済みだがURL不明
  return undefined; // 未生成
}

const led = loadLedger();
const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${SHEET_NAME}!A2:Z`,
  valueRenderOption: 'FORMATTED_VALUE',
});
const rows = res.data.values || [];

const updates = [];
let synced = 0;
for (let i = 0; i < rows.length; i++) {
  const sr = i + 2;
  if (sr < MIN_SOURCE_ROW) continue;
  const r = rows[i] || [];
  const name = norm(r[IDX.NAME]);
  const url = norm(r[IDX.URL]);
  const p = norm(r[IDX.P]);
  const w = norm(r[IDX.W]);
  if (p !== '詰めOK') continue;
  if (!name && !url) continue;

  const pubUrl = generatedUrl(led, url, name);
  if (pubUrl === undefined) continue; // 未生成 → 触らない
  // 永久エラーは人手対応用に残す（ただし生成済みなら済に上書き）
  if (w === '済') {
    // 既に済でもURLが空なら補完
    const x = norm(r[IDX.X]);
    if (x) continue;
  }
  // 生成済み → この行に 済 + URL を貼る
  updates.push({ range: `${SHEET_NAME}!${'W'}${sr}`, values: [['済']] });
  if (pubUrl) updates.push({ range: `${SHEET_NAME}!${'X'}${sr}`, values: [[`=HYPERLINK("${escapeQuote(pubUrl)}","${escapeQuote(pubUrl)}")`]] });
  synced++;
}

if (updates.length === 0) {
  console.log('✅ 同期の必要なし（すべての生成済み店に済/URLが付いている）');
} else {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
  });
  console.log(`✅ ${synced}行を再同期（生成済みの店に 済 + URL を貼り直し）`);
}
