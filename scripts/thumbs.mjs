// 自前の店の写真（public/restaurants）の縮小版を、手元で作る（費用 0。sharp。Vercel の画像最適化などの従量の機能は使わない）。
//
// 使い方: node scripts/thumbs.mjs            ← 何度流しても同じ結果。新しい画像が増えたときは、足りない分だけ作る
//         node scripts/thumbs.mjs --dry      ← 作らずに、対象の数と見積もりだけ出す
//
// 対象: カード・巻頭で使う画像（と、scripts/thumbs-extra.json の画像）（店の image・heroImages の先頭・特集記事の heroImage・最初の視点の先頭の写真・sideArticles）。
//       ギャラリーの写真（記事・店ページの大きな写真）は対象外（大きく出すので、元の画像のまま）。
// 作るもの: public/_thumbs/480/restaurants/<元の相対パス>.webp（幅 480）と public/_thumbs/960/…（幅 960）と public/_thumbs/1600/…（幅 1600）。webp（quality 74）。
//       元の幅が狭いとき（幅 < 360）・元が小さいとき（40KB 未満）は作らない。元より大きくしない（幅は min(元の幅, 480 / 960)）。
//       向き（EXIF）は rotate() で直して焼き込む。元の幅が 600 以下のときは 960 は作らない（480 だけ）。元の幅が 1000 を超えるときは 1600 も作る（デバイスピクセル比 2 の画面で、表示幅 700 前後までの枠に足りる幅。2026-10-26 追加。min(元の幅, 1600) なので元より大きくしない）。
// 表: lib/localThumbs.ts（縮小版がある画像の一覧。sized() が引く。生成物 = 手で編集しない）
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
const sharp = require(path.join(ROOT, "node_modules/sharp"));
const DRY = process.argv.includes("--dry");
const W1 = 480, W2 = 960, W3 = 1600, MIN_W = 360, MIN_BYTES = 40000, Q = 74;

// ───── データを読む（TS を、その場で JS にして読む。ページの中の処理ではない） ─────
const ts = require(path.join(ROOT, "node_modules/typescript"));
const Module = require("module");
const resolve0 = Module._resolveFilename;
Module._resolveFilename = function (r, p, ...x) {
  if (r.startsWith("@/")) r = path.join(ROOT, r.slice(2));
  if (r === "server-only") r = path.join(ROOT, "node_modules/next/dist/compiled/server-only/empty.js");
  return resolve0.call(this, r, p, ...x);
};
require.extensions[".ts"] = function (m, f) {
  m._compile(ts.transpileModule(fs.readFileSync(f, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true }, fileName: f }).outputText, f);
};
const R = (p) => require(path.join(ROOT, p));
const { RESTAURANTS, FEATURE_ARTICLES } = R("lib/data.ts");
const { sanitizeFeatureArticle, sanitizeRestaurant } = R("lib/imageBlocklist.ts");
const { applyFeatureSpotPhotos } = R("lib/featureSpotPhotos.ts");
const { applyFeatureSinglePhotos } = R("lib/portal/noren/featureSinglePhotos.ts");
const { applyShopPhotos } = R("lib/shopPhotos.ts");

const set = new Set();
const add = (u) => {
  if (typeof u !== "string" || !u.startsWith("/restaurants/") || u.includes("?")) return;
  let d = u;
  try { d = decodeURIComponent(u); } catch {}
  if (/\.(jpe?g|png|webp)$/i.test(d)) set.add(d);
};
for (const r0 of RESTAURANTS) for (const r of [r0, applyShopPhotos(sanitizeRestaurant(r0))]) { add(r.image); add((r.heroImages || [])[0]); }
for (const a0 of Object.values(FEATURE_ARTICLES)) {
  for (const a of [a0, applyFeatureSpotPhotos(sanitizeFeatureArticle(applyFeatureSinglePhotos(a0)))]) {
    add(a.heroImage);
    add(((a.ranking || [])[0]?.images || [])[0]);
    for (const s of a.sideArticles || []) add(s.img);
  }
}

// 実際のページ（/gourmet・/search・地域・店ページなど）を PC・スマホで開いて、幅 760px 以下で出ていた原寸の画像のうち、上の対象に無かったもの（scripts/thumbs-extra.json）も対象にする
try {
  for (const u of JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/thumbs-extra.json"), "utf8"))) add(u);
} catch {}

// ───── 作る ─────
const pub = path.join(ROOT, "public");
const outOf = (w, rel) => path.join(pub, "_thumbs", String(w), rel + ".webp");
const table = []; // [相対パス, 段（1 = 480 だけ / 2 = 480 と 960）]
let made = 0, kept = 0, skipped = 0, missing = 0, bytes = 0, srcBytes = 0;
for (const u of [...set].sort()) {
  const src = path.join(pub, u);
  if (!fs.existsSync(src)) { missing++; continue; }
  const st = fs.statSync(src);
  let meta;
  try { meta = await sharp(src).metadata(); } catch { skipped++; continue; }
  if (!meta.width || meta.width < MIN_W || st.size < MIN_BYTES) { skipped++; continue; }
  const tiers = meta.width > 1000 ? [W1, W2, W3] : meta.width > 600 ? [W1, W2] : [W1];
  for (const w of tiers) {
    const out = outOf(w, u.slice(1));
    if (!fs.existsSync(out)) {
      if (!DRY) {
        fs.mkdirSync(path.dirname(out), { recursive: true });
        await sharp(src).rotate().resize({ width: Math.min(w, meta.width), withoutEnlargement: true }).webp({ quality: Q, effort: 4 }).toFile(out);
      }
      made++;
    } else kept++;
    if (fs.existsSync(out)) bytes += fs.statSync(out).size;
  }
  srcBytes += st.size;
  table.push([u.replace(/^\/restaurants\//, ""), tiers.length]);
}

// ───── 表（lib/localThumbs.ts）。client の部品からも呼ばれる sized() が引くので、小さく保つ（1 行 = 相対パス + 段） ─────
const body = table.map(([p, t]) => (t === 2 ? p : p + "\t" + t)).join("\n");
const ts_ = `// 生成物（scripts/thumbs.mjs）。手で編集しない。縮小版（public/_thumbs/<幅>/restaurants/<相対パス>.webp）がある画像の一覧。
// 1 行 = /restaurants/ から先の相対パス（デコード済み）。行末に \\t1 があるものは 480 だけ、\\t3 があるものは 480・960・1600 の 3 つ、無いものは 480 と 960 の両方。
// 軽く保つ（client の部品から import される lib/imageUrl.ts が使う）。数 = ${table.length}
export const LOCAL_THUMBS = ${JSON.stringify(body)};
`;
if (!DRY) fs.writeFileSync(path.join(ROOT, "lib/localThumbs.ts"), ts_);
console.log(JSON.stringify({ 対象の候補: set.size, 元の画像なし: missing, 作らない_小さい_狭い: skipped, 縮小版のある元画像: table.length, 今回作った縮小版: made, 既にあった縮小版: kept, 縮小版の合計MB: +(bytes / 1e6).toFixed(1), 元画像の合計MB: +(srcBytes / 1e6).toFixed(1), 表の大きさKB: +(Buffer.byteLength(ts_) / 1000).toFixed(1), dry: DRY }));
