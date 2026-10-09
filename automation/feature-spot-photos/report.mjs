// 当てはめの前と後で、「写真の無いポイント」の数を出して、数が合うかを確かめる(読むだけ。DB にも書かない)。
//
// 実行(リポジトリの直下で。build.mjs のあとに):
//   node --no-warnings --experimental-strip-types automation/feature-spot-photos/report.mjs
// 付けられるもの:  --generated <file> (まとめたファイルを指定。既定 lib/featureSpotPhotos.generated.json)  --list (当たったポイントの一覧)  --no-e2e / --e2e
//
// 数えるもの(コードのデータだけ。DB は見ない=本番で DB の値が重なるのは title/lede/hero_image などで、ranking の画像はコード優先):
//   前 = FEATURE_ARTICLES に sanitizeFeatureArticle をかけた記事(lib/db/features.ts の getFeatureArticleById と同じ順)
//   後 = 前に applyFeatureSpotPhotos(本番が使う関数そのもの)をかけた記事
//   「写真が無い」= FeaturePage.tsx と同じ判定(common.mjs の lackOf)。inventory.mjs と同じ数え方なので、前の数は inventory.json と一致する。
//   店/場所 の分け方は inventory.mjs の classify と同じ(href の店 → 店 / テレアポ由来の単店特集 → 店 / 名前の完全一致で店ページあり → 店 / 業態語の辞書 / 手動の 4 件)
// 数が合う条件: 前 − 後 =「まとめたファイルのうち、実際に当たったポイントの数」。まとめたファイルの中に当たらなかったものがあれば一覧に出す。
// さらに(DB の環境変数が無いときは)本番の取り出し口 getFeatureArticleById を全特集に通して、上の「後」と画像が全部同じことも確かめる。
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, CALLER_CWD, loadCode, lackOf } from './common.mjs';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? path.resolve(CALLER_CWD, argv[i + 1]) : d; };
const GENERATED = opt('--generated', path.join(ROOT, 'lib/featureSpotPhotos.generated.json'));
const customGenerated = argv.includes('--generated');

const code = await loadCode();
const { data, FEATURE_ARTICLES, FEATURE_INDEXABLE_IDS, sanitizeFeatureArticle, usable, applyFeatureSpotPhotos } = code;
const tele = await import(ROOT + '/lib/teleapo-features.ts');

// ---------- まとめたファイル ----------
let photos = {};
let fileState = 'なし(何も当たらない)';
if (existsSync(GENERATED)) {
  try { photos = JSON.parse(readFileSync(GENERATED, 'utf8')); fileState = `${Object.keys(photos).length} 特集`; } catch (e) { fileState = '壊れている(何も当たらない): ' + e.message; }
}

// ---------- 店/場所 の分け方(inventory.mjs の classify と同じ) ----------
const norm = (s) => (s || '').normalize('NFKC').toLowerCase().replace(/\s+/g, '');
const REST_BY_NAME = new Map();
for (const r of data.RESTAURANTS) { const k = norm(r.name); if (!REST_BY_NAME.has(k)) REST_BY_NAME.set(k, []); REST_BY_NAME.get(k).push(r.id); }
const PLACE_WORDS = /(神社|寺院|寺|公園|商店街|市場|展望台|博物館|美術館|庭園|城|動物園|水族館|百貨店|ショッピング|商業施設|モール|歴史建築|建築|観光|名所|足湯|遊歩道|プロムナード|温泉|橋|タワー|駅|広場|通り|街並み|ランドマーク|遺跡|滝|湖|山|海岸|ビーチ|港|ホール|劇場|神宮|大社|宮|庭|古墳|石碑|銅像|街区|エリア)/;
const SHOP_WORDS = /(居酒屋|カフェ|喫茶|ラーメン|そば|うどん|寿司|鮨|和食|洋食|イタリアン|フレンチ|焼肉|焼鳥|焼き鳥|串|バー|ビストロ|食堂|レストラン|中華|スイーツ|パン|ベーカリー|天ぷら|とんかつ|うなぎ|鰻|ステーキ|ダイニング|酒場|割烹|料亭|定食|カレー|ピザ|パスタ|蕎麦|惣菜|総菜|焼肉店)/;
const MANUAL_PLACE = new Set(['feature-kinosha-nachikatsuura#1', 'feature-kinosha-nachikatsuura#2', 'feature-kinosha-nachikatsuura#3', 'feature-kinosha-nachikatsuura#4']); // inventory.mjs の MANUAL(汽ノ舎=施設=場所)
function kindOf(id, r, spotNo) {
  if (r.href && /^\/restaurant\//.test(r.href)) return '店';
  if (Object.prototype.hasOwnProperty.call(tele.TELEAPO_FEATURE_ARTICLES, id)) return '店'; // テレアポ由来の単店特集
  const hit = REST_BY_NAME.get(norm(r.name));
  if (hit && hit.length === 1) return '店'; // 名前の完全一致で店ページが 1 つだけある
  if (MANUAL_PLACE.has(`${id}#${spotNo}`)) return '場所';
  const c = r.cuisine || '';
  const p = PLACE_WORDS.test(c), s = SHOP_WORDS.test(c);
  if (p && !s) return '場所';
  if (s && !p) return '店';
  return '不明';
}

// ---------- 前と後 ----------
const rows = []; // { id, indexable, before:{spots,hero}, after:{spots,hero}, kinds: spotNo->kind }
const applied = []; // 実際に当たった { id, slot }
const afterArticles = new Map();
for (const [id, a0] of Object.entries(FEATURE_ARTICLES)) {
  const before = sanitizeFeatureArticle(a0);
  const after = applyFeatureSpotPhotos(before, photos);
  afterArticles.set(id, after);
  const lb = lackOf(before, usable), la = lackOf(after, usable);
  const kinds = {};
  for (const n of lb.spots) kinds[n] = kindOf(id, before.ranking[n - 1], n);
  rows.push({ id, indexable: FEATURE_INDEXABLE_IDS.has(id), lb, la, kinds });
  for (const n of lb.spots) if (!la.spots.includes(n)) applied.push({ id, slot: n });
  if (lb.heroUnusable && !la.heroUnusable) applied.push({ id, slot: 'hero' });
}

const sum = (f) => rows.reduce((a, r) => a + f(r), 0);
const cnt = (pick, kind, which) => sum((r) => (pick(r) ? Object.entries(kinds(r, which)).filter(([, k]) => !kind || k === kind).length : 0));
// 後の「どのポイントが残っているか」は kinds(前) から引く
function kinds(r, which) {
  const keep = which === 'before' ? r.lb.spots : r.la.spots;
  const o = {};
  for (const n of keep) o[n] = r.kinds[n];
  return o;
}
const ALL = () => true, IDX = (r) => r.indexable;
const dw = (s) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x7f ? 2 : 1), 0); // 表示幅(全角 2)
const line = (label, b, a) => console.log(`${label}${' '.repeat(Math.max(1, 46 - dw(label)))}${String(b).padStart(6)} → ${String(a).padStart(6)}   (−${b - a})`);

console.log('== 当てはめの前後(report.mjs) ==');
console.log(`まとめたファイル: ${GENERATED}  [${fileState}]`);
console.log(`特集 ${rows.length} 本(検索に出す特集 ${rows.filter(IDX).length} 本)`);
console.log('');
console.log('-- 写真の無いポイントの数(前 → 後) --');
line('全特集', cnt(ALL, null, 'before'), cnt(ALL, null, 'after'));
line('  うち 店', cnt(ALL, '店', 'before'), cnt(ALL, '店', 'after'));
line('  うち 場所', cnt(ALL, '場所', 'before'), cnt(ALL, '場所', 'after'));
const unkB = cnt(ALL, '不明', 'before'), unkA = cnt(ALL, '不明', 'after');
if (unkB || unkA) line('  うち 不明(辞書で決まらない)', unkB, unkA);
line('検索に出す特集(FEATURE_INDEXABLE_IDS)', cnt(IDX, null, 'before'), cnt(IDX, null, 'after'));
line('  うち 店', cnt(IDX, '店', 'before'), cnt(IDX, '店', 'after'));
line('  うち 場所', cnt(IDX, '場所', 'before'), cnt(IDX, '場所', 'after'));
console.log('');
console.log('-- 特集の数(前 → 後) --');
line('写真の無いポイントがある特集', rows.filter((r) => r.lb.spots.length).length, rows.filter((r) => r.la.spots.length).length);
line('  うち 検索に出す特集', rows.filter((r) => r.indexable && r.lb.spots.length).length, rows.filter((r) => r.indexable && r.la.spots.length).length);
line('全部のポイントに写真が無い特集', rows.filter((r) => r.lb.spots.length === FEATURE_ARTICLES[r.id].ranking.length).length, rows.filter((r) => r.la.spots.length === FEATURE_ARTICLES[r.id].ranking.length).length);
line('一番上の写真が使えない特集', rows.filter((r) => r.lb.heroUnusable).length, rows.filter((r) => r.la.heroUnusable).length);
line('  うち 検索に出す特集', rows.filter((r) => r.indexable && r.lb.heroUnusable).length, rows.filter((r) => r.indexable && r.la.heroUnusable).length);

// ---------- 数が合うか ----------
const fileSpots = [], fileHeroes = [];
for (const [id, e] of Object.entries(photos)) {
  for (const k of Object.keys(e?.spots ?? {})) fileSpots.push({ id, slot: Number(k) });
  if (e?.hero) fileHeroes.push({ id, slot: 'hero' });
}
const key = (x) => `${x.id}#${x.slot}`;
const appliedSet = new Set(applied.map(key));
const notApplied = [...fileSpots, ...fileHeroes].filter((x) => !appliedSet.has(key(x)));
const appliedSpots = applied.filter((x) => x.slot !== 'hero').length, appliedHeroes = applied.length - appliedSpots;
const spotDrop = cnt(ALL, null, 'before') - cnt(ALL, null, 'after');
console.log('');
console.log('-- 数が合うか --');
console.log(`まとめたファイルにある写真   ポイント ${fileSpots.length} / 一番上 ${fileHeroes.length}`);
console.log(`実際に当たった               ポイント ${appliedSpots} / 一番上 ${appliedHeroes}`);
console.log(`写真の無いポイントの減り     ${spotDrop}   → ${spotDrop === appliedSpots ? '一致(OK)' : '不一致(NG)'}`);
console.log(`ファイルにあるのに当たらなかった ${notApplied.length} 件${notApplied.length ? '(特集が無い・そのポイントにもう写真がある・番号が範囲外、など。build.mjs を回し直す)' : ''}`);
for (const x of notApplied.slice(0, 30)) console.log(`  ${x.id} #${x.slot}`);
if (flag('--list')) { console.log('\n-- 当たったポイント --'); for (const x of applied) console.log(`${x.id} #${x.slot}`); }

// ---------- 本番の取り出し口を通した結果が「後」と同じか ----------
const doE2E = flag('--e2e') || (!flag('--no-e2e') && !process.env.NEXT_PUBLIC_SUPABASE_URL && !customGenerated);
console.log('');
if (!doE2E) {
  console.log(`-- 取り出し口(getFeatureArticleById)の確認: しない(${customGenerated ? '--generated 指定のため' : process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DB の環境変数があり、DB を読んでしまうため(--e2e で強制)' : '--no-e2e'}) --`);
} else {
  const feats = await import(ROOT + '/lib/db/features.ts');
  const warn = console.warn; console.warn = () => {}; // DB が読めないときの警告(コードにフォールバックする)を黙らせる
  let same = 0, diff = [];
  const sig = (a) => JSON.stringify([a.heroImage, a.ogImage ?? null, a.ranking.map((r) => r.images)]);
  for (const id of Object.keys(FEATURE_ARTICLES)) {
    const got = await feats.getFeatureArticleById(id);
    if (got && sig(got) === sig(afterArticles.get(id))) same++; else diff.push(id);
  }
  console.warn = warn;
  console.log(`-- 取り出し口(getFeatureArticleById。DB は読めない環境=コードにフォールバック)を全特集に通した結果 --`);
  console.log(`「後」と一番上・ogImage・全ポイントの画像が同じ: ${same} / ${rows.length}   → ${diff.length === 0 ? '一致(OK)' : '不一致(NG): ' + diff.slice(0, 10).join(', ')}`);
}
