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
// 詰めOKリスト（QUERYビュー）の W/X を、顧客管理IDで本体から作り直す
//
// このビューは「詰めOKの店だけを一覧で見る」ために作られたシートなので、
// 表示が実態と食い違っていては存在意義がない。
// QUERY結果は詰めOKが1件増えるだけで全行が下にズレるが、手動列のW/Xは
// その場に残るため、放置すると必ずズレる（実際に28行ズレ・176行の残骸が発生した）。
// → 毎回、行番号ではなく顧客管理ID(A列)で本体と突き合わせて全面的に書き直す。
//   IDが無い行は空にする（残骸の掃除）。これで何行増減しても自ズレしない。
// ══════════════════════════════════════════════════════════════
const bodyById = new Map();
for (const r of rows) {
  const id = norm(r[IDX.ID]);
  if (id) bodyById.set(id, { w: norm(r[IDX.W]), x: norm(r[IDX.X]) });
}

const viewRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${VIEW_SHEET}!A1:X1000`,
  valueRenderOption: 'FORMATTED_VALUE',
});
const viewRows = viewRes.data.values || [];

// 1行目は見出しなので触らない。2行目以降を作り直す。
const grid = [];
let filled = 0, cleared = 0, changed = 0;
for (let i = 1; i < 1000; i++) {
  const r = viewRows[i] || [];
  const id = norm(r[IDX.ID]);
  const curW = norm(r[IDX.W]);
  const curX = norm(r[IDX.X]);
  let w = '', x = '';
  if (id && bodyById.has(id)) {
    const b = bodyById.get(id);
    w = b.w;
    // 本体のX列はHYPERLINK式なので、表示値からURLを取り出して式を組み直す
    const m = b.x.match(/https?:\/\/\S+/);
    if (m) x = `=HYPERLINK("${encodeURI(m[0]).replace(/"/g, '""')}","${m[0].replace(/"/g, '""')}")`;
    if (w || x) filled++;
  } else if (curW || curX) {
    cleared++;
  }
  if (curW !== w || (curX ? 1 : 0) !== (x ? 1 : 0)) changed++;
  grid.push([w, x]);
}

if (DRY) {
  console.log(`[dry] ${VIEW_SHEET}: ID一致で埋める ${filled}行 / 残骸を空にする ${cleared}行 （実際には書きません）`);
} else {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${VIEW_SHEET}!W2:X1000`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: grid },
  });
  console.log(`✅ ${VIEW_SHEET} を顧客管理IDで再構築（${filled}行に反映 / 残骸 ${cleared}行を消去）`);
}
