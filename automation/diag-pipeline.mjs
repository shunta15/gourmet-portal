// パイプラインの「未処理0件」「スプシ照合0/79件」の原因を診断
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { loadLedger, isGenerated, nameKey } from '../scripts/ledger.mjs';
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

const led = loadLedger();
console.log('=== ledger 件数 ===');
console.log('  cids:', Object.keys(led.cids || {}).length);
console.log('  names:', Object.keys(led.names || {}).length);

// トスアップ元シートを全部読む
const r = await sheets.spreadsheets.values.get({ spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk', range: 'トスアップ元シート!A2:Z', valueRenderOption: 'FORMATTED_VALUE' });
const rows = r.data.values || [];

const stats = { tot: 0, belowMin: 0, emptyNameUrl: 0, notTsumeOK: 0, generated: 0, processing: 0, error_cooldown: 0, perm_error: 0, candidate: 0 };
const candidates = [];
const generatedShown = [];

const normalize = (v) => v == null ? '' : String(v).replace(/^'+/, '').replace(/[　\s]+/g, ' ').trim();
const MIN = 175;
const classify = (raw) => {
  const v = normalize(raw);
  if (!v) return 'empty';
  if (v === '済') return 'done';
  if (v.startsWith('永久エラー')) return 'permanent_error';
  if (v.startsWith('処理中')) return 'processing';
  if (v.startsWith('エラー')) return 'error_cooldown';
  return 'unknown';
};

for (let i = 0; i < rows.length; i++) {
  const row = rows[i] || [];
  const sourceRow = i + 2;
  const name = normalize(row[3]);
  const url = normalize(row[9]);
  const p = normalize(row[15]);
  const w = normalize(row[22]);
  stats.tot++;
  if (sourceRow < MIN) { stats.belowMin++; continue; }
  if (!name && !url) { stats.emptyNameUrl++; continue; }
  if (p !== '詰めOK') { stats.notTsumeOK++; continue; }
  const gen = isGenerated(led, url, name);
  if (gen) { stats.generated++; if (generatedShown.length < 5) generatedShown.push(`${sourceRow}: ${name}`); continue; }
  const s = classify(w);
  if (s === 'processing') { stats.processing++; continue; }
  if (s === 'permanent_error') { stats.perm_error++; continue; }
  if (s === 'error_cooldown') { stats.error_cooldown++; continue; }
  stats.candidate++;
  if (candidates.length < 5) candidates.push(`${sourceRow}: ${name} | url=${url.slice(0, 40)} | W=${w.slice(0, 20)}`);
}
console.log('\n=== トスアップ元シート 統計 ===');
for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`);
console.log('\n=== 生成済み判定された行(先頭5) ===');
generatedShown.forEach((x) => console.log('  ' + x));
console.log('\n=== 候補に入る行(先頭5) ===');
candidates.forEach((x) => console.log('  ' + x));
console.log('\n=== reconcile-ledger.mjs/store sheet照合用シート名確認 ===');
// reconcile-ledger.mjsはどのシートを読んでいるか
const reconc = readFileSync('scripts/reconcile-ledger.mjs', 'utf-8');
const sheetNames = [...reconc.matchAll(/(['"`])(トスアップ元シート|詰めOKリスト)['"`]/g)].map((m) => m[2]);
console.log('  reconcile-ledger.mjs 参照シート:', [...new Set(sheetNames)].join(', '));
