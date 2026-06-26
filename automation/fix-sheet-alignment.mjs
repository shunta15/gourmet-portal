// 行ズレ修復スクリプト
// 1. teleapo-features.ts の全 articleId を「正」とする
// 2. トスアップ元シート全行をスキャン、店名で照合
// 3. P列=詰めOK の本体行のW列に「済」、X列にHYPERLINKを書き戻し
// 4. 「詰めOKリスト」のW,X列(行2以降)をクリア（QUERYビュー側のズレた手動値を消す）
// 引数 --apply で実行、なしでdry-run
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const APPLY = process.argv.includes('--apply');

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

// 1. teleapo-features.ts から articleId 一覧取得
const mod = await import('../lib/teleapo-features.ts');
const ARTS = mod.TELEAPO_FEATURE_ARTICLES;
const ids = Object.keys(ARTS);
console.log(`記事数(teleapo-features.ts): ${ids.length} 件`);

// 2. 店名キーで正規化マップ作成（タイトルやID自体から推測する複数キー）
const norm = (s) => (s || '').toString().replace(/^'+/, '').replace(/[　\s・。、,.\-・·]+/g, '').toLowerCase().trim();
const idByNorm = new Map();
for (const id of ids) {
  idByNorm.set(norm(id), id);
  // titleからも引けるよう一応登録
  const t = ARTS[id]?.title || '';
  const sub = ARTS[id]?.subtitle || '';
  for (const c of [t, sub]) {
    const k = norm(c);
    if (k && !idByNorm.has(k)) idByNorm.set(k, id);
  }
}
// ledger.json の names も追加
try {
  const led = JSON.parse(readFileSync(join(__dirname, 'generated-ledger.json'), 'utf-8'));
  for (const obj of [led.cids || {}, led.names || {}]) {
    for (const k in obj) {
      const e = obj[k];
      if (e?.name && e?.articleId) {
        const nk = norm(e.name);
        if (nk && !idByNorm.has(nk)) idByNorm.set(nk, e.articleId);
      }
    }
  }
} catch {}
console.log(`照合キー: ${idByNorm.size} 件`);

// 3. トスアップ元シート全行取得
const src = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'トスアップ元シート!A2:Z', valueRenderOption: 'FORMATTED_VALUE' });
const rows = src.data.values || [];
console.log(`トスアップ元シート: ${rows.length} 行`);

// 4. P=詰めOK かつ 店名がledgerにある → 書き戻し対象
const writes = [];
const skipped = [];
const unmatched = [];
for (let i = 0; i < rows.length; i++) {
  const r = rows[i] || [];
  const rowNum = i + 2;
  const name = (r[3] || '').toString().trim();
  const p = (r[15] || '').toString().trim();
  const curW = (r[22] || '').toString().trim();
  const curX = (r[23] || '').toString().trim();
  if (p !== '詰めOK') continue;
  if (!name) continue;
  const id = idByNorm.get(norm(name));
  if (!id) { unmatched.push({ rowNum, name }); continue; }
  const url = `https://machinowa.tokyo/feature/${id}`;
  if (curW === '済' && curX.includes(id)) { skipped.push({ rowNum, name }); continue; }
  writes.push({ rowNum, name, id, url });
}
console.log(`書き戻し対象: ${writes.length} 件 / 既に正: ${skipped.length} 件 / 未生成(unmatched): ${unmatched.length} 件`);
if (writes.length) {
  console.log('\n=== 書き戻し対象（先頭20） ===');
  writes.slice(0, 20).forEach((w) => console.log(`  row ${w.rowNum}: ${w.name} → /feature/${w.id}`));
}
if (unmatched.length && unmatched.length <= 30) {
  console.log('\n=== 未生成(詰めOKだが台帳未登録) ===');
  unmatched.forEach((u) => console.log(`  row ${u.rowNum}: ${u.name}`));
}

if (!APPLY) {
  console.log('\n--- dry-run。--apply で実行 ---');
  process.exit(0);
}

// 5. トスアップ元シート本体に書き戻し
console.log('\n▼ トスアップ元シート 本体に書き戻し中...');
const data = writes.flatMap((w) => [
  { range: `トスアップ元シート!W${w.rowNum}`, values: [['済']] },
  { range: `トスアップ元シート!X${w.rowNum}`, values: [[`=HYPERLINK("${w.url}","${w.url}")`]] },
]);
if (data.length) {
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { valueInputOption: 'USER_ENTERED', data } });
  console.log(`✅ ${writes.length} 行に書き戻し完了`);
}

// 6. 詰めOKリストの W,X列クリア（QUERYビュー側のズレた手動値を消す）
console.log('\n▼ 「詰めOKリスト」 W,X列をクリア中...');
const qSheet = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: '詰めOKリスト!W2:X', valueRenderOption: 'FORMATTED_VALUE' });
const qRows = qSheet.data.values || [];
const lastQRow = qRows.length + 1;
await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `詰めOKリスト!W2:X${lastQRow}` });
console.log(`✅ W2:X${lastQRow} をクリア`);

// 7. 詰めOKリストのQUERY範囲をA:Xに拡張(本体W,Xも一緒にQUERYで表示するため)
console.log('\n▼ 「詰めOKリスト」 A1 QUERY範囲を A:V → A:X に拡張');
await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: '詰めOKリスト!A1',
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: [[`=QUERY('トスアップ元シート'!A:X,"SELECT * WHERE Col16='詰めOK'",1)`]] },
});
console.log('✅ QUERY範囲をA:Xに拡張');
console.log('\n=== 修復完了 ===');
