#!/usr/bin/env node
// 候補ゼロのスポットを、英語/短縮クエリ＋向きフィルタ緩和で再収集し candidates.json に追加。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FILE = join(ROOT, 'automation', 'batch8-candidates.json');
const IMGDIR = join(ROOT, 'automation', 'imgcand');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const WIDTH = 1280;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(p) { const url = `${API}?${new URLSearchParams({ format: 'json', ...p })}`; for (let i = 0; i < 4; i++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 429 || r.status === 503) { await sleep(1500 * (i + 1)); continue; } if (!r.ok) return null; return await r.json(); } catch { await sleep(800 * (i + 1)); } } return null; }
async function searchTitles(q, ns, lim = 8) { const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: String(ns), srlimit: String(lim) }); return (j?.query?.search || []).map((h) => h.title); }
async function filesInCat(cat, lim = 14) { const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: 'file', cmlimit: String(lim) }); return (j?.query?.categorymembers || []).map((m) => m.title); }
async function thumb(t) { const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(WIDTH) }); const p = Object.values(j?.query?.pages || {})[0]; if (!p || p.missing !== undefined) return null; const info = p.imageinfo?.[0]; if (!info) return null; if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null; if (!info.width || info.width < 700) return null; if (info.height > info.width * 1.7) return null; const desc = (info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 160); return { url: info.thumburl || info.url, file: t, w: info.width, h: info.height, desc }; }
async function download(url, path) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return false; const b = Buffer.from(await r.arrayBuffer()); if (b.length < 3000) return false; writeFileSync(path, b); return true; } catch { return false; } }

// 候補ゼロのスポット → 英語/短縮クエリ
const PATCH = {
  'osaka-tenjimbashisuji-walk#5': ['Tenjinbashisuji', 'Tenjinbashi shopping street Osaka', 'Tenma Osaka arcade'],
  'osaka-sumiyoshi-taisha-walk#3': ['Sumiyoshi-taisha honden', 'Sumiyoshi Grand Shrine', 'Sumiyoshi taisha'],
  'osaka-sumiyoshi-taisha-walk#4': ['Sumiyoshi taisha', 'Tanekashisha', 'Sumiyoshi shrine Osaka'],
  'osaka-sumiyoshi-taisha-walk#5': ['Sumiyoshi Park Osaka', 'Sumiyoshi Takatoro', 'Sumiyoshi lighthouse Osaka'],
  'hyogo-takarazuka-hananomichi#3': ['Takarazuka Grand Theater', 'Takarazuka Grand Theatre', 'Hananomichi Takarazuka'],
  'hyogo-takarazuka-hananomichi#5': ['Mukogawa river Takarazuka', 'Muko River Hyogo', 'Takarazuka Mukogawa'],
  'hyogo-kinosaki-onsen-soto#1': ['Kinosaki Onsen', 'Kinosaki Onsen night', 'Kinosaki willow river'],
  'hyogo-kinosaki-onsen-soto#5': ['Kinosaki Onsen Ropeway', 'Daishiyama Kinosaki', 'Kinosaki ropeway'],
  'shiga-otsu-biwako-walk#1': ['Otsu Port', 'Michigan ship Lake Biwa', 'Biwako Otsu'],
  'shiga-omihachiman-horikawa#4': ['Omihachiman old town', 'Shinmachi Omihachiman', 'Omihachiman townscape'],
  'wakayama-castle-burakuri#2': ['Wakayama Castle Ohashiroka', 'Wakayama Castle bridge', 'Wakayama Castle Nishinomaru garden'],
  'aichi-arimatsu-shibori#1': ['Arimatsu Nagoya', 'Arimatsu old town', 'Arimatsu machiya'],
  'shizuoka-miho-shimizu#1': ['Miho no Matsubara', 'Mihonomatsubara Fuji', 'Miho pine grove'],
  'shizuoka-miho-shimizu#2': ['Miho shrine Shizuoka', 'Mihо jinja', 'Miho jinja Shimizu'],
  'shizuoka-miho-shimizu#3': ['Shimizu Port Shizuoka', 'Shimizu port Mount Fuji', 'Shimizu ko'],
  'shizuoka-miho-shimizu#5': ['Nihondaira Yume Terrace', 'Nihondaira', 'Nihondaira observatory'],
  'shizuoka-sumpu-course#5': ['Aoba Shizuoka', 'Shizuoka oden street', 'Aoba symbol road Shizuoka'],
  'fukuoka-itoshima-sea#2': ['Futamigaura Itoshima', 'Sakurai Futamigaura', 'Itoshima coast'],
  'fukuoka-itoshima-sea#4': ['Mount Kaya Itoshima', 'Kayasan Fukuoka', 'Kaya mountain Itoshima'],
  'fukuoka-yanagawa-kudari#1': ['Yanagawa canal', 'Yanagawa donko boat', 'Yanagawa river cruise'],
  'hokkaido-asahiyama-zoo#3': ['Kitasaito Garden Asahikawa', 'Asahikawa Kitasaito', 'Asahikawa station garden'],
  'hiroshima-onomichi-slope#2': ['Senkoji Park Onomichi', 'Senkoji observatory Onomichi', 'Onomichi channel view'],
  'gunma-ikaho-stone-steps#5': ['Mizusawa-dera', 'Mizusawa Kannon', 'Mizusawadera Gunma'],
  'saitama-chichibu-nature#4': ['Hodosan', 'Mount Hodo Nagatoro', 'Hodosan ropeway'],
  'tokyo-yanesen-walk#3': ['Kannonji Yanaka', 'Tsuiji-bei Yanaka', 'Yanaka Kannonji wall'],
};

const data = JSON.parse(readFileSync(FILE, 'utf-8'));
const byId = Object.fromEntries(data.articles.map((a) => [a.id, a]));
let fixed = 0; const still = [];
for (const key of Object.keys(PATCH)) {
  const [id, idxs] = key.split('#'); const idx = Number(idxs) - 1;
  const art = byId[id]; if (!art || !art.spots[idx]) { still.push(key); continue; }
  const spot = art.spots[idx];
  const titles = new Set();
  for (const q of PATCH[key]) {
    for (const c of (await searchTitles(q, 14, 2)).slice(0, 1)) for (const f of await filesInCat(c, 10)) titles.add(f);
    for (const f of await searchTitles(q, 6, 6)) titles.add(f);
    await sleep(120);
  }
  const cands = [];
  for (const t of [...titles].slice(0, 24)) { const r = await thumb(t); if (r) cands.push(r); if (cands.length >= 4) break; await sleep(90); }
  spot.candidates = spot.candidates || [];
  let n0 = spot.candidates.length;
  for (let n = 0; n < cands.length; n++) {
    const localPath = join(IMGDIR, `${id}__${idx + 1}__${n0 + n + 1}.jpg`);
    if (await download(cands[n].url, localPath)) spot.candidates.push({ url: cands[n].url, file: cands[n].file, localPath, w: cands[n].w, h: cands[n].h, desc: cands[n].desc });
    await sleep(80);
  }
  if (spot.candidates.length) { fixed++; process.stderr.write(`✓ ${key} ${spot.name} → 候補${spot.candidates.length}枚\n`); }
  else { still.push(key); process.stderr.write(`✗ ${key} ${spot.name} 依然ゼロ\n`); }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`パッチ: ${fixed}/${Object.keys(PATCH).length} スポットで候補確保`);
if (still.length) { console.log(`依然ゼロ(${still.length}):`); still.forEach((s) => console.log('  -', s)); }
