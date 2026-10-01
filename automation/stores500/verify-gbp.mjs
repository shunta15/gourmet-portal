#!/usr/bin/env node
/**
 * verify-gbp.mjs
 *
 * automation/stores500/gbp/<articleId>.json（fetch-gbp-details.mjs の出力）が
 * 「記事・詰めOKリストの店と同じ店か」を確認して表で出す。結果は stdout のみ（ファイルに書かない）。
 *
 *   名前: GBP の name と、詰めOKリストの店舗名・記事ID を正規化して完全一致で比較
 *         （部分一致は「要目視」として出すだけで一致とは扱わない）
 *   住所: GBP の都道府県＋市区町村 と 詰めOKリスト G列（店舗住所）の都道府県＋市区町村 を比較
 *   記事: 記事本文（title/subtitle/lede/各POINTの area）に GBP の市区町村名が出てくるか
 *
 * スプレッドシートは読み取り専用。電話番号など個人情報は出力しない。
 *
 * 使い方: node automation/stores500/verify-gbp.mjs [--limit 10] [--offset 0]
 */
import { google } from 'googleapis';
import { existsSync, readFileSync } from 'fs';
import { SHEET_ID } from '../../scripts/sheets-config.mjs';

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? Number(process.argv[i + 1]) : d;
};
const LIMIT = arg('--limit', 10);
const OFFSET = arg('--offset', 0);

const ROOT = new URL('../../', import.meta.url);
const map = JSON.parse(readFileSync(new URL('automation/stores500/map.json', ROOT), 'utf8')).slice(OFFSET, OFFSET + LIMIT);
const articles = (await import(new URL('lib/teleapo-features.ts', ROOT).href)).TELEAPO_FEATURE_ARTICLES;

const sa = JSON.parse(readFileSync(new URL('automation/secrets/sa.json', ROOT), 'utf8'));
const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const read = async (range) => (await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })).data.values || [];
const ledger = await read('記事台帳!A2:C');
const view = await read('詰めOKリスト!A2:K');
const viewById = new Map(view.map((r) => [(r[0] || '').trim(), r]));
const cidByArticle = new Map(ledger.map((r) => [(r[2] || '').trim(), (r[0] || '').trim()]));

const normName = (x) =>
  (x || '').toString().normalize('NFKC').replace(/[&’'\s・。、,.\-·『』「」（）()～~〜！!|｜【】\[\]]/g, '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const normAddr = (x) => (x || '').toString().normalize('NFKC').replace(/^日本、?\s*/, '').replace(/〒\s*\d{3}-?\d{4}\s*/, '').replace(/\s/g, '');
function prefCity(addr) {
  const a = normAddr(addr);
  const pref = (a.match(/^(.+?[都道府県])/) || [])[1] || null;
  const rest = pref ? a.slice(pref.length) : a;
  // 「○○郡△△町」「京都市中京区」など。最初に現れる 市 / 郡+町村 / 区 までを市区町村とする
  const city = (rest.match(/^(.+?郡.+?[町村]|.+?市|.+?区|.+?[町村])/) || [])[1] || null;
  return { pref, city };
}

const rows = [];
for (const item of map) {
  const f = new URL(`automation/stores500/gbp/${item.articleId}.json`, ROOT);
  if (!existsSync(f)) {
    rows.push({ id: item.articleId, note: 'GBP取得なし' });
    continue;
  }
  const g = JSON.parse(readFileSync(f, 'utf8'));
  const sheetRow = viewById.get(cidByArticle.get(item.articleId)) || [];
  const sheetName = item.sheetName;
  const sheetAddr = sheetRow[6] || '';

  const gn = normName(g.name);
  let nameVerdict;
  if (gn && (gn === normName(sheetName) || gn === normName(item.articleId))) nameVerdict = '一致';
  else if (gn && (normName(sheetName).includes(gn) || gn.includes(normName(sheetName)) || normName(item.articleId).includes(gn))) nameVerdict = '要目視(片方が他方を含む)';
  else nameVerdict = '不一致';

  const gp = prefCity(g.address);
  const sp = prefCity(sheetAddr);
  let addrVerdict;
  if (!gp.pref) addrVerdict = '住所なし';
  else if (gp.pref === sp.pref && gp.city === sp.city) addrVerdict = '一致';
  else if (gp.pref === sp.pref) addrVerdict = `都道府県のみ一致(GBP:${gp.city}/シート:${sp.city})`;
  else addrVerdict = `不一致(GBP:${gp.pref}${gp.city}/シート:${sp.pref}${sp.city})`;

  const art = articles[item.articleId];
  const artText = art
    ? [art.title, art.subtitle, art.lede, ...(art.ranking || []).map((r) => r.area)].filter(Boolean).join(' ')
    : '';
  const stem = gp.city ? gp.city.replace(/[市区町村]$/, '') : null;
  const prefStem = gp.pref ? gp.pref.replace(/[都道府県]$/, '') : null;
  let artVerdict;
  if (!art) artVerdict = '記事なし';
  else if (gp.city && artText.includes(gp.city)) artVerdict = `「${gp.city}」あり`;
  else if (stem && stem.length >= 2 && artText.includes(stem)) artVerdict = `「${stem}」あり`;
  else if (prefStem && artText.includes(prefStem)) artVerdict = `「${prefStem}」のみあり`;
  else artVerdict = '地名なし(要目視)';

  rows.push({
    id: item.articleId,
    gbpName: g.name,
    sheetName,
    nameVerdict,
    gbpAddr: g.address,
    addrVerdict,
    artVerdict,
    artTitle: art ? art.title : null,
  });
}

console.log('| # | 記事ID | GBP店名 | シート店名 | 名前 | GBP住所 | 住所(シート比) | 記事内の地名 |');
console.log('|---|---|---|---|---|---|---|---|');
rows.forEach((r, i) => {
  if (r.note) return console.log(`| ${i + 1} | ${r.id} | ${r.note} |||||| |`);
  console.log(`| ${i + 1} | ${r.id} | ${r.gbpName} | ${r.sheetName} | ${r.nameVerdict} | ${r.gbpAddr} | ${r.addrVerdict} | ${r.artVerdict} |`);
});
const c = (f) => rows.filter(f).length;
console.log(`\n名前 一致 ${c((r) => r.nameVerdict === '一致')} / 要目視 ${c((r) => (r.nameVerdict || '').startsWith('要目視'))} / 不一致 ${c((r) => r.nameVerdict === '不一致')}`);
console.log(`住所 一致 ${c((r) => r.addrVerdict === '一致')} / それ以外 ${c((r) => r.addrVerdict && r.addrVerdict !== '一致')}`);
console.log(`記事に市区町村名あり ${c((r) => /あり$/.test(r.artVerdict || '') && !/のみあり/.test(r.artVerdict))} / のみあり・なし ${c((r) => r.artVerdict && (!/あり$/.test(r.artVerdict) || /のみあり/.test(r.artVerdict)))}`);
console.log('\n記事タイトル（目視確認用）:');
rows.forEach((r, i) => r.artTitle && console.log(`${i + 1}. ${r.id}: ${r.artTitle}`));
