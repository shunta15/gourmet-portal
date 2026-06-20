#!/usr/bin/env node
// フェーズ2: ビジョン照合で採用した新画像を旧7ファイルの ranking[].images と heroImage に反映、再emit。
// 採用なし(imageUrl=null)のスポットは旧画像を維持。DBのhero_image更新用に {id->heroImage} を出力。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FILES = {
  newGuideFeatures: ['NEW_GUIDE_FEATURES', 'NEW_GUIDE_FEATURE_ARTICLES'],
  newGuideFeatures2: ['NEW_GUIDE_FEATURES_2', 'NEW_GUIDE_FEATURE_ARTICLES_2'],
  newGuideFeatures4: ['NEW_GUIDE_FEATURES_4', 'NEW_GUIDE_FEATURE_ARTICLES_4'],
  newGuideFeatures5: ['NEW_GUIDE_FEATURES_5', 'NEW_GUIDE_FEATURE_ARTICLES_5'],
  newGuideFeatures6: ['NEW_GUIDE_FEATURES_6', 'NEW_GUIDE_FEATURE_ARTICLES_6'],
  newGuideFeaturesKansai: ['KANSAI_FEATURES', 'KANSAI_FEATURE_ARTICLES'],
  newGuideFeaturesChubu: ['CHUBU_FEATURES', 'CHUBU_FEATURE_ARTICLES'],
};
const resolved = JSON.parse(readFileSync(join(ROOT, 'automation', 'batch8-resolved.json'), 'utf-8')).articles;
const rmap = Object.fromEntries(resolved.map((a) => [a.id, a]));
const fileOf = JSON.parse(readFileSync(join(ROOT, 'automation', 'detmpl61', '_fileOf.json'), 'utf-8'));

const heroUpdates = {};
let changedSpots = 0, changedHero = 0;
const dumps = {};
for (const f of Object.keys(FILES)) dumps[f] = JSON.parse(readFileSync(join(ROOT, 'automation', 'old', `${f}.json`), 'utf-8'));

for (const [id, file] of Object.entries(fileOf)) {
  const r = rmap[id]; if (!r) continue;
  const a = dumps[file].articles[id]; if (!a) continue;
  (a.ranking || []).forEach((rk, i) => {
    const url = r.spots[i]?.imageUrl;
    if (url && (rk.images || [])[0] !== url) { rk.images = [url]; changedSpots++; }
  });
  // hero = 先頭スポット(=heroSpotIndex 0)の画像
  const hi = Number.isInteger(r.heroSpotIndex) ? r.heroSpotIndex : 0;
  const heroUrl = a.ranking?.[hi]?.images?.[0];
  if (heroUrl && a.heroImage !== heroUrl) { a.heroImage = heroUrl; changedHero++; }
  // FEATURESカードのimageもhero画像に合わせる
  const card = dumps[file].features.find((x) => x.id === id);
  if (card && heroUrl) card.image = heroUrl;
  heroUpdates[id] = a.heroImage;
}

for (const [file, [fv, av]] of Object.entries(FILES)) {
  const { features, articles } = dumps[file];
  const header = `import type { Feature, FeatureArticle } from "./data";\n\n// 自動生成（脱テンプレ改修＋画像ビジョン照合 2026-06-20）。\n\n`;
  const body = `export const ${fv}: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
    `export const ${av}: Record<string, FeatureArticle> = ${JSON.stringify(articles, null, 2)};\n`;
  writeFileSync(join(ROOT, 'lib', `${file}.ts`), header + body, 'utf-8');
}
writeFileSync(join(ROOT, 'automation', 'phase2-hero-updates.json'), JSON.stringify(heroUpdates, null, 2));
console.log(`画像差替: spot ${changedSpots}件 / hero ${changedHero}件 → 7ファイル再emit`);
console.log(`DB hero_image 更新対象: ${Object.keys(heroUpdates).length}本 (phase2-hero-updates.json)`);
