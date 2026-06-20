// 現在のlib7ファイル（脱テンプレ済みテキスト＋現画像）を automation/old/*.json に再ダンプ。
// lib各ファイルの import は `import type {...} from "./data"` のみ＝型stripで消えるので解決不要。
import { writeFileSync } from 'fs';
const FILES = [
  ['newGuideFeatures', 'NEW_GUIDE_FEATURES', 'NEW_GUIDE_FEATURE_ARTICLES'],
  ['newGuideFeatures2', 'NEW_GUIDE_FEATURES_2', 'NEW_GUIDE_FEATURE_ARTICLES_2'],
  ['newGuideFeatures4', 'NEW_GUIDE_FEATURES_4', 'NEW_GUIDE_FEATURE_ARTICLES_4'],
  ['newGuideFeatures5', 'NEW_GUIDE_FEATURES_5', 'NEW_GUIDE_FEATURE_ARTICLES_5'],
  ['newGuideFeatures6', 'NEW_GUIDE_FEATURES_6', 'NEW_GUIDE_FEATURE_ARTICLES_6'],
  ['newGuideFeaturesKansai', 'KANSAI_FEATURES', 'KANSAI_FEATURE_ARTICLES'],
  ['newGuideFeaturesChubu', 'CHUBU_FEATURES', 'CHUBU_FEATURE_ARTICLES'],
];
let n5 = 0;
for (const [f, fv, av] of FILES) {
  const m = await import(`../lib/${f}.ts`);
  const features = m[fv]; const articles = m[av];
  for (const id of Object.keys(articles)) if (/5選/.test(articles[id].title || '')) n5++;
  writeFileSync(`automation/old/${f}.json`, JSON.stringify({ features, articles }, null, 2));
  console.log(`  ${f}: ${features.length}枚 / ${Object.keys(articles).length}本`);
}
console.log(`再ダンプ完了。ダンプ内5選: ${n5}（0なら脱テンプレ保持OK）`);
