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
  'tokyo-takao-mountain#2': ['Takaosan Takosugi', 'Mount Takao Tako-sugi cedar', 'Takao tako sugi'],
  'tokyo-takao-mountain#4': ['Takao monkey park', 'Takaosan saru-en', 'Mount Takao monkey'],
  'tokyo-shibamata-walk#3': ['Yamamoto-tei Shibamata', 'Yamamototei garden Katsushika', 'Yamamoto-tei'],
  'tokyo-tachikawa-showa#5': ['Showa Kinen Park Japanese garden', 'Showa Memorial Park garden', 'Showa Kinen Koen teien'],
  'tokyo-fukagawa-walk#5': ['Monzen-nakacho', 'Monzennakacho street', 'Fukagawa Monzennakacho'],
  'osaka-minoo-falls#1': ['Minoo Station Hankyu', 'Minoo Park entrance', 'Minoo waterfall trail'],
  'osaka-minoo-falls#3': ['Minoo gorge autumn', 'Minoo valley maple', 'Mino-o river'],
  'osaka-shitennoji-walk#3': ['Isshinji Osaka', 'Isshin-ji temple Osaka', 'Isshinji nio gate'],
  'kyoto-kurama-kibune#1': ['Eizan Railway Kirara', 'Eizan Densha momiji tunnel', 'Eizan kirara train'],
  'kyoto-kurama-kibune#2': ['Kurama-dera kondo', 'Kuramadera main hall', 'Kurama-dera honden'],
  'kyoto-ohara-sanzen#5': ['Ohara Kyoto countryside', 'Ohara village Kyoto fields', 'Ohara no sato'],
  'hyogo-nishinomiya-koshien#1': ['Koshien Stadium', 'Hanshin Koshien Stadium exterior', 'Koshien Stadium ivy'],
  'hyogo-nishinomiya-koshien#3': ['Nishinomiya Shrine', 'Nishinomiya jinja gate', 'Nishinomiya Ebisu shrine'],
  'hyogo-nishinomiya-koshien#4': ['Mondoyakujin', 'Mondo Yakujin Tokoji', 'Mondoyakujin Nishinomiya'],
  'hyogo-rokko-maya-night#4': ['Rokko Garden Terrace', 'Rokko miharashi tower', 'Rokko Garden Terrace observatory'],
  'nara-horyuji-course#1': ['Fujinoki Tomb', 'Fujinoki Kofun Ikaruga', 'Fujinoki kofun'],
  'nara-horyuji-course#4': ['Horinji Ikaruga', 'Horin-ji pagoda Nara', 'Horinji three-storied pagoda'],
  'aichi-inuyama-castle#1': ['Sanko Inari Shrine Inuyama', 'Sankoinari Inuyama', 'Sanko Inari torii Inuyama'],
  'aichi-inuyama-castle#3': ['Urakuen Joan', 'Jo-an teahouse Inuyama', 'Joan tea house Urakuen'],
  'aichi-inuyama-castle#5': ['Inuyama Dondenkan', 'Inuyama festival float', 'Inuyama matsuri yamaguruma'],
  'aichi-tokoname-walk#1': ['Tokoname chimney', 'Tokoname kiln chimney', 'Tokoname pottery chimney'],
  'shizuoka-hamamatsu-hamanako#5': ['Ryotanji Hamamatsu', 'Ryotan-ji garden Iinoya', 'Ryotanji Inoya'],
  'shizuoka-shuzenji-onsen#2': ['Shuzenji bamboo path', 'Shuzenji chikurin', 'Shuzenji Onsen bamboo grove'],
  'fukuoka-kokura-castle#1': ['Yasaka Shrine Kokura', 'Kokura Gion Yasaka', 'Yasaka jinja Kitakyushu'],
  'hokkaido-furano-biei#4': ['Ken and Mary tree Biei', 'Biei patchwork road', 'Biei hills poplar tree'],
  'hokkaido-noboribetsu-onsen#5': ['Noboribetsu Bear Park', 'Noboribetsu kuma bokujo', 'Noboribetsu Bear ropeway'],
  'hiroshima-tomonoura-walk#1': ['Tomonoura joyato', 'Tomonoura lantern tower', 'Tomonoura joyato lighthouse'],
  'hiroshima-tomonoura-walk#2': ['Taichoro Fukuzenji', 'Fukuzen-ji Taichoro', 'Taichoro Tomonoura'],
  'wakayama-koyasan-course#1': ['Koyasan Daimon', 'Koya-san Daimon gate', 'Mount Koya Daimon'],
  'wakayama-koyasan-course#3': ['Kongobuji', 'Kongobu-ji Koyasan', 'Kongobuji Banryutei'],
  'wakayama-koyasan-course#5': ['Okunoin Koyasan', 'Koyasan Okunoin', 'Okunoin cemetery Koya'],
  'shiga-hieizan-enryakuji#1': ['Sakamoto Otsu anozumi', 'Sakamoto stone walls Otsu', 'Sakamoto Hieizan satobo'],
  'shiga-hieizan-enryakuji#4': ['Enryakuji Saito', 'Enryakuji Shakado', 'Hieizan Saito Shakado'],
  'gunma-tomioka-silk#1': ['Suwa Shrine Tomioka', 'Tomioka Suwa jinja', 'Suwa jinja Gunma'],
  'gunma-tomioka-silk#4': ['Okkirikomi Gunma', 'Tomioka noodle', 'Gunma okkirikomi'],
  'gunma-tomioka-silk#5': ['Nukisaki Shrine', 'Ichinomiya Nukisaki jinja', 'Nukisaki jinja Tomioka'],
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
