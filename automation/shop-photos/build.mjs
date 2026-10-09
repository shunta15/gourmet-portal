// グルメの店ページ: 「使える写真が 1 枚も無い店」に当てる写真をまとめて、lib/shopPhotos.generated.json を書く。
// 検査に落ちた写真は入れず、理由を一覧で出す(スクリプトは止めない)。
//
// 写真の出どころは 2 つ。店ごとに (b) があれば (b) だけ、無ければ (a):
//   (b) 店ページ用に集めた写真: automation/shop-photos/<店ID>.json の images(slot は h1・h2・h3。h1 が一番上)。public/restaurants/fs/shop-<店ID>/h1.jpg …
//   (a) その店の特集用に集めた写真の流用: automation/feature-spot-photos/store-links.json({ 特集ID: 店ID })で結んだ特集の記録
//       (automation/feature-spot-photos/<dir>.json)の images。一番上に出すので hero を先頭、あとは横長(横が縦の 1.3 倍以上)を先に。
//
// 実行(リポジトリの直下で):
//   node --no-warnings automation/shop-photos/build.mjs
// 付けられるもの:  --dry-run (書かない)  --records <dir>  --feature-records <dir>  --links <file>  --public <dir>  --out <file>   (試験用。普段は付けない)
//
// 検査(1 枚ずつ。落ちた写真は入れない):
//   店: 店 ID がコードの店(RESTAURANTS)に実在する / 「使える写真が 1 枚も無い店」である(暖簾の店ページと同じ数え方。使える写真がある店には当てない)
//   (b) の記録: dir が shop-<店ID> / matched.how が address+name-exact か address+name-contains(確かめた印。無いものは取り違えを避けて落とす) / slot が h1・h2・h3
//   (a) の記録: dir が fs-+sha1(特集ID)の先頭 10 桁
//   写真: path が /restaurants/fs/<dir>/ の下の .jpg で public/ に実在する / JPEG として読めて、幅と高さが 300px 以上 /
//         大きさ(バイト数)が決まりの 1.5 倍以内(一番上 350KB・ほか 220KB) / 同じ店の中で同じ中身(sha256)が 2 回使われていない
// 「使える写真が 1 枚も無い」の数え方は、本番の店の取り出し口(lib/db/restaurants.ts)と同じ: sanitizeRestaurant をかけた店に、暖簾の店ページと同じ判定
// (heroImagesOf と isUsableFeatureImage)。当てはめのあとの店は使わないので、何度回しても結果は同じ。
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, CALLER_CWD, loadCode } from '../feature-spot-photos/common.mjs';
import { readJpeg, sha1dir, sha256, MIN_PX, KB, SLACK, LIMIT } from '../feature-spot-photos/jpeg.mjs';

// ---------- 引数 ----------
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? path.resolve(CALLER_CWD, argv[i + 1]) : d; };
const SHOP_RECORDS = opt('--records', path.join(ROOT, 'automation/shop-photos'));
const FEATURE_RECORDS = opt('--feature-records', path.join(ROOT, 'automation/feature-spot-photos'));
const LINKS = opt('--links', path.join(ROOT, 'automation/feature-spot-photos/store-links.json'));
const PUBLIC_DIR = opt('--public', path.join(ROOT, 'public'));
const OUT = opt('--out', path.join(ROOT, 'lib/shopPhotos.generated.json'));
const DRY = flag('--dry-run');

const REASONS = {
  'record-unreadable': '記録が読めない(JSON として壊れている・形が違う)',
  'store-not-found': '店 ID がコードの店に実在しない',
  'store-has-photo': 'その店にはもう使える写真がある(使える写真が 1 枚も無い店だけに当てる)',
  'feature-not-found': '特集の記録の featureId が、結びつき(store-links.json)に無い',
  'dir-mismatch': 'dir が決まりの値(店 shop-<店ID> / 特集 fs-+sha1 の先頭 10 桁)と違う',
  'not-verified': '記録の matched.how が address+name-exact / address+name-contains のどちらでもない(店を確かめた印が無い)',
  'slot-invalid': 'slot が決まり(店 h1・h2・h3 / 特集 整数か hero)と違う',
  'slot-duplicated': '同じ slot が 2 回(先のものを採用)',
  'path-invalid': 'path が /restaurants/fs/<dir>/ の下の .jpg ではない・使えない文字がある',
  'file-missing': 'path のファイルが public/ に無い',
  'not-jpeg': 'JPEG として読めない(先頭・終わり・サイズの記載のどれかがおかしい)',
  'too-small': `幅か高さが ${MIN_PX}px 未満`,
  'too-heavy': `大きさが決まり(一番上 ${LIMIT.hero / KB}KB・ほか ${LIMIT.spot / KB}KB)の ${SLACK} 倍を超える`,
  'dup-content': '同じ店の中で、同じ中身のファイルが 2 回使われている(先のものを採用)',
};

// ---------- コードの店(本番の取り出し口と同じ: sanitizeRestaurant のあと) ----------
const code = await loadCode();
const shopMod = await import(ROOT + '/lib/portal/noren/shop.ts');
const blocklist = await import(ROOT + '/lib/imageBlocklist.ts');
const { usable } = code;
const stores = new Map(code.data.RESTAURANTS.map((r) => [r.id, r]));
const targets = new Set();
for (const r0 of code.data.RESTAURANTS) {
  const r = blocklist.sanitizeRestaurant(r0);
  if (!shopMod.heroImagesOf(r).some((u) => usable(u))) targets.add(r0.id);
}

const drops = []; // { src: 'a'|'b', id, slot, file, reason, detail }
const warns = [];
const drop = (src, id, slot, file, reason, detail = '') => drops.push({ src, id, slot, file, reason, detail });

/** 写真 1 枚の検査(path・実在・JPEG・大きさ)。通れば { path, hash, width, height }、落ちれば null(drops に積む) */
function checkPhoto({ src, id, slotLabel, file, dir, p, limit }) {
  const prefix = `/restaurants/fs/${dir}/`;
  if (typeof p !== 'string' || !p.startsWith(prefix) || /[^A-Za-z0-9_./-]/.test(p) || p.includes('..') || !/\.jpe?g$/i.test(p)) { drop(src, id, slotLabel, file, 'path-invalid', String(p)); return null; }
  const abs = path.join(PUBLIC_DIR, p);
  let st;
  try { st = statSync(abs); if (!st.isFile()) throw new Error(); } catch { drop(src, id, slotLabel, file, 'file-missing', p); return null; }
  const buf = readFileSync(abs);
  const j = readJpeg(buf);
  if (j.error) { drop(src, id, slotLabel, file, 'not-jpeg', `${p}: ${j.error}`); return null; }
  if (j.width < MIN_PX || j.height < MIN_PX) { drop(src, id, slotLabel, file, 'too-small', `${p}: ${j.width}x${j.height}`); return null; }
  if (st.size > limit * SLACK) { drop(src, id, slotLabel, file, 'too-heavy', `${p}: ${Math.round(st.size / KB)}KB > ${Math.round((limit * SLACK) / KB)}KB`); return null; }
  return { path: p, hash: sha256(buf), width: j.width, height: j.height, bytes: st.size };
}

/** 同じ店の中の重複(中身のハッシュ)を除く。先に並べたものを残す */
function dedupe(src, id, list, file) {
  const seen = new Map();
  const out = [];
  for (const c of list) {
    if (seen.has(c.hash)) { drop(src, id, c.slotLabel, c.file ?? file, 'dup-content', `${c.path} は ${seen.get(c.hash)} と同じ中身`); continue; }
    seen.set(c.hash, c.path);
    out.push(c);
  }
  return out;
}

const jsonFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'store-links.json').sort() : []);

// ---------- (b) 店ページ用に集めた写真 ----------
const B = new Map(); // storeId -> [{ path, hash, width, height, slotLabel }] (h1 → h3 の順)
const bStat = { files: 0, unreadable: 0, recordedStores: new Set(), emptyRecords: 0, listed: 0, contains: [], exact: 0 };
for (const file of jsonFiles(SHOP_RECORDS)) {
  bStat.files++;
  let rec;
  try {
    rec = JSON.parse(readFileSync(path.join(SHOP_RECORDS, file), 'utf8'));
    if (!rec || typeof rec !== 'object' || typeof rec.storeId !== 'string' || !rec.storeId || !Array.isArray(rec.images ?? [])) throw new Error('形が違う');
  } catch (e) { bStat.unreadable++; drop('b', null, null, file, 'record-unreadable', String(e.message || e)); continue; }
  const id = rec.storeId;
  const images = rec.images ?? [];
  bStat.recordedStores.add(id);
  if (!images.length) bStat.emptyRecords++;
  bStat.listed += images.length;
  const dropAll = (reason, detail) => images.forEach((im) => drop('b', id, im?.slot ?? null, file, reason, detail));
  if (!stores.has(id)) { dropAll('store-not-found', id); continue; }
  if (!targets.has(id)) { dropAll('store-has-photo', id); continue; }
  if (rec.dir !== `shop-${id}`) { dropAll('dir-mismatch', `記録の dir=${rec.dir} / 決まりの値=shop-${id}`); continue; }
  if (images.length && !['address+name-exact', 'address+name-contains'].includes(rec.matched?.how)) { dropAll('not-verified', `matched.how=${JSON.stringify(rec.matched?.how)}`); continue; }
  if (file !== `${id}.json`) warns.push(`${file}: ファイル名が storeId(${id}) と違う`);

  const cands = [];
  const seenSlot = new Set();
  for (const im of images) {
    const slot = im?.slot;
    if (!['h1', 'h2', 'h3'].includes(slot)) { drop('b', id, slot ?? null, file, 'slot-invalid', JSON.stringify(slot)); continue; }
    const ok = checkPhoto({ src: 'b', id, slotLabel: slot, file, dir: rec.dir, p: im.path, limit: slot === 'h1' ? LIMIT.hero : LIMIT.spot });
    if (!ok) continue;
    if (seenSlot.has(slot)) { drop('b', id, slot, file, 'slot-duplicated', ok.path); continue; }
    seenSlot.add(slot);
    if (path.posix.basename(ok.path) !== `${slot}.jpg`) warns.push(`${id} ${slot}: ファイル名が ${slot}.jpg ではない(${path.posix.basename(ok.path)})`);
    if (Number.isFinite(im.width) && Number.isFinite(im.height) && (im.width !== ok.width || im.height !== ok.height)) warns.push(`${id} ${slot}: 記録の寸法(${im.width}x${im.height})と実際(${ok.width}x${ok.height})が違う`);
    cands.push({ ...ok, slotLabel: slot, file });
  }
  cands.sort((a, b) => a.slotLabel.localeCompare(b.slotLabel)); // h1 → h2 → h3
  const kept = dedupe('b', id, cands, file);
  if (kept.length) {
    B.set(id, kept);
    if (rec.matched.how === 'address+name-contains') bStat.contains.push(`${id}: 記録「${rec.storeName}」→ Google「${rec.matched.name}」(${rec.matched.address})`);
    else bStat.exact++;
    if (kept[0].width / kept[0].height < 1.3) warns.push(`${id}: 一番上の写真(${kept[0].slotLabel})が横長ではない(${kept[0].width}x${kept[0].height})`);
  }
}

// ---------- (a) その店の特集用に集めた写真の流用 ----------
let links = {};
try { links = JSON.parse(readFileSync(LINKS, 'utf8')); } catch (e) { console.log(`(結びつき ${LINKS} が読めない: ${e.message}。(a) は使わない)`); }
const A = new Map(); // storeId -> [{...}]
const aStat = { linkedTargets: 0, withRecord: 0, listed: 0 };
const featureRec = new Map(); // featureId -> { rec, file }
for (const file of jsonFiles(FEATURE_RECORDS)) {
  try {
    const rec = JSON.parse(readFileSync(path.join(FEATURE_RECORDS, file), 'utf8'));
    if (rec && typeof rec.featureId === 'string' && Array.isArray(rec.images ?? [])) featureRec.set(rec.featureId, { rec, file });
  } catch { /* 特集側の読めない記録は build.mjs(特集)が数える */ }
}
const linksOfStore = new Map(); // storeId -> featureId[]
for (const [fid, sid] of Object.entries(links)) { if (!linksOfStore.has(sid)) linksOfStore.set(sid, []); linksOfStore.get(sid).push(fid); }
for (const id of [...targets].sort()) {
  const fids = (linksOfStore.get(id) ?? []).sort();
  if (!fids.length) continue;
  aStat.linkedTargets++;
  const cands = [];
  for (const fid of fids) {
    const hit = featureRec.get(fid);
    if (!hit) continue;
    const { rec, file } = hit;
    const images = rec.images ?? [];
    aStat.listed += images.length;
    if (rec.dir !== sha1dir(fid)) { images.forEach((im) => drop('a', id, im?.slot ?? null, file, 'dir-mismatch', `記録の dir=${rec.dir} / 導いた値=${sha1dir(fid)}`)); continue; }
    for (const im of images) {
      const isHero = im?.slot === 'hero';
      const slotOk = isHero || Number.isInteger(im?.slot) || (typeof im?.slot === 'string' && /^\d+$/.test(im.slot));
      if (!slotOk) { drop('a', id, im?.slot ?? null, file, 'slot-invalid', JSON.stringify(im?.slot)); continue; }
      const label = isHero ? 'hero' : String(im.slot);
      const ok = checkPhoto({ src: 'a', id, slotLabel: label, file, dir: rec.dir, p: im.path, limit: isHero ? LIMIT.hero : LIMIT.spot });
      if (ok) cands.push({ ...ok, slotLabel: label, isHero, no: isHero ? 0 : Number(im.slot), file, fid });
    }
  }
  if (!cands.length) continue;
  aStat.withRecord++;
  // hero を先頭、あとは横長(横が縦の 1.3 倍以上)を先に、ポイントの番号順
  const wide = (c) => c.width / c.height >= 1.3;
  cands.sort((x, y) => (y.isHero - x.isHero) || (wide(y) - wide(x)) || (x.no - y.no));
  const kept = dedupe('a', id, cands, '');
  if (kept.length) A.set(id, kept.slice(0, 8)); // 暖簾の店ページは一番上に 8 枚まで出す
}

// ---------- まとめる((b) があれば (b)、無ければ (a)) ----------
const out = {};
const from = { b: 0, a: 0 };
let photoCount = 0;
for (const id of [...targets].sort()) {
  const picked = B.get(id) ?? A.get(id);
  if (!picked) continue;
  from[B.has(id) ? 'b' : 'a']++;
  out[id] = picked.map((c) => c.path);
  photoCount += picked.length;
}

// ---------- 書く ----------
const json = JSON.stringify(out, null, 2) + '\n';
if (!DRY) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = OUT + '.tmp';
  writeFileSync(tmp, json);
  renameSync(tmp, OUT);
}

// ---------- 出力 ----------
const dropImgs = (src) => drops.filter((d) => d.src === src && d.reason !== 'record-unreadable').length;
const byReason = {};
for (const d of drops) byReason[d.reason] = (byReason[d.reason] || 0) + 1;
console.log('== 店ページの写真のまとめ(shop-photos/build.mjs) ==');
console.log(`書いた先: ${DRY ? '(--dry-run のため書かない) ' : ''}${OUT}`);
console.log('');
console.log(`店の総数                          ${stores.size}`);
console.log(`使える写真が 1 枚も無い店          ${targets.size}   (sanitizeRestaurant のあと・暖簾の店ページと同じ数え方)`);
console.log(`写真を当てる店(まとめた店)        ${Object.keys(out).length}   うち (b)店ページ用 ${from.b} / (a)特集の流用 ${from.a}   写真 ${photoCount} 枚`);
console.log(`まだ写真の無い店                  ${targets.size - Object.keys(out).length}`);
console.log('');
console.log(`(b) 店ページ用: 記録のファイル ${bStat.files}(読めない ${bStat.unreadable})/ 記録のある店 ${bStat.recordedStores.size}(images が空 ${bStat.emptyRecords})/ 写真の入った店 ${B.size} / 記録の写真 ${bStat.listed} 枚 → 採用 ${[...B.values()].reduce((n, l) => n + l.length, 0)} + 落とした ${dropImgs('b')}`);
console.log(`    店の確かめ方: 完全一致 ${bStat.exact} 店 / 「含む」 ${bStat.contains.length} 店`);
console.log(`(a) 特集の流用: 対象の店のうち特集と結びついた店 ${aStat.linkedTargets} / 使える写真のある記録がある店 ${aStat.withRecord} / 記録の写真 ${aStat.listed} 枚(結びついた特集のもの)→ 落とした ${dropImgs('a')}`);
console.log(`    (a) のうち (b) が優先されて使われなかった店 ${[...A.keys()].filter((k) => B.has(k)).length}`);
if (bStat.contains.length) {
  console.log('');
  console.log('-- 店名を「含む」で通した店(発注者が 1 件ずつ見る) --');
  for (const l of bStat.contains) console.log(l);
}
if (drops.length) {
  console.log('');
  console.log('-- 落とした理由 --');
  for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${r}  [${REASONS[r] ?? ''}]`);
  console.log('');
  console.log('-- 落とした写真の一覧(出どころ / 店 / slot / 理由 / 詳細) --');
  for (const d of drops) console.log(`${d.src === 'a' ? '(a)' : '(b)'} | ${d.id ?? '(記録)'} | ${d.slot ?? '-'} | ${d.reason}${d.detail ? ' | ' + d.detail : ''}${d.file ? ' | ' + d.file : ''}`);
}
if (warns.length) {
  console.log('');
  console.log(`-- 警告(落とさなかったが気になる点) ${warns.length} 件 --`);
  for (const w of warns) console.log(w);
}
