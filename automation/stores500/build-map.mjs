#!/usr/bin/env node
/**
 * build-map.mjs
 *
 * 「記事はあるが店舗ページが無い店」と、その Google Maps URL（詰めOKリストのK列）を
 * 対応付けて automation/stores500/map.json に出す。
 *
 * 出力: [{ articleId, sheetName, mapsUrl }]
 *   電話番号・担当者名・性別・住所などは保存しない（読むのは照合に使う間だけ。ファイルには出さない）。
 *
 * 照合のルール（部分一致 includes は禁止。OWL ⊂ SEAFOODBOWL で店舗が消えた事故の再発防止）
 *   - 顧客管理ID（記事台帳 A列 ⇔ 詰めOKリスト A列）は完全一致
 *   - 店舗ページの有無: 店名の完全一致（空白・記号除去後）か、住所の完全一致（正規化後）のみ
 *
 * スプレッドシートは読み取り専用（scope: spreadsheets.readonly）。書き込みは一切しない。
 *
 * 使い方: node automation/stores500/build-map.mjs
 */
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { SHEET_ID } from '../../scripts/sheets-config.mjs';

const HERE = new URL('./', import.meta.url);
const ROOT = new URL('../../', import.meta.url);

// ---- シート読み取り（readonly）----
const sa = JSON.parse(readFileSync(new URL('../secrets/sa.json', import.meta.url), 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const read = async (range) =>
  (await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })).data.values || [];

// 見出し行で列を特定する（列がずれても壊れないように）
function colIndex(header, label, fallback) {
  const i = header.findIndex((h) => (h || '').trim() === label);
  return i >= 0 ? i : fallback;
}

const ledgerRows = await read('記事台帳!A1:D');
const viewRows = await read('詰めOKリスト!A1:Z');
const L = ledgerRows[0] || [];
const V = viewRows[0] || [];
const LC = {
  id: colIndex(L, '顧客管理ID', 0),
  name: colIndex(L, '店舗名', 1),
  article: colIndex(L, '記事ID', 2),
};
// 詰めOKリストは A列の見出しが空（QUERYビュー）。A=顧客管理ID 固定、その他は見出しで探す
const VC = {
  id: 0,
  name: colIndex(V, '店舗名', 3),
  addr: colIndex(V, '店舗住所', 6),
  url: colIndex(V, 'URL', 10),
};
console.error(
  `[cols] ledger id=${LC.id} name=${LC.name} article=${LC.article} / view id=${VC.id} name=${VC.name} addr=${VC.addr} url=${VC.url}`,
);

// ---- 正規化 ----
const normName = (x) =>
  (x || '')
    .toString()
    .normalize('NFKC')
    .replace(/[&’'\s・。、,.\-·『』「」（）()～~〜！!|｜【】\[\]]/g, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
const normAddr = (x) =>
  (x || '')
    .toString()
    .normalize('NFKC')
    .replace(/^日本、?\s*/, '')
    .replace(/〒\s*\d{3}-?\d{4}\s*/, '')
    .replace(/[\s　]/g, '')
    .replace(/[‐‑‒–—―−ーｰ－]/g, '-')
    .toLowerCase();

// ---- 記事一覧 ----
const articleIds = Object.keys(
  (await import(new URL('lib/teleapo-features.ts', ROOT).href)).TELEAPO_FEATURE_ARTICLES,
);
const articleSet = new Set(articleIds);

// ---- 既存の店舗ページ（lib/data.ts の RESTAURANTS + lib/teleapo-restaurants.ts）----
// data.ts は拡張子なし import を含み node から直接読めないため、テキストを走査して
// RESTAURANTS 配列の各オブジェクトの name / address だけを取り出す。
function parseDataTsRestaurants() {
  const lines = readFileSync(new URL('lib/data.ts', ROOT), 'utf8').split('\n');
  const start = lines.findIndex((l) => l.startsWith('export const RESTAURANTS'));
  if (start < 0) throw new Error('RESTAURANTS が見つからない');
  const out = [];
  let cur = null;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l === '];') break;
    if (l === '  {') cur = { name: null, address: null };
    else if (cur && l === '  },') {
      out.push(cur);
      cur = null;
    } else if (cur) {
      let m;
      if ((m = l.match(/^ {4}name: "(.*)",$/))) cur.name = m[1];
      else if ((m = l.match(/^ {4}address: "(.*)",$/))) cur.address = m[1];
    }
  }
  return out;
}
const dataTs = parseDataTsRestaurants();
const teleRests = (await import(new URL('lib/teleapo-restaurants.ts', ROOT).href)).TELEAPO_RESTAURANTS;
const pages = [
  ...dataTs.map((r) => ({ src: 'data.ts', name: r.name, address: r.address })),
  ...teleRests.map((r) => ({ src: 'teleapo-restaurants.ts', name: r.name, address: r.address })),
];
const pageNames = new Set(pages.map((p) => normName(p.name)).filter(Boolean));
const pageAddrs = new Set(pages.map((p) => normAddr(p.address)).filter((a) => a.length >= 8));
console.error(`[pages] 店舗ページ ${pages.length}件 (data.ts ${dataTs.length} + teleapo-restaurants ${teleRests.length})`);

// ---- 顧客管理ID で突き合わせ ----
const viewById = new Map();
for (const r of viewRows.slice(1)) {
  const id = (r[VC.id] || '').trim();
  if (id) viewById.set(id, r);
}

const stats = {
  articles: articleIds.length,
  ledgerRows: 0,
  ledgerArticleNotFound: 0,
  noViewRow: 0,
  matched: 0,
  noMapsUrl: 0,
  excludedHasPage: 0,
  excludedBy: { name: 0, articleIdAsName: 0, address: 0 },
  output: 0,
};
const noLedger = new Set(articleIds);
const out = [];
const excluded = [];
const noUrl = [];

for (const lr of ledgerRows.slice(1)) {
  const id = (lr[LC.id] || '').trim();
  const articleId = (lr[LC.article] || '').trim();
  if (!id || !articleId) continue;
  stats.ledgerRows++;
  if (!articleSet.has(articleId)) {
    stats.ledgerArticleNotFound++;
    continue;
  }
  noLedger.delete(articleId);
  const vr = viewById.get(id);
  if (!vr) {
    stats.noViewRow++;
    continue;
  }
  stats.matched++;
  const sheetName = (vr[VC.name] || lr[LC.name] || '').trim();
  const mapsUrl = (vr[VC.url] || '').trim();
  const addr = vr[VC.addr] || '';

  // 店舗ページが既にあるか（完全一致のみ）
  let by = null;
  if (pageNames.has(normName(sheetName))) by = 'name';
  else if (pageNames.has(normName(articleId))) by = 'articleIdAsName';
  else if (normAddr(addr).length >= 8 && pageAddrs.has(normAddr(addr))) by = 'address';
  if (by) {
    stats.excludedHasPage++;
    stats.excludedBy[by]++;
    excluded.push({ articleId, by });
    continue;
  }

  if (!/^https?:\/\/(maps\.google\.com|www\.google\.com\/maps|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|share\.google)\b/.test(mapsUrl)) {
    stats.noMapsUrl++;
    noUrl.push({ articleId, urlKind: mapsUrl ? 'Maps以外のURL' : '空' });
    continue;
  }
  out.push({ articleId, sheetName, mapsUrl });
}
stats.output = out.length;

writeFileSync(new URL('map.json', HERE), JSON.stringify(out, null, 2) + '\n');

console.log('=== 件数内訳 ===');
console.log(`記事数 (TELEAPO_FEATURE_ARTICLES)            : ${stats.articles}`);
console.log(`台帳に載っている記事                          : ${stats.ledgerRows - stats.ledgerArticleNotFound}`);
const noLedgerHasPage = [...noLedger].filter((id) => pageNames.has(normName(id)));
console.log(`  台帳に無い記事（=詰めOKリストに行が無く Maps URL を引けない）: ${noLedger.size}`);
console.log(`    うち記事ID=店名で店舗ページ既存（そもそも対象外）          : ${noLedgerHasPage.length} (${noLedgerHasPage.join(' / ')})`);
console.log(`    うち店舗ページも台帳も無い（Maps URL の入手元が別途必要）  : ${noLedger.size - noLedgerHasPage.length}`);
console.log(`顧客管理IDで詰めOKリストと対応付けできた数    : ${stats.matched}  (台帳のIDが詰めOKリストに無い: ${stats.noViewRow})`);
console.log(`店舗ページ既存で除外                          : ${stats.excludedHasPage}  (店名一致 ${stats.excludedBy.name} / 記事ID=店名一致 ${stats.excludedBy.articleIdAsName} / 住所一致 ${stats.excludedBy.address})`);
console.log(`Maps URL が無い（空 or Maps以外）で除外       : ${stats.noMapsUrl}`);
console.log(`map.json 出力                                 : ${stats.output}`);
if (excluded.length) console.log('除外(店舗ページあり):', excluded.map((e) => `${e.articleId}[${e.by}]`).join(' / '));
if (noUrl.length) console.log('Maps URL なし:', noUrl.map((e) => `${e.articleId}(${e.urlKind})`).join(' / '));
console.log('台帳に無い記事ID（Maps URL を引けない）:', [...noLedger].join(' | '));
