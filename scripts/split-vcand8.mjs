#!/usr/bin/env node
// batch8-candidates.json を記事ごとの照合用ファイル automation/vcand8/<id>.json に分割。
// 各候補に表示用の0始まりindexを付け、ビジョンagentが見るローカル画像パスを記す。
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VDIR = join(ROOT, 'automation', 'vcand8');
mkdirSync(VDIR, { recursive: true });
const { articles } = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-candidates.json'), 'utf-8'));
const ids = [];
for (const a of articles) {
  const out = {
    id: a.id, title: a.title,
    spots: a.spots.map((s, i) => ({
      spot: i + 1, name: s.name, imageSubject: s.imageSubject, imageRegion: s.imageRegion,
      candidates: (s.candidates || []).map((c, n) => ({ index: n, localPath: c.localPath, file: c.file, desc: c.desc, w: c.w, h: c.h })),
    })),
  };
  writeFileSync(join(VDIR, `${a.id}.json`), JSON.stringify(out, null, 2));
  ids.push(a.id);
}
writeFileSync(join(VDIR, '_ids.json'), JSON.stringify(ids));
console.log(`照合用ファイル ${ids.length} 本 → automation/vcand8/`);
