#!/usr/bin/env node
// Deep Search Console analysis
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, '..', 'automation', 'secrets', 'sa.json');
const SITE = process.env.GSC_SITE || 'sc-domain:machinowa.tokyo';

const d = (x) => x.toISOString().slice(0, 10);
const today = new Date();
const defEnd = new Date(today.getTime() - 3 * 86400000);
const defStart = new Date(defEnd.getTime() - 27 * 86400000);
const startDate = process.argv[2] || d(defStart);
const endDate = process.argv[3] || d(defEnd);

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const sc = google.searchconsole({ version: 'v1', auth: await auth.getClient() });

async function query(dimensions, rowLimit = 25, orderBy = null) {
  const body = { startDate, endDate, dimensions, rowLimit };
  if (orderBy) {
    body.orderBy = orderBy;
  }
  const res = await sc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: body,
  });
  return res.data.rows || [];
}

const result = {
  window: { startDate, endDate },
  timestamp: new Date().toISOString(),
  totals: {},
  topQueries50: [],
  topPages50: [],
  prefixBreakdown: {},
  deviceBreakdown: {},
  strikingDistance: [],
  lowCTRPages: [],
};

try {
  // Totals
  const total = await query([], 1);
  const t = total[0] || {};
  result.totals = {
    clicks: t.clicks ?? 0,
    impressions: t.impressions ?? 0,
    ctr: t.impressions ? ((t.clicks / t.impressions) * 100).toFixed(2) : '0',
    avgPosition: (t.position ?? 0).toFixed(1),
  };

  // Top 50 queries
  const queries = await query(['query'], 50, [{ direction: 'descending', columnName: 'impressions' }]);
  result.topQueries50 = queries.map(r => ({
    query: r.keys[0],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.impressions ? ((r.clicks / r.impressions) * 100).toFixed(2) : '0',
    position: (r.position ?? 0).toFixed(1),
  }));

  // Top 50 pages
  const pages = await query(['page'], 50, [{ direction: 'descending', columnName: 'impressions' }]);
  result.topPages50 = pages.map(r => ({
    page: decodeURIComponent(r.keys[0]).replace('https://machinowa.tokyo', ''),
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.impressions ? ((r.clicks / r.impressions) * 100).toFixed(2) : '0',
    position: (r.position ?? 0).toFixed(1),
  }));

  // Prefix breakdown (all pages)
  const allPages = await query(['page'], 500, [{ direction: 'descending', columnName: 'impressions' }]);
  const prefixes = {
    '/restaurant/': { clicks: 0, impressions: 0, count: 0, positions: [] },
    '/feature/': { clicks: 0, impressions: 0, count: 0, positions: [] },
    '/region/': { clicks: 0, impressions: 0, count: 0, positions: [] },
    '/scene/': { clicks: 0, impressions: 0, count: 0, positions: [] },
    'other': { clicks: 0, impressions: 0, count: 0, positions: [] },
  };

  for (const row of allPages) {
    const page = decodeURIComponent(row.keys[0]).replace('https://machinowa.tokyo', '');
    let prefix = 'other';
    if (page.startsWith('/restaurant/')) prefix = '/restaurant/';
    else if (page.startsWith('/feature/')) prefix = '/feature/';
    else if (page.startsWith('/region/')) prefix = '/region/';
    else if (page.startsWith('/scene/')) prefix = '/scene/';

    prefixes[prefix].clicks += row.clicks ?? 0;
    prefixes[prefix].impressions += row.impressions ?? 0;
    prefixes[prefix].count += 1;
    prefixes[prefix].positions.push(row.position ?? 0);
  }

  for (const [prefix, data] of Object.entries(prefixes)) {
    const avgPos = data.positions.length > 0
      ? (data.positions.reduce((a, b) => a + b, 0) / data.positions.length).toFixed(1)
      : '0';
    result.prefixBreakdown[prefix] = {
      clicks: data.clicks,
      impressions: data.impressions,
      pageCount: data.count,
      avgPosition: avgPos,
      ctr: data.impressions ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0',
    };
  }

  // Device breakdown
  const devices = await query(['device'], 10);
  for (const row of devices) {
    const device = row.keys[0] || 'unknown';
    result.deviceBreakdown[device] = {
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.impressions ? ((row.clicks / row.impressions) * 100).toFixed(2) : '0',
      position: (row.position ?? 0).toFixed(1),
    };
  }

  // Striking distance queries (position 4-15, impressions >= 20)
  result.strikingDistance = result.topQueries50.filter(q => {
    const pos = parseFloat(q.position);
    const imp = q.impressions;
    return pos >= 4 && pos <= 15 && imp >= 20;
  }).slice(0, 20);

  // Low CTR pages (impressions >= 50, CTR < 1%)
  result.lowCTRPages = result.topPages50.filter(p => {
    const ctr = parseFloat(p.ctr);
    const imp = p.impressions;
    return imp >= 50 && ctr < 1;
  });

  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
}
