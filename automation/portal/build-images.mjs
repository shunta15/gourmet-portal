/**
 * 総合トップ（/）のグルメ写真を、幅 960 / 480 の WebP に事前生成する。
 *
 *   node automation/portal/build-images.mjs          # 生成して lib/portal/homePhotos.json の variants を更新
 *   node automation/portal/build-images.mjs --check  # 生成済みか・元画像が変わっていないかだけ確認（書き込まない）
 *
 * - 元の一覧は lib/portal/homePhotos.json の "preferred"（lib/portal/home.ts と共有）。元画像（public/restaurants/…）は変えない。
 * - 出力は public/_portal/home-{パスのハッシュ}-{幅}.webp。元より大きくは拡大しない（元が 960 未満ならその幅まで）。
 * - sharp は node_modules にあるものを使う（追加インストールなし）。
 * - 生成物（WebP と JSON）はコミットする。ビルド時には動かさない。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const JSON_PATH = path.join(ROOT, "lib/portal/homePhotos.json");
const OUT_DIR = path.join(ROOT, "public/_portal");
const WIDTHS = [480, 960];
const QUALITY = 78;
const check = process.argv.includes("--check");

const cfg = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const variants = {};
let problems = 0;

for (const src of cfg.preferred) {
  const file = path.join(ROOT, "public", src);
  if (!fs.existsSync(file)) {
    console.log(`SKIP  ${src}（元画像が無い。総合トップは次の候補に落ちる）`);
    continue;
  }
  const meta = await sharp(file).metadata();
  const hash = crypto.createHash("sha1").update(src).digest("hex").slice(0, 8);
  // 元より大きくしない。元が小さければ「元の幅」の1枚だけ
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);
  const items = [];
  for (const w of widths) {
    const name = `home-${hash}-${w}.webp`;
    const out = path.join(OUT_DIR, name);
    const buf = await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer();
    const m = await sharp(buf).metadata();
    if (check) {
      if (!fs.existsSync(out) || !fs.readFileSync(out).equals(buf)) {
        console.log(`STALE ${name}`);
        problems++;
      }
    } else {
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(out, buf);
    }
    items.push({ w: m.width, h: m.height, src: `/_portal/${name}`, bytes: buf.length });
  }
  variants[src] = { width: items[items.length - 1].w, height: items[items.length - 1].h, items };
  console.log(
    `${check ? "CHECK" : "OK   "} ${src}  元 ${meta.width}x${meta.height} ${(fs.statSync(file).size / 1024).toFixed(0)}KB → ` +
      items.map((i) => `${i.w}w ${(i.bytes / 1024).toFixed(0)}KB`).join(" / "),
  );
}

if (check) {
  if (JSON.stringify(cfg.variants) !== JSON.stringify(variants)) {
    console.log("STALE lib/portal/homePhotos.json の variants が生成結果と違う");
    problems++;
  }
  console.log(problems ? `NG ${problems}件` : "OK 生成物は最新");
  process.exit(problems ? 1 : 0);
}
fs.writeFileSync(JSON_PATH, JSON.stringify({ ...cfg, variants }, null, 2) + "\n");
console.log(`wrote ${path.relative(ROOT, JSON_PATH)}`);
