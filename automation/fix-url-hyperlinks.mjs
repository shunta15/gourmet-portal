// X列(特集記事_URL)/Z列(店舗紹介_URL)の素のURL文字列を、クリック可能な HYPERLINK 式に変換する。
// 日本語を含むURLは Google スプレッドシートが自動リンク化しないため、
// リンク先はパーセントエンコード済みURL、表示は読みやすい生URL、という形にする。
// 使い方: node automation/fix-url-hyperlinks.mjs [--dry]
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { SHEET_ID, BODY_SHEET, VIEW_SHEET } from '../scripts/sheets-config.mjs';

const DRY = process.argv.includes('--dry');

/** https://machinowa.tokyo/feature/日本語 → パス部分だけエンコード */
function encodeUrl(raw) {
  try {
    const u = new URL(raw);
    // pathname は既にエンコード済みで返るので、そのまま組み立てれば良い
    return u.origin + u.pathname + u.search + u.hash;
  } catch {
    return raw;
  }
}
const esc = (s) => String(s).replace(/"/g, '""');

function toFormula(raw) {
  const encoded = encodeUrl(raw);
  return `=HYPERLINK("${esc(encoded)}","${esc(raw)}")`;
}

const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: [DRY ? 'https://www.googleapis.com/auth/spreadsheets.readonly' : 'https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

let totalChanged = 0;
let skippedOrphan = 0;
for (const sheetName of [VIEW_SHEET, BODY_SHEET]) {
  // 生きている行の判定用に A列(顧客管理ID) を読む。
  // 旧シート時代に直書きされた W/X の残骸は A列が空なので、触らずに残す。
  const idRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A2:A`,
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const ids = (idRes.data.values || []).map((r) => String(r[0] || '').trim());

  for (const col of ['X', 'Z']) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!${col}2:${col}`,
      valueRenderOption: 'FORMULA',
    });
    const rows = res.data.values || [];
    const data = [];
    for (let i = 0; i < rows.length; i++) {
      const v = String((rows[i] || [])[0] || '').trim();
      if (!v) continue;
      if (v.startsWith('=')) continue;                 // 既に式ならそのまま
      if (!/^https?:\/\//i.test(v)) continue;          // URLでないものは触らない
      if (!ids[i]) { skippedOrphan++; continue; }      // 顧客管理IDが無い＝旧データの孤児セル
      const row = i + 2;
      data.push({ range: `${sheetName}!${col}${row}`, values: [[toFormula(v)]] });
    }
    if (!data.length) { console.log(`  ${sheetName}!${col}: 変換対象なし`); continue; }
    console.log(`  ${sheetName}!${col}: ${data.length}件を HYPERLINK 式に変換`);
    if (data.length <= 3) data.forEach((d) => console.log(`     ${d.range} ${d.values[0][0].slice(0, 100)}`));
    else console.log(`     例) ${data[0].range} ${data[0].values[0][0].slice(0, 100)}`);
    totalChanged += data.length;
    if (!DRY) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { valueInputOption: 'USER_ENTERED', data },
      });
    }
  }
}
console.log(DRY ? `\n--dry: 合計 ${totalChanged}件が対象（書き込みなし）` : `\n✅ 合計 ${totalChanged}件を変換`);
console.log(`（顧客管理IDが無い旧データの孤児セル ${skippedOrphan}件は対象外として温存）`);
