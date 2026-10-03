/**
 * 総合サイトのテキストのコントラスト比（WCAG 2.x AA）を Playwright で計算する。
 *
 *   npx next start -p 3242   # 本番ビルドを起動してから
 *   node proto-portal/check-contrast.mjs [--base http://localhost:3242] [--out result.json] [--pages "/,/beauty"] [--verbose]
 *
 * 方法（背景がグラデーション・写真・WebGL でも測れるように、画面に出た実際の色を使う）:
 *  1. ページを開いて登場アニメ・スクロール連動を最終状態にし、テキストを持つ要素の位置・文字色・サイズ・太さを集める
 *  2. 全文字を透明にして全画面スクリーンショットを撮り、各文字の枠の下にある背景の色を拾う（下位 5% のコントラストを採用）
 *  3. 文字色（透明度・親の opacity を反映）と背景のコントラスト比を計算。通常文字 4.5、大きい文字（24px 以上、または 18.66px 以上で太字700）は 3.0
 * 除外: aria-hidden の装飾、非表示、opacity 0、幅高さが 4px 未満（スクリーンリーダー専用など）、Leaflet の地図タイル
 * 幅 1440 と 390 の両方で測る。終了コードは違反があれば 1。
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:3242");
const OUT = arg("out", "");
const VERBOSE = process.argv.includes("--verbose");
// --silk: 総合トップの WebGL の絹を実際に動かした状態で測る（幅1440のみ。ヘッドレスなのでソフトウェア描画）。
// 既定は「動きを減らす」設定で測る（絹は出ず、CSS のグラデーションだけ）。
const SILK = process.argv.includes("--silk");
const PAGES = arg(
  "pages",
  [
    "/",
    "/beauty",
    "/bodycare",
    "/pet",
    "/leisure",
    "/stay",
    "/beauty/hair",
    "/beauty/hair/tokyo",
    "/beauty/area/tokyo",
    "/bodycare/scene/weekend-open",
    "/area/tokyo",
    "/area/aichi",
    "/station",
    "/station/kyoto",
    "/station/kyoto/祇園四条",
    "/station/hyogo/神戸三宮",
    "/videos",
    "/videos/sv-nazatu-1",
    "/map",
    "/map?pref=kyoto",
  ].join(","),
).split(",");
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** ページ内で「文字を持つ要素」を集める（ブラウザ内で実行） */
function collect() {
  const out = [];
  const sx = scrollX;
  const sy = scrollY;
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return [0, 0, 0, 1];
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  const seen = new Set();
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) continue;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName)) continue;
    // 直接の文字ノード
    const texts = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (texts.length === 0) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.closest(".leaflet-tile-pane, .leaflet-marker-pane .mp-cl-wrap, .leaflet-marker-pane .mp-pin-wrap")) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    // 親までの opacity の積
    let op = 1;
    let hidden = false;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const o = parseFloat(getComputedStyle(a).opacity);
      op *= o;
      if (o === 0) hidden = true;
    }
    if (hidden || op < 0.01) continue;
    const rects = [];
    for (const n of texts) {
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const q of r.getClientRects()) if (q.width >= 4 && q.height >= 4) rects.push([q.left + sx, q.top + sy, q.width, q.height]);
    }
    if (rects.length === 0) continue;
    // 画面外に押し出された（clip・overflow で完全に見えない）ものは除外
    const fg = parse(cs.color);
    const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : "");
    const parentSel = el.parentElement ? el.parentElement.tagName.toLowerCase() + (typeof el.parentElement.className === "string" && el.parentElement.className ? "." + el.parentElement.className.trim().split(/\s+/)[0] : "") : "";
    out.push({
      sel,
      parentSel,
      text: texts.map((n) => n.textContent.trim()).join(" ").slice(0, 28),
      fs: parseFloat(cs.fontSize),
      fw: parseInt(cs.fontWeight, 10) || 400,
      fg: [fg[0], fg[1], fg[2], fg[3] * op],
      rects,
    });
  }
  return out;
}

/** 文字の枠の下の背景を、スクリーンショットから拾ってコントラストを出す */
function judge(items, img) {
  const { data, info } = img;
  const W = info.width;
  const H = info.height;
  const res = [];
  for (const it of items) {
    let worst = Infinity;
    let worstBg = null;
    for (const [x, y, w, h] of it.rects) {
      const gx = Math.min(14, Math.max(2, Math.floor(w / 6)));
      const gy = Math.min(4, Math.max(2, Math.floor(h / 6)));
      const ratios = [];
      for (let i = 0; i < gx; i++) {
        for (let j = 0; j < gy; j++) {
          const px = Math.round(x + ((i + 0.5) / gx) * w);
          const py = Math.round(y + ((j + 0.5) / gy) * h);
          if (px < 0 || py < 0 || px >= W || py >= H) continue;
          const o = (py * W + px) * 4;
          const bg = [data[o], data[o + 1], data[o + 2]];
          const a = it.fg[3];
          const fg = [it.fg[0] * a + bg[0] * (1 - a), it.fg[1] * a + bg[1] * (1 - a), it.fg[2] * a + bg[2] * (1 - a)];
          ratios.push([ratio(fg, bg), bg, fg]);
        }
      }
      if (ratios.length === 0) continue;
      ratios.sort((p, q) => p[0] - q[0]);
      const pick = ratios[Math.floor(ratios.length * 0.05)];
      if (pick[0] < worst) {
        worst = pick[0];
        worstBg = pick;
      }
    }
    if (!isFinite(worst)) continue;
    const large = it.fs >= 24 || (it.fs >= 18.66 && it.fw >= 700);
    const need = large ? 3 : 4.5;
    res.push({ ...it, ratio: worst, need, large, fail: worst < need, bg: hex(worstBg[1]), fgFinal: hex(worstBg[2]) });
  }
  return res;
}

const browser = await chromium.launch(SILK ? { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] } : {});
const all = [];
let checked = 0;
for (const vp of VIEWPORTS) {
  if (SILK && vp.name !== "1440") continue;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: SILK ? "no-preference" : "reduce" });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    const resp = await page.goto(BASE + encodeURI(p), { waitUntil: "load", timeout: 120000 });
    if (!resp || resp.status() !== 200) {
      console.log(`SKIP ${vp.name} ${p} -> ${resp?.status()}`);
      continue;
    }
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
    await page.evaluate(() => {
      document.querySelectorAll("[data-reveal]").forEach((e) => e.classList.add("is-in"));
      document.querySelectorAll("[data-progress]").forEach((e) => e.style.setProperty("--p", "1"));
    });
    await page.evaluate(() => document.fonts.ready);
    if (SILK) await page.waitForSelector("canvas.mp-silk[data-ready]", { timeout: 20000 }).catch(() => console.log("  （絹が始まらなかった）"));
    await page.waitForTimeout(2500);
    const items = await page.evaluate(collect);
    await page.addStyleTag({ content: "*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}" });
    await page.waitForTimeout(300);
    // 縦に長いページは Chromium が 16384px 付近から先を白で返すので、6000px ずつ撮って縦に連結する
    const total = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    const bufs = [];
    let width = vp.width;
    for (let y = 0; y < total; y += 6000) {
      const h = Math.min(6000, total - y);
      const png = await page.screenshot({ fullPage: true, clip: { x: 0, y, width: vp.width, height: h } });
      const r = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      width = r.info.width;
      bufs.push(r.data);
    }
    const raw = { data: Buffer.concat(bufs), info: { width, height: Math.round(Buffer.concat(bufs).length / 4 / width) } };
    const judged = judge(items, raw);
    const bad = judged.filter((j) => j.fail);
    for (const b of bad) all.push({ vp: vp.name, page: p, ...b });
    checked += judged.length;
    console.log(`${vp.name.padEnd(5)} ${p.padEnd(32)} 文字要素 ${String(judged.length).padStart(4)}  違反 ${bad.length}`);
    if (VERBOSE) for (const b of bad) console.log(`        ${b.ratio.toFixed(2)} < ${b.need}  ${b.sel} 「${b.text}」 ${b.fs}px/${b.fw}  文字${b.fgFinal} 背景${b.bg}`);
  }
  await ctx.close();
}
await browser.close();

// 集計: 延べ（ページ×幅×要素）とユニーク（クラス名＋親＋文字色の組）
const uniq = new Map();
for (const v of all) {
  const key = `${v.sel}|${v.parentSel}|${v.fg.map((n) => Math.round(n)).join(",")}`;
  if (!uniq.has(key)) uniq.set(key, { ...v, n: 0 });
  uniq.get(key).n++;
}
console.log(`\n検査した文字要素（延べ）: ${checked}`);
console.log(`違反（延べ）: ${all.length}   ユニーク（クラス＋親＋文字色の組）: ${uniq.size}`);
const top = [...uniq.values()].sort((a, b) => b.n - a.n);
for (const u of top.slice(0, 60)) console.log(`  ×${String(u.n).padStart(3)}  ${u.ratio.toFixed(2)}<${u.need}  ${u.sel}  ${u.fs}px/${u.fw}  文字${u.fgFinal} 背景${u.bg}  「${u.text}」 (${u.page} ${u.vp})`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ checked, total: all.length, unique: uniq.size, items: top }, null, 1));
process.exit(all.length ? 1 : 0);
