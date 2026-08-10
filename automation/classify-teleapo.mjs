// テレアポ特集127本を「検索に出してよい品質か」で機械的に分類する。
//
// 背景（2026-08 Search Console実績）:
//   クリックは全て店名検索。/restaurant/r161「深夜ラーメンB」だけで月41クリック。
//   テレアポ特集は同じ「店名検索の受け皿」なのに全部 noindex で、導線を自ら塞いでいる。
//   ただし内容が薄い記事を大量にindexさせると サイト全体の評価を落とすため、選別する。
//
// 判定軸:
//   A) 実写画像がある（プレースホルダ 20558バイト でない）
//   B) 「確認できなかった」系の逃げ表現が少ない
//   C) specs に具体値が入っている（"要確認" だけで埋まっていない）
//   D) 本文量
import { readFileSync, statSync, existsSync } from 'fs';

const SRC = 'lib/teleapo-features.ts';
const PLACEHOLDER_SIZE = statSync('public/restaurants/_placeholder/feature-hero.jpg').size;

const src = readFileSync(SRC, 'utf-8');
const marks = [];
for (const m of src.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)) marks.push({ id: m[1], at: m.index });

const HEDGE = /確認できな|確認が取れ|裏付け|見当たらな|情報が(?:少な|乏し|限られ)|推測|想像|とどまる|示すことができな/g;

const rows = marks.map((x, i) => {
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
  return { id: x.id, chars: text.length, hedges, specs: specs.length, vague, realPhoto };
});

// 合格条件: 実写画像あり かつ 逃げ表現3個以下 かつ 曖昧specsが半分未満 かつ 本文2500字以上
const pass = rows.filter((r) => r.realPhoto && r.hedges <= 3 && r.vague < r.specs / 2 && r.chars >= 2500);
const fail = rows.filter((r) => !pass.includes(r));

console.log(`テレアポ特集 合計: ${rows.length}本`);
console.log(`  ✅ 公開(index)候補 : ${pass.length}本`);
console.log(`  ⛔ 見送り          : ${fail.length}本`);
console.log(`\n── 見送り理由の内訳 ──`);
console.log(`  プレースホルダ画像 : ${fail.filter((r) => !r.realPhoto).length}本`);
console.log(`  逃げ表現が4個以上  : ${fail.filter((r) => r.hedges > 3).length}本`);
console.log(`  specsが曖昧ばかり  : ${fail.filter((r) => r.vague >= r.specs / 2).length}本`);
console.log(`  本文2500字未満     : ${fail.filter((r) => r.chars < 2500).length}本`);

console.log(`\n── 見送りになる記事（上位15件・逃げ表現が多い順）──`);
fail.sort((a, b) => b.hedges - a.hedges).slice(0, 15).forEach((r) =>
  console.log(`  ${r.id.slice(0, 26).padEnd(28)} 本文${String(r.chars).padStart(5)}字 逃げ${String(r.hedges).padStart(2)} 曖昧specs${r.vague}/${r.specs} 実写${r.realPhoto ? '有' : '無'}`));

console.log(`\n── index候補（先頭15件）──`);
pass.slice(0, 15).forEach((r) =>
  console.log(`  ${r.id.slice(0, 26).padEnd(28)} 本文${String(r.chars).padStart(5)}字 逃げ${String(r.hedges).padStart(2)} 曖昧specs${r.vague}/${r.specs}`));
