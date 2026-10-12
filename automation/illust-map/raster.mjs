// 描き起こした SVG（automation/illust-map/svg/<style>/）を、あらかじめ画像（WebP）にする。画面では SVG を敷かず、この画像を敷く（実行時に重い SVG を描かないため）。
//   使い方: node automation/illust-map/raster.mjs [--style=e|f|g|h] [地域キー…]   （meta.json の項目のうち、指定したものを画像にする。省くと全部）
//   出力: public/_portal/illust-map/<style>-<キー>[-core].webp、automation/illust-map/webp.json、lib/portal/noren/illustMaps.generated.ts（範囲の表）
// 解像度: 初期表示の画面の 2 倍（スマホ・高精細の画面でもにじまない）。ただし長辺 CAP px まで、1 枚 BUDGET KB 前後に収まるよう画質を下げる。
// 細かい層（core）は、縁を四辺の 9% でぼかした透明つきの画像にする（実行時の CSS の mask は使わない）。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const require = createRequire(import.meta.url);
const sharp = require("/Users/shunta/claude/gp-portal/node_modules/sharp");
const { chromium } = await import("/Users/shunta/claude/gp-portal/node_modules/playwright/index.mjs");

const OUT = path.join(ROOT, "public/_portal/illust-map");
const TABLE = path.join(ROOT, "lib/portal/noren/illustMaps.generated.ts");
const META = path.join(HERE, "meta.json");
const WEBP = path.join(HERE, "webp.json");
const meta = JSON.parse(fs.readFileSync(META, "utf8"));
const webp = fs.existsSync(WEBP) ? JSON.parse(fs.readFileSync(WEBP, "utf8")) : {};
const args = process.argv.slice(2);
const styleArg = args.find((a) => a.startsWith("--style="))?.slice(8);
const only = args.filter((a) => !a.startsWith("--"));
const BUDGET = Number(process.env.BUDGET_KB || 260);
const CAP = { overview: Number(process.env.CAP_OV || 2600), core: Number(process.env.CAP_CORE || 2600) };

fs.mkdirSync(OUT, { recursive: true });
const tmp = path.join(HERE, "tmp");
fs.mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();

for (const [id, m] of Object.entries(meta)) {
  if (styleArg && m.style !== styleArg) continue;
  if (only.length && !only.includes(m.key)) continue;
  const t0 = Date.now();
  const fi = 2 ** (m.zi - m.z); // 初期表示の画面の px / 単位
  const file = path.join(ROOT, "automation/illust-map", m.file);
  const svgText = fs.readFileSync(file, "utf8");
  const sw = Number(svgText.match(/width="(\d+)"/)?.[1]), sh = Number(svgText.match(/height="(\d+)"/)?.[1]);
  let scale = Math.min(2 * fi, CAP[m.kind] / Math.max(sw, sh));
  let png, info;
  let q = 74;
  for (let attempt = 0; attempt < 6; attempt++) {
    const pw = Math.round(sw * scale), ph = Math.round(sh * scale);
    const html = path.join(tmp, "wrap.html");
    const feather = m.kind === "core" ? "-webkit-mask-image:linear-gradient(to right,transparent,#000 9%,#000 91%,transparent),linear-gradient(to bottom,transparent,#000 9%,#000 91%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(to right,transparent,#000 9%,#000 91%,transparent),linear-gradient(to bottom,transparent,#000 9%,#000 91%,transparent);mask-composite:intersect;" : "";
    fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}img{display:block;width:${pw}px;height:${ph}px;${feather}}</style><img src="file://${file}">`);
    const page = await browser.newPage({ viewport: { width: pw, height: ph }, deviceScaleFactor: 1 });
    await page.goto("file://" + html);
    await page.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    png = await page.screenshot({ type: "png", omitBackground: m.kind === "core", timeout: 170000 });
    await page.close();
    let pipe = sharp(png);
    if (m.kind !== "core") pipe = pipe.removeAlpha();
    let out;
    for (; q >= 40; q -= 6) {
      out = await pipe.clone().webp({ quality: q, alphaQuality: 70, effort: 5, smartSubsample: true }).toBuffer();
      if (out.length / 1024 <= BUDGET) break;
    }
    info = { w: pw, h: ph, kb: Math.round(out.length / 1024), q };
    if (out.length / 1024 <= BUDGET * 1.12) { fs.writeFileSync(path.join(OUT, `${m.style}-${m.key}${m.kind === "core" ? "-core" : ""}.webp`), out); break; }
    scale *= 0.84; // 画質を下げても収まらない: 解像度を下げる
    q = 66;
  }
  webp[id] = { src: `/_portal/illust-map/${m.style}-${m.key}${m.kind === "core" ? "-core" : ""}.webp`, bounds: m.bounds, z: m.z, zi: m.zi, w: info.w, h: info.h, kb: info.kb, q: info.q, kind: m.kind, waterRaw: m.waterRaw };
  fs.writeFileSync(WEBP, JSON.stringify(webp, null, 1));
  console.log(`${id.padEnd(24)} ${info.w}x${info.h} q${info.q} ${info.kb}KB  (svg ${m.svgKB}KB) ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });

// ---- 範囲の表（lib/portal/noren/illustMaps.generated.ts）----
// e の地域のうち、まだ画像にしていないものは、これまでの SVG（public/_portal/illust-map/<キー>.svg。automation/illust-map/table.json）のまま
const legacyPath = path.join(HERE, "table.json");
const legacy = fs.existsSync(legacyPath) ? JSON.parse(fs.readFileSync(legacyPath, "utf8")) : {};
const tbl = { e: {}, f: {}, g: {}, h: {} };
const jp = {};
for (const [k, v] of Object.entries(legacy)) {
  if (k === "__japan") { jp.e = { src: "/_portal/illust-map/japan.svg", bounds: v.bounds }; continue; }
  tbl.e[k] = { zi: v.zi, main: { src: `/_portal/illust-map/${k}.svg`, bounds: v.bounds }, ...(v.core ? { core: { src: `/_portal/illust-map/${k}-core.svg`, bounds: v.core.bounds } } : {}) };
}
const seen = new Set();
for (const [id, w] of Object.entries(webp)) {
  const [style, key, kind] = id.split("/");
  if (key === "japan") { jp[style] = { src: w.src, bounds: w.bounds }; continue; }
  if (!seen.has(style + key)) { seen.add(style + key); tbl[style][key] = {}; } // 画像にした地域は、これまでの SVG（暫定）の項目を捨てる
  tbl[style][key][kind === "core" ? "core" : "main"] = { src: w.src, bounds: w.bounds, kb: w.kb };
  if (kind !== "core") tbl[style][key].zi = w.zi;
}
const fmt = (o) => JSON.stringify(o, null, 1).replace(/\n\s*/g, " ");
const rows = (style) => Object.entries(tbl[style]).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `    ${JSON.stringify(k)}: ${fmt(v)},`).join("\n");
fs.writeFileSync(TABLE, `/**
 * 「さがす」の地図 e・f・g・h の、地域ごとの画像の範囲の表。automation/illust-map/raster.mjs が書き出す（手で編集しない）。
 * main = 粗い層（すべての店の範囲。h はこの 1 枚だけ）、core = 細かい層（初期表示のまわり。縁をぼかした透明つき。粗い層の上に重ねる）。bounds は [[南, 西], [北, 東]]（緯度経度）。
 * f・g・h は、ここにある地域だけ（ほかの地域は e の絵を出す）。e のうち src が .svg のものは、画像にする前の描き起こし（暫定）。
 * 出典: 地図は国土地理院ベクトルタイルをもとに作成。
 */
export type IllustLayer = { src: string; bounds: [[number, number], [number, number]]; kb?: number };
export type IllustEntry = { main: IllustLayer; core?: IllustLayer; zi?: number };
export type IllustStyle = "e" | "f" | "g" | "h";

export const ILLUST: Record<IllustStyle, Record<string, IllustEntry>> = {
  e: {
${rows("e")}
  },
  f: {
${rows("f")}
  },
  g: {
${rows("g")}
  },
  h: {
${rows("h")}
  },
};

/** 全国の地図（描き方ごと。f・g・h が無いときは e） */
export const ILLUST_JAPAN: Partial<Record<IllustStyle, IllustLayer>> & { e: IllustLayer } = ${fmt(jp)};
`);
console.log("table written");
