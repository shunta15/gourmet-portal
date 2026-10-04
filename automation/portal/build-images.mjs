/**
 * 総合サイトで使う店写真を、幅 960 / 480 の WebP に事前生成する。
 *
 *   node automation/portal/build-images.mjs          # 生成して対応表（JSON）を更新
 *   node automation/portal/build-images.mjs --check  # 生成済みか・元画像が変わっていないかだけ確認（書き込まない）
 *
 * 生成するもの（どちらも元画像 public/restaurants/… は変えない。元より大きくは拡大しない）:
 *  1. home … 総合トップ（/）のグルメ写真。元の一覧は lib/portal/homePhotos.json の "preferred"（lib/portal/home.ts と共有）。
 *            出力 public/_portal/home-{パスのハッシュ}-{幅}.webp、対応表は同じ JSON の "variants"。
 *  2. shop … 総合ページ（駅・新業種の店ページ・一覧など）の店カード・店ページで使う店写真すべて。
 *            元の一覧は店データ（lib/data.ts の RESTAURANTS → sanitizeRestaurant 後の image のうち、自サイトにある使える写真）。
 *            出力 public/_portal/shop-{パスのハッシュ}-{幅}.webp、対応表は lib/portal/shopPhotos.json の "variants"。
 *            総合ページは lib/portal/photos.ts でこの対応表を引き、<img srcset> を出す（components/portal/ShopPhoto.tsx）。
 *            対応表に無い写真（外部URL・データベース側で差し替わった写真）は元の画像をそのまま出す。
 *            ※ 新業種の店データが入ったら、collectShopSources() にその店の画像を足す（今は新業種の掲載が 0 件）。
 *  3. photo … 「写真から探す」（/photos）の壁に並べる料理写真。元の一覧は lib/portal/foodPhotos.ts の FOOD_PHOTO（店ID → 写真のパス）。
 *            幅 400 / 800（壁の1枚）と 1200（押して大きくしたとき）の3種。元より大きくは作らない。
 *            出力 public/_portal/photo-{パスのハッシュ}-{幅}.webp、対応表は lib/portal/foodPhotoVariants.json の "variants"。
 *            作る前に毎回、(1) その店が掲載中か（lib/data.ts の RESTAURANTS に居る）(2) 写真が public/ に在るか
 *            (3) 使ってよい写真か（photoRules.ts の isUsableImage＝表示禁止・食べログ系・プレースホルダ）を確かめ、
 *            外れた店は INVALID と出して作らない（--check では不一致として数える）。ページ側は対応表に無い店を壁に出さない。
 *
 * - sharp と jiti（店データの .ts を読むため）は node_modules にあるものを使う（追加インストールなし）。
 * - 生成物（WebP と JSON）はコミットする。ビルド時には動かさない。実行時に fs で調べない（Vercel の関数に public/ が同梱されるため）。
 * - どこからも参照されない home-*.webp / shop-*.webp は、生成時に削除・--check では不一致として報告する。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT_DIR = path.join(ROOT, "public/_portal");
const WIDTHS = [480, 960];
const check = process.argv.includes("--check");

const HOME_JSON = path.join(ROOT, "lib/portal/homePhotos.json");
const SHOP_JSON = path.join(ROOT, "lib/portal/shopPhotos.json");
const FOOD_JSON = path.join(ROOT, "lib/portal/foodPhotoVariants.json");

const homeCfg = JSON.parse(fs.readFileSync(HOME_JSON, "utf8"));
const shopCfg = JSON.parse(fs.readFileSync(SHOP_JSON, "utf8"));
const foodCfg = JSON.parse(fs.readFileSync(FOOD_JSON, "utf8"));

/** 店データから、事前生成する店写真（public からのパス）の一覧を作る */
async function collectShopSources() {
  let createJiti;
  try {
    ({ createJiti } = await import("jiti"));
  } catch {
    console.error("jiti が見つかりません（node_modules/jiti）。店データ（.ts）を読めないので shop の生成ができません。");
    process.exit(2);
  }
  const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
  const data = await jiti.import(path.join(ROOT, "lib/data.ts"));
  const { sanitizeRestaurant } = await jiti.import(path.join(ROOT, "lib/imageBlocklist.ts"));
  const { isLocalShopPhoto } = await jiti.import(path.join(ROOT, "lib/portal/photoRules.ts"));
  const set = new Set();
  for (const r of data.RESTAURANTS) {
    const img = sanitizeRestaurant(r).image;
    if (isLocalShopPhoto(img)) set.add(img);
  }
  return [...set].sort();
}

/** 壁に載せる料理写真（public からのパス）の一覧。掲載中・ファイルあり・使ってよい写真の3つを確かめ、外れたものは INVALID と出す */
async function collectFoodSources() {
  const { createJiti } = await import("jiti");
  const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
  const data = await jiti.import(path.join(ROOT, "lib/data.ts"));
  const { FOOD_PHOTO } = await jiti.import(path.join(ROOT, "lib/portal/foodPhotos.ts"));
  const { isUsableImage } = await jiti.import(path.join(ROOT, "lib/portal/photoRules.ts"));
  const listed = new Set(data.RESTAURANTS.map((r) => r.id));
  const set = new Set();
  for (const [id, src] of Object.entries(FOOD_PHOTO)) {
    const why = [];
    if (!listed.has(id)) why.push("掲載中の店ではない");
    if (!fs.existsSync(path.join(ROOT, "public", src))) why.push("元画像が無い");
    if (!isUsableImage(src)) why.push("使えない写真（表示禁止・食べログ系・プレースホルダ）");
    if (why.length) {
      console.log(`INVALID [photo] ${id} ${src}（${why.join("・")}）`);
      foodInvalid++;
      continue;
    }
    set.add(src);
  }
  return [...set].sort();
}

let foodInvalid = 0;
const groups = [
  { name: "home", sources: homeCfg.preferred, quality: 78 },
  { name: "shop", sources: await collectShopSources(), quality: 74 },
  // 壁の1枚は 400 / 800、押して大きくしたときは 1200。大きい版ほど画質を少し落として総量を抑える
  { name: "photo", sources: await collectFoodSources(), widths: [400, 800, 1200], quality: (w) => (w <= 400 ? 72 : w <= 800 ? 70 : 66), effort: 6 },
];

let problems = foodInvalid;
const referenced = new Set();
const totals = {};
const results = {};

for (const g of groups) {
  const variants = {};
  const hashes = new Map();
  totals[g.name] = { sources: 0, files: 0, bytes: 0, origBytes: 0 };
  for (const src of g.sources) {
    const file = path.join(ROOT, "public", src);
    if (!fs.existsSync(file)) {
      console.log(`SKIP  [${g.name}] ${src}（元画像が無い）`);
      continue;
    }
    const meta = await sharp(file).metadata();
    const hash = crypto.createHash("sha1").update(src).digest("hex").slice(0, 8);
    if (hashes.has(hash) && hashes.get(hash) !== src) {
      console.error(`ハッシュ衝突: ${src} と ${hashes.get(hash)}`);
      process.exit(2);
    }
    hashes.set(hash, src);
    // 元より大きくしない。元が小さければ「元の幅」の1枚だけ
    const widths = [...new Set((g.widths ?? WIDTHS).map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);
    const items = [];
    for (const w of widths) {
      const name = `${g.name}-${hash}-${w}.webp`;
      const out = path.join(OUT_DIR, name);
      const q = typeof g.quality === "function" ? g.quality(w) : g.quality;
      const buf = await sharp(file)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: q, ...(g.effort ? { effort: g.effort } : {}) })
        .toBuffer();
      const m = await sharp(buf).metadata();
      if (check) {
        if (!fs.existsSync(out) || !fs.readFileSync(out).equals(buf)) {
          console.log(`STALE ${name}（${src}）`);
          problems++;
        }
      } else {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        fs.writeFileSync(out, buf);
      }
      referenced.add(name);
      items.push({ w: m.width, h: m.height, src: `/_portal/${name}`, bytes: buf.length });
      totals[g.name].files++;
      totals[g.name].bytes += buf.length;
    }
    totals[g.name].sources++;
    totals[g.name].origBytes += fs.statSync(file).size;
    variants[src] = { width: items[items.length - 1].w, height: items[items.length - 1].h, items };
    if (g.name === "home") {
      console.log(
        `${check ? "CHECK" : "OK   "} ${src}  元 ${meta.width}x${meta.height} ${(fs.statSync(file).size / 1024).toFixed(0)}KB → ` +
          items.map((i) => `${i.w}w ${(i.bytes / 1024).toFixed(0)}KB`).join(" / "),
      );
    }
  }
  results[g.name] = variants;
}

// 参照されない生成物（home-*.webp / shop-*.webp / photo-*.webp）
const orphans = fs.existsSync(OUT_DIR)
  ? fs.readdirSync(OUT_DIR).filter((f) => /^(home|shop|photo)-[0-9a-f]{8}-\d+\.webp$/.test(f) && !referenced.has(f))
  : [];
for (const f of orphans) {
  if (check) {
    console.log(`ORPHAN ${f}（どの対応表からも参照されていない）`);
    problems++;
  } else {
    fs.unlinkSync(path.join(OUT_DIR, f));
    console.log(`DEL   ${f}（参照されていない）`);
  }
}

for (const [name, t] of Object.entries(totals)) {
  console.log(
    `${name}: 元画像 ${t.sources} 枚（${(t.origBytes / 1e6).toFixed(1)}MB）→ WebP ${t.files} ファイル 合計 ${(t.bytes / 1e6).toFixed(2)}MB`,
  );
}

const cfgs = [
  { name: "home", file: HOME_JSON, cfg: homeCfg },
  { name: "shop", file: SHOP_JSON, cfg: shopCfg },
  { name: "photo", file: FOOD_JSON, cfg: foodCfg },
];
for (const c of cfgs) {
  if (check) {
    if (JSON.stringify(c.cfg.variants) !== JSON.stringify(results[c.name])) {
      console.log(`STALE ${path.relative(ROOT, c.file)} の variants が生成結果と違う`);
      problems++;
    }
  } else {
    fs.writeFileSync(c.file, JSON.stringify({ ...c.cfg, variants: results[c.name] }, null, 2) + "\n");
    console.log(`wrote ${path.relative(ROOT, c.file)}`);
  }
}

if (check) {
  console.log(problems ? `NG ${problems}件` : "OK 生成物は最新");
  process.exit(problems ? 1 : 0);
}
