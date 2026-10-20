// 余白パターン 2「紙と罫線、小さな絵」(/proto-home/sp-2)の切り絵(ステッカー) 4 枚を作る。
// 元は既存の飾り・見本から切り出し済みの絵だけ(新しく AI で作らない)。やること = 余白を切って、白い紙の縁(ふち)と薄い影を付け、少し傾けるだけ。
//   st-balloon  … lower/fx-balloon.webp(街の絵の気球)
//   st-card     … cats/d/band-leisure.webp(見本の「おでかけ」札の川と街の水彩)を絵はがき風に
//   st-sprig    … lower/v2.webp(花のつる。寝かせて斜めに)
//   st-sun      … lower/fx-sun.webp(街の絵の太陽)
// 実行: node components/portal/hproto/machi2/space/2/build-assets.mjs(public/_portal/hproto/machi2/space/2/ に書き出し。各枚の大きさは同じ階層の components/.../space/2/dims.json)
import { createRequire } from "node:module";
import fs from "node:fs";
const sharp = createRequire("/Users/shunta/claude/gp-k-gomu/package.json")("sharp");
import path from "node:path";

const ROOT = "/Users/shunta/claude/gp-k-gomu/public/_portal/hproto/machi2";
const OUT = `${ROOT}/space/2`;
fs.mkdirSync(OUT, { recursive: true });

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const PAD = 26; // 影・縁のための余白(書き出しの画素。表示は半分)

/** 2 倍の画素で作る(表示は半分の大きさ → 2 倍密度の画面でもにじまない) */
async function make({ name, src, crop, scale, rot, edge, edgeTan = 3, flat, circle }) {
  let img = sharp(src).ensureAlpha();
  if (crop) img = img.extract(crop);
  let buf = await img.png().toBuffer();
  if (flat) {
    // 透明な部分(空のにじみ)を空色で埋め、角丸の長方形にする(絵はがき)
    const mm = await sharp(buf).metadata();
    const rr = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${mm.width}" height="${mm.height}"><rect width="${mm.width}" height="${mm.height}" rx="${flat.r}" fill="#fff"/></svg>`);
    buf = await sharp({ create: { width: mm.width, height: mm.height, channels: 4, background: flat.bg } }).composite([{ input: buf }, { input: rr, blend: "dest-in" }]).png().toBuffer();
  }
  // うっすらした光のにじみ(アルファ 40 未満)を消してから、余白の透明部分を切り詰める
  {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) if (data[i] < 40) data[i] = 0;
    // 切り離された小さな点(ごみ)を消す: 8 近傍でつながった塊のうち、いちばん大きい塊だけ残す
    const { width: w, height: h } = info;
    const lab = new Int32Array(w * h);
    let best = 0, bestN = 0, nlab = 0;
    const stack = [];
    for (let s0 = 0; s0 < w * h; s0++) {
      if (lab[s0] || data[s0 * 4 + 3] === 0) continue;
      nlab++; let n = 0; stack.push(s0); lab[s0] = nlab;
      while (stack.length) {
        const q = stack.pop(); n++;
        const qx = q % w, qy = (q - qx) / w;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = qx + dx, ny = qy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const k = ny * w + nx;
          if (!lab[k] && data[k * 4 + 3] !== 0) { lab[k] = nlab; stack.push(k); }
        }
      }
      if (n > bestN) { bestN = n; best = nlab; }
    }
    if (!flat) for (let k = 0; k < w * h; k++) if (lab[k] !== best) data[k * 4 + 3] = 0;
    buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  }
  buf = await sharp(buf).trim({ background: CLEAR, threshold: 4 }).png().toBuffer();
  if (circle) {
    // 太陽: 元の絵の下が平らに切れているので、丸く切り抜く
    const cm = await sharp(buf).metadata();
    const d = Math.min(cm.width, cm.height);
    const cc = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cm.width}" height="${cm.height}"><circle cx="${cm.width / 2}" cy="${cm.height / 2}" r="${d / 2}" fill="#fff"/></svg>`);
    buf = await sharp(buf).composite([{ input: cc, blend: "dest-in" }]).png().toBuffer();
  }
  let m = await sharp(buf).metadata();
  buf = await sharp(buf).resize({ width: Math.round(m.width * scale), kernel: "lanczos3" }).png().toBuffer();
  if (rot) buf = await sharp(buf).rotate(rot, { background: CLEAR }).png().toBuffer();
  buf = await sharp(buf).trim({ background: CLEAR, threshold: 4 }).extend({ top: PAD + edge, bottom: PAD + edge, left: PAD + edge, right: PAD + edge, background: CLEAR }).png().toBuffer();
  m = await sharp(buf).metadata();
  const { width: W, height: H } = m;

  const alpha = await sharp(buf).extractChannel(3).raw().toBuffer();
  const grey = (b) => sharp(b, { raw: { width: W, height: H, channels: 1 } });
  /** 影絵 mask を r 画素ぶん太らせる(ぼかして閾値) */
  const one = async (pipe) => { const { data, info } = await pipe.toColourspace("b-w").extractChannel(0).raw().toBuffer({ resolveWithObject: true }); if (info.channels !== 1) throw new Error("channels " + info.channels); return data; };
  const grow = (r) => one(grey(alpha).blur(Math.max(0.3, r / 1.42)).threshold(20));
  const solid = async (rgb, maskBuf, mul = 1) => {
    const a = mul === 1 ? maskBuf : Buffer.from(maskBuf.map((v) => Math.round(v * mul)));
    return sharp({ create: { width: W, height: H, channels: 3, background: rgb } }).joinChannel(a, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  };
  const maskWhite = await grow(edge);
  const maskTan = await grow(edge + edgeTan);
  const shadowSrc = await grow(edge + 2);
  const shadowBlur = await one(grey(shadowSrc).blur(6));
  const shadow = await solid({ r: 96, g: 74, b: 40 }, shadowBlur, 0.34);
  const tan = await solid({ r: 226, g: 215, b: 190 }, maskTan);
  const white = await solid({ r: 255, g: 254, b: 250 }, maskWhite);
  const out = await sharp({ create: { width: W, height: H + 8, channels: 4, background: CLEAR } })
    .composite([
      { input: shadow, left: 0, top: 8 },
      { input: tan, left: 0, top: 0 },
      { input: white, left: 0, top: 0 },
      { input: buf, left: 0, top: 0 },
    ])
    .webp({ quality: 90, alphaQuality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, `${name}.webp`), out);
  return { name, w: W, h: H + 8 };
}

const dims = [];
dims.push(await make({ name: "st-balloon", src: `${ROOT}/lower/fx-balloon.webp`, scale: 2, rot: -7, edge: 7 }));
dims.push(await make({ name: "st-card", src: `${ROOT}/cats/d/band-leisure.webp`, crop: { left: 0, top: 78, width: 340, height: 130 }, scale: 1.2, rot: 3, edge: 11, flat: { r: 14, bg: { r: 190, g: 222, b: 245, alpha: 1 } } }));
dims.push(await make({ name: "st-sprig", src: `${ROOT}/lower/v2.webp`, scale: 1, rot: 66, edge: 7 }));
dims.push(await make({ name: "st-sun", src: `${ROOT}/lower/fx-sun.webp`, scale: 2.2, rot: 0, edge: 8, circle: true }));
fs.writeFileSync("/Users/shunta/claude/gp-k-gomu/components/portal/hproto/machi2/space/2/dims.json", JSON.stringify(dims, null, 1));
console.log(JSON.stringify(dims));
