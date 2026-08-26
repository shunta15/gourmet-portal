#!/usr/bin/env node
// 成果物ベースの死活監視
//   「詰めOK なのに記事が存在しない行」を検出する。
//   集計値(未処理0件)は 24h クールダウンや済フラグの誤りで嘘をつくため、
//   スプシの状態ではなく "記事が実在するか" だけを見る。
//   gap があれば exit 1 + デスクトップ通知。
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { SHEET_ID, IDX, FEATURE_TRIGGER, BODY_SHEET } from './sheets-config.mjs';

const KEY = new URL('../automation/secrets/sa.json', import.meta.url);
const sa = JSON.parse(readFileSync(KEY, 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

const arts = new Set(Object.keys((await import('../lib/teleapo-features.ts')).TELEAPO_FEATURE_ARTICLES));
const led = JSON.parse(readFileSync(new URL('../automation/generated-ledger.json', import.meta.url), 'utf8'));
const byCid = new Map(Object.entries(led.cids || {}).map(([c, e]) => [c, e.articleId]));
const norm = x => (x || '').toString().replace(/[&’'　\s・。、,.\-·『』「」（）()～~！]/g, '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const byName = new Map([...arts].map(id => [norm(id), id]));
for (const [k, e] of Object.entries(led.names || {})) {
  const id = e && (e.articleId || e.id);
  if (id && arts.has(id) && !byName.has(norm(k))) byName.set(norm(k), id);
}

const rows = (await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID, range: `${BODY_SHEET}!A1:Z`,
})).data.values || [];

const gaps = [];
let total = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i] || [];
  if ((r[IDX.STATUS] || '').trim() !== FEATURE_TRIGGER) continue;
  total++;
  const name = (r[IDX.NAME] || '').trim();
  const cid = ((r[IDX.URL] || '').match(/cid=(\d+)/) || [])[1];
  let id = cid && byCid.get(cid);
  if (id && !arts.has(id)) id = null;
  if (!id) id = byName.get(norm(name));
  if (!id) gaps.push({ row: i + 1, name, w: (r[IDX.W] || '').toString().trim() });
}

console.log(`詰めOK ${total}件 / 記事あり ${total - gaps.length}件 / 記事なし ${gaps.length}件`);
if (!gaps.length) { console.log('✅ 抜けなし'); process.exit(0); }
console.log('\n=== 記事が存在しない行 ===');
gaps.forEach(g => console.log(`  行${g.row} 「${g.name}」  W列=${JSON.stringify(g.w)}`));
try {
  const msg = gaps.slice(0, 5).map(g => g.name).join(' / ');
  execFileSync('/usr/bin/osascript', ['-e',
    `display notification "未作成 ${gaps.length}件: ${msg.replace(/"/g, '')}" with title "マチノワ 記事の抜け検知"`]);
} catch {}
process.exit(1);
