#!/usr/bin/env node
// スプシの W列(済)/X列(URL) を台帳に合わせて再同期する
//
// 背景: IMPORTRANGE で D列(店名)/J列(Maps URL)が動的に入れ替わるため、
//   生成時に行番号で書いた「済」「URL」が、行ズレで別の店の行に取り残される。
//   → 生成済みの店なのに W/X が空に見え、「記事できてない」ように見える。
// 対策: 各行の「今いる店」が台帳(cid・店名)で生成済みなら、その行の W=済 / X=URL を
//   貼り直す。行がどこにズレても、今の位置に正しい済/URLが付く。
//
// 🚨 2026-08-04 事故と対策:
//   旧実装は「詰めOKリスト」= QUERYビュー を読み、**ビューの行番号で W/X を書いていた**。
//   ビューはQUERYなので詰めOK行が1件増えるだけで全行が下にズレるが、手動列のW/Xは
//   その場に残る。結果、8/4に「定食屋 ふくろう」が増えた瞬間に以降の行が総ズレし、
//   「定食屋 ふくろう」の行に「ヌーラNulla」の記事URLが表示された（＝重複記事に見える）。
//   → 読み書きとも「トスアップ元シート」本体のみを対象にする。本体の行番号は不動。
//   ビューの W/X には一切書かない。
//
// 使い方: node scripts/sheets-sync-status.mjs

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadLedger, cidFromUrl, nameKey } from './ledger.mjs';
import { SHEET_ID, BODY_SHEET, VIEW_SHEET, IDX, FEATURE_TRIGGER, MIN_SOURCE_ROW } from './sheets-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
// 書き込み先は本体のみ。ビュー(詰めOKリスト)には絶対に書かない。
const SHEET_NAME = BODY_SHEET;

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
  const p = norm(r[IDX.STATUS]);
  const w = norm(r[IDX.W]);
  if (p !== FEATURE_TRIGGER) continue;
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

const DRY = process.argv.includes('--dry');

if (updates.length === 0) {
  console.log('✅ 本体は同期の必要なし（すべての生成済み店に済/URLが付いている）');
} else if (DRY) {
  console.log(`[dry] 本体 ${synced}行に書き込む予定（実際には書きません）:`);
  updates.forEach((u) => console.log(`  ${u.range} = ${String(u.values[0][0]).slice(0, 70)}`));
} else {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
  });
  console.log(`✅ 本体 ${synced}行を再同期（生成済みの店に 済 + URL を貼り直し）`);
}

// ══════════════════════════════════════════════════════════════
// 【2026-08-27 廃止】詰めOKリスト（ビュー）の W/X 再構築処理
//
// かつてビューの W/X は手動列だったため、毎回ここで作り直していた。
// 現在ビューの表示列は S(済) / T(表示用URL) / U(コピー用URL) の3列で、
// いずれも「自分の行の $A列(顧客管理ID)で記事台帳を引く数式」になっており、
// 行がどう並び替わっても自動で正しくなる。人もbotも書く必要がない。
//
// この処理を残していたため、毎朝の実行で W/X 列が復活し、
// 「同じ内容の列が二重に並ぶ」「片方だけズレている」状態を再生産していた
// （2026-08-27 にユーザーが発見）。よってビューへの書き込みは完全に削除した。
//
// ビュー側の維持は automation/sync-article-ledger.mjs が担当する。
// ここから先はビューに一切書き込まない。
// ══════════════════════════════════════════════════════════════
console.log('ℹ️  ビュー(詰めOKリスト)への書き込みは廃止済み。S/T/U の数式が自動で追随します。');
