#!/usr/bin/env node
/**
 * resolve-commons-images.mjs
 *
 * ワークフローが生成した記事JSON（各spotに imageFile / imageQuery を持つ）を読み、
 * Wikimedia Commons API で各画像の「実在する 1280px サムネイルURL」を決定論的に解決する。
 * LLM が推測した URL は一切信用せず、必ず API 経由で 200 を確認した URL のみ採用する。
 *
 *   1) imageFile（"File:Xxx.jpg"）を imageinfo API で解決 → thumburl 取得
 *   2) 無ければ imageQuery で Commons 画像検索（namespace 6）→ 横長・大判の実画像を採用
 *   3) 最終URLを HEAD で 200 確認
 *
 * 入力:  automation/new-articles-raw.json   （{articles:[...]}）
 * 出力:  automation/new-articles-resolved.json
 *        + 解決できなかった spot を標準出力にレポート（手当て用）
 *
 * 使い方: node scripts/resolve-commons-images.mjs [入力] [出力]
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IN = process.argv[2] || join(ROOT, 'automation', 'new-articles-raw.json');
const OUT = process.argv[3] || join(ROOT, 'automation', 'new-articles-resolved.json');

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial use, Wikimedia Commons images)';
const WIDTH = 1280;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { await sleep(2000 * (attempt + 1)); continue; }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }
  return null;
}

async function head200(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { await sleep(2000 * (attempt + 1)); continue; }
      return res.status === 200;
    } catch {
      await sleep(800 * (attempt + 1));
    }
  }
  return false;
}

// File:タイトル → 1280px thumburl（横長/実画像のみ）
async function resolveByFile(fileTitle) {
  let title = String(fileTitle || '').trim();
  if (!title) return null;
  if (!/^file:/i.test(title)) title = `File:${title}`;
  const j = await api({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime', iiurlwidth: String(WIDTH) });
  const pages = j?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return null;
  const info = page.imageinfo?.[0];
  if (!info) return null;
  if (info.mime && !/image\/(jpeg|png|webp)/.test(info.mime)) return null;
  // 縦長すぎる画像はヒーロー向きでないので避ける（極端な縦長のみ除外）
  if (info.width && info.height && info.height > info.width * 1.15) return null;
  const u = info.thumburl || info.url;
  return u || null;
}

// 検索フォールバック: クエリで Commons 画像検索 → 最初の横長・大判
async function resolveByQuery(query) {
  const q = String(query || '').trim();
  if (!q) return null;
  const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: '6', srlimit: '12' });
  const hits = j?.query?.search || [];
  for (const hit of hits) {
    const u = await resolveByFile(hit.title);
    if (u && await head200(u)) return u;
    await sleep(120);
  }
  return null;
}

async function resolveSpot(spot) {
  // 1) imageFile を試す
  let u = await resolveByFile(spot.imageFile);
  if (u && await head200(u)) return { url: u, via: 'file' };
  // 2) imageQuery 検索
  u = await resolveByQuery(spot.imageQuery);
  if (u) return { url: u, via: 'query' };
  // 3) 日本語名でも検索（最後の手段）
  u = await resolveByQuery(spot.name);
  if (u) return { url: u, via: 'name' };
  return null;
}

const data = JSON.parse(readFileSync(IN, 'utf-8'));
const articles = data.articles || data;
const unresolved = [];
let total = 0, solved = 0;

for (const art of articles) {
  for (let i = 0; i < art.spots.length; i++) {
    const spot = art.spots[i];
    total++;
    const r = await resolveSpot(spot);
    if (r) {
      spot.imageUrl = r.url;
      solved++;
      process.stderr.write(`✓ ${art.id} #${i + 1} ${spot.name} [${r.via}]\n`);
    } else {
      spot.imageUrl = null;
      unresolved.push({ id: art.id, idx: i + 1, name: spot.name, imageFile: spot.imageFile, imageQuery: spot.imageQuery });
      process.stderr.write(`✗ ${art.id} #${i + 1} ${spot.name} — 解決失敗\n`);
    }
    await sleep(150);
  }
  // ヒーロー画像 = heroSpotIndex の spot の画像（無ければ最初の解決済み）
  const hi = Number.isInteger(art.heroSpotIndex) ? art.heroSpotIndex : 0;
  art.heroImageUrl = art.spots[hi]?.imageUrl || art.spots.find((s) => s.imageUrl)?.imageUrl || null;
}

writeFileSync(OUT, JSON.stringify({ articles, unresolved }, null, 2), 'utf-8');

console.log(`\n=== 画像解決 ${solved}/${total} ===`);
console.log(`出力: ${OUT}`);
if (unresolved.length) {
  console.log(`\n⚠ 未解決 ${unresolved.length}件（手当て必要）:`);
  for (const u of unresolved) console.log(`  - ${u.id} #${u.idx} ${u.name}  (file:${u.imageFile} / q:${u.imageQuery})`);
  const badArticles = [...new Set(unresolved.map((u) => u.id))];
  console.log(`\n影響記事: ${badArticles.join(', ')}`);
} else {
  console.log('✅ 全画像が実URLで解決・200確認済み');
}
