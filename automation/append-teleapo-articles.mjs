// Workflowで生成した teleapo記事JSON を lib/teleapo-features.ts に追記
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';
const wfOut = process.argv[2];
const raw = readFileSync(wfOut, 'utf-8');
const decoded = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const data = JSON.parse(decoded);
const articles = (data.result || data).articles || [];
console.log(`生成記事: ${articles.length}件`);

// FeatureArticle TS文字列を組み立て
function escTS(s) {
  if (s == null) return '""';
  return JSON.stringify(s);
}
function buildArticleBlock(a) {
  const ranking = a.ranking.map((r) => `      {
        rank: ${escTS(r.rank)},
        rankNum: ${r.rankNum},
        name: ${escTS(r.name)},
        cuisine: ${escTS(r.cuisine)},
        area: ${escTS(r.area)},
        purpose: ${escTS(r.purpose)},
        desc: ${escTS(r.desc)},
        images: ${r.imageRelPath ? `[${escTS(r.imageRelPath)}]` : '[]'},
        specs: [
${r.specs.map((s) => `          { k: ${escTS(s.k)}, v: ${escTS(s.v)} }`).join(',\n')}
        ]
      }`).join(',\n');
  return `  ${escTS(a.articleId)}: {
    id: ${escTS(a.articleId)},
    no: "",
    articleType: "guide" as const,
    kicker: ${escTS(a.kicker)},
    title: ${escTS(a.title)},
    titleHTML: ${escTS(a.titleHTML)},
    subtitle: ${escTS(a.subtitle)},
    lede: ${escTS(a.lede)},
    date: "2026-06-30",
    reading: "",
    author: "マチノワ編集部",
    heroImage: ${escTS(a.heroImagePath)},
    ogImage: ${escTS(a.heroImagePath)},
    ranking: [
${ranking}
    ],
    sideArticles: [],
    quote: ${escTS(a.quote)},
    quoteCite: ${escTS(a.quoteCite)},
    closing: ${escTS(a.closing)},
  },\n`;
}

const blocks = articles.map(buildArticleBlock).join('\n');
const target = 'lib/teleapo-features.ts';
const cur = readFileSync(target, 'utf-8');
// 末尾「  },\n\n};」の前に挿入
const next = cur.replace(/(\n\s*\},)\s*\n\s*\};\s*$/, `$1\n\n${blocks}\n};\n`);
if (next === cur) { console.error('❌ 挿入点が見つからない'); process.exit(1); }
writeFileSync(target, next);
console.log(`✅ ${target} に ${articles.length}記事追記`);

// プレースホルダ画像をコピー
for (const a of articles) {
  const dir = `public/restaurants/teleapo-${a.articleId}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  for (const f of ['hero.jpg', 'point2.jpg']) {
    const dst = join(dir, f);
    if (!existsSync(dst)) {
      copyFileSync('public/restaurants/_placeholder/feature-hero.jpg', dst);
      console.log(`  画像コピー: ${dst}`);
    }
  }
}

// ledger URL 更新用 mapping を出力
const urlMap = articles.map((a) => ({
  articleId: a.articleId,
  name: a.articleId === 'vegeeggLABO' ? 'vege egg LABO.' : 'ナナンテア nananthea',
  url: `https://machinowa.tokyo/feature/${a.articleId}`,
}));
writeFileSync('automation/manual-gen-urls.json', JSON.stringify(urlMap, null, 2));
console.log('URL一覧:', urlMap.map((u) => `${u.articleId}: ${u.url}`).join(', '));
