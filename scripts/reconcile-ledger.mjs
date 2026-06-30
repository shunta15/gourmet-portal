#!/usr/bin/env node
// 台帳の初期再構築（IMPORTRANGE 行ズレ問題の修復）
//
// やること:
//  1. lib/teleapo-features.ts の全記事ID（=生成済み店舗の確定リスト）を台帳の names に登録
//  2. スプシ「詰めOKリスト」の W=済 / X=feature URL の行を走査し、
//     - X の feature URL から「実際に生成された店名」を取り、names に登録
//     - その行の D列名 と X由来の店名が一致（=行が整合）し、J列に cid があれば cids に登録
//     - 一致しない（=行ズレ）行はレポートに出す（cid は新店のものなので信用しない）
//
// これで「店舗の固有ID(cid)・店名」基準の処理済み台帳が出来る。
// 以後 sheets-candidates*.mjs はこの台帳で重複判定するため、行がズレても破綻しない。

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadLedger, saveLedger, addEntry, cidFromUrl, nameKey, LEDGER_PATH } from './ledger.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const SHEET_NAME = '詰めOKリスト';

function norm(v) {
  if (v == null) return '';
  return String(v).replace(/^'+/, '').replace(/[　\s]+/g, ' ').trim();
}

// teleapo-features.ts の記事ID（id フィールド）を抽出
// ※ エントリキーのインデントは揃っていない場合があるので、各記事に必ずある
//    `id: "..."` フィールドから取る（POINT項目は id を持たないので混入しない）
function teleapoArticleIds() {
  const src = readFileSync(join(__dirname, '..', 'lib', 'teleapo-features.ts'), 'utf-8');
  const ids = [];
  const re = /^\s*id:\s*"([^"]+)"\s*,/gm;
  let m;
  while ((m = re.exec(src))) ids.push(m[1]);
  return [...new Set(ids)];
}

const led = loadLedger();

// 1) 生成済み記事ID（=生成済み店舗の確定リスト）→ names
const ids = teleapoArticleIds();
const idByKey = new Map();           // nameKey(articleId) -> articleId
for (const id of ids) {
  addEntry(led, { name: id, articleId: id, url: `https://machinowa.tokyo/feature/${id}` });
  idByKey.set(nameKey(id), id);
}
console.log(`📚 teleapo-features.ts の記事ID: ${ids.length}件を names に登録`);

// 2) スプシ走査: 「現在その行にいる店(D列)が生成済み記事IDと一致」したら、その行の J列 cid を回収
//    W/X列は IMPORTRANGE 行ズレで信用できないため使わない。D列名 ↔ 記事ID で照合する。
const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${SHEET_NAME}!A2:Z`,
  valueRenderOption: 'FORMATTED_VALUE',
});
const rows = res.data.values || [];
const IDX = { NAME: 3, URL: 9 };
// 空応答ガード: 詰めOKリストはQUERYビューでGoogle API 再計算中の空応答を返すことがある。
// 100行未満なら3秒待ってリトライ。それでもダメなら台帳破壊を避けて続行(警告のみ)。
if (rows.length < 100) {
  process.stderr.write(`⚠️  Sheets API が ${rows.length} 行しか返さなかった(QUERYビュー再計算中?)。3秒後にリトライ\n`);
  await new Promise((r) => setTimeout(r, 3000));
  const retry = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${SHEET_NAME}!A2:Z`, valueRenderOption: 'FORMATTED_VALUE' });
  const retryRows = retry.data.values || [];
  if (retryRows.length > rows.length) {
    process.stderr.write(`✅ リトライで ${retryRows.length} 行取得\n`);
    rows.length = 0; rows.push(...retryRows);
  } else if (retryRows.length < 100) {
    process.stderr.write(`❌ リトライ後も ${retryRows.length} 行。台帳の破壊を避けて既存台帳を維持(再構築スキップ)\n`);
    process.exit(0);
  }
}

let cidRecovered = 0;
const matchedKeys = new Set();

const allRows = rows.map((r, i) => ({ dName: norm((r || [])[IDX.NAME]), jUrl: norm((r || [])[IDX.URL]) }));

// (a) 完全一致での cid 回収
for (const { dName, jUrl } of allRows) {
  if (!dName) continue;
  const nk = nameKey(dName);
  if (!idByKey.has(nk)) continue;
  matchedKeys.add(nk);
  const cid = cidFromUrl(jUrl);
  if (cid) {
    addEntry(led, { cid, name: dName, articleId: idByKey.get(nk), url: `https://machinowa.tokyo/feature/${idByKey.get(nk)}` });
    cidRecovered++;
  }
}

// (b) 表記揺れ吸収: 未マッチの記事IDを、D列が「記事IDで始まる/記事IDを含む」行と照合し
//     その行のD列キーをエイリアスとして names に登録（＋cid回収）。誤マッチ防止に3文字以上限定。
let aliasAdded = 0;
for (const id of ids) {
  const idk = nameKey(id);
  if (matchedKeys.has(idk)) continue;
  if (idk.length < 3) continue;
  for (const { dName, jUrl } of allRows) {
    if (!dName) continue;
    const dk = nameKey(dName);
    if (dk === idk) continue;
    if (dk.startsWith(idk) || dk.includes(idk)) {
      addEntry(led, { name: dName, articleId: id, url: `https://machinowa.tokyo/feature/${id}` });
      const cid = cidFromUrl(jUrl);
      if (cid) addEntry(led, { cid, name: dName, articleId: id, url: `https://machinowa.tokyo/feature/${id}` });
      matchedKeys.add(idk);
      aliasAdded++;
      break;
    }
  }
}
if (aliasAdded > 0) console.log(`📚 表記揺れエイリアス: ${aliasAdded}件を追加登録`);

saveLedger(led);

// cid を回収できなかった生成済み記事（現在シートに居ない or cid無しURL）
const noCid = ids.filter(id => !matchedKeys.has(nameKey(id)));

console.log(`📚 スプシ照合: 生成済み店をシート上で ${matchedKeys.size}/${ids.length}件 発見 / cid 回収 ${cidRecovered}件`);
console.log(`📚 台帳合計: cid ${Object.keys(led.cids).length}件 / 店名キー ${Object.keys(led.names).length}件`);
console.log(`📄 保存先: ${LEDGER_PATH}`);
console.log('');
if (noCid.length > 0) {
  console.log(`ℹ️  cid 未回収の生成済み記事 ${noCid.length}件（店名キーで重複防止は機能。cidは今後の生成時に記録される）:`);
  console.log(`    ${noCid.slice(0, 20).join(' / ')}${noCid.length > 20 ? ' ...' : ''}`);
}
