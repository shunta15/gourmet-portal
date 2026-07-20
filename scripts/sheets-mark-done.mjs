#!/usr/bin/env node
// トスアップ元シート（本体）の W/X (feature) または Y/Z (restaurant) に処理結果を書き込む
// 注意: 「詰めOKリスト」はトスアップ元シートのQUERYビューで、A〜V列が並び替わるとW,Xがズレる
//       問題があったため、必ず「本体」のトスアップ元シートに書き込む（行ズレ防止）
//
// 使い方:
//   ロック取得（処理開始時、空 or「処理中:」古い のみ上書き）:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=processing
//   成功（冪等: 既に「済」なら no-op）:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --url=https://...
//   エラー（自動日付付与・24時間後にリトライ対象）:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=error --reason="GBP取得失敗"
//   永久エラー（禁止語など、二度と試行しない）:
//     node scripts/sheets-mark-done.mjs --type=feature --row=146 --status=permanent_error --reason="禁止語含む"
//
// 列マッピング:
//   feature    → W=ステータス, X=URL（成功時のみ）
//   restaurant → Y=ステータス, Z=URL（成功時のみ）
//
// ステータス値:
//   "処理中: YYYY-MM-DD HH:MM JST" — 一時ロック
//   "済"                            — 成功（冪等保護対象）
//   "エラー: 理由 (YYYY-MM-DD)"      — 24時間後にリトライ対象
//   "永久エラー: 理由"               — 二度とリトライしない
//
// 冪等性:
//   - 既に「済」のセルは --force なしでは上書きしない
//   - 既に「永久エラー」のセルも --force なしでは上書きしない
//   - 「処理中」「エラー」「空」は上書き可能

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SHEET_ID, MIN_SOURCE_ROW } from './sheets-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
// SHEET_ID / MIN_SOURCE_ROW は scripts/sheets-config.mjs が単一情報源


const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...rest] = a.replace(/^--/, '').split('=');
    return [k, rest.join('=')];
  })
);

const { type, row, url, reason, force } = args;
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
  console.error(`❌ row ${row} は MIN_SOURCE_ROW=${MIN_SOURCE_ROW} 未満。書き戻し拒否`);
  process.exit(1);
}
if (!status) {
  console.error('❌ --status=done|processing|error|permanent_error または --url=... を指定');
  process.exit(1);
}
if (!['done', 'processing', 'error', 'permanent_error'].includes(status)) {
  console.error(`❌ --status は done|processing|error|permanent_error。受け取った値: ${status}`);
  process.exit(1);
}
if (status === 'done' && !url) {
  console.error('❌ --status=done では --url=<生成URL> 必須');
  process.exit(1);
}
if ((status === 'error' || status === 'permanent_error') && !reason) {
  console.error('❌ エラー時は --reason="..." 必須');
  process.exit(1);
}

const doneCol = type === 'feature' ? 'W' : 'Y';
const urlCol  = type === 'feature' ? 'X' : 'Z';

// セルインジェクション防止
const sanitize = (s) => {
  const v = String(s);
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
};
const escapeQuote = (s) => String(s).replace(/"/g, '""');
const jstNow = () => {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().replace('T', ' ').slice(0, 16);
};
const jstDateOnly = () => {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
};

try {
  const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // 冪等チェック: 現在のセル値を読み取る
  const cur = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `トスアップ元シート!${doneCol}${row}`,
  });
  const currentVal = (cur.data.values?.[0]?.[0] || '').toString().trim();

  // 上書き禁止条件（--force で迂回可）
  if (!force) {
    if (currentVal === '済') {
      console.log(`ℹ️  row ${row} ${type}: 既に「済」のため no-op (冪等保護)`);
      process.exit(0);
    }
    if (currentVal.startsWith('永久エラー')) {
      console.log(`ℹ️  row ${row} ${type}: 既に「永久エラー」のため no-op (人手解除待ち)`);
      process.exit(0);
    }
  }

  let updates;
  if (status === 'done') {
    updates = [
      { range: `トスアップ元シート!${doneCol}${row}`, values: [['済']] },
      { range: `トスアップ元シート!${urlCol}${row}`, values: [[`=HYPERLINK("${escapeQuote(url)}","${escapeQuote(url)}")`]] },
    ];
  } else if (status === 'processing') {
    updates = [
      { range: `トスアップ元シート!${doneCol}${row}`, values: [[`処理中: ${jstNow()} JST`]] },
    ];
  } else if (status === 'permanent_error') {
    updates = [
      { range: `トスアップ元シート!${doneCol}${row}`, values: [[sanitize(`永久エラー: ${reason}`)]] },
    ];
  } else {
    // error（24h後リトライ対象。日付付与）
    updates = [
      { range: `トスアップ元シート!${doneCol}${row}`, values: [[sanitize(`エラー: ${reason} (${jstDateOnly()})`)]] },
    ];
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
  });

  if (status === 'done') {
    console.log(`✅ row ${row} ${type}: ${doneCol}=済, ${urlCol}=${url}`);
  } else if (status === 'processing') {
    console.log(`🔒 row ${row} ${type}: ${doneCol}=処理中ロック取得`);
  } else if (status === 'permanent_error') {
    console.log(`⛔ row ${row} ${type}: ${doneCol}=永久エラー: ${reason}`);
  } else {
    console.log(`⚠️  row ${row} ${type}: ${doneCol}=エラー: ${reason} (${jstDateOnly()}) ※24h後リトライ`);
  }
} catch (e) {
  console.error(`❌ Sheets API 書き戻し失敗 (row ${row} ${type} status=${status}): ${e.message}`);
  process.exit(2);
}
