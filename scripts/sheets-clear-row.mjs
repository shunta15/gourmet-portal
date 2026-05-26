// 詰めOKリストの指定行の W 列（feature 状況）を空にする
// 使い方: node scripts/sheets-clear-row.mjs --rows=149,150,151,152,153,154
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...rest] = a.replace(/^--/, '').split('=');
    return [k, rest.join('=')];
  })
);
const rows = (args.rows || '').split(',').map(r => parseInt(r, 10)).filter(Boolean);
if (rows.length === 0) {
  console.error("Usage: node scripts/sheets-clear-row.mjs --rows=149,150,151");
  process.exit(2);
}

const credentials = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

const updates = rows.map(r => ({
  range: `詰めOKリスト!W${r}`,
  values: [['']],
}));
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SHEET_ID,
  requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
});
console.log(`✅ Cleared W column for rows: ${rows.join(', ')}`);
