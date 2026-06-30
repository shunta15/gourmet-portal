// 詰めOKリストのrow 2-218にある全店舗を ledger.names に登録する。
// これで自動生成パイプラインは row 219以降の新規分だけを候補にする。
// ユーザー指示「219行目から新たに作成」を実現するため。
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { loadLedger, saveLedger, addEntry, nameKey } from '../scripts/ledger.mjs';
const sa = JSON.parse(readFileSync('automation/secrets/sa.json', 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

// 詰めOKリストのA2:D218を読む (D列=店名)
const r = await sheets.spreadsheets.values.get({
  spreadsheetId: '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk',
  range: '詰めOKリスト!A2:D218',
  valueRenderOption: 'FORMATTED_VALUE',
});
const rows = r.data.values || [];
console.log(`詰めOKリスト row 2-218: ${rows.length}行取得`);

const led = loadLedger();
const beforeNames = Object.keys(led.names).length;
let added = 0;
let skipped = 0;
const newlyAdded = [];
for (let i = 0; i < rows.length; i++) {
  const row = i + 2; // スプシ実行番号
  const name = ((rows[i] || [])[3] || '').toString().trim();
  if (!name) continue;
  const k = nameKey(name);
  if (led.names[k]) { skipped++; continue; }
  addEntry(led, {
    name,
    articleId: `skip-row${row}`,
    url: `[手動スキップ:詰めOKリスト row ${row}]`,
  });
  added++;
  if (newlyAdded.length < 10) newlyAdded.push(`row ${row}: ${name}`);
}
saveLedger(led);
const afterNames = Object.keys(led.names).length;
console.log(`ledger.names: ${beforeNames} → ${afterNames} (新規追加 ${added} / 既登録スキップ ${skipped})`);
if (newlyAdded.length) {
  console.log('新規登録の先頭10件:');
  newlyAdded.forEach((x) => console.log('  ' + x));
}
