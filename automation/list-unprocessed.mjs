// 詰めOK & W=空(未生成) で、Maps URLがある/ない を分類
import { google } from 'googleapis';
import { readFileSync } from 'fs';
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const r = await sheets.spreadsheets.values.get({ spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk', range: 'トスアップ元シート!A2:Z', valueRenderOption: 'FORMATTED_VALUE' });
const rows = r.data.values || [];
const withUrl = [], withoutUrl = [];
for (let i = 0; i < rows.length; i++) {
  const v = rows[i] || [];
  const row = i + 2;
  const name = (v[3] || '').toString().trim();
  const url = (v[9] || '').toString().trim();
  const p = (v[15] || '').toString().trim();
  const w = (v[22] || '').toString().trim();
  if (p !== '詰めOK') continue;
  if (w === '済') continue;
  if (!name) continue;
  if (url) withUrl.push({ row, name, url: url.slice(0, 60) });
  else withoutUrl.push({ row, name });
}
console.log(`=== 詰めOK & 未生成 ===`);
console.log(`Maps URLあり(自動化対象): ${withUrl.length} 件`);
console.log(`Maps URLなし(処理不能): ${withoutUrl.length} 件`);
console.log('\n=== Maps URLなし(担当者の入力待ち) ===');
withoutUrl.forEach((u) => console.log(`  row ${u.row}: ${u.name}`));
console.log('\n=== Maps URLあり(次回パイプライン実行で生成される予定) ===');
withUrl.slice(0, 20).forEach((u) => console.log(`  row ${u.row}: ${u.name}  ${u.url}`));
if (withUrl.length > 20) console.log(`  ...他 ${withUrl.length - 20} 件`);
