#!/usr/bin/env node
// 脱テンプレ改修(テキスト)を旧7ファイルに反映し、各ファイルをJSON形式で再emit。
// 画像(ranking[].images)は変更しない。画像検証フェーズ2用に
// {id -> spots:[{name,imageSubject,imageRegion,currentImage}]} を automation/phase2-images.json に保存。
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WFOUT = process.argv[2];
const FILES = {
  newGuideFeatures: ['NEW_GUIDE_FEATURES', 'NEW_GUIDE_FEATURE_ARTICLES'],
  newGuideFeatures2: ['NEW_GUIDE_FEATURES_2', 'NEW_GUIDE_FEATURE_ARTICLES_2'],
  newGuideFeatures4: ['NEW_GUIDE_FEATURES_4', 'NEW_GUIDE_FEATURE_ARTICLES_4'],
  newGuideFeatures5: ['NEW_GUIDE_FEATURES_5', 'NEW_GUIDE_FEATURE_ARTICLES_5'],
  newGuideFeatures6: ['NEW_GUIDE_FEATURES_6', 'NEW_GUIDE_FEATURE_ARTICLES_6'],
  newGuideFeaturesKansai: ['KANSAI_FEATURES', 'KANSAI_FEATURE_ARTICLES'],
  newGuideFeaturesChubu: ['CHUBU_FEATURES', 'CHUBU_FEATURE_ARTICLES'],
};
const wf = JSON.parse(readFileSync(WFOUT, 'utf-8'));
const rewritten = (wf.result || wf).rewritten || [];
const rmap = Object.fromEntries(rewritten.map((r) => [r.id, r]));
const strip = (s) => typeof s === 'string' ? s.replace(/\s*(署名[：:／\/]?\s*)?マチノワ編集部[。.]?\s*$/, '').trim() : s;

const phase2 = {};
let total = 0;
for (const [file, [fv, av]] of Object.entries(FILES)) {
  const d = JSON.parse(readFileSync(join(ROOT, 'automation', 'old', `${file}.json`), 'utf-8'));
  const { features, articles } = d;
  for (const id of Object.keys(articles)) {
    const r = rmap[id]; if (!r) continue;
    const a = articles[id];
    a.title = strip(r.title); a.titleHTML = r.titleHTML; a.subtitle = strip(r.subtitle);
    a.lede = strip(r.lede); a.quote = strip(r.quote); a.closing = strip(r.closing);
    if (r.articleType) a.articleType = r.articleType;
    const card = features.find((f) => f.id === id);
    if (card) { card.title = a.title; card.sub = a.subtitle; }
    // フェーズ2: 被写体と現画像を退避（ranking順）
    const subs = r.spots || [];
    phase2[id] = (a.ranking || []).map((rk, i) => ({
      name: rk.name, area: rk.area,
      imageSubject: subs[i]?.imageSubject || rk.name,
      imageRegion: subs[i]?.imageRegion || '',
      currentImage: (rk.images || [])[0] || '',
    }));
    total++;
  }
  const header = `import type { Feature, FeatureArticle } from "./data";\n\n// 自動生成（脱テンプレ改修 2026-06-20）: テキスト/articleTypeを4ペルソナで多様化。スポット・画像は保持。\n\n`;
  const body = `export const ${fv}: Feature[] = ${JSON.stringify(features, null, 2)};\n\n` +
    `export const ${av}: Record<string, FeatureArticle> = ${JSON.stringify(articles, null, 2)};\n`;
  writeFileSync(join(ROOT, 'lib', `${file}.ts`), header + body, 'utf-8');
  console.log(`  ${file}.ts 再生成`);
}
writeFileSync(join(ROOT, 'automation', 'phase2-images.json'), JSON.stringify(phase2, null, 2));
console.log(`脱テンプレ反映 ${total}本 / フェーズ2画像データ ${Object.keys(phase2).length}本分を保存`);
