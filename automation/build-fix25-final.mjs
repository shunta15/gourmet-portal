// 私が目視で選んだ25件の採用localFileをURLに解決し、fix25-final.json [{id,spot,url}] を出力。
import { readFileSync, writeFileSync } from 'fs';
const ROOT = '/Users/shunta/claude/gourmet-portal';
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 選定: id, spot, 採用localFile basename
const CHOSEN = [
  ['new-enoshima-evening-date', 4, 'new-enoshima-evening-date__4__1.jpg'],
  ['new-musashikosugi-family', 4, 'new-musashikosugi-family__4__1.jpg'],
  ['new-ueno-museum', 2, 'new-ueno-museum__2__1.jpg'],
  ['new-shinjuku-time', 2, 'new-shinjuku-time__2__2.jpg'],
  ['new-skytree-area', 5, 'new-skytree-area__5__1.jpg'],
  ['new-nakameguro-walk', 2, 'new-nakameguro-walk__2__1.jpg'],
  ['new-nakameguro-walk', 5, 'new-nakameguro-walk__5__3.jpg'],
  ['new-jiyugaoka-patisserie', 1, 'new-jiyugaoka-patisserie__1__1.jpg'],
  ['new-jiyugaoka-patisserie', 2, 'new-jiyugaoka-patisserie__2__1.jpg'],
  ['new-jiyugaoka-patisserie', 3, 'new-jiyugaoka-patisserie__3__2.jpg'],
  ['new-hachioji-gourmet', 5, 'new-hachioji-gourmet__5__3.jpg'],
  ['new-kanagawa-weekend', 5, 'new-kanagawa-weekend__5__1.jpg'],
  ['kansai-shinsekai-tsutenkaku', 3, 'kansai-shinsekai-tsutenkaku__3__2.jpg'],
  ['kansai-tennoji-abeno-family', 2, 'kansai-tennoji-abeno-family__2__1.jpg'],
  ['kansai-nara-park-walk', 1, 'kansai-nara-park-walk__1__2.jpg'],
  ['kansai-naramachi-walk', 2, 'kansai-naramachi-walk__2__3.jpg'],
  ['kansai-naramachi-walk', 4, 'kansai-naramachi-walk__4__1.jpg'],
  ['chubu-nagoya-station-walk', 3, 'chubu-nagoya-station-walk__3__3.jpg'],
  ['chubu-atsuta-jingu-walk', 5, 'chubu-atsuta-jingu-walk__5__1.jpg'],
  ['kanto-kawagoe-walk', 4, 'kanto-kawagoe-walk__4__1.jpg'],
  ['kyoto-ohara-sanzen', 5, 'kyoto-ohara-sanzen__5__1.jpg'],
  ['shiga-biwako-terrace', 3, 'shiga-biwako-terrace__3__1.jpg'],
];
// 再収集(R)分は File: タイトルから解決
const RFILES = [
  ['new-harajuku-backstreet', 5, 'File:Takeshita Street.jpg'],
  ['kansai-nara-park-walk', 2, 'File:Sika deer in Nara Park, November 2016.jpg'],
  ['kyoto-toji-temple', 4, 'TOJI_LOTUS'],
];
async function api(p) { const url = `${API}?${new URLSearchParams({ format: 'json', ...p })}`; for (let i = 0; i < 4; i++) { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 429) { await sleep(3000); continue; } return await r.json(); } return null; }
async function urlOf(title) { const j = await api({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1280' }); const p = Object.values(j?.query?.pages || {})[0]; return p?.imageinfo?.[0]?.thumburl || p?.imageinfo?.[0]?.url || null; }
async function findToji() { const j = await api({ action: 'query', list: 'search', srsearch: 'To-ji five-storied pagoda lotus pond', srnamespace: '6', srlimit: '8' }); for (const h of (j?.query?.search || [])) { if (/lotus|pond|To-ji|Toji/i.test(h.title) && /pagoda/i.test(h.title)) { const u = await urlOf(h.title); if (u) return u; } } const j2 = await api({ action: 'query', list: 'search', srsearch: 'To-ji pagoda Kyoto lotus', srnamespace: '6', srlimit: '5' }); for (const h of (j2?.query?.search || [])) { const u = await urlOf(h.title); if (u) return u; } return null; }

const cand = JSON.parse(readFileSync(ROOT + '/automation/fix25-cand.json', 'utf-8'));
const lp2url = {};
for (const o of cand) for (const c of o.candidates) lp2url[c.localPath.split('/').pop()] = c.url;
const final = [];
for (const [id, spot, lf] of CHOSEN) { const url = lp2url[lf]; if (!url) { console.log('URL未解決', id, spot, lf); continue; } final.push({ id, spot, url }); }
for (const [id, spot, title] of RFILES) { let url = title === 'TOJI_LOTUS' ? await findToji() : await urlOf(title); if (!url) { console.log('R URL未解決', id, spot, title); continue; } final.push({ id, spot, url }); await sleep(300); }
writeFileSync(ROOT + '/automation/fix25-final.json', JSON.stringify(final, null, 2));
console.log(`確定 ${final.length}/25 件`);
for (const f of final) if (/toji/.test(f.id)) console.log('  東寺URL:', f.url);
