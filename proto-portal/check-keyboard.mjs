/**
 * 総合サイトのキーボード操作・フォーカスの見え方・画像の alt を Playwright で検査する。
 *
 *   npx next start -p 3242   # 本番ビルドを起動してから
 *   node proto-portal/check-keyboard.mjs [--base http://localhost:3242] [--home]   （--home: 総合トップ（1・2・2b）だけ）
 *
 * 検査:
 *  1. / （幅1440・にぎわいの輪・2 色とも）: Tab の順番が「本文へ移動」→ロゴ→さがす→業種の入口 6 つ。各要素にフォーカスリングが見える。入口にフォーカスすると、その業種が選ばれる
 *  2. / （幅390・2 色とも）: 同じ順番。入口が画面に出る大きさ。2b. 動きを減らす設定: 同じ順番で、輪は回らない
 *  3. /map: Tab で業種チップに届き、Space で aria-pressed が切り替わる。「今開いている店だけ」の切替に Tab で届き、Space で切り替わる
 *  4. /station/kyoto/祇園四条: 「今開いている店だけ」の切替に Tab で届き、Space で切り替わる（URL に ?open=1）
 *  5. フッターの <summary>（地方ブロック）に Tab で届き、Enter で開閉する
 *  6. 総合サイトの主なページで <img> の alt 属性が全部ある（空 alt は装飾として許可。ただし単独のリンクの中の画像は不可）
 *  7. 検索の combobox（幅1440）: Tab で「検索を開く」→ Enter で開く → 入力 → 候補（role=listbox/option・aria-expanded・aria-controls）
 *     → ↓で選ぶ（aria-activedescendant・選択行のリング）→ Esc で候補を閉じる → もう一度 Esc で検索欄を閉じてボタンへ戻る → ↓ と Enter で移動
 *  8. 共有ボタン（駅ページ）: Tab で4つのコントロールに順に届き、それぞれリングが見える。コピーは Enter で動き、状況が role=status に出る
 * フォーカスリングの検査: :focus-visible の outline が付いていて、リングの色と周りの背景のコントラストが 3:1 以上（スクリーンショットから実測）。
 * 違反があれば終了コード 1。
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:3242");
const bad = [];
const ok = (m) => console.log("  OK  " + m);
const ng = (m) => {
  bad.push(m);
  console.log("  NG  " + m);
};

const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

/** いまフォーカスのある要素の、リングの見え方（outline の有無と、リング/背景の実測コントラスト） */
async function ringOf(page) {
  const info = await page.evaluate(() => {
    const e = document.activeElement;
    if (!e || e === document.body) return null;
    // 見えないチェックボックス（input の次の .tr が見た目）は、リングを持つ兄弟を見る
    let target = e;
    const cs0 = getComputedStyle(e);
    if (cs0.outlineStyle === "none" && e.matches("input[type=checkbox]") && e.nextElementSibling) target = e.nextElementSibling;
    const b = target.getBoundingClientRect();
    const cs = getComputedStyle(target);
    return {
      name: (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().replace(/\s+/g, " ").slice(0, 24),
      tag: e.tagName.toLowerCase(),
      x: b.left, y: b.top, w: b.width, h: b.height,
      os: cs.outlineStyle, ow: parseFloat(cs.outlineWidth) || 0, oo: parseFloat(cs.outlineOffset) || 0, oc: cs.outlineColor,
      vw: innerWidth, vh: innerHeight,
    };
  });
  if (!info) return null;
  if (info.os === "none" || info.ow < 1) return { ...info, ring: false, contrast: 0 };
  const png = await page.screenshot();
  const { data, info: im } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= im.width || yi >= im.height) return null;
    const o = (yi * im.width + xi) * 4;
    return [data[o], data[o + 1], data[o + 2]];
  };
  // リングの中心線（左辺・右辺・上辺・下辺のうち画面内にあるもの）と、その外側の背景を測り、一番良いものを採る
  const half = info.oo + info.ow / 2;
  const out = info.oo + info.ow + 5;
  const cy = info.y + info.h / 2, cx = info.x + info.w / 2;
  const pairs = [
    [px(info.x - half, cy), px(info.x - out, cy)],
    [px(info.x + info.w + half, cy), px(info.x + info.w + out, cy)],
    [px(cx, info.y - half), px(cx, info.y - out)],
    [px(cx, info.y + info.h + half), px(cx, info.y + info.h + out)],
  ].filter(([a, b]) => a && b);
  const best = Math.max(0, ...pairs.map(([a, b]) => ratio(a, b)));
  return { ...info, ring: true, contrast: best };
}

const browser = await chromium.launch();
/** --home: 総合トップ（1・2・2b）だけを検査して終わる（総合トップを直したあとの確認用） */
const ONLY_HOME = process.argv.includes("--home");

async function tabUntil(page, pred, max = 80) {
  for (let i = 1; i <= max; i++) {
    await page.keyboard.press("Tab");
    const hit = await page.evaluate(pred);
    if (hit) return i;
  }
  return -1;
}

// ───── 1・2・2b. 総合トップ（にぎわいの輪）: Tab の順番とフォーカスリング ─────
// 総合トップは「にぎわいの輪」（2 色ランダム）。共通ヘッダーは出さない（画面の中に、ロゴと「さがす」がある）。
// Tab の順番: 本文へ移動 → ロゴ → さがす → 業種の入口 6 つ（グルメ・ビューティー・ボディケアはリンク、ほかの 3 つはボタン）。
// 入口にフォーカスが来ると、その業種が選ばれる（.ng の data-sel が変わる）。選んだものが入れる業種なら、入口の列のあとに「入る」のリンクが出る。
// 色は 2 色とも見る（履歴の項目に色を先に入れて固定する。ページの抽選スクリプトがそれを読む）。
// ビューティー・ボディケアは実在の店のデータ（lib/places/generated/*.json）の件数で「掲載中」（aria-label「◯◯に入る」）／「掲載準備中」（「◯◯（準備中）のページを見る」）が決まる（2026-10-09 から掲載中）
function liveName(key, name) {
  let n = 0;
  try { n = JSON.parse(fs.readFileSync(new URL(`../lib/places/generated/${key}.json`, import.meta.url), "utf8")).places.length; } catch (e) {}
  return n > 0 ? `${name}に入る` : `${name}（準備中）`;
}
const HOME_WANT = [
  ["本文へ移動", null],
  ["マチノワ", null],
  ["さがす", null],
  ["グルメに入る", "gourmet"],
  [liveName("beauty", "ビューティー"), "beauty"],
  [liveName("bodycare", "ボディケア"), "bodycare"],
  ["ペット（準備中）", "pet"],
  ["おでかけ（準備中）", "leisure"],
  ["ステイ（準備中）", "stay"],
];
const pinTheme = (page, t) => page.addInitScript((x) => { try { history.replaceState({ ngTheme: x }, ""); } catch (e) {} }, t);
async function homeTabOrder(page, label, mobile) {
  // `next dev` の丸い開発用の表示（nextjs-portal。左下で業種の入口に重なる）は、リングの測定に混ざるので隠す（`next start` には無い）
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  for (const [w, key] of HOME_WANT) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(650);
    const r = await ringOf(page);
    if (!r) {
      ng(`${label}: Tab でフォーカスが無い（期待: ${w}）`);
      continue;
    }
    if (!r.name.includes(w)) ng(`${label}: Tab の順番: 「${w}」のはずが「${r.name}」`);
    else if (!r.ring) ng(`${label}: 「${w}」にフォーカスリングが無い`);
    else if (r.contrast < 3) ng(`${label}: 「${w}」のフォーカスリングのコントラスト ${r.contrast.toFixed(2)} < 3`);
    else ok(`${label}: 「${w}」 リング ${r.ow}px ${r.os} コントラスト ${r.contrast.toFixed(1)}`);
    if (key) {
      const sel = await page.evaluate(() => document.querySelector(".ng")?.dataset.sel);
      sel === key ? ok(`  フォーカス → 「${w}」が選ばれる（data-sel=${sel}）`) : ng(`${label}: 「${w}」にフォーカスしたのに選ばれたのは ${sel}`);
    }
    if (mobile && key) {
      const box = await page.evaluate(() => {
        const e = document.activeElement.getBoundingClientRect();
        return { w: e.width, h: e.height, inView: e.top >= 0 && e.bottom <= innerHeight };
      });
      box.w >= 40 && box.h >= 40 && box.inView ? ok(`  画面に出る ${Math.round(box.w)}×${Math.round(box.h)}`) : ng(`${label}: 「${w}」が画面に出ない・小さい（${Math.round(box.w)}×${Math.round(box.h)}）`);
    }
  }
}

for (const theme of ["sometsuke", "akagane"]) {
  console.log(`1. / 幅1440（にぎわいの輪・${theme}）: Tab で`);
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await pinTheme(page, theme);
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2600);
    const t = await page.evaluate(() => document.querySelector(".ngp")?.dataset.theme);
    t === theme ? ok(`色 ${t}`) : ng(`色を固定できていない（${t}）`);
    await homeTabOrder(page, `PC ${theme}`, false);
    await ctx.close();
  }
  console.log(`2. / 幅390（にぎわいの輪・${theme}）: Tab で`);
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await pinTheme(page, theme);
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2600);
    await homeTabOrder(page, `スマホ ${theme}`, true);
    await ctx.close();
  }
}
console.log("2b. / 動きを減らす設定: Tab の順番は同じ・輪は回らない");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await homeTabOrder(page, "動きを減らす", false);
  const rot = await page.evaluate(() => (document.querySelector(".ng-ring")?.style.getPropertyValue("--rot") || "0").trim());
  parseFloat(rot) === 0 ? ok("輪は回らない（--rot が 0）") : ng(`動きを減らす設定なのに輪が回っている（--rot=${rot}）`);
  await ctx.close();
}

if (ONLY_HOME) {
  await browser.close();
  console.log(`\n違反: ${bad.length}`);
  process.exit(bad.length ? 1 : 0);
}

// ───── 3. 地図のチップ・切替 ─────
console.log("3. /map: チップと「今開いている」切替");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/map", { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const n = await tabUntil(page, () => document.activeElement?.classList.contains("mp-mx-chip"), 60);
  if (n < 0) ng("地図の業種チップに Tab で届かない");
  else {
    const r = await ringOf(page);
    r?.ring && r.contrast >= 3 ? ok(`業種チップ「${r.name}」に ${n} 回の Tab で届く（リング ${r.contrast.toFixed(1)}）`) : ng(`業種チップのフォーカスリングが見えない（${r?.contrast?.toFixed(2)}）`);
    // 押されていないチップまで進めて Space
    for (let i = 0; i < 6; i++) {
      const pressed = await page.evaluate(() => document.activeElement?.getAttribute("aria-pressed"));
      if (pressed === "false") break;
      await page.keyboard.press("Tab");
    }
    const before = await page.evaluate(() => document.activeElement?.getAttribute("aria-pressed"));
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => document.activeElement?.getAttribute("aria-pressed"));
    before !== after ? ok(`Space でチップが切り替わる（aria-pressed ${before} → ${after}）`) : ng(`Space でチップが切り替わらない（${before} → ${after}）`);
    await page.keyboard.press("Space");
  }
  const m = await tabUntil(page, () => !!document.activeElement?.closest?.(".mp-obar-switch"), 60);
  if (m < 0) ng("/map の「今開いている店だけ」切替に Tab で届かない");
  else {
    const r = await ringOf(page);
    r?.ring && r.contrast >= 3 ? ok(`「今開いている店だけ」に Tab で届く（リング ${r.contrast.toFixed(1)}）`) : ng(`「今開いている店だけ」のフォーカスリングが見えない（${r?.contrast?.toFixed(2)} / ring=${r?.ring}）`);
    const b = await page.evaluate(() => document.activeElement.checked);
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    const a = await page.evaluate(() => document.activeElement.checked);
    b !== a ? ok(`Space で切り替わる（checked ${b} → ${a}）`) : ng("/map の切替が Space で切り替わらない");
  }
  await ctx.close();
}

// ───── 4. 駅ページの切替 ─────
console.log("4. /station/kyoto/祇園四条: 「今開いている」切替");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + encodeURI("/station/kyoto/祇園四条"), { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const m = await tabUntil(page, () => !!document.activeElement?.closest?.(".mp-obar-switch"), 80);
  if (m < 0) ng("駅ページの「今開いている店だけ」切替に Tab で届かない");
  else {
    const r = await ringOf(page);
    r?.ring && r.contrast >= 3 ? ok(`切替に ${m} 回の Tab で届く（リング ${r.contrast.toFixed(1)}）`) : ng(`切替のフォーカスリングが見えない（${r?.contrast?.toFixed(2)} / ring=${r?.ring}）`);
    const before = await page.evaluate(() => document.activeElement.checked);
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => document.activeElement.checked);
    const url = page.url();
    before !== after ? ok(`Space で切り替わる（checked ${before} → ${after}）`) : ng("切替が Space で切り替わらない");
    after && /open=1/.test(url) ? ok("オンにすると URL に ?open=1 が付く") : after ? ng(`オンなのに URL に ?open=1 が無い（${url}）`) : null;
  }
  await ctx.close();
}

// ───── 5. フッターの折りたたみ ─────
console.log("5. フッターの地方ブロック（summary）");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/beauty", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const openAtStart = await page.evaluate(() => [...document.querySelectorAll(".mp-ft-areas details")].map((d) => d.open));
  openAtStart.length === 8 && openAtStart.every(Boolean) ? ok("PC 幅ではフッターの地方ブロック 8つが開いた状態") : ng(`PC 幅のフッターの details が ${openAtStart.length} 個・開いている ${openAtStart.filter(Boolean).length} 個`);
  const n = await tabUntil(page, () => document.activeElement?.tagName === "SUMMARY", 120);
  if (n < 0) ng("フッターの summary に Tab で届かない");
  else {
    const r = await ringOf(page);
    r?.ring && r.contrast >= 3 ? ok(`summary「${r.name}」に届く（リング ${r.contrast.toFixed(1)}）`) : ng(`summary のフォーカスリングが見えない（${r?.contrast?.toFixed(2)}）`);
    const before = await page.evaluate(() => document.activeElement.parentElement.open);
    await page.keyboard.press("Enter");
    const after = await page.evaluate(() => document.activeElement.parentElement.open);
    before !== after ? ok(`Enter で開閉する（${before} → ${after}）`) : ng("summary が Enter で開閉しない");
  }
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + "/beauty", { waitUntil: "load" });
  await p2.waitForTimeout(1500);
  const mob = await p2.evaluate(() => [...document.querySelectorAll(".mp-ft-areas details")].map((d) => d.open));
  mob.length === 8 && mob.every((o) => !o) ? ok("スマホ幅ではフッターの地方ブロックが閉じた状態") : ng(`スマホ幅でフッターが開いたまま（開いている ${mob.filter(Boolean).length}/${mob.length}）`);
  await ctx2.close();
}

/**
 * 候補データ（/search-index.json）の取得が終わって、候補が出るまで待つ。
 * 取得中は「すべての結果を見る」の1行（option 1つ）だけが出る。それを「候補が出た」と見ると、
 * マシンが重いときに option が 1 つのまま ARIA を調べて「不完全」と誤判定する（2026-10-06 に実際に起きた。取得を3秒遅らせると再現する）。
 */
async function waitForSuggestions(page) {
  await page.waitForFunction(() => document.querySelectorAll('[role="listbox"] [role="option"]').length >= 2, null, { timeout: 15000 }).catch(() => {});
}

// ───── 7. 検索の combobox ─────
console.log("7. 検索の combobox（幅1440）");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + encodeURI("/station/kyoto/祇園四条"), { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const n = await tabUntil(page, () => document.activeElement?.getAttribute("aria-label") === "検索を開く", 20);
  if (n < 0) ng("検索を開くボタンに Tab で届かない");
  else {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(900);
    const onInput = await page.evaluate(() => document.activeElement?.matches?.(".mp-hd-search input"));
    onInput ? ok("Enter で検索欄が開き、入力欄にフォーカスが移る") : ng("検索を開いても入力欄にフォーカスが移らない");
    const ri = await ringOf(page);
    ri?.ring && ri.contrast >= 3 ? ok(`検索の入力欄のフォーカスリング（${ri.contrast.toFixed(1)}）`) : ng(`検索の入力欄のフォーカスリングが見えない（${ri?.contrast?.toFixed(2)}）`);
    await page.keyboard.type("三宮", { delay: 40 });
    await waitForSuggestions(page);
    const roles = await page.evaluate(() => {
      const i = document.activeElement;
      const lb = document.getElementById(i.getAttribute("aria-controls") || "");
      return { role: i.getAttribute("role"), exp: i.getAttribute("aria-expanded"), ac: i.getAttribute("aria-autocomplete"), lb: lb?.getAttribute("role"), opts: lb ? [...lb.querySelectorAll('[role="option"]')].length : 0 };
    });
    roles.role === "combobox" && roles.exp === "true" && roles.lb === "listbox" && roles.opts >= 2 ? ok(`role=combobox・aria-expanded=true・aria-controls → listbox（候補 ${roles.opts}）`) : ng(`combobox の ARIA が不完全（${JSON.stringify(roles)}）`);
    await page.keyboard.press("ArrowDown");
    const sel = await page.evaluate(() => {
      const i = document.activeElement;
      const id = i.getAttribute("aria-activedescendant");
      const o = id ? document.getElementById(id) : null;
      if (!o) return null;
      const cs = getComputedStyle(o);
      const bg = getComputedStyle(o.parentElement).backgroundColor;
      return { selected: o.getAttribute("aria-selected"), os: cs.outlineStyle, ow: parseFloat(cs.outlineWidth) || 0, oc: cs.outlineColor, bg };
    });
    if (!sel || sel.selected !== "true") ng("↓ で aria-activedescendant の候補が選択状態にならない");
    else {
      const rgb = (c) => c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
      const c = ratio(rgb(sel.oc), rgb(sel.bg));
      sel.os !== "none" && sel.ow >= 2 && c >= 3 ? ok(`↓ で候補が選択され、選択行にリング ${sel.ow}px（コントラスト ${c.toFixed(1)}）`) : ng(`選択行のリングが見えない（${JSON.stringify(sel)} / ${c.toFixed(2)}）`);
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const closed = await page.evaluate(() => ({ lb: !!document.querySelector('[role="listbox"]'), onInput: !!document.activeElement?.matches?.(".mp-hd-search input"), exp: document.activeElement?.getAttribute("aria-expanded") }));
    !closed.lb && closed.onInput && closed.exp === "false" ? ok("Esc で候補が閉じる（フォーカスは入力欄のまま・aria-expanded=false）") : ng(`Esc で候補が閉じない（${JSON.stringify(closed)}）`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const back = await page.evaluate(() => ({ btn: document.activeElement?.getAttribute("aria-label"), open: document.querySelector(".mp-hd-search")?.classList.contains("open") }));
    back.btn === "検索を開く" && !back.open ? ok("もう一度 Esc で検索欄が閉じ、フォーカスが「検索を開く」に戻る") : ng(`Esc で検索欄が閉じない（${JSON.stringify(back)}）`);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    // （type="search" は Esc で入力が消えるので、打ち直す）
    await page.keyboard.type("三宮", { delay: 40 });
    await waitForSuggestions(page);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    await Promise.all([page.waitForURL(/\/station\/hyogo\//, { timeout: 15000 }).catch(() => {}), page.keyboard.press("Enter")]);
    decodeURIComponent(page.url()).includes("/station/hyogo/神戸三宮") ? ok("↓ と Enter で候補の駅ページへ移動する") : ng(`Enter で移動しない（${decodeURIComponent(page.url())}）`);
  }
  await ctx.close();
}

// ───── 8. 共有ボタン ─────
console.log("8. 共有ボタン（駅ページ）");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  await page.goto(BASE + encodeURI("/station/kyoto/祇園四条"), { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const first = await tabUntil(page, () => !!document.activeElement?.closest?.("[data-share]"), 120);
  if (first < 0) ng("共有ボタンに Tab で届かない");
  else {
    const kinds = [];
    for (let i = 0; i < 4; i++) {
      const r = await ringOf(page);
      const k = await page.evaluate(() => document.activeElement?.getAttribute("data-share-kind"));
      kinds.push(k);
      r?.ring && r.contrast >= 3 ? ok(`共有「${r.name}」にリング（${r.contrast.toFixed(1)}）`) : ng(`共有「${r?.name}」のフォーカスリングが見えない（${r?.contrast?.toFixed(2)}）`);
      if (i < 3) await page.keyboard.press("Tab");
    }
    kinds.join(",") === "line,x,facebook,copy" ? ok("Tab の順番は LINE → X → Facebook → リンクをコピー") : ng(`共有ボタンの Tab の順番が違う（${kinds.join(",")}）`);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    const msg = await page.evaluate(() => document.querySelector("[data-share] [role=status]")?.textContent || "");
    const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
    /コピーしました/.test(msg) && clip.startsWith("https://machinowa.tokyo/station/kyoto/") ? ok("コピーは Enter で動き、role=status に「コピーしました」が出る") : ng(`コピーが動かない（${msg} / ${clip}）`);
  }
  await ctx.close();
}

// ───── 6. 画像の alt ─────
console.log("6. 画像の alt");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const pages = ["/", "/beauty", "/area/tokyo", "/station", "/station/kyoto", "/station/kyoto/祇園四条", "/station/hyogo/神戸三宮", "/videos", "/videos/sv-nazatu-1", "/map", "/map?pref=kyoto", "/find?q=三宮", "/find?q=京都", "/photos", "/omakase"];
  let imgs = 0;
  for (const u of pages) {
    await page.goto(BASE + encodeURI(u), { waitUntil: "load" });
    await page.waitForTimeout(800);
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll("img")].map((i) => {
        const a = i.closest("a");
        const aText = a ? (a.textContent || "").replace(/\s+/g, "").length : 0;
        return { src: (i.currentSrc || i.src || "").slice(-50), hasAlt: i.hasAttribute("alt"), alt: i.getAttribute("alt"), inLink: !!a, linkHasText: aText > 0, leaflet: !!i.closest(".leaflet-container") };
      }),
    );
    for (const r of rows) {
      imgs++;
      if (r.leaflet) continue; // 地図タイル・マーカー（Leaflet が出す画像）
      if (!r.hasAlt) ng(`${u}: alt 属性が無い img（${r.src}）`);
      else if (r.alt === "" && r.inLink && !r.linkHasText) ng(`${u}: 文字の無いリンクの中の img の alt が空（${r.src}）`);
    }
  }
  imgs > 0 ? ok(`画像 ${imgs} 枚を検査`) : ng("画像が 1 枚も無い？");
  await ctx.close();
}

await browser.close();
console.log(`\n違反: ${bad.length}`);
for (const b of bad) console.log("  " + b);
process.exit(bad.length ? 1 : 0);
