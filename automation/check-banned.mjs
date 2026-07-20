// 生成記事JSONの禁止表現・構造・文量を機械チェックする（AI判断に依存しない決定的ゲート）
// 使い方: node automation/check-banned.mjs <dir-or-file...>
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const BANNED = [
  // 評価・口コミ系（Atmosphere SKU禁止）
  { re: /★|☆/, why: '星マーク（評価）' },
  { re: /評価\s*[0-9０-９]|[0-9０-９]\s*点満点|Google\s*評価|グーグル評価/i, why: '評価値' },
  { re: /口コミ\s*[0-9０-９]+\s*件|レビュー\s*[0-9０-９]+\s*件|[0-9０-９]+\s*件のレビュー|[0-9０-９]+\s*件の口コミ/, why: 'レビュー件数' },
  // 誇張
  { re: /日本一|世界一|日本初|世界初|最大級|最高峰|随一|唯一無二|絶品|必食|悶絶|至高|究極/, why: '誇張・最上級表現' },
  // 年号付き料金
  { re: /（\s*[0-9]{4}\s*年(現在|時点)\s*）|\(\s*[0-9]{4}\s*年(現在|時点)\s*\)/, why: '年号付き料金表記' },
  // 俗称
  { re: /うんこビル|東京一凶/, why: '俗称・スラング' },
];

// 「人気」「おすすめ」は根拠なし使用が禁止。単純検出して目視確認に回す（警告扱い）
const WARN = [
  { re: /人気(店|の|な)/, why: '「人気」— 根拠が本文にあるか要確認' },
  { re: /おすすめ|オススメ/, why: '「おすすめ」— 根拠が本文にあるか要確認' },
];

// 営業時間・価格に言及したら確認喚起があるか
const HOURS_PRICE = /[0-9０-９]{1,2}\s*[:：時]|円|定休|営業時間/;
const CONFIRM = /確認|問い合わせ|問合せ|公式|電話/;

const LEN = {
  lede: [230, 400],
  desc: [280, 560],
  quote: [120, 240],
  closing: [320, 600],
};

function texts(a) {
  const out = [['lede', a.lede], ['quote', a.quote], ['closing', a.closing], ['title', a.title], ['subtitle', a.subtitle]];
  (a.ranking || []).forEach((r, i) => {
    out.push([`ranking[${i}].name`, r.name]);
    out.push([`ranking[${i}].desc`, r.desc]);
    (r.specs || []).forEach((s, j) => out.push([`ranking[${i}].specs[${j}]`, `${s.k}: ${s.v}`]));
  });
  return out.filter(([, v]) => typeof v === 'string');
}

function collect(target) {
  if (statSync(target).isDirectory()) {
    return readdirSync(target).filter((f) => f.endsWith('.json')).map((f) => join(target, f));
  }
  return [target];
}

const files = process.argv.slice(2).flatMap(collect);
if (!files.length) { console.error('ファイルが無い'); process.exit(1); }

let hardFail = 0, warnCount = 0;
for (const file of files) {
  let a;
  try { a = JSON.parse(readFileSync(file, 'utf-8')); }
  catch (e) { console.log(`❌ ${file}: JSONパース失敗 — ${e.message}`); hardFail++; continue; }

  const problems = [], warns = [];

  // 構造
  for (const k of ['articleId', 'kicker', 'title', 'titleHTML', 'subtitle', 'lede', 'ranking', 'quote', 'quoteCite', 'closing']) {
    if (!a[k]) problems.push(`必須キー欠落: ${k}`);
  }
  if (!Array.isArray(a.ranking) || a.ranking.length !== 5) problems.push(`ranking が5件でない (${a.ranking?.length})`);
  if (a.quoteCite && a.quoteCite !== 'マチノワ編集部') problems.push(`quoteCite が「マチノワ編集部」でない: ${a.quoteCite}`);
  if (a.titleHTML && !/<br>/.test(a.titleHTML)) problems.push('titleHTML に <br> が無い');
  if (a.titleHTML && !/<em>.*<\/em>/.test(a.titleHTML)) problems.push('titleHTML に <em> が無い');
  (a.ranking || []).forEach((r, i) => {
    if (r.rank !== `POINT 0${i + 1}`) problems.push(`ranking[${i}].rank が "POINT 0${i + 1}" でない: ${r.rank}`);
    if (!Array.isArray(r.specs) || r.specs.length !== 2) problems.push(`ranking[${i}].specs が2件でない`);
  });
  // 全POINTのareaが同一か
  const areas = [...new Set((a.ranking || []).map((r) => r.area))];
  if (areas.length > 1) problems.push(`area が POINT 間で不一致: ${areas.join(' / ')}`);

  // 禁止表現
  for (const [where, v] of texts(a)) {
    for (const b of BANNED) if (b.re.test(v)) problems.push(`${where}: ${b.why} → 「${v.match(b.re)[0]}」`);
    for (const w of WARN) if (w.re.test(v)) warns.push(`${where}: ${w.why} → 「${v.match(w.re)[0]}」`);
  }

  // 営業時間・価格に触れていたら確認喚起があるか（記事全体で判定）
  const whole = texts(a).map(([, v]) => v).join('\n');
  if (HOURS_PRICE.test(whole) && !CONFIRM.test(whole)) {
    problems.push('営業時間/価格に言及しているが「確認」を促す記述が無い');
  }

  // 文量
  const lenCheck = [['lede', a.lede], ['quote', a.quote], ['closing', a.closing]];
  (a.ranking || []).forEach((r, i) => lenCheck.push([`desc`, r.desc, i]));
  for (const [kind, v, i] of lenCheck) {
    if (typeof v !== 'string') continue;
    const [lo, hi] = LEN[kind];
    if (v.length < lo || v.length > hi) {
      warns.push(`${kind}${i != null ? `[${i}]` : ''} 文量 ${v.length}字（目安 ${lo}〜${hi}）`);
    }
  }

  const nameShort = file.split('/').pop();
  if (problems.length) {
    hardFail++;
    console.log(`\n❌ ${nameShort}  (${a.articleId})`);
    problems.forEach((p) => console.log(`   NG  ${p}`));
    warns.forEach((w) => console.log(`   warn ${w}`));
  } else {
    console.log(`\n✅ ${nameShort}  (${a.articleId})`);
    warns.forEach((w) => console.log(`   warn ${w}`));
  }
  warnCount += warns.length;
}

console.log(`\n===== 合計: ${files.length}件 / 不合格 ${hardFail}件 / 警告 ${warnCount}件 =====`);
process.exit(hardFail ? 1 : 0);
