// 生成済み記事のURLをスプシに書き戻す（本体＝行番号 / 詰めOKビュー＝顧客管理IDで照合）
// 使い方: node automation/writeback-batch.mjs [--dry]
//   automation/applied-urls.json（articleId,url）と候補JSON（sourceRow,id,name）を突き合わせる
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { SHEET_ID, BODY_SHEET, VIEW_SHEET, IDX } from '../scripts/sheets-config.mjs';
import { loadLedger, saveLedger, addEntry, nameKey } from '../scripts/ledger.mjs';

const DRY = process.argv.includes('--dry');
const applied = JSON.parse(readFileSync('automation/applied-urls.json', 'utf-8'));
const cands = JSON.parse(readFileSync('automation/candidates-snapshot.json', 'utf-8')).feature;

// 照合用の正規化:
//  1) ラテン文字のアクセントを除去（É→E）。NFD→結合記号除去→NFC で日本語の濁点は保持する
//     （日本語の濁点は U+3099/309A で ̀-ͯ の範囲外なので壊れない）
//  2) 文字・数字以外（記号・括弧・空白・『』・中黒・ハイフン等）をすべて除去
const norm = (s) =>
  String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

// articleId ← 店舗名 の対応を作る（articleId は店舗名から記号除去したもの）
// 🚨 中間一致（includes）は使わない。記事ID "OWL" が "SEAFOODBOWL SHOP IN TANASHI" に
//    誤マッチして別店舗の行に書き込む事故が起きた（2026-08-02）。前方一致のみ・4文字以上に限定し、
//    候補が複数ある曖昧なケースは書き込まずに警告する。
function findRow(articleId) {
  const ak = norm(articleId);
  const exact = cands.filter((c) => norm(c.name) === ak);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;
  const pre = cands.filter((c) => {
    const ck = norm(c.name);
    if (Math.min(ck.length, ak.length) < 4) return false;
    return ck.startsWith(ak) || ak.startsWith(ck);
  });
  return pre.length === 1 ? pre[0] : null;
}

const pairs = [];
for (const a of applied) {
  const hit = findRow(a.articleId);
  if (!hit) { console.log(`⚠️  候補行が一意に決まらない（書き込みません）: ${a.articleId}`); continue; }
  pairs.push({ ...a, sourceRow: hit.sourceRow, custId: hit.id, name: hit.name });
}
console.log(`対応づけ: ${pairs.length}/${applied.length}件`);
pairs.forEach((p) => console.log(`  本体row${p.sourceRow} [${p.custId}] ${p.name} → ${p.url}`));
if (DRY) { console.log('\n--dry のため書き込みはしません'); process.exit(0); }
if (!pairs.length) process.exit(0);

// 日本語を含むURLは Google スプレッドシートが自動リンク化しないため、必ず HYPERLINK 式で書く。
// リンク先＝パーセントエンコード済みURL / 表示＝読みやすい生URL。
function urlCell(raw) {
  let encoded = raw;
  try { const u = new URL(raw); encoded = u.origin + u.pathname + u.search + u.hash; } catch {}
  const esc = (s) => String(s).replace(/"/g, '""');
  return `=HYPERLINK("${esc(encoded)}","${esc(raw)}")`;
}

const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

// 1) 本体（行番号で確実に）
const bodyData = pairs.map((p) => ({
  range: `${BODY_SHEET}!W${p.sourceRow}:X${p.sourceRow}`,
  values: [['済', urlCell(p.url)]],
}));
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SHEET_ID,
  requestBody: { valueInputOption: 'USER_ENTERED', data: bodyData },
});
console.log(`✅ 本体 ${BODY_SHEET} に ${bodyData.length}行 書き戻し`);

// 2) 詰めOKビュー（顧客管理IDで現在行を特定してから書く＝行ズレ耐性）
const view = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID, range: `${VIEW_SHEET}!A2:A`, valueRenderOption: 'FORMATTED_VALUE',
});
const viewIds = (view.data.values || []).map((r) => String(r[0] || '').trim());
const viewData = [];
for (const p of pairs) {
  const i = viewIds.indexOf(String(p.custId).trim());
  if (i < 0) { console.log(`⚠️  ビューに顧客管理ID ${p.custId} が無い`); continue; }
  const row = i + 2;
  viewData.push({ range: `${VIEW_SHEET}!W${row}:X${row}`, values: [['済', urlCell(p.url)]] });
}
if (viewData.length) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data: viewData },
  });
  console.log(`✅ ビュー ${VIEW_SHEET} に ${viewData.length}行 書き戻し（顧客管理ID照合）`);
}

// 3) ledger 登録（重複生成防止）
const led = loadLedger();
for (const p of pairs) {
  addEntry(led, { name: p.name, articleId: p.articleId, url: p.url });
}
saveLedger(led);
console.log(`✅ ledger に ${pairs.length}件 登録`);
