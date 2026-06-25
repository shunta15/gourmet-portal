import { readFileSync, writeFileSync } from 'fs';
const OLD = ['newGuideFeatures', 'newGuideFeatures2', 'newGuideFeatures4', 'newGuideFeatures5', 'newGuideFeatures6', 'newGuideFeaturesKansai', 'newGuideFeaturesChubu'];
const NEW = [['newGuideFeatures7', 'NEWGUIDE7_FEATURE_ARTICLES'], ['newGuideFeatures8', 'NEWGUIDE8_FEATURE_ARTICLES'], ['newGuideFeatures9', 'NEWGUIDE9_FEATURE_ARTICLES'], ['newGuideFeatures10', 'NEWGUIDE10_FEATURE_ARTICLES']];
const arts = {}, fileOf = {};
for (const f of OLD) { const d = JSON.parse(readFileSync(`automation/old/${f}.json`, 'utf-8')); for (const id in d.articles) { arts[id] = d.articles[id]; fileOf[id] = f; } }
for (const [f, av] of NEW) { const m = await import(`../lib/${f}.ts`); for (const id in (m[av] || {})) { arts[id] = m[av][id]; fileOf[id] = f; } }
const mm = JSON.parse(readFileSync('automation/mismatch25.json', 'utf-8'));
const out = [];
for (const x of mm) {
  const a = arts[x.id]; if (!a) { console.log('見つからない', x.id); continue; }
  const rk = (a.ranking || [])[x.spot - 1];
  out.push({ id: x.id, spot: x.spot, file: fileOf[x.id], name: rk?.name || '', area: rk?.area || '', badNote: x.note });
}
writeFileSync('automation/fix25-input.json', JSON.stringify(out, null, 2));
out.forEach((o) => console.log(`${o.file} | ${o.id}#${o.spot} | ${o.name} | area:${o.area}`));
