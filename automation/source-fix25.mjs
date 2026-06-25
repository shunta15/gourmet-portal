// fix25 クエリ出力で候補を収集。各itemに candidates[]（specific/area タグ付き・localPath付き）を付与。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
const ROOT = '/Users/shunta/claude/gourmet-portal';
const DIR = ROOT + '/automation/fix25img';
mkdirSync(DIR, { recursive: true });
const QOUT = process.argv[2];
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p) { const url = `${API}?${new URLSearchParams({ format: 'json', ...p })}`; for (let i = 0; i < 4; i++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 429 || r.status === 503) { await sleep(2500 * (i + 1)); continue; } if (!r.ok) return null; return await r.json(); } catch { await sleep(900 * (i + 1)); } } return null; }
async function st(q, ns, lim) { const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: String(ns), srlimit: String(lim) }); return (j?.query?.search || []).map((h) => h.title); }
async function fic(cat, lim = 8) { const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmtype: 'file', cmlimit: String(lim) }); return (j?.query?.categorymembers || []).map((m) => m.title); }
async function thumb(t) { const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280' }); const p = Object.values(j?.query?.pages || {})[0]; if (!p || p.missing !== undefined) return null; const info = p.imageinfo?.[0]; if (!info) return null; if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null; if (!info.width || info.width < 700) return null; if (info.height > info.width * 1.7) return null; const desc = (info.extmetadata?.ImageDescription?.value || '').replace(/<[^>]*>/g, '').slice(0, 160); return { url: info.thumburl || info.url, file: t, w: info.width, h: info.height, desc }; }
async function dl(url, path) { try { if (existsSync(path)) return true; const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return false; const b = Buffer.from(await r.arrayBuffer()); if (b.length < 3000) return false; writeFileSync(path, b); return true; } catch { return false; } }

const qd = JSON.parse(readFileSync(QOUT, 'utf-8'));
const items = (qd.result || qd).queries || [];
const out = [];
for (const it of items) {
  const titles = []; // [{title, tag}]
  for (const q of (it.queries || [])) { for (const c of (await st(q, 14, 1)).slice(0, 1)) for (const f of await fic(c, 6)) titles.push({ title: f, tag: 'specific' }); for (const f of await st(q, 6, 5)) titles.push({ title: f, tag: 'specific' }); await sleep(120); }
  for (const q of (it.areaQueries || [])) { for (const f of await st(q, 6, 4)) titles.push({ title: f, tag: 'area' }); await sleep(120); }
  const seen = new Set(); const cands = []; let got = 0;
  for (const { title, tag } of titles) {
    if (seen.has(title)) continue; seen.add(title);
    const r = await thumb(title); if (!r) { await sleep(50); continue; }
    const lp = `${DIR}/${it.id}__${it.spot}__${got + 1}.jpg`;
    if (await dl(r.url, lp)) { cands.push({ url: r.url, file: r.file, localPath: lp, tag, desc: r.desc }); got++; }
    if (got >= 8) break; await sleep(70);
  }
  out.push({ id: it.id, spot: it.spot, candidates: cands });
  process.stderr.write(`${got ? '✓' : '✗'} ${it.id}#${it.spot} +${got}\n`);
}
writeFileSync(ROOT + '/automation/fix25-cand.json', JSON.stringify(out, null, 2));
const zero = out.filter((o) => !o.candidates.length).length;
console.log(`収集完了: ${out.length}件 / 候補ゼロ ${zero}`);
