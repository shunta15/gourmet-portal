#!/usr/bin/env node
// 脱テンプレ改修した記事の title/title_html/subtitle/lede を Supabase の
// feature_articles に「UPDATE」する（upsert/削除はしない＝既存行の該当列のみ更新）。
// DB優先配信なので、これを実行しないとDBにある旧記事は旧タイトルのまま表示される。
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WFOUT = process.argv[2];

for (const line of readFileSync(join(ROOT, '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/); if (m) process.env[m[1]] = process.env[m[1]] ?? m[2];
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const wf = JSON.parse(readFileSync(WFOUT, 'utf-8'));
const rewritten = (wf.result || wf).rewritten || [];
const strip = (s) => typeof s === 'string' ? s.replace(/\s*(署名[：:／\/]?\s*)?マチノワ編集部[。.]?\s*$/, '').trim() : s;

let updated = 0, notInDb = 0, errs = 0;
for (const r of rewritten) {
  const patch = { title: strip(r.title), title_html: r.titleHTML, subtitle: strip(r.subtitle), lede: strip(r.lede) };
  const { data, error } = await sb.from('feature_articles').update(patch).eq('id', r.id).select('id');
  if (error) { console.error(`✗ ${r.id}: ${error.message}`); errs++; continue; }
  if (data && data.length) { updated++; } else { notInDb++; }
}
console.log(`DB更新: ${updated}件 / DBに無く据え置き(=コード配信): ${notInDb}件 / エラー: ${errs}`);
