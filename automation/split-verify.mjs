// verify-manifest-local.json を記事ごとに分割。agentがReadする automation/verify-art/<id>.json を生成。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
const ROOT = '/Users/shunta/claude/gourmet-portal';
mkdirSync(ROOT + '/automation/verify-art', { recursive: true });
const rows = JSON.parse(readFileSync(ROOT + '/automation/verify-manifest-local.json', 'utf-8'));
const byId = {};
for (const r of rows) {
  if (!r.localFile || !existsSync(r.localFile)) continue;
  (byId[r.id] ||= []).push({ spot: r.spot, name: r.name, localFile: r.localFile });
}
const ids = Object.keys(byId);
for (const id of ids) writeFileSync(`${ROOT}/automation/verify-art/${id}.json`, JSON.stringify({ id, spots: byId[id] }, null, 2));
writeFileSync(ROOT + '/automation/verify-art/_ids.json', JSON.stringify(ids));
let miss = 0; for (const r of rows) if (!r.localFile) miss++;
console.log(`分割: ${ids.length}記事 / 画像欠落(DL失敗): ${miss}`);
