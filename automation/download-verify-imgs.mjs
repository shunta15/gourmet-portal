// verify-manifest.json の全画像をローカルへ収集（429回避: 緩やか・再開可能）。
// 各行に localFile を付与して verify-manifest-local.json に保存。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
const ROOT = '/Users/shunta/claude/gourmet-portal';
const DIR = ROOT + '/automation/verify';
mkdirSync(DIR, { recursive: true });
const rows = JSON.parse(readFileSync(ROOT + '/automation/verify-manifest.json', 'utf-8'));
const UA = 'MachinowaBot/1.0 (https://machinowa.tokyo; editorial)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let dl = 0, reuse = 0, fail = 0;
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  if (r.local && existsSync(r.local)) { r.localFile = r.local; reuse++; continue; }
  const target = `${DIR}/${String(i).padStart(3, '0')}.jpg`;
  if (existsSync(target)) { r.localFile = target; reuse++; continue; }
  let ok = false;
  for (let attempt = 0; attempt < 4 && !ok; attempt++) {
    try {
      const res = await fetch(r.url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { await sleep(4000 * (attempt + 1)); continue; }
      if (!res.ok) break;
      const b = Buffer.from(await res.arrayBuffer());
      if (b.length < 2000) break;
      writeFileSync(target, b); r.localFile = target; ok = true; dl++;
    } catch { await sleep(1500); }
  }
  if (!ok) { fail++; r.localFile = null; }
  await sleep(650);
  if (i % 40 === 0) { writeFileSync(ROOT + '/automation/verify-manifest-local.json', JSON.stringify(rows, null, 2)); process.stderr.write(`...${i}/${rows.length} (DL ${dl} / 再利用 ${reuse} / 失敗 ${fail})\n`); }
}
writeFileSync(ROOT + '/automation/verify-manifest-local.json', JSON.stringify(rows, null, 2));
console.log(`収集完了: DL ${dl} / ローカル再利用 ${reuse} / 失敗 ${fail} / 計 ${rows.length}`);
