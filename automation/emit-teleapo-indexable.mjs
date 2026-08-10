// 品質基準を満たすテレアポ特集の記事IDを lib/teleapoIndexable.ts に書き出す。
//
// 背景（2026-08 Search Console実績）:
//   クリックは全て店名検索。/restaurant/r161「深夜ラーメンB」だけで月41クリック。
//   テレアポ特集は同じ「店名検索の受け皿」なのに全部 noindex で、導線を自ら塞いでいた。
//   ただし薄い記事を大量にindexさせるとサイト全体の評価を落とすため、選別して出す。
//
// 合格条件（すべて満たすこと）:
//   1. 実写画像がある（プレースホルダでない）
//   2. 逃げ表現（「確認できなかった」等）が3個以下
//   3. specs の曖昧値（「要確認」等）が半数未満
//   4. 本文2500字以上
import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';

const SRC = 'lib/teleapo-features.ts';
const OUT = 'lib/teleapoIndexable.ts';
const PLACEHOLDER_SIZE = statSync('public/restaurants/_placeholder/feature-hero.jpg').size;

const src = readFileSync(SRC, 'utf-8');
const marks = [];
for (const m of src.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)) marks.push({ id: m[1], at: m.index });

const HEDGE = /確認できな|確認が取れ|裏付け|見当たらな|情報が(?:少な|乏し|限られ)|推測|想像|とどまる|示すことができな/g;

const pass = [];
const fail = [];
marks.forEach((x, i) => {
  const body = src.slice(x.at, i + 1 < marks.length ? marks[i + 1].at : src.length);
  const text = [...body.matchAll(/^\s*(?:lede|desc|quote|closing):\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => m[1]).join('');
  const specs = [...body.matchAll(/\{\s*k:\s*"[^"]*"\s*,\s*v:\s*"([^"]*)"\s*\}/g)].map((m) => m[1]);
  const vague = specs.filter((v) => /要確認|確認でき|不明|なし$/.test(v)).length;

  const dir = `public/restaurants/teleapo-${x.id}`;
  let realPhoto = false;
  try {
    const h = statSync(`${dir}/hero.jpg`).size;
    const p = existsSync(`${dir}/point2.jpg`) ? statSync(`${dir}/point2.jpg`).size : 0;
    realPhoto = h !== PLACEHOLDER_SIZE && p !== PLACEHOLDER_SIZE;
  } catch {}

  const hedges = (text.match(HEDGE) || []).length;
  const ok = realPhoto && hedges <= 3 && vague < specs.length / 2 && text.length >= 2500;
  (ok ? pass : fail).push(x.id);
});

const body = `/**
 * 検索インデックス対象にするテレアポ特集の記事ID
 *
 * 自動生成: node automation/emit-teleapo-indexable.mjs
 * 手で編集しないこと（次回生成で上書きされます）
 *
 * 合格条件: 実写画像あり / 逃げ表現3個以下 / 曖昧specsが半数未満 / 本文2500字以上
 * 不合格の記事は URL は有効なまま noindex を維持します（品質が上がれば自動で対象入り）。
 */
export const TELEAPO_INDEXABLE_IDS: string[] = [
${pass.map((id) => `  ${JSON.stringify(id)},`).join('\n')}
];
`;
writeFileSync(OUT, body);
console.log(`✅ ${OUT} に ${pass.length}件を書き出し（見送り ${fail.length}件）`);
