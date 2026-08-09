// backup-view-wx.json から 詰めOKリストの W/X 列を元に戻す
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { SHEET_ID, VIEW_SHEET } from '../scripts/sheets-config.mjs';

const bak = JSON.parse(readFileSync('automation/backup-view-wx.json', 'utf-8'));
const rows = bak.values;
// 1000行ぶんの矩形に整える（欠けている行は空で埋める）
const grid = [];
for (let i = 0; i < 1000; i++) {
  const r = rows[i] || [];
  grid.push([r[0] ?? '', r[1] ?? '']);
}
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: `${VIEW_SHEET}!W1:X1000`,
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: grid },
});
console.log(`✅ ${VIEW_SHEET} の W1:X1000 を ${bak.savedAt} 時点の内容に戻しました`);
