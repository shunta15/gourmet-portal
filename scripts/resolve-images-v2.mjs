#!/usr/bin/env node
/**
 * resolve-images-v2.mjs  ── 画像「候補」収集（採用はビジョン検証で別途決める）
 *
 * 各スポットの imageSubject / imageRegion / name から、Wikimedia Commons で
 * 候補画像を複数集めてローカルにDLする。採用はしない（後段の vision-verify が判定）。
 *
 *   候補ソース: ①被写体名でカテゴリ検索→そのカテゴリ内のファイル ②被写体名でファイル検索
 *               ③スポット名でファイル検索  を統合し、横長・大判の実画像に絞る
 *   各候補: thumburl(1280) を automation/imgcand/<id>__<idx>__<n>.jpg にDL
 *
 * 入力: automation/batch8-raw.json  （{articles:[{id,spots:[{name,imageSubject,imageRegion}]}]}）
 * 出力: automation/batch8-candidates.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IN = process.argv[2] || join(ROOT, 'automation', 'batch8-raw.json');
const OUT = process.argv[3] || join(ROOT, 'automation', 'batch8-candidates.json');
const IMGDIR = join(ROOT, 'automation', 'imgcand');
mkdirSync(IMGDIR, { recursive: true });

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const WIDTH = 1280;
const MAX_CAND = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { await sleep(1500 * (i + 1)); continue; }
      if (!res.ok) return null;
      return await res.json();
    } catch { await sleep(800 * (i + 1)); }
  }
  return null;
}
async function searchTitles(query, ns, limit = 8) {
  const j = await api({ action: 'query', list: 'search', srsearch: query, srnamespace: String(ns), srlimit: String(limit) });
  return (j?.query?.search || []).map((h) => h.title);
}
async function filesInCategory(cat, limit = 20) {
  const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: 'file', cmlimit: String(limit) });
  return (j?.query?.categorymembers || []).map((m) => m.title);
}
async function thumb(fileTitle) {
  const j = await api({ action: 'query', titles: fileTitle, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(WIDTH) });
  const page = Object.values(j?.query?.pages || {})[0];
  if (!page || page.missing !== undefined) return null;
  const info = page.imageinfo?.[0];
  if (!info) return null;
  if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null;
  if (!info.width || info.width < 800) return null;
  if (info.height > info.width * 1.1) return null; // 横長のみ（ヒーロー適性）
  const desc = (info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 160);
  return { url: info.thumburl || info.url, file: fileTitle, w: info.width, h: info.height, desc };
}
async function download(url, path) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 3000) return false; // 壊れ/極小は除外
    writeFileSync(path, buf);
    return true;
  } catch { return false; }
}

async function gatherCandidates(spot) {
  const titles = new Set();
  // ① 被写体でカテゴリ検索 → カテゴリ内ファイル
  const cats = await searchTitles(spot.imageSubject, 14, 3);
  for (const c of cats.slice(0, 2)) { for (const f of await filesInCategory(c, 12)) titles.add(f); await sleep(100); }
  // ② 被写体でファイル検索
  for (const f of await searchTitles(spot.imageSubject, 6, 8)) titles.add(f);
  // ③ スポット名でファイル検索
  for (const f of await searchTitles(spot.name, 6, 6)) titles.add(f);
  // 解決＆横長フィルタ
  const resolved = [];
  for (const t of [...titles].slice(0, 22)) {
    const r = await thumb(t);
    if (r) resolved.push(r);
    if (resolved.length >= MAX_CAND * 2) break;
    await sleep(90);
  }
  return resolved.slice(0, MAX_CAND);
}

const data = JSON.parse(readFileSync(IN, 'utf-8'));
const articles = data.articles || data;
let totalSpots = 0, withCand = 0;
for (const art of articles) {
  for (let i = 0; i < art.spots.length; i++) {
    const spot = art.spots[i];
    totalSpots++;
    const cands = await gatherCandidates(spot);
    spot.candidates = [];
    for (let n = 0; n < cands.length; n++) {
      const localPath = join(IMGDIR, `${art.id}__${i + 1}__${n + 1}.jpg`);
      const okdl = await download(cands[n].url, localPath);
      if (okdl) spot.candidates.push({ url: cands[n].url, file: cands[n].file, localPath, w: cands[n].w, h: cands[n].h, desc: cands[n].desc });
      await sleep(80);
    }
    if (spot.candidates.length) withCand++;
    process.stderr.write(`${spot.candidates.length ? '✓' : '✗'} ${art.id} #${i + 1} ${spot.name} (${spot.imageSubject}) → 候補${spot.candidates.length}枚\n`);
  }
}
writeFileSync(OUT, JSON.stringify({ articles }, null, 2), 'utf-8');
console.log(`\n=== 候補収集 ${withCand}/${totalSpots} スポットで候補あり ===`);
console.log(`画像DL先: ${IMGDIR}`);
console.log(`出力: ${OUT}`);
const none = [];
for (const a of articles) a.spots.forEach((s, i) => { if (!s.candidates || !s.candidates.length) none.push(`${a.id}#${i + 1} ${s.name}`); });
if (none.length) { console.log(`\n⚠ 候補ゼロ(${none.length}): 要英語クエリ手当て`); none.forEach((x) => console.log('  -', x)); }
