// 詰めOKリストの W/X 列の現状をバックアップする（復元できるようにするため）
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { SHEET_ID, VIEW_SHEET } from '../scripts/sheets-config.mjs';

const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID, range: `${VIEW_SHEET}!W1:X1000`, valueRenderOption: 'FORMULA',
});
const out = { sheet: VIEW_SHEET, range: 'W1:X1000', savedAt: new Date().toISOString(), values: res.data.values || [] };
const path = 'automation/backup-view-wx.json';
writeFileSync(path, JSON.stringify(out, null, 1));
console.log(`✅ ${path} に ${out.values.length}行を保存しました（W/X列の現状）`);
console.log(`   復元したい場合は node automation/restore-view-wx.mjs で戻せます`);
