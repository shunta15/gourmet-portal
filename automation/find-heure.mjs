import { google } from 'googleapis';
import { readFileSync } from 'fs';
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
console.log('=== トスアップ元シート で HEURE/BLEUE を検索 ===');
const r = await sheets.spreadsheets.values.get({ spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk', range: 'トスアップ元シート!A2:Z', valueRenderOption: 'FORMATTED_VALUE' });
const rows = r.data.values || [];
let found = 0;
for (let i = 0; i < rows.length; i++) {
  const v = rows[i] || [];
  const name = (v[3] || '').toString();
  if (/HEURE|BLEUE|ブルー|ルアー/i.test(name)) {
    found++;
    console.log(`  row ${i + 2}:`);
    console.log(`    D(店名)="${name}"`);
    console.log(`    J(URL)="${(v[9] || '').slice(0, 80)}"`);
    console.log(`    P(詰めステ)="${v[15] || ''}"`);
    console.log(`    Q(担当)="${v[16] || ''}"`);
    console.log(`    U(商談)="${v[20] || ''}"`);
    console.log(`    W(済)="${v[22] || ''}"`);
    console.log(`    X(URL)="${(v[23] || '').slice(0, 80)}"`);
  }
}
console.log(`計 ${found} 件`);
