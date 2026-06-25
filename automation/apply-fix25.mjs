// fix25-final.json [{id,spot,url}] を該当spotに差替、fix25-trim.json はトリム。
// 旧ファイルはautomation/old、新バッチ(7-10)はlibから読み再emit。hero(先頭spot)変更はhero_image/カードも更新しDB用に出力。
// 実行: node --experimental-strip-types automation/apply-fix25.mjs
import { readFileSync, writeFileSync } from 'fs';
const ROOT = '/Users/shunta/claude/gourmet-portal';
const FILES = {
  newGuideFeatures: ['NEW_GUIDE_FEATURES', 'NEW_GUIDE_FEATURE_ARTICLES', 'old'],
  newGuideFeatures2: ['NEW_GUIDE_FEATURES_2', 'NEW_GUIDE_FEATURE_ARTICLES_2', 'old'],
  newGuideFeatures4: ['NEW_GUIDE_FEATURES_4', 'NEW_GUIDE_FEATURE_ARTICLES_4', 'old'],
  newGuideFeatures5: ['NEW_GUIDE_FEATURES_5', 'NEW_GUIDE_FEATURE_ARTICLES_5', 'old'],
  newGuideFeatures6: ['NEW_GUIDE_FEATURES_6', 'NEW_GUIDE_FEATURE_ARTICLES_6', 'old'],
  newGuideFeaturesKansai: ['KANSAI_FEATURES', 'KANSAI_FEATURE_ARTICLES', 'old'],
  newGuideFeaturesChubu: ['CHUBU_FEATURES', 'CHUBU_FEATURE_ARTICLES', 'old'],
  newGuideFeatures7: ['NEWGUIDE7_FEATURES', 'NEWGUIDE7_FEATURE_ARTICLES', 'lib'],
  newGuideFeatures8: ['NEWGUIDE8_FEATURES', 'NEWGUIDE8_FEATURE_ARTICLES', 'lib'],
  newGuideFeatures9: ['NEWGUIDE9_FEATURES', 'NEWGUIDE9_FEATURE_ARTICLES', 'lib'],
  newGuideFeatures10: ['NEWGUIDE10_FEATURES', 'NEWGUIDE10_FEATURE_ARTICLES', 'lib'],
};
const input = JSON.parse(readFileSync(ROOT + '/automation/fix25-input.json', 'utf-8'));
const fileOf = {}; for (const it of input) fileOf[it.id] = it.file;
const finals = JSON.parse(readFileSync(ROOT + '/automation/fix25-final.json', 'utf-8'));
const trims = JSON.parse(readFileSync(ROOT + '/automation/fix25-trim.json', 'utf-8'));

const byFile = {};
for (const f of finals) { const file = fileOf[f.id]; (byFile[file] ||= []).push({ ...f, act: 'set' }); }
for (const t of trims) { const file = fileOf[t.id]; (byFile[file] ||= []).push({ ...t, act: 'trim' }); }

async function loadFile(f) {
  const [fv, av, src] = FILES[f];
  if (src === 'old') { const d = JSON.parse(readFileSync(`${ROOT}/automation/old/${f}.json`, 'utf-8')); return { features: d.features, articles: d.articles, fv, av }; }
  const m = await import(`../lib/${f}.ts`); return { features: m[fv], articles: m[av], fv, av };
}
const heroUpdates = {};
let setN = 0, trimN = 0;
for (const f of Object.keys(byFile)) {
  const { features, articles, fv, av } = await loadFile(f);
  const byArt = {};
  for (const a of byFile[f]) (byArt[a.id] ||= []).push(a);
  for (const id of Object.keys(byArt)) {
    const art = articles[id]; if (!art || !Array.isArray(art.ranking)) continue;
    const acts = byArt[id].sort((x, y) => y.spot - x.spot);
    for (const a of acts) {
      const i = a.spot - 1; const rk = art.ranking[i]; if (!rk) continue;
      if (a.act === 'trim') { art.ranking.splice(i, 1); trimN++; }
      else { rk.images = [a.url]; setN++; }
    }
    const heroUrl = art.ranking?.[0]?.images?.[0];
    if (heroUrl && art.heroImage !== heroUrl) { art.heroImage = heroUrl; }
    const card = features.find((x) => x.id === id); if (card && heroUrl) card.image = heroUrl;
    if (heroUrl) heroUpdates[id] = heroUrl;
  }
  const header = `import type { Feature, FeatureArticle } from "./data";\n\n// 自動生成。誤掲載25スポットの目視差替/トリム(2026-06-25)。\n\n`;
  const body = `export const ${fv}: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
    `export const ${av}: Record<string, FeatureArticle> = ${JSON.stringify(articles, null, 2)};\n`;
  writeFileSync(`${ROOT}/lib/${f}.ts`, header + body, 'utf-8');
  console.log(`  ${f}.ts 再emit`);
}
writeFileSync(ROOT + '/automation/fix25-hero-updates.json', JSON.stringify(heroUpdates, null, 2));
console.log(`差替 ${setN} / トリム ${trimN} / hero更新候補 ${Object.keys(heroUpdates).length}`);
