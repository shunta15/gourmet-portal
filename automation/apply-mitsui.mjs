// 炭焼き日本料理三ツ井の記事を teleapo-features.ts に挿入する（単発）
import { readFileSync, writeFileSync } from 'fs';

const taskOut = JSON.parse(readFileSync('/private/tmp/claude-501/-Users-shunta-claude/5aa2c717-d996-4e99-8751-46c89fcba578/tasks/wi3vkyljd.output', 'utf-8'));
const a = taskOut.result;
if (!a || !a.articleId) { console.error('❌ result が取れない'); process.exit(1); }

// HTMLエンティティをデコード（titleHTML用）
function dec(s) {
  return (s == null ? '' : String(s))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}
function esc(s) { return JSON.stringify(s == null ? '' : String(s)); }

const id = a.articleId;
const heroPath = `/restaurants/teleapo-${id}/hero.jpg`;
const point2Path = `/restaurants/teleapo-${id}/point2.jpg`;

const ranking = a.ranking.map((r, i) => {
  const imgs = i === 0 ? `[${esc(heroPath)}]` : i === 1 ? `[${esc(point2Path)}]` : '[]';
  return `      {
        rank: ${esc(r.rank)},
        rankNum: ${r.rankNum},
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
    date: "2026-07-07",
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

const target = 'lib/teleapo-features.ts';
const cur = readFileSync(target, 'utf-8');
if (cur.includes(`"${id}":`)) { console.error('❌ 既に存在:', id); process.exit(1); }
const next = cur.replace(/(\n\s*\},)\s*\n\s*\};\s*$/, `$1\n\n${block}\n};\n`);
if (next === cur) { console.error('❌ 挿入点が見つからない'); process.exit(1); }
writeFileSync(target, next);
console.log(`✅ ${target} に「${id}」を挿入`);
console.log(`   URL: https://machinowa.tokyo/feature/${id}`);
console.log(`   titleHTML: ${dec(a.titleHTML)}`);
