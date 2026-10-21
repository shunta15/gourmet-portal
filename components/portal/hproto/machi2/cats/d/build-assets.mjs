// 業種の札 案D「写真なし・大きな色の丸アイコン」の素材づくり(一度だけ手で回す。出力は public/_portal/hproto/machi2/cats/d/ に置いてコミット済み)。
//   node components/portal/hproto/machi2/cats/d/build-assets.mjs <見本の PNG>
// 見本 = オーナーが持ってきた総合トップの見本(1122×1402)。使うのは上から 2 段目の業種の札 6 枚(y≈300〜605)だけ。
//   glyph-*.webp … 既存の ic2-*.webp(色付きの丸)から「白い絵だけ」を取り出した透過画像(2 倍に伸ばして縁をくっきりさせ、丸は CSS で描く)
//   band-*.webp  … 札の下の水彩の飾り(家・街・緑)。見本から札ごとに切り出し、白地を透過にする(札の矢印は消して埋める)
//   vine-*.webp  … 札と札の間の緑のつる。見本から切り出し、緑だけを透過にして取る
//   cats/d/dims.json … 切り出した寸法(見本の画素)。CSS・CatsD.tsx の数字の根拠(public には置かない)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
const require = createRequire(path.join(process.cwd(), "package.json"));
const sharp = require("sharp");

const SAMPLE = process.argv[2];
const OUT = path.join(process.cwd(), "public/_portal/hproto/machi2/cats/d");
const IC2 = path.join(process.cwd(), "public/_portal/hproto/machi2/lower");
const KEYS = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];
/** 見本の札の左右の端(画素)。上端 300・下端 605 */
const CARD = [[14, 184], [194, 370], [383, 553], [563, 739], [750, 926], [937, 1109]];
const TOP = 300, BOT = 605;
const BAND_H = 107; // 札の下 107 画素(札の高さの約 1/3)を飾りの帯にする
const SC = 2; // 出力は 2 倍(1x でも 2x でもぼやけない)

const raw = await sharp(SAMPLE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = raw.info.width;
const px = (x, y) => { const i = (y * W + x) * 3; return [raw.data[i], raw.data[i + 1], raw.data[i + 2]]; };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hue = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 1) return -1; let h; if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; return ((h * 60) + 360) % 360; };

/** 範囲を切り出して RGB の配列にする */
function cropRGB(x0, y0, w, h) {
  const d = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = px(x0 + x, y0 + y); d.set(c, (y * w + x) * 3); }
  return d;
}
/** 円の中をまわりの色でなめらかに埋める(拡散) */
function inpaintDisc(d, w, h, cx, cy, r) {
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) mask[y * w + x] = 1;
  const f = Float32Array.from(d);
  for (let it = 0; it < 400; it++) {
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      if (!mask[y * w + x]) continue;
      for (let k = 0; k < 3; k++) {
        const i = (y * w + x) * 3 + k;
        f[i] = (f[i - 3] + f[i + 3] + f[i - w * 3] + f[i + w * 3]) / 4;
      }
    }
  }
  for (let i = 0; i < d.length; i++) d[i] = Math.round(f[i]);
}
/** 白地 → 透過(color-to-alpha)。gate(r,g,b) が 0〜1 を返すと、その分だけ残す(緑だけ取るとき) */
function toAlpha(d, w, h, gate) {
  const o = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = d[i * 3], g = d[i * 3 + 1], b = d[i * 3 + 2];
    const a0 = (255 - Math.min(r, g, b)) / 255;
    let a = a0 * smooth(0.04, 0.09, a0); // ごく薄い地のざらつき・字のにじみは落とす
    if (gate) a *= gate(r, g, b);
    if (a > 0) {
      const ua = Math.max(a0, 0.001);
      o[i * 4] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - ua)) / ua)));
      o[i * 4 + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - ua)) / ua)));
      o[i * 4 + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - ua)) / ua)));
    }
    o[i * 4 + 3] = Math.round(a * 255);
  }
  return o;
}
const greenGate = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn;
  if (c < 14) return 0;
  const h = hue(r, g, b);
  // 札のふちの薄い黄緑の輪郭線(色相 50〜62°・彩度が低い)は取らない。葉(色相 65〜170°・彩度が高い)だけ取る
  return smooth(62, 74, h) * (1 - smooth(168, 188, h)) * smooth(34, 70, c);
};
const save = (rgba, w, h, file, extra = {}) =>
  sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).resize(w * SC, h * SC, { kernel: "lanczos3" }).sharpen({ sigma: 0.6 }).webp({ quality: 84, alphaQuality: 88, effort: 6, ...extra }).toFile(path.join(OUT, file));

const dims = { sample: { cardTop: TOP, cardBottom: BOT, cards: CARD }, bands: {}, vines: {}, glyph: SC * 216 };

/* 1. 札の下の飾り(帯) */
for (let i = 0; i < 6; i++) {
  const [L, R] = CARD[i];
  const x0 = L + 3, w = R - L - 6, y0 = BOT - 1 - BAND_H, h = BAND_H;
  const d = cropRGB(x0, y0, w, h);
  // 見本の矢印(ピンクの丸)の位置を探して消す
  let bx0 = 1e9, bx1 = -1, by0 = 1e9, by1 = -1;
  const mid = Math.round((L + R) / 2);
  for (let y = 548; y < 592; y++) for (let x = mid - 22; x < mid + 22; x++) {
    const [r, g, b] = px(x, y);
    if (r > 215 && g < 150 && b > 90 && b < 190 && r - g > 90) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
  }
  const acx = (bx0 + bx1) / 2, acy = (by0 + by1) / 2, ar = Math.max(bx1 - bx0, by1 - by0) / 2;
  if (i === 4) {
    // おでかけは水面の上に矢印が乗っているので、同じ高さの左隣の水面を写して埋める(ぼかして埋めると白いにじみが残る)
    const rr = ar + 6, cx = acx - x0, cy = acy - y0, sh = Math.round(rr * 2 + 3);
    const src = Buffer.from(d);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dd = Math.hypot(x - cx, y - cy);
      if (dd > rr + 2.5) continue;
      const f = 1 - smooth(rr - 1, rr + 2.5, dd); // ふちはなじませる
      const sx = x - sh;
      if (sx < 0) continue;
      for (let k = 0; k < 3; k++) d[(y * w + x) * 3 + k] = Math.round(src[(y * w + x) * 3 + k] * (1 - f) + src[(y * w + sx) * 3 + k] * f);
    }
  } else inpaintDisc(d, w, h, acx - x0, acy - y0, ar + 4);
  // 業種名・サブ文の紺色の字(帯の上の方に入っている)を白に戻す。青い屋根・空とは色相で分ける(字 220〜268°)
  const er = new Uint8Array(w * h);
  for (let y = 0; y < Math.min(h, 54); y++) for (let x = 0; x < w; x++) {
    const r = d[(y * w + x) * 3], g = d[(y * w + x) * 3 + 1], bb = d[(y * w + x) * 3 + 2];
    const c = Math.max(r, g, bb) - Math.min(r, g, bb), hh = hue(r, g, bb);
    if (hh >= 220 && hh <= 268 && c >= 8 && r < 238) er[y * w + x] = 1;
  }
  for (let pass = 0; pass < 2; pass++) { const cp = er.slice(); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (cp[y * w + x] || cp[y * w + x - 1] || cp[y * w + x + 1] || cp[(y - 1) * w + x] || cp[(y + 1) * w + x]) er[y * w + x] = 1; }
  for (let p = 0; p < w * h; p++) if (er[p]) { d[p * 3] = 255; d[p * 3 + 1] = 255; d[p * 3 + 2] = 255; }
  const rgba = toAlpha(d, w, h);
  // 上のふち 14 画素はなだらかに消す(帯の上で絵が切れて見えない)
  for (let y = 0; y < h; y++) { const k = smooth(0, 14, y); for (let x = 0; x < w; x++) rgba[(y * w + x) * 4 + 3] = Math.round(rgba[(y * w + x) * 4 + 3] * k); }
  await save(rgba, w, h, `band-${KEYS[i]}.webp`);
  dims.bands[KEYS[i]] = { w, h, arrow: { cx: +(acx - x0).toFixed(1), cy: +(acy - y0).toFixed(1), r: ar, fromBottom: +(BOT - acy).toFixed(1) } };
}

/* 2. 札の間のつる(緑だけ) */
const VY0 = 296, VY1 = 506;
const b = [null, (CARD[0][1] + CARD[1][0]) / 2, (CARD[1][1] + CARD[2][0]) / 2, (CARD[2][1] + CARD[3][0]) / 2, (CARD[3][1] + CARD[4][0]) / 2, (CARD[4][1] + CARD[5][0]) / 2, null];
const VINES = [[0, 58, "l"], [148, 232, ""], [338, 420, ""], [520, 604, ""], [718, 784, ""], [895, 955, ""], [1068, 1122, "r"]];
for (let k = 0; k < 7; k++) {
  const [x0, x1, side] = VINES[k];
  const w = x1 - x0, h = VY1 - VY0;
  const d = cropRGB(x0, VY0, w, h);
  const rgba = toAlpha(d, w, h, greenGate);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let f = (1 - smooth(h - 26, h, y)) * smooth(0, 8, y); // 上下はなだらかに消す
    // ボディケアの緑の丸(中心 468,385・半径 60)は緑なので、つるに混ざらないよう外す
    if ((x0 + x - 468) ** 2 + (VY0 + y - 385) ** 2 < 66 * 66) f = 0;
    if (side !== "l") f *= smooth(0, 13, x);
    if (side !== "r") f *= smooth(0, 13, w - 1 - x);
    rgba[(y * w + x) * 4 + 3] = Math.round(rgba[(y * w + x) * 4 + 3] * f);
  }
  await save(rgba, w, h, `vine-${k}.webp`);
  // 札の端(基準)からの位置: 内側のつるは「札と札の境」、外側は「札の外端」
  const anchor = side === "l" ? CARD[0][0] : side === "r" ? CARD[5][1] : b[k];
  dims.vines[k] = { x0, w, h, y0: VY0, anchorOffset: +(anchor - x0).toFixed(1) };
}

/* 3. 白い絵だけ(ic2 の色付きの丸から) */
for (const k of KEYS) {
  const { data, info } = await sharp(path.join(IC2, `ic2-${k}.webp`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  // 丸の地の色(縁に近い輪の中央値)を求め、白さ t = (最小チャンネル − 地の最小) / (255 − 地の最小) を絵の濃さにする
  const ring = [];
  for (let a = 0; a < 360; a += 6) { const rad = a * Math.PI / 180; const x = Math.round(108 + 98 * Math.cos(rad)), y = Math.round(108 + 98 * Math.sin(rad)); const i = (y * info.width + x) * 4; ring.push(Math.min(data[i], data[i + 1], data[i + 2])); }
  ring.sort((p, q) => p - q);
  const m0 = ring[ring.length >> 1];
  const a8 = Buffer.alloc(n);
  for (let i = 0; i < n; i++) {
    const m = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
    const t = Math.min(1, Math.max(0, (m - (m0 + 22)) / (250 - (m0 + 22))));
    a8[i] = Math.round(t * (data[i * 4 + 3] / 255) * 255);
  }
  // 2 倍に伸ばして(なめらか)→ しきい値の曲線で縁をくっきりさせる
  const upr = await sharp(a8, { raw: { width: info.width, height: info.height, channels: 1 } }).resize(info.width * SC, info.height * SC, { kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const up = upr.data, uch = upr.info.channels, un = info.width * SC * info.height * SC;
  const out = Buffer.alloc(un * 4);
  for (let i = 0; i < un; i++) {
    const t = smooth(0.30, 0.70, up[i * uch] / 255);
    out[i * 4] = 255; out[i * 4 + 1] = 255; out[i * 4 + 2] = 255; out[i * 4 + 3] = Math.round(t * 255);
  }
  await sharp(out, { raw: { width: info.width * SC, height: info.height * SC, channels: 4 } }).webp({ lossless: true, effort: 6 }).toFile(path.join(OUT, `glyph-${k}.webp`));
}
writeFileSync(path.join(process.cwd(), "components/portal/hproto/machi2/cats/d/dims.json"), JSON.stringify(dims, null, 1));
console.log(JSON.stringify(dims));
