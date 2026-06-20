// TS型ストリップで feature ファイルを読み、{features, articles} を JSON 出力
const file = process.argv[2];      // 例: ../lib/newGuideFeaturesKansai.ts
const featVar = process.argv[3];   // 例: KANSAI_FEATURES
const artVar = process.argv[4];    // 例: KANSAI_FEATURE_ARTICLES
const out = process.argv[5];
const mod = await import(file);
const features = mod[featVar];
const articles = mod[artVar];
const fs = await import('fs');
fs.writeFileSync(out, JSON.stringify({ features, articles }, null, 2));
console.log(`${featVar}: ${features.length}枚 / ${artVar}: ${Object.keys(articles).length}本 → ${out}`);
