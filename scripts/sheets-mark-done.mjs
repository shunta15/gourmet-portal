#!/usr/bin/env node
// 詰めOKリスト の W/X (feature) または Y/Z (restaurant) に処理結果を書き込む
//
// 使い方:
//   ロック取得（処理開始時）:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=processing
//   成功:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --url=https://...
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=done --url=https://...
//   エラー:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=error --reason="GBP取得失敗"
//
// 列マッピング:
//   feature    → W=ステータス, X=URL（成功時のみ）
//   restaurant → Y=ステータス, Z=URL（成功時のみ）
//
// ステータス値:
//   "処理中: YYYY-MM-DD HH:MM JST" — ロック取得（race防止用）
//   "済"                            — 成功
//   "エラー: 理由"                   — 失敗
//
// 「処理中:」「済」「エラー:」のいずれも次回 candidates 抽出時にスキップ対象。

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const MIN_SOURCE_ROW = 146;  // candidates.mjs と必ず一致させる

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...rest] = a.replace(/^--/, '').split('=');
    return [k, rest.join('=')];
  })
);

const { type, row, url, reason } = args;
let { status = url ? 'done' : null } = args;

if (!['feature', 'restaurant'].includes(type)) {
  console.error('❌ --type=feature or --type=restaurant');
  process.exit(1);
}
if (!row || isNaN(row)) {
  console.error('❌ --row=<行番号> 必要');
  process.exit(1);
}
if (Number(row) < MIN_SOURCE_ROW) {
  console.error(`❌ row ${row} は MIN_SOURCE_ROW=${MIN_SOURCE_ROW} 未満。書き戻し拒否（旧案件保護）`);
  process.exit(1);
}
if (!status) {
  console.error('❌ --status=done|processing|error のいずれか、もしくは --url=... を指定');
  process.exit(1);
}
if (!['done', 'processing', 'error'].includes(status)) {
  console.error(`❌ --status は done | processing | error。受け取った値: ${status}`);
  process.exit(1);
}
if (status === 'done' && !url) {
  console.error('❌ --status=done では --url=<生成URL> 必須');
  process.exit(1);
}
if (status === 'error' && !reason) {
  console.error('❌ --status=error では --reason="..." 必須');
  process.exit(1);
}

const doneCol = type === 'feature' ? 'W' : 'Y';
const urlCol  = type === 'feature' ? 'X' : 'Z';

// セルインジェクション防止: 先頭が = + - @ なら ' を前置
const sanitizeCell = (s) => {
  const v = String(s);
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
};
// HYPERLINK 関数内の " エスケープ
const escapeQuote = (s) => String(s).replace(/"/g, '""');

let updates;
if (status === 'done') {
  updates = [
    { range: `詰めOKリスト!${doneCol}${row}`, values: [['済']] },
    { range: `詰めOKリスト!${urlCol}${row}`, values: [[`=HYPERLINK("${escapeQuote(url)}","${escapeQuote(url)}")`]] },
  ];
} else if (status === 'processing') {
  // ロック取得: JST 時刻を入れて競合の証跡を残す
  const jst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16);
  updates = [
    { range: `詰めOKリスト!${doneCol}${row}`, values: [[`処理中: ${jst} JST`]] },
  ];
} else {
  // エラー時はステータス列のみ
  updates = [
    { range: `詰めOKリスト!${doneCol}${row}`, values: [[sanitizeCell(`エラー: ${reason}`)]] },
  ];
}

try {
  const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
  });

  if (status === 'done') {
    console.log(`✅ row ${row} ${type}: ${doneCol}=済, ${urlCol}=${url}`);
  } else if (status === 'processing') {
    console.log(`🔒 row ${row} ${type}: ${doneCol}=処理中ロック取得`);
  } else {
    console.log(`⚠️  row ${row} ${type}: ${doneCol}=エラー: ${reason}`);
  }
} catch (e) {
  console.error(`❌ Sheets API 書き戻し失敗 (row ${row} ${type} status=${status}): ${e.message}`);
  process.exit(2);
}
