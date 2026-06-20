#!/usr/bin/env node
// query-gen WF出力の英語クエリで、ゼロ候補スポットに候補を追加収集。
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FILE = join(ROOT, 'automation', 'batch8-candidates.json');
const IMGDIR = join(ROOT, 'automation', 'imgcand');
const QOUT = process.argv[2];
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p) { const url = `${API}?${new URLSearchParams({ format: 'json', ...p })}`; for (let i = 0; i < 4; i++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 429 || r.status === 503) { await sleep(1500 * (i + 1)); continue; } if (!r.ok) return null; return await r.json(); } catch { await sleep(800 * (i + 1)); } } return null; }
async function st(q, ns, lim = 8) { const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: String(ns), srlimit: String(lim) }); return (j?.query?.search || []).map((h) => h.title); }
async function fic(cat, lim = 12) { const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: 'file', cmlimit: String(lim) }); return (j?.query?.categorymembers || []).map((m) => m.title); }
async function thumb(t) { const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280' }); const p = Object.values(j?.query?.pages || {})[0]; if (!p || p.missing !== undefined) return null; const info = p.imageinfo?.[0]; if (!info) return null; if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null; if (!info.width || info.width < 700) return null; if (info.height > info.width * 1.7) return null; const desc = (info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 160); return { url: info.thumburl || info.url, file: t, w: info.width, h: info.height, desc }; }
async function dl(url, path) { try { if (existsSync(path)) return true; const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return false; const b = Buffer.from(await r.arrayBuffer()); if (b.length < 3000) return false; writeFileSync(path, b); return true; } catch { return false; } }

const data = JSON.parse(readFileSync(FILE, 'utf-8'));
const byId = Object.fromEntries(data.articles.map((a) => [a.id, a]));
const q = JSON.parse(readFileSync(QOUT, 'utf-8'));
const qlist = (q.result || q).queries || [];
let fixed = 0, total = 0;
for (const art of qlist) {
  const a = byId[art.id]; if (!a) continue;
  for (const sp of (art.spots || [])) {
    const idx = sp.spot - 1; const spot = a.spots[idx]; if (!spot) continue;
    if (spot.candidates && spot.candidates.length) continue; // 既に有ればスキップ
    total++;
    const titles = new Set();
    for (const query of sp.queries) {
      for (const c of (await st(query, 14, 2)).slice(0, 1)) for (const f of await fic(c, 8)) titles.add(f);
      for (const f of await st(query, 6, 6)) titles.add(f);
      await sleep(110);
    }
    spot.candidates = [];
    let got = 0;
    for (const t of [...titles].slice(0, 22)) {
      const r = await thumb(t); if (!r) { await sleep(60); continue; }
      const localPath = join(IMGDIR, `${art.id}__${sp.spot}__${got + 1}.jpg`);
      if (await dl(r.url, localPath)) { spot.candidates.push({ url: r.url, file: r.file, localPath, w: r.w, h: r.h, desc: r.desc }); got++; }
      if (got >= 4) break;
      await sleep(70);
    }
    if (got) fixed++;
    process.stderr.write(`${got ? '✓' : '✗'} ${art.id}#${sp.spot} ${spot.name} +${got}\n`);
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
let z = 0; for (const a of data.articles) for (const s of a.spots) if (!(s.candidates && s.candidates.length)) z++;
console.log(`クエリ再収集: ${fixed}/${total} スポットで候補確保 / 残りゼロ ${z}`);
