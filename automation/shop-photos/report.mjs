// 店ページの当てはめの前と後で、「使える写真が 1 枚も無い店」の数を出して、数が合うかを確かめる(読むだけ。DB にも書かない)。
//
// 実行(リポジトリの直下で。automation/shop-photos/build.mjs のあとに):
//   node --no-warnings automation/shop-photos/report.mjs
// 付けられるもの:  --generated <file> (まとめたファイルを指定。既定 lib/shopPhotos.generated.json)  --list (当たった店の一覧)  --no-e2e / --e2e
//
// 数えるもの(コードのデータだけ。DB は見ない):
//   前 = RESTAURANTS に sanitizeRestaurant をかけた店(lib/db/restaurants.ts と同じ順)
//   後 = 前に applyShopPhotos(本番が使う関数そのもの)をかけた店
//   「使える写真が 1 枚も無い」= 暖簾の店ページと同じ数え方(heroImagesOf の中に isUsableFeatureImage が 1 枚も無い)
//   参考として、sanitizeRestaurant をかけない数え方(shop-nophoto.mjs と同じ。前は 93)も出す。
// 数が合う条件: 前 − 後 =「まとめたファイルのうち、実際に当たった店の数」。まとめたファイルの中に当たらなかった店があれば一覧に出す。
// さらに(DB の環境変数が無いときは)本番の取り出し口 getRestaurantById / getAllRestaurants / getRestaurantsByRegion を全部通して、上の「後」と
// 一番上の写真・image が全店で同じことも確かめる。
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, CALLER_CWD, loadCode } from '../feature-spot-photos/common.mjs';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? path.resolve(CALLER_CWD, argv[i + 1]) : d; };
const GENERATED = opt('--generated', path.join(ROOT, 'lib/shopPhotos.generated.json'));
const customGenerated = argv.includes('--generated');

const code = await loadCode();
const { data, usable } = code;
const shopMod = await import(ROOT + '/lib/portal/noren/shop.ts');
const blocklist = await import(ROOT + '/lib/imageBlocklist.ts');
const sp = await import(ROOT + '/lib/shopPhotos.ts');
const idx = await import(ROOT + '/lib/restaurantIndexable.ts');

let photos = {};
let fileState = 'なし(何も当たらない)';
if (existsSync(GENERATED)) {
  try { photos = JSON.parse(readFileSync(GENERATED, 'utf8')); fileState = `${Object.keys(photos).length} 店`; } catch (e) { fileState = '壊れている(何も当たらない): ' + e.message; }
}

const none = (r) => !shopMod.heroImagesOf(r).some((u) => usable(u));
const rows = [];
const afterById = new Map();
const applied = [];
for (const r0 of data.RESTAURANTS) {
  const before = blocklist.sanitizeRestaurant(r0);
  const after = sp.applyShopPhotos(before, photos);
  afterById.set(r0.id, after);
  rows.push({ id: r0.id, rawNone: none(r0), before: none(before), after: none(after), beforeR: before, afterR: after });
  if (none(before) && !none(after)) applied.push(r0.id);
}
const n = (f) => rows.filter(f).length;
const line = (label, b, a) => console.log(`${label}${' '.repeat(Math.max(1, 46 - [...label].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x7f ? 2 : 1), 0)))}${String(b).padStart(5)} → ${String(a).padStart(5)}   (−${b - a})`);

console.log('== 店ページの当てはめの前後(shop-photos/report.mjs) ==');
console.log(`まとめたファイル: ${GENERATED}  [${fileState}]`);
console.log(`店 ${rows.length} 軒`);
console.log('');
console.log('-- 使える写真が 1 枚も無い店の数(前 → 後) --');
line('本番の取り出し口と同じ数え方(sanitize のあと)', n((r) => r.before), n((r) => r.after));
console.log(`(参考)sanitize をかけない数え方(shop-nophoto.mjs と同じ)   ${n((r) => r.rawNone)}   ← sanitize で使える写真が現れる店が ${n((r) => r.rawNone && !r.before)} 軒ある(${rows.filter((r) => r.rawNone && !r.before).map((r) => r.id).join(', ') || '-'})`);
const tg = rows.filter((r) => r.before);
const isArticleStore = (id) => Number(id.replace(/^r/, '')) >= 299; // r299〜 は記事由来の店(lib/articleStores.ts)
console.log(`  うち 記事由来の店(r299〜)${tg.filter((r) => isArticleStore(r.id)).length} / それ以外 ${tg.filter((r) => !isArticleStore(r.id)).length}`);

// ---------- 数が合うか ----------
const fileStores = Object.keys(photos).filter((id) => Array.isArray(photos[id]) && photos[id].length);
const notApplied = fileStores.filter((id) => !applied.includes(id));
const drop = n((r) => r.before) - n((r) => r.after);
console.log('');
console.log('-- 数が合うか --');
console.log(`まとめたファイルにある店     ${fileStores.length}(写真 ${fileStores.reduce((a, id) => a + photos[id].length, 0)} 枚)`);
console.log(`実際に当たった店             ${applied.length}`);
console.log(`使える写真が無い店の減り     ${drop}   → ${drop === applied.length ? '一致(OK)' : '不一致(NG)'}`);
console.log(`ファイルにあるのに当たらなかった ${notApplied.length} 店${notApplied.length ? '(店が無い・もう使える写真がある、など。build.mjs を回し直す): ' + notApplied.slice(0, 20).join(', ') : ''}`);
console.log(`まだ写真の無い店             ${n((r) => r.after)}${n((r) => r.after) ? ': ' + rows.filter((r) => r.after).map((r) => r.id).join(', ') : ''}`);
// 当てた店の中身の確認: 一番上が photos の先頭、image も先頭
const wrong = applied.filter((id) => { const a = afterById.get(id); return a.image !== photos[id][0] || a.heroImages[0] !== photos[id][0] || a.heroImages.length !== photos[id].length; });
console.log(`当たった店の image・heroImages がファイルの先頭と同じ   ${applied.length - wrong.length} / ${applied.length}${wrong.length ? '  NG: ' + wrong.join(', ') : ''}`);
if (flag('--list')) { console.log('\n-- 当たった店 --'); for (const id of applied) console.log(`${id} ${data.RESTAURANTS.find((r) => r.id === id).name} (${photos[id].length} 枚)`); }

// ---------- 検索への影響 ----------
const gateB = tg.filter((r) => idx.passesStoreQualityGate(r.beforeR)).length;
const gateA = tg.filter((r) => idx.passesStoreQualityGate(r.afterR)).length;
const noidxNow = tg.filter((r) => !idx.isRestaurantIndexable(r.id)).length;
console.log('');
console.log('-- 検索(index / sitemap)への影響 --');
console.log(`使える写真が無かった ${tg.length} 店のうち、品質の門(passesStoreQualityGate。画像・住所・営業時間)を通る店: 当てる前 ${gateB} → 当てた後 ${gateA}`);
console.log(`ただし isRestaurantIndexable は ARTICLE_STORES の元の値(取り出し口を通らない)で決まるので、今 noindex の店は ${noidxNow} 店のまま変わらない`);

// ---------- 本番の取り出し口を通した結果が「後」と同じか ----------
const doE2E = flag('--e2e') || (!flag('--no-e2e') && !process.env.NEXT_PUBLIC_SUPABASE_URL && !customGenerated);
console.log('');
if (!doE2E) {
  console.log(`-- 取り出し口の確認: しない(${customGenerated ? '--generated 指定のため' : process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DB の環境変数があり、DB を読んでしまうため(--e2e で強制)' : '--no-e2e'}) --`);
} else {
  const dbr = await import(ROOT + '/lib/db/restaurants.ts');
  const regions = await import(ROOT + '/lib/regions.ts');
  const warn = console.warn; console.warn = () => {}; // DB が読めないときの警告(コードにフォールバックする)を黙らせる
  const sig = (r) => JSON.stringify([r.image, r.heroImages ?? null, r.gallery ?? null]);
  const diff = { byId: [], all: [], region: [] };
  for (const r of data.RESTAURANTS) { const got = await dbr.getRestaurantById(r.id); if (!got || sig(got) !== sig(afterById.get(r.id))) diff.byId.push(r.id); }
  const all = await dbr.getAllRestaurants();
  const allIds = new Set(all.map((r) => r.id));
  for (const r of all) { const want = afterById.get(r.id); if (!want || sig(r) !== sig(want)) diff.all.push(r.id); }
  for (const key of Object.keys(regions.REGIONS)) {
    for (const r of await dbr.getRestaurantsByRegion(key)) { const want = afterById.get(r.id); if (!want || sig(r) !== sig(want)) diff.region.push(r.id); }
  }
  console.warn = warn;
  const ok = (a) => (a.length === 0 ? '一致(OK)' : '不一致(NG): ' + a.slice(0, 10).join(', '));
  console.log('-- 取り出し口(DB は読めない環境=コードにフォールバック)を通した結果が「後」と同じか(image・heroImages・gallery) --');
  console.log(`getRestaurantById     全 ${rows.length} 店   → ${ok(diff.byId)}`);
  console.log(`getAllRestaurants     ${all.length} 店(コードの店 ${data.RESTAURANTS.filter((r) => allIds.has(r.id)).length})   → ${ok(diff.all)}`);
  console.log(`getRestaurantsByRegion 全地域   → ${ok(diff.region)}`);
}
