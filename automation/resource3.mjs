// harajuku#5 / nara-park#2 / toji#4 の定番画像を狙って追加収集（少数リクエスト・429配慮）。
import { writeFileSync, existsSync } from 'fs';
const DIR = '/Users/shunta/claude/gourmet-portal/automation/fix25img';
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p) { const url = `${API}?${new URLSearchParams({ format: 'json', ...p })}`; for (let i = 0; i < 4; i++) { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 429 || r.status === 503) { await sleep(3000 * (i + 1)); continue; } return await r.json(); } return null; }
async function search(q, n = 6) { const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: '6', srlimit: String(n) }); return (j?.query?.search || []).map((h) => h.title); }
async function thumb(t) { const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime', iiurlwidth: '1280' }); const p = Object.values(j?.query?.pages || {})[0]; const info = p?.imageinfo?.[0]; if (!info) return null; if (info.mime && !/image\/(jpeg|png)/.test(info.mime)) return null; if (!info.width || info.width < 800) return null; if (info.height > info.width * 1.6) return null; return info.thumburl || info.url; }
async function dl(url, path) { if (existsSync(path)) return true; const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return false; const b = Buffer.from(await r.arrayBuffer()); if (b.length < 4000) return false; writeFileSync(path, b); return true; }
const jobs = [
  { key: 'new-harajuku-backstreet__5', queries: ['Takeshita Street Harajuku', 'Takeshita-dori Harajuku Tokyo', 'Cat Street Harajuku Tokyo'] },
  { key: 'kansai-nara-park-walk__2', queries: ['Sika deer Nara Park', 'Deer in Nara Park Japan', 'Nara deer bowing'] },
  { key: 'kyoto-toji-temple__4', queries: ['To-ji five-storied pagoda', 'Toji pagoda Kyoto', 'To-ji temple pagoda Kyoto'] },
];
for (const job of jobs) {
  const titles = new Set();
  for (const q of job.queries) { for (const t of await search(q, 5)) titles.add(t); await sleep(200); }
  let got = 0;
  for (const t of titles) {
    const u = await thumb(t); if (!u) { await sleep(120); continue; }
    const path = `${DIR}/${job.key}__R${got + 1}.jpg`;
    if (await dl(u, path)) { console.log('DL', job.key, 'R' + (got + 1), t.slice(0, 50)); got++; }
    if (got >= 3) break; await sleep(150);
  }
  if (!got) console.log('✗ なし', job.key);
}
