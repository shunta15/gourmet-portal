// 生成記事JSON群を lib/teleapo-features.ts に追記し、プレースホルダ画像を配置する
// 使い方: node automation/apply-articles.mjs <dir-or-file...>
// 出力: automation/applied-urls.json（articleId → URL の対応表。スプシ書き戻しに使う）
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

function dec(s) {
  return (s == null ? '' : String(s))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}
const esc = (s) => JSON.stringify(s == null ? '' : String(s));

function collect(t) {
  if (statSync(t).isDirectory()) return readdirSync(t).filter((f) => f.endsWith('.json')).map((f) => join(t, f));
  return [t];
}

const files = process.argv.slice(2).flatMap(collect);
if (!files.length) { console.error('❌ 入力が無い'); process.exit(1); }

const target = 'lib/teleapo-features.ts';
let cur = readFileSync(target, 'utf-8');
const today = new Date().toISOString().slice(0, 10);

const applied = [];
const blocks = [];

for (const file of files) {
  const a = JSON.parse(readFileSync(file, 'utf-8'));
  const id = a.articleId;
  if (!id) { console.error(`❌ articleId 無し: ${file}`); process.exit(1); }
  if (cur.includes(`"${id}":`) || blocks.some((b) => b.id === id)) {
    console.log(`⏭️  既に存在するのでスキップ: ${id}`);
    continue;
  }

  const heroPath = `/restaurants/teleapo-${id}/hero.jpg`;
  const point2Path = `/restaurants/teleapo-${id}/point2.jpg`;

  const ranking = a.ranking.map((r, i) => {
    const imgs = i === 0 ? `[${esc(heroPath)}]` : i === 1 ? `[${esc(point2Path)}]` : '[]';
    return `      {
        rank: ${esc(r.rank)},
        rankNum: ${r.rankNum ?? i + 1},
        name: ${esc(r.name)},
        cuisine: ${esc(r.cuisine)},
        area: ${esc(r.area)},
        purpose: ${esc(r.purpose)},
        desc: ${esc(r.desc)},
        images: ${imgs},
        specs: [
${r.specs.map((s) => `          { k: ${esc(s.k)}, v: ${esc(s.v)} }`).join(',\n')}
        ]
      }`;
  }).join(',\n');

  const block = `  ${esc(id)}: {
    id: ${esc(id)},
    no: "",
    articleType: "guide" as const,
    kicker: ${esc(a.kicker)},
    title: ${esc(a.title)},
    titleHTML: ${esc(dec(a.titleHTML))},
    subtitle: ${esc(a.subtitle)},
    lede: ${esc(a.lede)},
    date: ${esc(today)},
    reading: "",
    author: "マチノワ編集部",
    heroImage: ${esc(heroPath)},
    ogImage: ${esc(heroPath)},
    ranking: [
${ranking}
    ],
    sideArticles: [],
    quote: ${esc(a.quote)},
    quoteCite: ${esc(a.quoteCite)},
    closing: ${esc(a.closing)},
  },\n`;

  blocks.push({ id, block });
  applied.push({ articleId: id, url: `https://machinowa.tokyo/feature/${id}` });

  // プレースホルダ画像
  const dir = `public/restaurants/teleapo-${id}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  for (const f of ['hero.jpg', 'point2.jpg']) {
    const dst = join(dir, f);
    if (!existsSync(dst)) copyFileSync('public/restaurants/_placeholder/feature-hero.jpg', dst);
  }
}

if (!blocks.length) { console.log('追記対象なし'); process.exit(0); }

const joined = blocks.map((b) => b.block).join('\n');
const next = cur.replace(/(\n\s*\},)\s*\n\s*\};\s*$/, `$1\n\n${joined}\n};\n`);
if (next === cur) { console.error('❌ 挿入点が見つからない'); process.exit(1); }
writeFileSync(target, next);

writeFileSync('automation/applied-urls.json', JSON.stringify(applied, null, 2));
console.log(`✅ ${target} に ${blocks.length}記事を追記`);
applied.forEach((x) => console.log(`   ${x.articleId} → ${x.url}`));
console.log('→ automation/applied-urls.json に URL一覧を出力');
