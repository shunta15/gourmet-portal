// 余白パターン 1「水彩の葉と淡い色の帯」の素材づくり(一度だけ手で回す。出力は public/_portal/hproto/machi2/space/1/ に置いてコミット済み)。
//   node components/portal/hproto/machi2/space/1/build-assets.mjs <見本の webp または PNG>
// 見本 = オーナーの総合トップの見本(1122×1402。reports/machinowa-design/mockups/総合トップ_見本_業種アイコン札_2026-10-20.webp)。
// 使うのは見本の「画面の左右の端にある葉」だけ(AI 画像を新しく作らない)。
//   sap-l / sap-r(と左右反転の sap-l2 / sap-r2) … 左右の端の若木(クリーム地の上なので、地の白だけを透過にして幹・葉・足もとの草を残す)
//   branch-l / branch-r … 「春」の帯の左にある葉の枝(ピンクの地の上なので、緑の葉だけを取る。右は左右反転)
//   hang-r / hang-l … 最初の画面の右上から垂れる枝(空の上なので、緑の葉だけを取り、縁の水色を緑に寄せる。左は左右反転)
//   どれも 2 倍に伸ばして出力する
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const sharp = require("sharp");

const SAMPLE = process.argv[2];
const OUT = path.join(process.cwd(), "public/_portal/hproto/machi2/space/1");
const SC = 2;
const raw = await sharp(SAMPLE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = raw.info.width;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hue = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 1) return -1; let h; if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; return ((h * 60) + 360) % 360; };

/** 範囲を切り出して、地の白を透過にする。mode: "plain"(白だけ透過) / "leaf"(緑の葉+葉の近くの茶色の枝だけ) */
function cut(x0, y0, w, h, mode, despill = false) {
  const n = w * h, d = new Uint8Array(n * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = ((y0 + y) * W + x0 + x) * 3; d.set([raw.data[i], raw.data[i + 1], raw.data[i + 2]], (y * w + x) * 3); }
  const a = new Float32Array(n), a0s = new Float32Array(n), leaf = new Float32Array(n), stem = new Float32Array(n);
  for (let p = 0; p < n; p++) {
    const r = d[p * 3], g = d[p * 3 + 1], b = d[p * 3 + 2];
    const a0 = (255 - Math.min(r, g, b)) / 255;
    a0s[p] = a0;
    a[p] = a0 * smooth(0.04, 0.09, a0);
    const mx = Math.max(r, g, b), c = mx - Math.min(r, g, b), hh = hue(r, g, b);
    leaf[p] = smooth(62, 74, hh) * (1 - smooth(168, 188, hh)) * smooth(34, 70, c);
    stem[p] = smooth(8, 16, hh) * (1 - smooth(60, 66, hh)) * smooth(34, 52, c) * (1 - smooth(150, 185, mx));
  }
  if (mode === "leaf") {
    // 葉から 5 画素以内の暗い茶色(枝)も取る
    const near = new Uint8Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (leaf[y * w + x] > 0.6) for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w) near[yy * w + xx] = 1; }
    for (let p = 0; p < n; p++) a[p] *= Math.max(leaf[p], near[p] ? stem[p] : 0);
  }
  const o = Buffer.alloc(n * 4);
  for (let p = 0; p < n; p++) {
    const ua = Math.max(a0s[p], 0.001);
    let r = (d[p * 3] - 255 * (1 - ua)) / ua, g = (d[p * 3 + 1] - 255 * (1 - ua)) / ua, b = (d[p * 3 + 2] - 255 * (1 - ua)) / ua;
    if (despill) b = Math.min(b, g * 0.8); // 空の水色のにじみを緑に寄せる
    o[p * 4] = Math.max(0, Math.min(255, Math.round(r))); o[p * 4 + 1] = Math.max(0, Math.min(255, Math.round(g))); o[p * 4 + 2] = Math.max(0, Math.min(255, Math.round(b)));
    o[p * 4 + 3] = Math.round(a[p] * 255);
  }
  return o;
}
const dims = {};
async function save(name, x0, y0, w, h, mode, { despill = false, flop = false, fadeBottom = 0, fadeLeft = 0, fadeRight = 0 } = {}) {
  const rgba = cut(x0, y0, w, h, mode, despill);
  // 見本で隣の札・カードに隠れていた側の縁は、切り口が見えないようになだらかに消す
  for (let x = 0; x < w; x++) { const k = (fadeLeft ? smooth(0, fadeLeft, x) : 1) * (fadeRight ? 1 - smooth(w - fadeRight, w, x) : 1); if (k < 1) for (let y = 0; y < h; y++) rgba[(y * w + x) * 4 + 3] = Math.round(rgba[(y * w + x) * 4 + 3] * k); }
  if (fadeBottom) for (let y = h - fadeBottom; y < h; y++) { const k = 1 - smooth(h - fadeBottom, h, y); for (let x = 0; x < w; x++) rgba[(y * w + x) * 4 + 3] = Math.round(rgba[(y * w + x) * 4 + 3] * k); }
  let img = sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).resize(w * SC, h * SC, { kernel: "lanczos3" }).sharpen({ sigma: 0.6 });
  if (flop) img = img.flop();
  await img.webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, `${name}.webp`));
  dims[name] = { w: w * SC, h: h * SC, sample: [x0, y0, w, h] };
}
await save("sap-l", 0, 905, 31, 155, "plain", { fadeRight: 6, fadeBottom: 5 });
await save("sap-r", 1092, 920, 30, 140, "plain", { fadeLeft: 6, fadeBottom: 5 });
await save("sap-l2", 0, 905, 31, 155, "plain", { flop: true, fadeRight: 6, fadeBottom: 5 });
await save("sap-r2", 1092, 920, 30, 140, "plain", { flop: true, fadeLeft: 6, fadeBottom: 5 });
await save("branch-l", 0, 680, 135, 140, "leaf");
await save("branch-r", 0, 680, 135, 140, "leaf", { flop: true });
await save("hang-r", 1030, 45, 92, 72, "leaf", { despill: true, fadeRight: 5 });
await save("hang-l", 1030, 45, 92, 72, "leaf", { despill: true, flop: true, fadeRight: 5 });
writeFileSync(path.join(process.cwd(), "components/portal/hproto/machi2/space/1/dims.json"), JSON.stringify(dims, null, 1));
console.log(JSON.stringify(dims));
