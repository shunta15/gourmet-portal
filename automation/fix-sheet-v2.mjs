// 行ズレ修復v2: 全行スキャン+記事IDの部分一致照合(長いID優先)で抜け店舗も救出
// 旧版では「久留米 和洋/創作酒場 晩餐-Bansun-」等の長い表記がID「晩餐-Bansun」にマッチせず抜けていた
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SHEET_ID = '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';
const APPLY = process.argv.includes('--apply');
const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

const mod = await import('../lib/teleapo-features.ts');
const ARTS = mod.TELEAPO_FEATURE_ARTICLES;
const ids = Object.keys(ARTS);

// 強化版norm: 全角括弧/半角括弧/スラッシュ/中点/カッコ内容も除去
const norm = (s) => (s || '').toString()
  .replace(/^'+/, '')
  .replace(/[（(].*?[）)]/g, '')  // カッコ内除去（補足表記を消す）
  .replace(/[　\s・。、,.\-\/／｜|]+/g, '')
  .toLowerCase().trim();

// 完全一致マップ + 部分一致用ソート済みリスト
const idByNorm = new Map();
for (const id of ids) idByNorm.set(norm(id), id);
// ledgerのcidsから元名前も登録（より正確な照合）
const led = JSON.parse(readFileSync(join(__dirname, 'generated-ledger.json'), 'utf-8'));
for (const k in (led.cids || {})) {
  const e = led.cids[k];
  if (e?.name && e?.articleId) {
    const nk = norm(e.name);
    if (nk && !idByNorm.has(nk)) idByNorm.set(nk, e.articleId);
  }
}
// 部分一致用: norm(id)を長さ降順
const sortedNormIds = [...new Set(ids.map((id) => ({ id, n: norm(id) })).filter((x) => x.n.length >= 3))]
  .sort((a, b) => b.n.length - a.n.length);

function matchId(name) {
  const n = norm(name);
  if (!n) return null;
  // 1. 完全一致
  if (idByNorm.has(n)) return idByNorm.get(n);
  // 2. 部分一致(長いID優先, 最低3文字)
  for (const { id, n: nid } of sortedNormIds) {
    if (n.includes(nid)) return id;
  }
  return null;
}

// 全行スキャン
const src = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'トスアップ元シート!A2:Z', valueRenderOption: 'FORMATTED_VALUE' });
const rows = src.data.values || [];
const data = [];
const writes = [];
let already = 0;
for (let i = 0; i < rows.length; i++) {
  const r = rows[i] || [];
  const row = i + 2;
  const name = (r[3] || '').toString().trim();
  if (!name) continue;
  const id = matchId(name);
  if (!id) continue;
  const url = `https://machinowa.tokyo/feature/${id}`;
  const curW = (r[22] || '').toString().trim();
  const curX = (r[23] || '').toString().trim();
  if (curW === '済' && curX.includes(id)) { already++; continue; }
  writes.push({ row, name, id, url });
  data.push({ range: `トスアップ元シート!W${row}`, values: [['済']] });
  data.push({ range: `トスアップ元シート!X${row}`, values: [[`=HYPERLINK("${url}","${url}")`]] });
}
console.log(`書き戻し対象: ${writes.length} 行 / 既存正常: ${already} 行`);
if (writes.length) {
  console.log('\n=== 追加で救出される行(先頭30) ===');
  writes.slice(0, 30).forEach((w) => console.log(`  row ${w.row}: ${w.name} → /feature/${w.id}`));
}
if (!APPLY) { console.log('\n--- dry-run。--apply で実行 ---'); process.exit(0); }
if (data.length) {
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { valueInputOption: 'USER_ENTERED', data } });
  console.log(`\n✅ ${writes.length} 行書き戻し完了`);
}
