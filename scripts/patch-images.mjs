#!/usr/bin/env node
// 未解決スポットを、的確なクエリ＋向きフィルタ緩和で再解決し resolved.json をパッチする。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FILE = join(ROOT, 'automation', 'new-articles-resolved.json');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const WIDTH = 1280;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { await sleep(2000 * (i + 1)); continue; }
      if (!res.ok) return null;
      return await res.json();
    } catch { await sleep(1000 * (i + 1)); }
  }
  return null;
}
async function head200(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { await sleep(2000 * (i + 1)); continue; }
      return res.status === 200;
    } catch { await sleep(800 * (i + 1)); }
  }
  return false;
}
// 向きフィルタを緩和（縦長も許容）。大判の実画像なら採用。
async function fileToUrl(title) {
  if (!/^file:/i.test(title)) title = `File:${title}`;
  const j = await api({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime', iiurlwidth: String(WIDTH) });
  const page = Object.values(j?.query?.pages || {})[0];
  if (!page || page.missing !== undefined) return null;
  const info = page.imageinfo?.[0];
  if (!info) return null;
  if (info.mime && !/image\/(jpeg|png|webp)/.test(info.mime)) return null;
  if (info.width && info.width < 600) return null;
  return info.thumburl || info.url || null;
}
async function search(query) {
  const j = await api({ action: 'query', list: 'search', srsearch: query, srnamespace: '6', srlimit: '15' });
  for (const hit of (j?.query?.search || [])) {
    const u = await fileToUrl(hit.title);
    if (u && await head200(u)) return u;
    await sleep(120);
  }
  return null;
}

// 未解決スポット → 試すクエリ列（英語の確実なランドマーク名）
const PATCH = {
  'kansai-tennoji-abeno-family#2': ['Tennoji Park Osaka', 'Tennōji Park', 'Tennoji Zoo Osaka'],
  'kansai-fushimi-inari-walk#5': ['Fushimi Inari-taisha romon', 'Fushimi Inari-taisha', 'Fushimi Inari approach'],
  'kansai-kawaramachi-pontocho-date#5': ['Tatsumi bridge Kyoto', 'Gion Shirakawa', 'Shirakawa Gion'],
  'kansai-kitano-ijinkan-date#4': ['Uroko House Kobe', 'Kobe Uroko no Ie', 'Kitano Ijinkan Kobe'],
  'kansai-kitano-ijinkan-date#5': ['Kitano-cho Kobe', 'Kitano Ijinkan-gai', 'Kobe Kitano district'],
  'hokkaido-susukino-night-date#2': ['Sapporo TV Tower', 'Sapporo TV Tower night', 'Sapporo Television Tower'],
  'hokkaido-susukino-night-date#3': ['Susukino Sapporo', 'Susukino night', 'Susukino crossing'],
  'hokkaido-otaru-canal-date#5': ['Otaru Music Box Museum', 'Otaru Orgel Hall', 'Otaru Music Box'],
  'kanto-kawagoe-walk#2': ['Kawagoe Kurazukuri', 'Kawagoe Ichibangai', 'Kawagoe warehouse district'],
};

const data = JSON.parse(readFileSync(FILE, 'utf-8'));
const byId = Object.fromEntries(data.articles.map((a) => [a.id, a]));
let fixed = 0;
const still = [];
for (const key of Object.keys(PATCH)) {
  const [id, idxStr] = key.split('#');
  const idx = Number(idxStr) - 1;
  const art = byId[id];
  if (!art || !art.spots[idx]) { still.push(key); continue; }
  let url = null;
  for (const q of PATCH[key]) {
    url = await search(q);
    if (url) break;
    await sleep(150);
  }
  if (url) {
    art.spots[idx].imageUrl = url;
    fixed++;
    process.stderr.write(`✓ ${key} ${art.spots[idx].name} → ${url}\n`);
  } else {
    still.push(key);
    process.stderr.write(`✗ ${key} ${art.spots[idx].name} 依然未解決\n`);
  }
}
// ヒーローURL再計算（変化なしのはずだが念のため）
for (const a of data.articles) {
  const hi = Number.isInteger(a.heroSpotIndex) ? a.heroSpotIndex : 0;
  a.heroImageUrl = a.spots[hi]?.imageUrl || a.spots.find((s) => s.imageUrl)?.imageUrl || null;
}
// unresolved 再集計
data.unresolved = [];
for (const a of data.articles) a.spots.forEach((s, i) => { if (!s.imageUrl) data.unresolved.push({ id: a.id, idx: i + 1, name: s.name }); });
writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`パッチ解決: ${fixed}/${Object.keys(PATCH).length}`);
console.log(`残り未解決: ${data.unresolved.length}`);
for (const u of data.unresolved) console.log(`  - ${u.id} #${u.idx} ${u.name}`);
