#!/usr/bin/env node
// フェーズ2: feature_articles.hero_image を新ヒーロー画像にUPDATE（DB優先配信のため必須）。
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
for (const line of readFileSync(join(ROOT, '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/); if (m) process.env[m[1]] = process.env[m[1]] ?? m[2];
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const hero = JSON.parse(readFileSync(join(ROOT, 'automation', 'phase2-hero-updates.json'), 'utf-8'));
let updated = 0, notInDb = 0, err = 0;
for (const [id, url] of Object.entries(hero)) {
  if (!url) continue;
  const { data, error } = await sb.from('feature_articles').update({ hero_image: url }).eq('id', id).select('id');
  if (error) { console.error(`✗ ${id}: ${error.message}`); err++; continue; }
  if (data && data.length) updated++; else notInDb++;
}
console.log(`DB hero_image 更新: ${updated}件 / DBに無く据え置き: ${notInDb}件 / エラー: ${err}`);
