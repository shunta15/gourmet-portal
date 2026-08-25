import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { loadLedger, isGenerated, nameKey } from '../scripts/ledger.mjs';
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const res = await sheets.spreadsheets.values.get({ spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk', range: 'トスアップ元シート!A2:Z', valueRenderOption: 'FORMATTED_VALUE' });
const rows = res.data.values || [];
const led = loadLedger();
const normalize = (v) => v == null ? '' : String(v).replace(/^'+/, '').replace(/[　\s]+/g, ' ').trim();
let counts = { tot: 0, belowMin: 0, emptyNameUrl: 0, notTsumeOK: 0, generated: 0, badStatus: 0, cand: 0 };
let row473 = null;
for (let i = 0; i < rows.length; i++) {
  const r = rows[i] || [];
  const name = normalize(r[3]);
  const url = normalize(r[9]);
  const p = normalize(r[15]);
  const sourceRow = i + 2;
  counts.tot++;
  if (sourceRow === 473) row473 = { name, url, p, w: normalize(r[22]) };
  if (sourceRow < 175) { counts.belowMin++; continue; }
  if (!name && !url) { counts.emptyNameUrl++; continue; }
  if (p !== '詰めOK') { counts.notTsumeOK++; continue; }
  if (isGenerated(led, url, name)) { counts.generated++; continue; }
  const w = normalize(r[22]);
  if (w.startsWith('処理中') || w.startsWith('永久エラー') || w.startsWith('エラー')) { counts.badStatus++; continue; }
  counts.cand++;
}
console.log('行統計:', counts);
console.log('\nrow 473 (L\\\'HEURE BLEUE):', row473);
console.log('  nameKey:', nameKey(row473?.name));
console.log('  ledger.namesに存在:', !!led.names[nameKey(row473?.name)]);
console.log('  isGenerated:', isGenerated(led, row473?.url, row473?.name));
