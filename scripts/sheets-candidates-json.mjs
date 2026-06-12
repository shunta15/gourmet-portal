#!/usr/bin/env node
// 未処理候補を JSON で出力（bash パイプライン用）
// 出力: {"feature":[{sourceRow,name,url}...], "restaurant":[...]}

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadLedger, isGenerated } from './ledger.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const SHEET_NAME = '詰めOKリスト';
const MIN_SOURCE_ROW = 146;
const RETRY_AFTER_HOURS = 24;

function normalize(v) {
  if (v == null) return '';
  return String(v).replace(/^'+/, '').replace(/[　\s]+/g, ' ').trim();
}

function classifyStatus(cellRaw) {
  const v = normalize(cellRaw);
  if (!v) return 'empty';
  if (v === '済') return 'done';
  if (v.startsWith('永久エラー')) return 'permanent_error';
  if (v.startsWith('処理中')) return 'processing';
  if (v.startsWith('エラー')) {
    const m = v.match(/\((\d{4}-\d{2}-\d{2})\)$/);
    if (!m) return 'error_cooldown';
    const errDate = new Date(`${m[1]}T00:00:00+09:00`);
    const ageHours = (Date.now() - errDate.getTime()) / 3600000;
    return ageHours >= RETRY_AFTER_HOURS ? 'error_retryable' : 'error_cooldown';
  }
  return 'error_cooldown';
}

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${SHEET_NAME}!A2:Z`,
  valueRenderOption: 'FORMATTED_VALUE',
});
const rows = res.data.values || [];
const IDX = { NAME: 3, URL: 9, P: 15, U: 20, W: 22, Y: 24 };
const led = loadLedger();

const feature = [];
const restaurant = [];

for (let i = 0; i < rows.length; i++) {
  const r = rows[i] || [];
  const name = normalize(r[IDX.NAME]);
  const url = normalize(r[IDX.URL]);
  const p = normalize(r[IDX.P]);
  const u = normalize(r[IDX.U]);
  const sourceRow = i + 2;
  if (sourceRow < MIN_SOURCE_ROW) continue;
  if (!name && !url) continue;

  if (p === '詰めOK') {
    // 処理済み判定は「台帳（cid・店名）」が唯一の正。W列は IMPORTRANGE 行ズレで信用しない。
    if (isGenerated(led, url, name)) continue;            // 生成済み → スキップ（重複防止）
    const s = classifyStatus(r[IDX.W]);
    // 未生成なら、W列の「済」(=行ズレで残った別店の済)は無視して候補にする。
    // ただし直近エラー冷却 / 処理中ロック / 永久エラーは尊重（取りこぼし救済より誤連打防止）。
    if (s === 'permanent_error' || s === 'processing' || s === 'error_cooldown') continue;
    feature.push({ sourceRow, name, url });                // empty / 行ズレ済 / リトライ可
  }
  if (u === '商談完了') {
    const s = classifyStatus(r[IDX.Y]);
    if (s === 'empty' || s === 'error_retryable') {
      restaurant.push({ sourceRow, name, url });
    }
  }
}

console.log(JSON.stringify({ feature, restaurant }));
