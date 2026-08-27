// S/T列の行ズレを構造的に不可能にする
//  1. 「記事台帳」シート（顧客管理ID / 店舗名 / 記事ID）を作成・更新  ← 唯一の正
//  2. 詰めOKリストの S/T を「自分の行のA列(顧客管理ID)を引く数式」にする
//     → QUERYが並び替わっても各行は自分のIDを見るのでズレようがない
// 引数 --apply で実行
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { SHEET_ID } from '../scripts/sheets-config.mjs';

const APPLY = process.argv.includes('--apply');
const LEDGER = '記事台帳';
const FILL_TO = 400; // 将来の行増加ぶんまで数式を敷いておく

const sa = JSON.parse(readFileSync(new URL('./secrets/sa.json', import.meta.url), 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const s = google.sheets({ version: 'v4', auth: await auth.getClient() });
const R = async (r) => (await s.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: r })).data.values || [];

// --- 正データを作る: 本体の 顧客管理ID → 記事ID (cid照合優先) ---
const arts = new Set(Object.keys((await import('../lib/teleapo-features.ts')).TELEAPO_FEATURE_ARTICLES));
const ledgerJson = JSON.parse(readFileSync(new URL('./generated-ledger.json', import.meta.url), 'utf8'));
const byCid = new Map(Object.entries(ledgerJson.cids || {}).map(([c, e]) => [c, e.articleId]));
const norm = x => (x || '').toString().replace(/[&’'　\s・。、,.\-·『』「」（）()～~！]/g, '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const byName = new Map([...arts].map(id => [norm(id), id]));
for (const [k, e] of Object.entries(ledgerJson.names || {})) {
  const id = e && (e.articleId || e.id); const nk = norm(k);
  if (id && arts.has(id) && !byName.has(nk)) byName.set(nk, id);
}

const body = await R('トスアップ元シート!A1:Z');
const rows = [];
let viaCid = 0, viaName = 0, none = 0;
for (let i = 1; i < body.length; i++) {
  const r = body[i] || [];
  if ((r[16] || '').trim() !== '詰めOK') continue;
  const gid = (r[0] || '').trim(), name = (r[3] || '').trim();
  if (!gid || !name) continue;
  const cid = ((r[10] || '').match(/cid=(\d+)/) || [])[1];
  let id = cid && byCid.get(cid);
  if (id && !arts.has(id)) id = null;
  if (id) viaCid++; else { id = byName.get(norm(name)); if (id) viaName++; else none++; }
  // D列は「数式でないただの文字列」。ここが唯一、普通のコピペで貼れるURL。
  // 【厳守】表記は日本語のまま。パーセントエンコードしない（ユーザー指示・2026-08-28）
  if (id) rows.push([gid, name, id, `https://machinowa.tokyo/feature/${id}`]);
}
console.log(`台帳に載せる行: ${rows.length} (cid一致${viaCid} / 店名完全一致${viaName} / 記事なし${none}件は載せない)`);

const meta = await s.spreadsheets.get({ spreadsheetId: SHEET_ID });
const exists = meta.data.sheets.some(x => x.properties.title === LEDGER);
console.log(`「${LEDGER}」シート: ${exists ? '既存' : '新規作成する'}`);
console.log(`詰めOKリスト S2:T${FILL_TO} に数式を敷く`);

if (!APPLY) { console.log('\n--- dry-run。--apply で実行 ---'); process.exit(0); }

if (!exists) {
  await s.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [{ addSheet: { properties: { title: LEDGER } } }] } });
  console.log(`✅ 「${LEDGER}」シートを作成`);
}
await s.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `${LEDGER}!A:D` });
await s.spreadsheets.values.update({
  spreadsheetId: SHEET_ID, range: `${LEDGER}!A1`,
  // RAW = 数式として解釈させない。D列はただの文字列として入る
  valueInputOption: 'RAW',
  requestBody: { values: [['顧客管理ID', '店舗名', '記事ID', 'URL(コピペ用・関数なし)'], ...rows] },
});
console.log(`✅ ${LEDGER} に ${rows.length} 行を書き込み`);

// 詰めOKリスト S/T を数式化（各行が自分のA列を引く＝行ズレ不能）
const f = [];
for (let n = 2; n <= FILL_TO; n++) {
  f.push([
    `=IF($A${n}="","",IFERROR(IF(VLOOKUP($A${n},${LEDGER}!$A:$C,3,FALSE)="","","済"),""))`,
    `=IF($A${n}="","",IFERROR(HYPERLINK("https://machinowa.tokyo/feature/"&ENCODEURL(VLOOKUP($A${n},${LEDGER}!$A:$C,3,FALSE)),"https://machinowa.tokyo/feature/"&VLOOKUP($A${n},${LEDGER}!$A:$C,3,FALSE)),""))`,
  ]);
}
await s.spreadsheets.values.update({
  spreadsheetId: SHEET_ID, range: `詰めOKリスト!S2:T${FILL_TO}`,
  valueInputOption: 'USER_ENTERED', requestBody: { values: f },
});
// U列(旧ASCIIコピー用)は廃止。表記は日本語で統一するため役割が無くなった。
await s.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `詰めOKリスト!U1:U${FILL_TO}` });
console.log(`✅ 詰めOKリスト S/T を数式化（顧客管理IDで自動引き）／U列は廃止`);
