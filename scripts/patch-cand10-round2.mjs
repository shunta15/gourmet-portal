#!/usr/bin/env node
// batch9 round2: 却下スポットに被写体を正確に指す英語/ローマ字クエリで候補を追加。
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
  'kyoto-toji-temple#4': ['Toji Kodo', 'To-ji lecture hall', 'Toji kodo hall'],
  'kyoto-daigoji#5': ['Daigoji Bentendo', 'Daigo-ji Bentendo', 'Daigoji benten hall'],
  'kyoto-kamo-shrines#2': ['Kamigamo shake machi', 'Kamigamo Nishimura tei', 'Kamigamo Myojingawa'],
  'kyoto-kamo-shrines#3': ['Tadasu no Mori', 'Tadasu Forest Shimogamo', 'Tadasunomori Kyoto'],
  'kyoto-kamo-shrines#5': ['Shimogamo Shrine romon', 'Shimogamo jinja gate', 'Shimogamo Shrine tower gate'],
  'nara-tanzan-shrine#1': ['Tanzan Shrine pagoda', 'Tanzan jinja thirteen storey pagoda', 'Tonomine pagoda'],
  'nara-tanzan-shrine#2': ['Tanzan Shrine haiden', 'Tanzan jinja worship hall', 'Tanzan Shrine Sakurai'],
  'nara-tanzan-shrine#3': ['Tanzan Shrine honden', 'Tanzan jinja main hall', 'Tanzan jinja Nara'],
  'nara-tanzan-shrine#5': ['Tanzan Shrine kemari', 'Tanzan jinja Tonomine', 'Tanzan Shrine autumn'],
  'nara-muroji#1': ['Muroji bridge', 'Muro-ji taikobashi Uda', 'Muroji temple gate'],
  'nara-muroji#2': ['Muroji niomon', 'Muro-ji Nio gate', 'Muroji temple Uda'],
  'nara-muroji#3': ['Muroji yoroizaka', 'Muro-ji stone steps', 'Muroji kondo'],
  'nara-muroji#6': ['Muroji Mirokudo', 'Muro-ji Miroku hall', 'Muroji temple Nara'],
  'hyogo-takeda-castle#5': ['Takeda Asago townscape', 'Takeda machinami Asago', 'Takeda jokamachi Hyogo'],
  'shiga-biwako-terrace#2': ['Biwako Terrace', 'Biwako Valley terrace deck', 'Biwako Terrace Otsu'],
  'shiga-biwako-terrace#4': ['Biwako Valley Horai summit', 'Biwako Valley summit view', 'Horaisan Biwako Valley'],
  'aichi-korankei#3': ['Kojakuji Asuke', 'Korankei Kojaku-ji temple', 'Kosenji Korankei'],
  'aichi-korankei#4': ['Korankei Iimoriyama', 'Mount Iimori Asuke', 'Korankei autumn'],
  'shizuoka-oigawa-sumata#4': ['Sessokyo Oigawa', 'Yatsuhashi kodo Sessokyo', 'Oku Oigawa Sessokyo'],
  'shizuoka-oigawa-sumata#5': ['Shiogo no tsuribashi', 'Shiogo suspension bridge Oigawa', 'Kunowaki bridge'],
  'hokkaido-toyako#3': ['Mount Usu crater', 'Usuzan crater Hokkaido', 'Mount Usu ropeway crater'],
  'kagoshima-kirishima#1': ['Kirishima Shrine', 'Kirishima jingu', 'Kirishima jingu Kagoshima'],
};

const data = JSON.parse(readFileSync(FILE, 'utf-8'));
const byId = Object.fromEntries(data.articles.map((a) => [a.id, a]));
let added = 0;
for (const key of Object.keys(PATCH)) {
  const [id, idxs] = key.split('#'); const idx = Number(idxs) - 1;
  const art = byId[id]; if (!art || !art.spots[idx]) continue;
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
  if (got) added++;
  process.stderr.write(`${got ? '✓' : '·'} ${key} ${spot.name} +${got} (計${spot.candidates.length})\n`);
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`round2追加: ${added}/${Object.keys(PATCH).length}`);
