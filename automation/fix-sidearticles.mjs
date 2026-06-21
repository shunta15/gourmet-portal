// 各記事の sideArticles[].t（関連記事のリンク表示名）を、リンク先記事の現行タイトルに更新。
// 旧「◯◯5選」ラベルを脱テンプレ後タイトルに揃える。newGuide全11ファイルを再emit。
// 実行: node --experimental-strip-types automation/fix-sidearticles.mjs
import { writeFileSync } from 'fs';
const FILES = [
  ['newGuideFeatures', 'NEW_GUIDE_FEATURES', 'NEW_GUIDE_FEATURE_ARTICLES'],
  ['newGuideFeatures2', 'NEW_GUIDE_FEATURES_2', 'NEW_GUIDE_FEATURE_ARTICLES_2'],
  ['newGuideFeatures4', 'NEW_GUIDE_FEATURES_4', 'NEW_GUIDE_FEATURE_ARTICLES_4'],
  ['newGuideFeatures5', 'NEW_GUIDE_FEATURES_5', 'NEW_GUIDE_FEATURE_ARTICLES_5'],
  ['newGuideFeatures6', 'NEW_GUIDE_FEATURES_6', 'NEW_GUIDE_FEATURE_ARTICLES_6'],
  ['newGuideFeatures7', 'NEWGUIDE7_FEATURES', 'NEWGUIDE7_FEATURE_ARTICLES'],
  ['newGuideFeatures8', 'NEWGUIDE8_FEATURES', 'NEWGUIDE8_FEATURE_ARTICLES'],
  ['newGuideFeatures9', 'NEWGUIDE9_FEATURES', 'NEWGUIDE9_FEATURE_ARTICLES'],
  ['newGuideFeatures10', 'NEWGUIDE10_FEATURES', 'NEWGUIDE10_FEATURE_ARTICLES'],
  ['newGuideFeaturesKansai', 'KANSAI_FEATURES', 'KANSAI_FEATURE_ARTICLES'],
  ['newGuideFeaturesChubu', 'CHUBU_FEATURES', 'CHUBU_FEATURE_ARTICLES'],
];
const mods = {};
const titleMap = {};
for (const [f, fv, av] of FILES) {
  const m = await import(`../lib/${f}.ts`);
  if (!m[fv] || !m[av]) { console.log(`  SKIP ${f}: 変数名不一致 fv=${!!m[fv]} av=${!!m[av]}`); continue; }
  mods[f] = { features: m[fv], articles: m[av], fv, av };
  for (const id in m[av]) if (m[av][id].title) titleMap[id] = m[av][id].title;
  for (const c of m[fv]) if (c.title) titleMap[c.id] = c.title;
}
const idOf = (h) => { const m = (h || '').match(/\/feature\/([^/?#"]+)/); return m && m[1]; };
let fixed = 0, unmatched = new Set();
for (const f in mods) {
  for (const id in mods[f].articles) {
    const a = mods[f].articles[id];
    for (const key of ['sideArticles', 'related', 'sides']) {
      const sa = a[key];
      if (!Array.isArray(sa)) continue;
      for (const s of sa) {
        const rid = idOf(s.h || s.href || s.url);
        if (!rid) continue;
        const t = titleMap[rid];
        if (!t) { if (/選/.test(s.t || '')) unmatched.add(rid); continue; }
        if (s.t !== undefined && s.t !== t) { s.t = t; fixed++; }
      }
    }
  }
}
for (const f in mods) {
  const { features, articles, fv, av } = mods[f];
  const header = `import type { Feature, FeatureArticle } from "./data";\n\n// 自動生成。sideArticlesのリンク表示名を現行タイトルに同期(2026-06-21)。\n\n`;
  const body = `export const ${fv}: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
    `export const ${av}: Record<string, FeatureArticle> = ${JSON.stringify(articles, null, 2)};\n`;
  writeFileSync(`lib/${f}.ts`, header + body, 'utf-8');
}
console.log(`sideArticles表示名を更新: ${fixed}件 / 再emit ${Object.keys(mods).length}ファイル`);
if (unmatched.size) console.log(`未解決(map外の参照先・「選」を含む): ${[...unmatched].join(', ')}`);
