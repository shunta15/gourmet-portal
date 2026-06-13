#!/usr/bin/env node
// 却下(-1)スポットに、被写体を正確に指す英語クエリで候補を追加収集（既存candidatesに追記）。
import { readFileSync, writeFileSync } from 'fs';
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
async function thumb(t) { const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280' }); const p = Object.values(j?.query?.pages || {})[0]; if (!p || p.missing !== undefined) return null; const info = p.imageinfo?.[0]; if (!info) return null; if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null; if (!info.width || info.width < 640) return null; if (info.height > info.width * 1.8) return null; const desc = (info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 160); return { url: info.thumburl || info.url, file: t, w: info.width, h: info.height, desc }; }
async function dl(url, path) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return false; const b = Buffer.from(await r.arrayBuffer()); if (b.length < 3000) return false; writeFileSync(path, b); return true; } catch { return false; } }

const PATCH = {
  'osaka-mozu-kofun-walk#4': ['Sakai City Museum', 'Sakai Hakubutsukan', 'Sakai City Museum haniwa'],
  'osaka-tenjimbashisuji-walk#4': ['Tenjinbashisuji', 'Tenma Osaka shopping street', 'Osaka Tenma shotengai'],
  'osaka-tenjimbashisuji-walk#5': ['Tenjinbashisuji 5-chome', 'Tenjinbashisuji arcade', 'Tenjinbashisuji shopping arcade'],
  'osaka-tenjimbashisuji-walk#6': ['Nakazakicho Osaka', 'Nakazaki-cho', 'Nakazakicho street Osaka'],
  'osaka-sumiyoshi-taisha-walk#4': ['Sumiyoshi taisha sessha', 'Sumiyoshi-taisha massha', 'Sumiyoshi taisha precinct'],
  'osaka-sumiyoshi-taisha-walk#5': ['Sumiyoshi Park Osaka', 'Sumiyoshi koen', 'Sumiyoshi Toro lighthouse'],
  'kyoto-ginkakuji-philosophers-walk#4': ['Eikando', 'Eikan-do Zenrinji', 'Eikando pagoda Kyoto'],
  'kyoto-ginkakuji-philosophers-walk#5': ['Nanzenji Suirokaku', 'Nanzen-ji aqueduct', 'Nanzenji aqueduct'],
  'hyogo-takarazuka-hananomichi#3': ['Takarazuka Grand Theater', 'Quatre Reves Takarazuka', 'Takarazuka theater'],
  'hyogo-takarazuka-hananomichi#5': ['Mukogawa Takarazuka', 'Muko River Takarazuka', 'Mukogawa river Hyogo'],
  'hyogo-kinosaki-onsen-soto#1': ['Kinosaki Onsen street', 'Kinosaki Onsen willow', 'Kinosaki Onsen Otani river'],
  'shiga-otsu-biwako-walk#3': ['Mii-dera', 'Onjoji', 'Miidera kondo Otsu'],
  'shiga-otsu-biwako-walk#5': ['Biwako Otsukan', 'Otsukan Shiga', 'Biwako Otsu kan'],
  'shiga-omihachiman-horikawa#4': ['Omihachiman Shinmachi', 'Omihachiman machinami', 'Omihachiman merchant houses'],
  'wakayama-castle-burakuri#3': ['Mutsu Munemitsu statue Wakayama', 'Okakoen Wakayama', 'Wakayama Oka Park'],
  'wakayama-shirahama-sea#3': ['Senjojiki Shirahama Wakayama', 'Shirahama Senjojiki', 'Senjojiki Wakayama rock'],
  'wakayama-shirahama-sea#5': ['Heisogen Park Shirahama', 'Heisogen koen', 'Shirahama Heisogen Park'],
  'nagoya-castle-honmaru-course#2': ['Nagoya Castle Honmaru Palace', 'Honmaru Goten Nagoya', 'Nagoya Honmaru Goten'],
  'nagoya-castle-honmaru-course#3': ['Meijo Park Nagoya', 'Meijo koen Nagoya', 'Nagoya Meijo Park'],
  'shizuoka-sumpu-course#2': ['Sunpu Castle', 'Sunpujo Shizuoka', 'Sunpu Castle tatsumi yagura'],
  'shizuoka-sumpu-course#4': ['Konyamachi Shizuoka', 'Shizuoka Konyamachi', 'Shizuoka Aoba street'],
  'fukuoka-itoshima-sea#5': ['Sakurai Shrine Itoshima', 'Sakurai jinja Fukuoka', 'Sakurai jinja Itoshima'],
  'fukuoka-yanagawa-kudari#1': ['Yanagawa Fukuoka boat', 'Yanagawa river cruise', 'Yanagawa donko boat'],
  'hokkaido-asahiyama-zoo#1': ['Asahiyama Zoo', 'Asahiyama zoo seal', 'Asahikawa zoo'],
  'hokkaido-asahiyama-zoo#3': ['Kitasaito Garden Asahikawa', 'Asahikawa Kitasaito', 'Asahikawa station garden'],
  'hiroshima-onomichi-slope#2': ['Senkoji Park Onomichi', 'Onomichi Senkoji observatory', 'Onomichi viewpoint'],
  'hiroshima-onomichi-slope#3': ['Senkoji Onomichi', 'Senko-ji temple Onomichi', 'Senkoji temple'],
  'hiroshima-onomichi-slope#5': ['Jodoji Onomichi', 'Jodo-ji Onomichi pagoda', 'Jodoji temple Onomichi'],
  'gunma-ikaho-stone-steps#3': ['Kajika Bridge Ikaho', 'Ikaho Kajikabashi', 'Kajikabashi Gunma'],
  'saitama-chichibu-nature#4': ['Hodosan', 'Mount Hodo Nagatoro', 'Hodosan ropeway'],
  'tokyo-yanesen-walk#1': ['Nezu Shrine', 'Nezu jinja torii', 'Nezu Shrine Tokyo'],
  'tokyo-yanesen-walk#3': ['Kannonji Yanaka tsuijibei', 'Yanaka tsuiji wall', 'Kannon-ji Yanaka'],
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
    const r = await thumb(t); if (!r) { await sleep(70); continue; }
    const localPath = join(IMGDIR, `${id}__${idx + 1}__${n0 + got + 1}.jpg`);
    if (await dl(r.url, localPath)) { spot.candidates.push({ url: r.url, file: r.file, localPath, w: r.w, h: r.h, desc: r.desc }); got++; have.add(t); }
    if (got >= 5) break;
    await sleep(80);
  }
  if (got) added++;
  process.stderr.write(`${got ? '✓' : '·'} ${key} ${spot.name} +${got}枚 (計${spot.candidates.length})\n`);
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`round2追加: ${added}/${Object.keys(PATCH).length} スポットに候補追加`);
