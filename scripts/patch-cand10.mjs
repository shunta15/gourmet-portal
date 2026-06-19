#!/usr/bin/env node
// batch9 候補ゼロスポットを英語/短縮クエリで再収集（既存candidatesに追記）。向きフィルタ緩和。
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FILE = join(ROOT, 'automation', 'batch8-candidates.json');
const IMGDIR = join(ROOT, 'automation', 'imgcand');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p) { const url = `${API}?${new URLSearchParams({ format: 'json', ...p })}`; for (let i = 0; i < 4; i++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 429 || r.status === 503) { await sleep(1500 * (i + 1)); continue; } if (!r.ok) return null; return await r.json(); } catch { await sleep(800 * (i + 1)); } } return null; }
async function st(q, ns, lim = 8) { const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: String(ns), srlimit: String(lim) }); return (j?.query?.search || []).map((h) => h.title); }
async function fic(cat, lim = 12) { const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: 'file', cmlimit: String(lim) }); return (j?.query?.categorymembers || []).map((m) => m.title); }
async function thumb(t) { const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280' }); const p = Object.values(j?.query?.pages || {})[0]; if (!p || p.missing !== undefined) return null; const info = p.imageinfo?.[0]; if (!info) return null; if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null; if (!info.width || info.width < 700) return null; if (info.height > info.width * 1.8) return null; const desc = (info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 160); return { url: info.thumburl || info.url, file: t, w: info.width, h: info.height, desc }; }
async function dl(url, path) { try { if (existsSync(path)) return true; const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return false; const b = Buffer.from(await r.arrayBuffer()); if (b.length < 3000) return false; writeFileSync(path, b); return true; } catch { return false; } }

const PATCH = {
  'kyoto-toji-temple#2': ['Toji pagoda Kyoto', 'To-ji five-storey pagoda', 'Toji five-storied pagoda'],
  'kyoto-daigoji#4': ['Daigoji pagoda', 'Daigo-ji five-storey pagoda', 'Daigoji five-storied pagoda'],
  'kyoto-kamo-shrines#2': ['Kamigamo shake machi', 'Kamigamo Myojin river', 'Kamigamo jinja townscape'],
  'kyoto-kamo-shrines#6': ['Kamogawa Delta Kyoto', 'Kamo river delta Demachiyanagi', 'Kamogawa confluence Kyoto'],
  'nara-tanzan-shrine#5': ['Tanzan Shrine', 'Tanzan jinja Tonomine', 'Tanzan jinja kemari'],
  'nara-muroji#1': ['Muroji bridge', 'Muro-ji taikobashi', 'Muroji temple Uda'],
  'hyogo-takeda-castle#2': ['Ritsuunkyo', 'Takeda Castle sea of clouds', 'Ritsuunkyo Asago'],
  'hyogo-awaji-akashi#6': ['Naruto whirlpools', 'Uzushio Naruto cruise', 'Naruto whirlpool boat'],
  'shiga-biwako-terrace#1': ['Biwako Valley ropeway', 'Biwako Valley', 'Biwa-ko Valley'],
  'shiga-biwako-terrace#2': ['Biwako Terrace', 'Biwako Valley terrace', 'Biwako Terrace Otsu'],
  'shiga-biwako-terrace#3': ['Mount Horai Shiga', 'Horaisan Biwako', 'Horai mountain Otsu'],
  'shiga-biwako-terrace#4': ['Biwako Valley summit', 'Horaisan Biwako Valley', 'Biwako Terrace view'],
  'shiga-biwako-terrace#5': ['Biwako Valley zipline', 'Biwako Valley adventure', 'Horaisan Biwako'],
  'wakayama-kimiidera-wakaura#4': ['Wakanoura', 'Katanowami Wakayama', 'Wakaura bay'],
  'shizuoka-oigawa-sumata#1': ['Oigawa Railway steam locomotive', 'Oigawa Railway SL', 'Oigawa Railway C11'],
  'shizuoka-oigawa-sumata#2': ['Sumatakyo bridge', 'Sumata gorge suspension bridge', 'Yume no Tsuribashi'],
  'shizuoka-oigawa-sumata#4': ['Sessokyo Oigawa', 'Oku-Oigawa Sessokyo', 'Sessokyo gorge'],
  'shizuoka-oigawa-sumata#5': ['Shiogo suspension bridge', 'Shiogo tsuribashi', 'Kunowaki bridge Oigawa'],
  'hokkaido-toyako#1': ['Lake Toya Nakajima', 'Toyako Nakajima island', 'Lake Toya'],
  'hokkaido-toyako#3': ['Mount Usu ropeway', 'Usuzan crater', 'Mount Usu Hokkaido'],
  'hokkaido-shiretoko#5': ['Utoro port Shiretoko', 'Shiretoko cruise cliffs', 'Utoro Shiretoko'],
};

const data = JSON.parse(readFileSync(FILE, 'utf-8'));
const byId = Object.fromEntries(data.articles.map((a) => [a.id, a]));
let fixed = 0; const still = [];
for (const key of Object.keys(PATCH)) {
  const [id, idxs] = key.split('#'); const idx = Number(idxs) - 1;
  const art = byId[id]; if (!art || !art.spots[idx]) { still.push(key); continue; }
  const spot = art.spots[idx];
  const have = new Set((spot.candidates || []).map((c) => c.file));
  const titles = new Set();
  for (const q of PATCH[key]) {
    for (const c of (await st(q, 14, 2)).slice(0, 1)) for (const f of await fic(c, 10)) titles.add(f);
    for (const f of await st(q, 6, 6)) titles.add(f);
    await sleep(110);
  }
  spot.candidates = spot.candidates || [];
  let n0 = spot.candidates.length, got = 0;
  for (const t of [...titles].slice(0, 26)) {
    if (have.has(t)) continue;
    const r = await thumb(t); if (!r) { await sleep(60); continue; }
    const localPath = join(IMGDIR, `${id}__${idx + 1}__${n0 + got + 1}.jpg`);
    if (await dl(r.url, localPath)) { spot.candidates.push({ url: r.url, file: r.file, localPath, w: r.w, h: r.h, desc: r.desc }); got++; have.add(t); }
    if (got >= 5) break;
    await sleep(70);
  }
  if (got) fixed++;
  process.stderr.write(`${got ? '✓' : '·'} ${key} ${spot.name} +${got} (計${spot.candidates.length})\n`);
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`patch9: ${fixed}/${Object.keys(PATCH).length}`);
let z = 0; for (const a of data.articles) for (const s of a.spots) if (!(s.candidates && s.candidates.length)) z++;
console.log(`残り候補ゼロ: ${z}`);
