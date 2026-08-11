#!/usr/bin/env node
// Search Console の検索パフォーマンスを取得する
//
// 前提: サービスアカウント machinowa-bot@machinowa-automation.iam.gserviceaccount.com が
//   Search Console のプロパティ machinowa.tokyo に「制限付き」以上で追加されていること。
//
// 使い方:
//   node scripts/gsc-report.mjs                 直近28日
//   node scripts/gsc-report.mjs 2026-07-01 2026-07-31
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SITE = process.env.GSC_SITE || 'sc-domain:machinowa.tokyo';

const d = (x) => x.toISOString().slice(0, 10);
const today = new Date();
const defEnd = new Date(today.getTime() - 3 * 86400000);   // GSCは2〜3日遅延する
const defStart = new Date(defEnd.getTime() - 27 * 86400000);
const startDate = process.argv[2] || d(defStart);
const endDate = process.argv[3] || d(defEnd);

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const sc = google.searchconsole({ version: 'v1', auth: await auth.getClient() });

async function query(dimensions, rowLimit = 25) {
  const res = await sc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: { startDate, endDate, dimensions, rowLimit },
  });
  return res.data.rows || [];
}

try {
  console.log(`📊 ${SITE}  ${startDate} 〜 ${endDate}\n`);

  const total = await query([], 1);
  const t = total[0] || {};
  const ctr = t.impressions ? ((t.clicks / t.impressions) * 100).toFixed(2) : '0';
  console.log(`合計  クリック ${t.clicks ?? 0} / 表示 ${t.impressions ?? 0} / CTR ${ctr}% / 平均掲載順位 ${(t.position ?? 0).toFixed(1)}\n`);

  console.log('── 上位ページ ──');
  for (const r of await query(['page'], 20)) {
    console.log(`  ${String(r.clicks).padStart(4)}clk ${String(r.impressions).padStart(6)}imp 順位${r.position.toFixed(1).padStart(5)}  ${decodeURIComponent(r.keys[0]).replace('https://machinowa.tokyo', '')}`);
  }

  console.log('\n── 上位クエリ ──');
  for (const r of await query(['query'], 20)) {
    console.log(`  ${String(r.clicks).padStart(4)}clk ${String(r.impressions).padStart(6)}imp 順位${r.position.toFixed(1).padStart(5)}  ${r.keys[0]}`);
  }
} catch (e) {
  console.error(`❌ 取得失敗: ${e.message}`);
  console.error(`\nサービスアカウント: ${sa.client_email}`);
  console.error('Search Console のプロパティに、このアドレスをユーザー追加してください。');
  process.exit(1);
}
