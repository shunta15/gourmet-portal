// 写真の特集の試作用: 写真ごとの 幅・高さ・見た目の指紋(dHash 256 bit) を調べて lib/portal/photoFeature/photoMeta.generated.ts に書く。
// 使い方: node scripts/photo-feature-meta.mjs <パスの JSON 配列(例: ["/restaurants/teleapo-xxx/hero.jpg", …])> <出力先 .ts>
// 同じ絵（大きさ・圧縮だけが違うもの）を、ページ側で 1 枚にまとめるための表。ページ側は fs を使えないので、ここで先に作る。
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , listPath, outPath] = process.argv;
const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
const root = path.resolve("public");

async function meta(src) {
  const file = path.join(root, src);
  const img = sharp(file, { failOn: "none" }).rotate(); // EXIF の向きを直す
  const m = await img.metadata();
  const buf = await img.clone().greyscale().resize(17, 16, { fit: "fill" }).raw().toBuffer();
  let bits = "";
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits += buf[y * 17 + x] > buf[y * 17 + x + 1] ? "1" : "0";
  let hex = "";
  for (let i = 0; i < 256; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  // metadata は向きを直す前の幅・高さ。EXIF の向きが 5〜8 のときは縦横が入れ替わる
  const swap = (m.orientation ?? 1) >= 5;
  return [swap ? m.height : m.width, swap ? m.width : m.height, hex];
}

const out = {};
let n = 0;
for (const src of list) {
  try {
    out[src] = await meta(src);
  } catch (e) {
    console.error("skip", src, String(e).slice(0, 80));
  }
  if (++n % 200 === 0) console.error(n, "/", list.length);
}
const body = Object.entries(out)
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([k, v]) => `  ${JSON.stringify(k)}: [${v[0]}, ${v[1]}, "${v[2]}"],`)
  .join("\n");
fs.writeFileSync(
  outPath,
  `// 自動生成: node scripts/photo-feature-meta.mjs（手で編集しない）。写真の パス → [幅, 高さ, 見た目の指紋(dHash 256 bit・16 進 64 字)]。
// 写真の特集の試作（/proto-gourmet/photo-feature）が、同じ絵を 1 枚にまとめる・向きで組みを決めるために使う。表に無い写真は、パスの一致だけで重複を見る。
export const PHOTO_META: Record<string, readonly [number, number, string]> = {\n${body}\n};\n`,
);
console.error("wrote", outPath, Object.keys(out).length);
