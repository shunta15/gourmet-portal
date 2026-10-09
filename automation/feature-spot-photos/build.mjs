// 集めた写真の記録(automation/feature-spot-photos/<dir>.json)を全部読み、検査して、
// lib/featureSpotPhotos.generated.json を書く。検査に落ちた写真は入れず、理由を一覧で出す(スクリプトは止めない)。
//
// 実行(リポジトリの直下で):
//   node --no-warnings --experimental-strip-types automation/feature-spot-photos/build.mjs
// 付けられるもの:  --dry-run (書かない)  --records <dir>  --public <dir>  --out <file>   (試験用。普段は付けない)
//
// 検査(1 枚ずつ。落ちた写真は入れない):
//   1. featureId がコードの特集(FEATURE_ARTICLES)に実在する / dir が featureId から導いた値(fs-+sha1 の先頭 10 桁)と合う
//   2. slot が、その特集に実在するポイントの番号(ranking の何番めか。1 始まり)で、しかも「写真が無い」ポイントである(写真のあるポイントには当てない)。
//      "hero" は、その特集の一番上の写真が使えないときだけ(使える特集には要らない)
//   3. path が /restaurants/fs/<dir>/ の下の .jpg で、public/ に実在する
//   4. JPEG として読めて(先頭・終わり・サイズの記載)、幅と高さが 300px 以上
//   5. 大きさ(バイト数)が決まりの 1.5 倍以内(ポイント 220KB・一番上 350KB)
//   6. 1 つの店(featureId)の中で、同じ中身(sha256)のファイルが 2 回使われていない(ポイントの若い順に残し、一番上は最後)
// 「写真が無い」の数え方は common.mjs の lackOf(inventory.mjs と同じ。FeaturePage.tsx と同じ判定関数を共有)。
// 当てはめの前の記事で数えるので、このスクリプトを何度回しても結果は同じ(生成済みのファイルには左右されない)。
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, CALLER_CWD, loadCode, lackOf } from './common.mjs';

// ---------- 引数 ----------
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? path.resolve(CALLER_CWD, argv[i + 1]) : d; };
const RECORDS_DIR = opt('--records', path.join(ROOT, 'automation/feature-spot-photos'));
const PUBLIC_DIR = opt('--public', path.join(ROOT, 'public'));
const OUT = opt('--out', path.join(ROOT, 'lib/featureSpotPhotos.generated.json'));
const DRY = flag('--dry-run');

// ---------- 決まり ----------
const MIN_PX = 300;
const KB = 1024;
const LIMIT = { spot: 220 * KB, hero: 350 * KB };
const SLACK = 1.5;

const REASONS = {
  'record-unreadable': '記録が読めない(JSON として壊れている・形が違う)',
  'feature-not-found': 'featureId がコードの特集に実在しない',
  'dir-mismatch': 'dir が featureId から導いた値(fs-+sha1 の先頭 10 桁)と違う',
  'slot-invalid': 'slot が整数でも "hero" でもない',
  'slot-out-of-range': 'slot が、その特集のポイントの番号の範囲外',
  'slot-has-photo': 'そのポイントには使える写真がもうある(写真のあるポイントには当てない)',
  'hero-not-needed': '一番上の写真は使えるので要らない',
  'slot-duplicated': '同じ slot が 2 回(先のものを採用)',
  'path-invalid': 'path が /restaurants/fs/<dir>/ の下の .jpg ではない・使えない文字がある',
  'file-missing': 'path のファイルが public/ に無い',
  'not-jpeg': 'JPEG として読めない(先頭・終わり・サイズの記載のどれかがおかしい)',
  'too-small': `幅か高さが ${MIN_PX}px 未満`,
  'too-heavy': `大きさが決まり(ポイント ${LIMIT.spot / KB}KB・一番上 ${LIMIT.hero / KB}KB)の ${SLACK} 倍を超える`,
  'dup-content': '同じ店の中で、同じ中身のファイルが 2 回使われている(先のものを採用)',
};

// ---------- JPEG を読む(依存なし。SOF のサイズの記載と、終わりの EOI を見る) ----------
function readJpeg(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return { error: '先頭が JPEG ではない' };
  let i = 2;
  let dims = null;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) return { error: 'JPEG の構造が壊れている' };
    while (i < buf.length && buf[i] === 0xff) i++; // 詰めの 0xFF
    const m = buf[i++];
    if (m === undefined) break;
    if (m === 0x01 || (m >= 0xd0 && m <= 0xd8)) continue; // 長さの無いマーカー
    if (m === 0xd9) break; // EOI(SOF より前に来たら、下で dims 無しになる)
    if (i + 2 > buf.length) return { error: 'JPEG の途中で切れている' };
    const len = buf.readUInt16BE(i);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (i + 7 > buf.length) return { error: 'JPEG のサイズの記載が切れている' };
      dims = { height: buf.readUInt16BE(i + 3), width: buf.readUInt16BE(i + 5) };
      break;
    }
    if (m === 0xda) break; // SOS: 画像の本体に入った(SOF を見つけられなかった)
    i += len;
  }
  if (!dims || !dims.width || !dims.height) return { error: 'JPEG のサイズの記載が見つからない' };
  let end = buf.length;
  while (end > 2 && buf[end - 1] === 0x00) end--; // 末尾の 0 の詰めは許す
  if (!(buf[end - 2] === 0xff && buf[end - 1] === 0xd9)) return { error: '終わり(EOI)が無い=途中で切れた JPEG' };
  return dims;
}

const sha1dir = (featureId) => 'fs-' + createHash('sha1').update(featureId).digest('hex').slice(0, 10);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// ---------- コードの特集 ----------
const code = await loadCode();
const lack = new Map(); // featureId -> { spots: Set<番号>, count: ranking の長さ, heroUnusable }
for (const [id, a0] of Object.entries(code.FEATURE_ARTICLES)) {
  const a = code.sanitizeFeatureArticle(a0);
  const l = lackOf(a, code.usable);
  lack.set(id, { spots: new Set(l.spots), count: a.ranking.length, heroUnusable: l.heroUnusable });
}

// ---------- 記録を読む ----------
const files = existsSync(RECORDS_DIR) ? readdirSync(RECORDS_DIR).filter((f) => f.endsWith('.json')).sort() : [];
const drops = []; // { featureId, slot, file, reason, detail }
const warns = [];
const recorded = new Set(); // 記録のある featureId(読めた記録のもの)
let unreadable = 0, emptyRecords = 0, listedImages = 0;
const cands = new Map(); // featureId -> [{ slot, isHero, abs, path, hash, width, height, bytes, file }]

const drop = (featureId, slot, file, reason, detail = '') => { drops.push({ featureId, slot, file, reason, detail }); };

for (const file of files) {
  let rec;
  try {
    rec = JSON.parse(readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
    if (!rec || typeof rec !== 'object' || typeof rec.featureId !== 'string' || !rec.featureId || !Array.isArray(rec.images ?? [])) throw new Error('形が違う');
  } catch (e) {
    unreadable++;
    drop(null, null, file, 'record-unreadable', String(e.message || e));
    continue;
  }
  const fid = rec.featureId;
  const images = rec.images ?? [];
  recorded.add(fid);
  if (!images.length) emptyRecords++;
  listedImages += images.length;
  if (file !== `${rec.dir}.json`) warns.push(`${file}: ファイル名が dir(${rec.dir}) と違う`);

  const info = lack.get(fid);
  const dropAll = (reason, detail) => images.forEach((im) => drop(fid, im?.slot ?? null, file, reason, detail));
  if (!info) { dropAll('feature-not-found', fid); continue; }
  if (rec.dir !== sha1dir(fid)) { dropAll('dir-mismatch', `記録の dir=${rec.dir} / 導いた値=${sha1dir(fid)}`); continue; }

  for (const im of images) {
    const slotRaw = im?.slot;
    let slot, isHero = false;
    if (slotRaw === 'hero') isHero = true;
    else if (Number.isInteger(slotRaw) || (typeof slotRaw === 'string' && /^\d+$/.test(slotRaw))) slot = Number(slotRaw);
    else { drop(fid, slotRaw ?? null, file, 'slot-invalid', JSON.stringify(slotRaw)); continue; }
    const key = isHero ? 'hero' : String(slot);

    if (isHero) {
      if (!info.heroUnusable) { drop(fid, 'hero', file, 'hero-not-needed'); continue; }
    } else {
      if (slot < 1 || slot > info.count) { drop(fid, slot, file, 'slot-out-of-range', `ポイントは ${info.count} つ`); continue; }
      if (!info.spots.has(slot)) { drop(fid, slot, file, 'slot-has-photo'); continue; }
    }

    const p = im.path;
    const prefix = `/restaurants/fs/${rec.dir}/`;
    if (typeof p !== 'string' || !p.startsWith(prefix) || /[^A-Za-z0-9_./-]/.test(p) || p.includes('..') || !/\.jpe?g$/i.test(p)) { drop(fid, key, file, 'path-invalid', String(p)); continue; }
    const abs = path.join(PUBLIC_DIR, p);
    let st;
    try { st = statSync(abs); if (!st.isFile()) throw new Error(); } catch { drop(fid, key, file, 'file-missing', p); continue; }
    const buf = readFileSync(abs);
    const j = readJpeg(buf);
    if (j.error) { drop(fid, key, file, 'not-jpeg', `${p}: ${j.error}`); continue; }
    if (j.width < MIN_PX || j.height < MIN_PX) { drop(fid, key, file, 'too-small', `${p}: ${j.width}x${j.height}`); continue; }
    const limit = (isHero ? LIMIT.hero : LIMIT.spot) * SLACK;
    if (st.size > limit) { drop(fid, key, file, 'too-heavy', `${p}: ${Math.round(st.size / KB)}KB > ${Math.round(limit / KB)}KB`); continue; }

    // 通した(あとは同じ店の中の重複だけ)。決まりを外れていないが気になる点は警告にだけ出す
    const longEdge = Math.max(j.width, j.height);
    if (longEdge > (isHero ? 1600 : 1200)) warns.push(`${fid} ${key}: 長辺 ${longEdge}px が決まり(${isHero ? 1600 : 1200}px)より大きい`);
    if (st.size > (isHero ? LIMIT.hero : LIMIT.spot)) warns.push(`${fid} ${key}: ${Math.round(st.size / KB)}KB が決まり(${(isHero ? LIMIT.hero : LIMIT.spot) / KB}KB)より大きい(1.5 倍以内なので採用)`);
    if (isHero && j.width / j.height < 1.3) warns.push(`${fid} hero: 横長ではない(${j.width}x${j.height})`);
    if (Number.isFinite(im.width) && Number.isFinite(im.height) && (im.width !== j.width || im.height !== j.height)) warns.push(`${fid} ${key}: 記録の寸法(${im.width}x${im.height})と実際(${j.width}x${j.height})が違う`);
    const expect = isHero ? 'hero.jpg' : `p${slot}.jpg`;
    if (path.posix.basename(p) !== expect) warns.push(`${fid} ${key}: ファイル名が ${expect} ではない(${path.posix.basename(p)})`);

    if (!cands.has(fid)) cands.set(fid, []);
    cands.get(fid).push({ slot, isHero, key, path: p, hash: sha256(buf), file });
  }
}

// ---------- 同じ店の中の重複(中身のハッシュ)を除いて、まとめる ----------
const out = {};
let spotCount = 0, heroCount = 0;
for (const fid of [...cands.keys()].sort()) {
  const list = cands.get(fid).sort((a, b) => (a.isHero === b.isHero ? (a.slot || 0) - (b.slot || 0) : a.isHero ? 1 : -1)); // ポイントの若い順 → 一番上
  const seenHash = new Map();
  const seenSlot = new Set();
  const entry = {};
  for (const c of list) {
    // 同じ slot を 2 枚が名乗っていたら、先に読んだ(記録のファイル名順・記録の中の順)検査に通ったものを採る
    if (seenSlot.has(c.key)) { drop(fid, c.key, c.file, 'slot-duplicated', c.path); continue; }
    seenSlot.add(c.key);
    if (seenHash.has(c.hash)) { drop(fid, c.key, c.file, 'dup-content', `${c.path} は ${seenHash.get(c.hash)} と同じ中身`); continue; }
    seenHash.set(c.hash, c.path);
    if (c.isHero) { entry.hero = c.path; heroCount++; }
    else { (entry.spots ??= {})[String(c.slot)] = c.path; spotCount++; }
  }
  if (entry.hero || entry.spots) out[fid] = { ...(entry.hero ? { hero: entry.hero } : {}), ...(entry.spots ? { spots: entry.spots } : {}) };
}
// spots の鍵を数の順に並べる(差分を読みやすくする)
for (const e of Object.values(out)) if (e.spots) e.spots = Object.fromEntries(Object.entries(e.spots).sort((a, b) => Number(a[0]) - Number(b[0])));

// ---------- 書く ----------
const json = JSON.stringify(out, null, 2) + '\n';
if (!DRY) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = OUT + '.tmp';
  writeFileSync(tmp, json);
  renameSync(tmp, OUT);
}

// ---------- 出力 ----------
const lackFeatures = [...lack.entries()].filter(([, v]) => v.spots.size > 0).map(([k]) => k);
const droppedImages = drops.filter((d) => d.reason !== 'record-unreadable');
const byReason = {};
for (const d of drops) byReason[d.reason] = (byReason[d.reason] || 0) + 1;

console.log('== 写真のまとめ(build.mjs) ==');
console.log(`記録の置き場: ${RECORDS_DIR}`);
console.log(`書いた先:     ${DRY ? '(--dry-run のため書かない) ' : ''}${OUT}`);
console.log('');
console.log(`記録のファイル数            ${files.length}(読めた ${files.length - unreadable} / 読めない ${unreadable})`);
console.log(`記録のある店(特集)          ${recorded.size}   うち images が空(写真なしの記録) ${emptyRecords}`);
console.log(`写真の入った店(特集)        ${Object.keys(out).length}`);
console.log(`当てたポイントの数          ${spotCount}`);
console.log(`一番上の写真の数            ${heroCount}`);
console.log(`記録にある写真の数          ${listedImages}(= 採用 ${spotCount + heroCount} + 落とした ${droppedImages.length})`);
console.log(`落とした写真の数            ${droppedImages.length}`);
console.log(`(参考)写真の無いポイントがある特集 ${lackFeatures.length} 本のうち、記録のある特集 ${lackFeatures.filter((f) => recorded.has(f)).length} 本`);
if (drops.length) {
  console.log('');
  console.log('-- 落とした理由 --');
  for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${r}  [${REASONS[r] ?? ''}]`);
  console.log('');
  console.log('-- 落とした写真の一覧(特集 / slot / 理由 / 詳細) --');
  for (const d of drops) console.log(`${d.featureId ?? '(記録)'} | ${d.slot ?? '-'} | ${d.reason}${d.detail ? ' | ' + d.detail : ''}${d.file ? ' | ' + d.file : ''}`);
}
if (warns.length) {
  console.log('');
  console.log(`-- 警告(落とさなかったが気になる点) ${warns.length} 件 --`);
  for (const w of warns) console.log(w);
}
