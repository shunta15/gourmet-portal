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
  'tokyo-takao-mountain#2': ['Takaosan Takosugi', 'Mount Takao cedar tree', 'Takao tako sugi'],
  'tokyo-takao-mountain#4': ['Takaosan monkey park', 'Mount Takao saruen', 'Takaosan saru-en'],
  'tokyo-takao-mountain#5': ['Mount Takao summit', 'Takaosan summit Fuji', 'Mount Takao viewpoint'],
  'tokyo-shibamata-walk#1': ['Shibamata Taishakuten sando', 'Shibamata sando', 'Shibamata shopping street'],
  'tokyo-shibamata-walk#5': ['Tora-san Museum Shibamata', 'Katsushika Shibamata Tora-san', 'Yamada Yoji Museum'],
  'tokyo-fukagawa-walk#5': ['Monzen-nakacho', 'Monzennakacho Tokyo', 'Fukagawa Monzennakacho'],
  'osaka-minoo-falls#1': ['Minoo Station Hankyu', 'Minoo Park entrance', 'Minoo waterfall trail'],
  'osaka-minoo-falls#3': ['Minoo gorge', 'Minoo river valley', 'Mino-o Park river'],
  'osaka-shitennoji-walk#2': ['Shitennoji turtle pond', 'Shitennoji ishibutai', 'Shitennoji pond Osaka'],
  'kyoto-kurama-kibune#3': ['Kurama-dera mountain path', 'Kurama kinone michi', 'Kurama mountain trail'],
  'kyoto-kurama-kibune#5': ['Kibune kawadoko', 'Kibune kawayuka', 'Kibune river dining'],
  'kyoto-ohara-sanzen#5': ['Ohara Kyoto village', 'Ohara no sato Kyoto', 'Ohara terraced fields'],
  'hyogo-rokko-maya-night#2': ['Maya cable car', 'Mayasan ropeway', 'Maya Viewline'],
  'hyogo-rokko-maya-night#3': ['Rokko Cable car', 'Tenrandai Rokko', 'Rokko Cable'],
  'hyogo-rokko-maya-night#5': ['Rokko Shidare Observatory', 'Rokko garden observatory', 'Shidare observatory Rokko'],
  'aichi-inuyama-castle#3': ['Urakuen Inuyama', 'Jo-an teahouse Inuyama', 'Joan Inuyama'],
  'aichi-inuyama-castle#4': ['Inuyama castle town', 'Inuyama Honmachi street', 'Inuyama old town'],
  'aichi-tokoname-walk#1': ['Tokoname pottery footpath', 'Tokoname yakimono sanpomichi', 'Tokoname Ceramics Hall'],
  'aichi-tokoname-walk#4': ['Tokoname climbing kiln', 'Tokoname noborigama', 'Toei kiln Tokoname'],
  'aichi-tokoname-walk#6': ['Tokoname maneki neko street', 'Tokonyan Tokoname', 'Tokoname cat street'],
  'shizuoka-hamamatsu-hamanako#2': ['Kanzanji Ropeway', 'Lake Hamana ropeway', 'Hamanako ropeway'],
  'shizuoka-hamamatsu-hamanako#3': ['Bentenjima torii Hamamatsu', 'Bentenjima red torii', 'Lake Hamana torii'],
  'shizuoka-shuzenji-onsen#4': ['Shuzenji Katsura river', 'Shuzenji Onsen bridge', 'Shuzenji red bridge'],
  'shizuoka-shuzenji-onsen#5': ['Shigetsuden Shuzenji', 'Shuzenji Shigetsuden', 'Minamoto Yoriie grave'],
  'hokkaido-noboribetsu-onsen#3': ['Oyunuma river footbath Noboribetsu', 'Oyunumagawa footbath', 'Noboribetsu Oyunuma'],
  'hiroshima-tomonoura-walk#1': ['Tomonoura joyato', 'Tomonoura lantern harbor', 'Tomonoura toro'],
  'hiroshima-tomonoura-walk#4': ['Tomonoura townscape', 'Tomonoura old town', 'Tomonoura streets'],
  'shiga-hieizan-enryakuji#1': ['Sakamoto Otsu stone walls', 'Anozumi Sakamoto', 'Sakamoto Hieizan'],
  'shiga-hieizan-enryakuji#3': ['Enryakuji Konpon Chudo', 'Enryakuji Toto', 'Hieizan Enryakuji main hall'],
  'gunma-tomioka-silk#4': ['Tomioka Silk Mill gate', 'Tomioka Silk Mill front', 'Tomioka Seishijo entrance'],
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
