#!/usr/bin/env node
// 「詰めOKなのに記事が無い行」を全数照合して報告する。
//
// なぜ必要か: 候補抽出(sheets-candidates-json.mjs)は
//   ・エラー当日の行を24時間クールダウンで除外
//   ・処理中ロックの行を除外
//   ・台帳が「生成済み」と言えば除外（台帳の偽エントリで永久に消えることがある）
// するため、「候補0件」は「全部作り終えた」の証拠にならない。
// 実際に2026-08-02、候補0件の裏で未生成が8件滞留していた。
//
// このスクリプトは Q列=詰めOK の行を全部見て、W=済 かつ X=URL が入っているかだけを見る。
// 終了コード: 0=未処理なし / 1=未処理あり

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SHEET_ID, BODY_SHEET, IDX, FEATURE_TRIGGER, MIN_SOURCE_ROW } from './sheets-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const rows = (await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${BODY_SHEET}!A2:Z`,
  valueRenderOption: 'FORMATTED_VALUE',
})).data.values || [];

const n = (v) => String(v ?? '').replace(/^'+/, '').trim();

let target = 0;
const pending = [];
rows.forEach((r, i) => {
  const row = i + 2;
  if (row < MIN_SOURCE_ROW) return;
  if (n(r[IDX.STATUS]) !== FEATURE_TRIGGER) return;
  target++;
  const w = n(r[IDX.W]);
  const x = n(r[IDX.X]);
  if (w === '済' && x) return;
  pending.push({ row, name: n(r[IDX.NAME]), w: w || '(空)', x: x ? 'あり' : '(空)' });
});

console.log(`📊 詰めOK ${target}件 / 記事あり ${target - pending.length}件 / 未処理 ${pending.length}件`);
for (const p of pending) console.log(`   ✗ row${p.row} ${p.name} W=${p.w} X=${p.x}`);

process.exit(pending.length ? 1 : 0);
