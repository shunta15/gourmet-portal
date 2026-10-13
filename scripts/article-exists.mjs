#!/usr/bin/env node
// 記事ID が lib/teleapo-features.ts に実在するか（NFC に揃えて完全一致）。
// 使い方: node scripts/article-exists.mjs "<記事ID>"   → 実在=exit 0 / 無い=exit 1
//
// local-pipeline.sh から、
//   ・claude を起動する前（既に同じIDの記事があるなら起動しない＝重複生成・空回り防止）
//   ・claude が「完了」と言った後（記事が実在しなければ成功扱いにしない）
// の 2 か所で呼ぶ。ログや claude の自己申告ではなく、成果物（記事の実在）で判定するため。
// 照合は NFC 正規化したうえでの完全一致のみ。中間一致・includes は使わない。
import { readFileSync } from 'fs';

const id = (process.argv[2] ?? '').normalize('NFC');
if (!id) {
  console.error('usage: node scripts/article-exists.mjs "<記事ID>"');
  process.exit(2);
}
const src = readFileSync(new URL('../lib/teleapo-features.ts', import.meta.url), 'utf-8');
const ids = new Set([...src.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)].map((m) => m[1].normalize('NFC')));
process.exit(ids.has(id) ? 0 : 1);
