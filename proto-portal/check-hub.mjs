/**
 * 総合トップ「にぎわいの輪」（`/`）の動作検査。Playwright。公開手順書（LAUNCH.md）の事前チェック 17。
 *
 *   PORTAL_LAUNCHED=1 npx next start -p 3242   # 公開スイッチ ON の本番ビルドを起動してから
 *   node proto-portal/check-hub.mjs [--base http://localhost:3242] [--shots 出力ディレクトリ] [--no-footer]
 *
 * 検査するのは `/` だけ（色を固定して見るルート /proto-hub/** は、プレビュー・ローカル専用なので使わない。色の固定は、履歴の項目に色を先に入れて行う）。
 *  A 言葉: title が キャッチコピー／ h1・リード・下のブロックの全文が hub-concepts/COPY-FINAL.md と一字一句同じ（下のブロックに余分な文字が無い）／
 *          古い言い回し（業種をまたいで・街とお店、人と人・Prototype）が画面に無い
 *  B 色: 2 色（sometsuke・akagane）のどちらかで出る。20 回開いて両方出る（片方に偏り過ぎない）／ 最初の描画のあとで色が変わらない（ちらつき 0）／
 *        フッターの色が輪の色に合う／ 入る → 戻るで同じ色
 *  C 業種の扱い: グルメ＝/gourmet（掲載中）、ビューティー・ボディケア＝/beauty・/bodycare（「ページを見る」）、ペット・おでかけ・ステイ＝リンク無し（押しても移動しない）／
 *        「掲載準備中」は選んでいる業種の 1 回だけ／ 「さがす」が /find の 1 つ
 *  D 数字: グルメの掲載店・特集・いま営業中が出る。 営業中 ≤ 営業時間が確かな店 ≤ 掲載店
 *  E 輪を回す: ドラッグ（PC はマウス・スマホは指の横スワイプ）・矢印キー（← →）で輪の角度が動く。逆向きは逆に回る
 *  F 動きを減らす設定: 輪は回らず（矢印キー・ドラッグでも動かない）、入るのは演出なしで移動、全文が見えている
 *  G スクリプトなし: 言葉が全部ある／ 6 業種のうち入れる 3 つ・さがす・フッターの全リンクが 200（--no-footer ならフッターを除く）
 *  H 共通: 横スクロール 0（1440・1280・390・360 × 2 色）、コンソールエラー・失敗リクエスト 0、壊れた画像 0
 * 最後の行は `違反: N`。違反があれば終了コード 1。
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:3242");
const SHOTS = arg("shots", "");
const NO_FOOTER = process.argv.includes("--no-footer");
const bad = [];
const ok = (m) => console.log("  OK  " + m);
const ng = (m) => {
  bad.push(m);
  console.log("  NG  " + m);
};
const check = (cond, good, bads) => (cond ? ok(good) : ng(bads ?? good));
const note = (m) => console.log("  ・  " + m);

/** COPY-FINAL.md のコードブロック: [キャッチコピー, コンセプト（空行で段落）] */
const here = path.dirname(fileURLToPath(import.meta.url));
const md = fs.readFileSync(path.join(here, "hub-concepts", "COPY-FINAL.md"), "utf8");
const blocks = [...md.matchAll(/```\n([\s\S]*?)\n```/g)].map((m) => m[1]);
if (blocks.length < 2) {
  console.log("COPY-FINAL.md のコードブロックが 2 つ取れない");
  process.exit(2);
}
const CATCH = blocks[0];
const [P1, P2, P3] = blocks[1].split("\n\n");
const THEMES = ["sometsuke", "akagane"];
/** フッターの地の色（nigiwai.css の body:has(.ngp[data-theme]) --ngf-bg） */
const FOOT_BG = { sometsuke: "rgb(24, 38, 90)", akagane: "rgb(5, 10, 24)" };
const NAMES = ["グルメ", "ビューティー", "ボディケア", "ペット", "おでかけ", "ステイ"];
const HREFS = ["/gourmet", "/beauty", "/bodycare", null, null, null];

/**
 * コンソールエラーと、失敗したリクエスト（404 など）を集める。
 * `/_vercel/insights/script.js`（Vercel の計測スクリプト）は Vercel の上でだけ配られるので、ローカルの `next start` では 404 になる。数えない。
 */
function watchErrors(page, errors) {
  page.on("console", (m) => m.type() === "error" && !/^Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  page.on("response", (r) => r.status() >= 400 && !/\/_vercel\//.test(r.url()) && errors.push(`${r.status()} ${r.url()}`));
}

const browser = await chromium.launch();
const PC = { viewport: { width: 1440, height: 900 } };
const MOB = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };

/**
 * 色を固定する（0.1 → sometsuke、0.9 → akagane）。ページの抽選スクリプトが読む「履歴の項目に覚えた色」（history.state.ngTheme）を、ページのスクリプトより先に入れる。
 * （Math.random を差し替える方法は使わない。値が固定されると、React のイベントが動かなくなる）
 */
const force = (page, v) => page.addInitScript((t) => { try { history.replaceState({ ngTheme: t }, ""); } catch (e) {} }, v < 0.5 ? "sometsuke" : "akagane");

/** 最初の描画から、.ngp の data-theme を毎フレーム記録する（ちらつきの検出） */
const recorder = () => {
  window.__rec = [];
  const loop = () => {
    const r = document.querySelector(".ngp");
    if (r) window.__rec.push(r.getAttribute("data-theme"));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

const rotOf = (page) =>
  page.evaluate(() => {
    const el = document.querySelector(".ng-ring");
    return parseFloat((el?.style.getPropertyValue("--rot") || getComputedStyle(el).getPropertyValue("--rot") || "0").trim());
  });
/** 角度の差を −180〜180 に */
const dAng = (a, b) => ((((b - a + 180) % 360) + 360) % 360) - 180;

async function openHome(browserCtx, { rv, reduce = false, rec = false } = {}) {
  const page = await browserCtx.newPage();
  const errors = [];
  watchErrors(page, errors);
  if (rv !== undefined) await force(page, rv);
  if (rec) await page.addInitScript(recorder);
  const resp = await page.goto(BASE + "/", { waitUntil: "load", timeout: 120000 });
  return { page, errors, status: resp?.status() };
}

/** 全部の遅延読み込みの画像を呼ぶため、ページを下まで少しずつ流してから先頭に戻る */
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

/** 画面に出す点のうち、入口・ボタン・検索ではなく、ドラッグが始まる点を探す */
const dragPoint = (page) =>
  page.evaluate(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (const fy of [0.3, 0.4, 0.5, 0.6, 0.2, 0.7]) {
      for (const fx of [0.5, 0.2, 0.8, 0.35, 0.65]) {
        const x = Math.round(W * fx);
        const y = Math.round(H * fy);
        const el = document.elementFromPoint(x, y);
        if (el && el.closest(".ng") && !el.closest("a, button, [data-nodrag]")) return { x, y };
      }
    }
    return null;
  });

async function swipeTouch(cdp, x0, y0, x1, y1, steps = 12, dt = 14) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / steps, y: y0 + ((y1 - y0) * i) / steps }] });
    await new Promise((r) => setTimeout(r, dt));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/* ═══════════ A 言葉・D 数字・C 業種の扱い・E 輪を回す（PC・スマホ） ═══════════ */
for (const vp of [
  { name: "PC 1440×900", opts: PC, mobile: false },
  { name: "スマホ 390×844", opts: MOB, mobile: true },
]) {
  console.log(`\n== ${vp.name} ==`);
  const ctx = await browser.newContext(vp.opts);
  const { page, errors, status } = await openHome(ctx, { rv: 0.1 });
  check(status === 200, "/ が 200", `/ が ${status}`);
  await page.waitForTimeout(2600);

  console.log(" A 言葉");
  const t = await page.evaluate(() => ({
    title: document.title,
    h1s: [...document.querySelectorAll("h1")].map((e) => e.textContent),
    lead: document.querySelector(".ng-lead")?.textContent ?? null,
    st: document.querySelector(".ng-st")?.textContent ?? null,
    p1: document.querySelector(".ng-st-p1")?.textContent ?? null,
    p2: document.querySelector(".ng-st-p2")?.textContent ?? null,
    p3: document.querySelector(".ng-st-p3")?.textContent ?? null,
    body: document.body.innerText,
    mainKids: [...(document.querySelector("main")?.children ?? [])].map((e) => e.className || e.id || e.tagName),
  }));
  check(t.title === CATCH, `title がキャッチコピーと同じ（${t.title}）`, `title が違う: ${t.title}`);
  check(t.h1s.length === 1 && t.h1s[0] === CATCH, "h1 は 1 つで、textContent がキャッチコピーと同じ", `h1: ${JSON.stringify(t.h1s)}`);
  check(t.lead === P1, "リードが第 1 段落（3 行）と同じ", `リード: ${JSON.stringify(t.lead)}`);
  check(t.p1 === P1, "下のブロックの第 1 段落（3 つの場面）が COPY-FINAL.md と同じ", `第 1 段落: ${JSON.stringify(t.p1)}`);
  check(t.p2 === P2, "第 2 段落が同じ", `第 2 段落: ${JSON.stringify(t.p2)}`);
  check(t.p3 === P3, "第 3 段落（結び）が同じ", `第 3 段落: ${JSON.stringify(t.p3)}`);
  check(t.st === P1 + P2 + P3, "下のブロックに、決定した言葉以外の文字が無い", `下のブロックの全文: ${JSON.stringify(t.st)}`);
  for (const w of ["業種をまたいで", "街とお店、人と人", "Prototype", "非公開"]) check(!t.body.includes(w), `画面に「${w}」が無い`, `画面に「${w}」がある`);

  console.log(" C 業種の扱い・さがす");
  const items = await page.evaluate(() =>
    [...document.querySelectorAll(".ng-btns li > *")].map((e) => ({ tag: e.tagName, href: e.getAttribute("href"), label: e.getAttribute("aria-label") })),
  );
  check(items.length === 6, "業種の入口が 6 つ", `業種の入口が ${items.length}`);
  NAMES.forEach((n, i) => {
    const it = items[i];
    if (!it) return;
    const good = HREFS[i] ? it.tag === "A" && it.href === HREFS[i] : it.tag === "BUTTON" && it.href === null;
    check(it.label?.startsWith(n) && good, `${n}: ${HREFS[i] ? `リンク ${HREFS[i]}` : "リンクではない（button）"}`, `${n}: ${JSON.stringify(it)}`);
  });
  const find = await page.evaluate(() => [...document.querySelectorAll(".ng a")].filter((a) => a.getAttribute("href") === "/find").map((a) => a.textContent.trim()));
  check(find.length === 1 && find[0] === "さがす", "「さがす」が /find の 1 つ", `/find へのリンク: ${JSON.stringify(find)}`);
  const logo = await page.evaluate(() => document.querySelector(".ng-logo")?.getAttribute("href"));
  check(logo === "/", "ロゴが /", `ロゴ: ${logo}`);
  // 6 業種を順にフォーカスして、状態の表示と「入る」を見る
  for (let i = 0; i < 6; i++) {
    await page.evaluate((k) => document.querySelectorAll(".ng-btns li > *")[k].focus(), i);
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => ({
      state: document.querySelector(".ng-state")?.textContent.trim() ?? null,
      go: document.querySelector(".ng-go")?.getAttribute("href") ?? null,
      goText: document.querySelector(".ng-go")?.textContent.replace("→", "").trim() ?? null,
      // 画面に出ている「掲載準備中」（読み上げ専用の .ng-sr は数えない）
      prep: (() => {
        const c = document.querySelector(".ng").cloneNode(true);
        c.querySelectorAll(".ng-sr").forEach((e) => e.remove());
        return (c.textContent.match(/掲載準備中/g) ?? []).length;
      })(),
      sr: document.querySelector(".ng-sr")?.textContent.trim() ?? "",
      deadLinks: [...document.querySelectorAll(".ng a")].map((a) => a.getAttribute("href")).filter((h) => /^\/(pet|leisure|stay)(\/|$)/.test(h || "")),
      facts: !!document.querySelector(".ng-facts"),
    }));
    if (i === 0) check(s.state === "掲載中" && s.go === "/gourmet" && s.goText === "グルメに入る" && s.facts, "グルメ: 掲載中・「グルメに入る」→ /gourmet・数字あり", `グルメ: ${JSON.stringify(s)}`);
    else if (i < 3) check(s.state === "掲載準備中" && s.go === HREFS[i] && s.goText === "ページを見る" && !s.facts, `${NAMES[i]}: 掲載準備中・「ページを見る」→ ${HREFS[i]}`, `${NAMES[i]}: ${JSON.stringify(s)}`);
    else check(s.state === "掲載準備中" && s.go === null && s.deadLinks.length === 0, `${NAMES[i]}: 掲載準備中と出るだけ。リンク無し`, `${NAMES[i]}: ${JSON.stringify(s)}`);
    if (i > 0) check(s.prep === 1, `${NAMES[i]}: 「掲載準備中」は画面に 1 回`, `${NAMES[i]}: 「掲載準備中」が ${s.prep} 回`);
    if (i > 0) check(s.sr.startsWith(NAMES[i]) && s.sr.includes("掲載準備中"), `${NAMES[i]}: 選ぶと読み上げ（role=status）が「${s.sr}」`, `${NAMES[i]}: 読み上げが合わない: ${JSON.stringify(s.sr)}`);
  }
  // ペット・おでかけ・ステイを押しても移動しない
  for (const i of [3, 4, 5]) {
    const before = page.url();
    await page.locator(".ng-btns li > *").nth(i).click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    check(page.url() === before, `${NAMES[i]}を押しても移動しない`, `${NAMES[i]}を押したら移動した: ${page.url()}`);
  }
  await page.evaluate(() => document.querySelectorAll(".ng-btns li > *")[0].focus());
  await page.waitForTimeout(300);

  console.log(" D 数字");
  await page.waitForFunction(() => document.querySelector(".ng-open[data-on]"), null, { timeout: 15000 }).catch(() => {});
  const nums = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".ng-facts b")].map((e) => Number(e.textContent.replace(/,/g, "")));
    const known = Number((document.querySelector(".ng-open small")?.textContent.match(/([\d,]+)店/) || [])[1]?.replace(/,/g, ""));
    return { shops: b[0], features: b[1], open: b[2], known };
  });
  note(`掲載 ${nums.shops} 店・特集 ${nums.features} 本・いま営業中 ${nums.open} 軒（営業時間が確かな ${nums.known} 店のうち）`);
  check(nums.shops > 0 && nums.features > 0, "掲載店・特集の数が出ている", `数字: ${JSON.stringify(nums)}`);
  check(nums.known > 0 && nums.open <= nums.known && nums.known <= nums.shops, "営業中 ≤ 営業時間が確かな店 ≤ 掲載店", `数字の大小が合わない: ${JSON.stringify(nums)}`);

  console.log(" E 輪を回す");
  const pt = await dragPoint(page);
  check(!!pt, "ドラッグを始められる点がある", "ドラッグを始められる点が無い");
  if (pt) {
    const r0 = await rotOf(page);
    if (vp.mobile) {
      const cdp = await ctx.newCDPSession(page);
      await swipeTouch(cdp, pt.x, pt.y, pt.x + 150, pt.y);
    } else {
      await page.mouse.move(pt.x, pt.y);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) {
        await page.mouse.move(pt.x + i * 13, pt.y);
        await page.waitForTimeout(14);
      }
      await page.mouse.up();
    }
    const r1 = await rotOf(page);
    const d1 = dAng(r0, r1);
    // 逆向き
    if (vp.mobile) {
      const cdp = await ctx.newCDPSession(page);
      await swipeTouch(cdp, pt.x, pt.y, pt.x - 150, pt.y);
    } else {
      await page.mouse.move(pt.x, pt.y);
      await page.mouse.down();
      for (let i = 1; i <= 12; i++) {
        await page.mouse.move(pt.x - i * 13, pt.y);
        await page.waitForTimeout(14);
      }
      await page.mouse.up();
    }
    const r2 = await rotOf(page);
    const d2 = dAng(r1, r2);
    note(`ドラッグ: ${d1.toFixed(1)}° → 逆向き ${d2.toFixed(1)}°`);
    check(Math.abs(d1) > 8 && Math.abs(d2) > 8 && Math.sign(d1) !== Math.sign(d2), `${vp.mobile ? "指の横スワイプ" : "マウスのドラッグ"}で輪が回り、逆向きは逆に回る`, `ドラッグで輪が回らない/向きが合わない（${d1.toFixed(1)}°・${d2.toFixed(1)}°）`);
  }
  // 矢印キー（スマホでもキーボードは付けられる）。ふだんの回転（2.4°/s）より十分大きく動く
  await page.waitForTimeout(2000); // 慣性が元の回転に戻るのを待つ
  await page.evaluate(() => document.activeElement?.blur?.());
  const a0 = await rotOf(page);
  await page.waitForTimeout(400);
  const drift = dAng(a0, await rotOf(page));
  const k0 = await rotOf(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(350);
  const kr = dAng(k0, await rotOf(page));
  await page.waitForTimeout(2200);
  const k1 = await rotOf(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(350);
  const kl = dAng(k1, await rotOf(page));
  note(`ふだん ${drift.toFixed(1)}°/0.4 秒・→ 3 回 ${kr.toFixed(1)}°・← 3 回 ${kl.toFixed(1)}°（0.35 秒）`);
  check(kr > 20 && kl < -20, "矢印キー（→ ←）で輪が回り、向きが逆になる", `矢印キーで輪が回らない（→ ${kr.toFixed(1)}°・← ${kl.toFixed(1)}°）`);

  console.log(" H 共通");
  const sw = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  check(sw.sw <= sw.cw, "横スクロール 0", `横スクロールあり（${sw.sw} > ${sw.cw}）`);
  await scrollThrough(page);
  const imgs = await page.evaluate(() => {
    const all = [...document.images].filter((i) => i.src && !i.src.startsWith("data:"));
    return { n: all.length, broken: all.filter((i) => i.complete && i.naturalWidth === 0).length, pending: all.filter((i) => !i.complete).length };
  });
  check(imgs.broken === 0 && imgs.pending === 0, `壊れた画像 0（${imgs.n} 枚）`, `壊れた画像 ${imgs.broken}・読み込めていない画像 ${imgs.pending}（${imgs.n} 枚中）`);
  check(errors.length === 0, "コンソールエラー・失敗リクエスト 0", `エラー: ${errors.slice(0, 5).join(" | ")}`);
  if (SHOTS) {
    fs.mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: path.join(SHOTS, `hub-${vp.mobile ? "mob" : "pc"}.png`) });
  }
  await ctx.close();
}

/* ═══════════ B 色 ═══════════ */
console.log("\n== B 色（PC）==");
{
  const seen = { sometsuke: 0, akagane: 0 };
  const odd = [];
  for (let i = 0; i < 20; i++) {
    const ctx = await browser.newContext(PC);
    const { page } = await openHome(ctx, { rec: true });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({ theme: document.querySelector(".ngp")?.getAttribute("data-theme"), rec: [...new Set(window.__rec)], foot: getComputedStyle(document.querySelector(".mp-ft")).backgroundColor }));
    if (THEMES.includes(r.theme)) seen[r.theme]++;
    else odd.push(r.theme);
    if (r.rec.length !== 1 || r.rec[0] !== r.theme) odd.push(`ちらつき ${JSON.stringify(r.rec)}`);
    if (FOOT_BG[r.theme] !== r.foot) odd.push(`フッターの色 ${r.theme} ${r.foot}`);
    await ctx.close();
  }
  note(`20 回開いた結果: sometsuke ${seen.sometsuke}・akagane ${seen.akagane}`);
  check(seen.sometsuke > 0 && seen.akagane > 0, "20 回開いて、2 色の両方が出る", `片方しか出ない（${JSON.stringify(seen)}）`);
  check(seen.sometsuke >= 3 && seen.akagane >= 3, "どちらも 3 回以上（極端な偏りなし）", `偏りが大きい（${JSON.stringify(seen)}）`);
  check(odd.length === 0, "最初の描画から色が変わらない（ちらつき 0）・フッターの色が輪の色と合う", `問題: ${odd.join(" / ")}`);
  // 遅い端末（CPU 4 倍遅延）でも、最初の描画のあとで色が変わらない
  const slow = [];
  for (const rv of [0.1, 0.9, 0.1, 0.9]) {
    const ctx = await browser.newContext(PC);
    const page = await ctx.newPage();
    await force(page, rv);
    await page.addInitScript(recorder);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(800);
    const rec = await page.evaluate(() => [...new Set(window.__rec)]);
    if (rec.length !== 1) slow.push(`${rv}: ${JSON.stringify(rec)}`);
    await ctx.close();
  }
  check(slow.length === 0, "CPU 4 倍遅延でも、色が最初の描画から変わらない", `遅延でちらつき: ${slow.join(" / ")}`);
}

console.log("\n== B 入る → 戻るで同じ色 ==");
{
  const diff = [];
  for (let i = 0; i < 6; i++) {
    const ctx = await browser.newContext(PC);
    const { page } = await openHome(ctx, { rec: true });
    await page.waitForTimeout(1500);
    const t0 = await page.evaluate(() => document.querySelector(".ngp")?.getAttribute("data-theme"));
    await page.locator('.ng-btns a[href="/gourmet"]').click();
    await page.waitForURL("**/gourmet", { timeout: 30000 }).catch(() => {});
    const onGourmet = new URL(page.url()).pathname === "/gourmet";
    await page.goBack({ waitUntil: "load" }).catch(() => {});
    await page.waitForSelector(".ngp", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);
    const t1 = await page.evaluate(() => document.querySelector(".ngp")?.getAttribute("data-theme"));
    if (!onGourmet) diff.push(`${i}: /gourmet へ移動しない（${page.url()}）`);
    else if (t0 !== t1) diff.push(`${i}: ${t0} → ${t1}`);
    await ctx.close();
  }
  check(diff.length === 0, "グルメに入って戻ると、同じ色（6 回）", `色が変わった/入れなかった: ${diff.join(" / ")}`);
}

/* ═══════════ F 動きを減らす設定 ═══════════ */
console.log("\n== F 動きを減らす設定（PC）==");
{
  const ctx = await browser.newContext({ ...PC, reducedMotion: "reduce" });
  const { page, errors } = await openHome(ctx, { rv: 0.9 });
  await page.waitForTimeout(2000);
  const r0 = await rotOf(page);
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  const pt = await dragPoint(page);
  if (pt) {
    await page.mouse.move(pt.x, pt.y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(pt.x + i * 15, pt.y);
    await page.mouse.up();
  }
  await page.waitForTimeout(500);
  const r1 = await rotOf(page);
  check(Math.abs(dAng(r0, r1)) < 0.01, "輪は回らない（時間・矢印キー・ドラッグのどれでも）", `輪が動いた（${r0} → ${r1}）`);
  const inf = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity).map((a) => a.animationName || a.constructor.name),
  );
  check(inf.length === 0, "終わらない動き（無限に繰り返すアニメーション）が無い", `動き続けるアニメーション: ${[...new Set(inf)].join(", ")}`);
  const vis = await page.evaluate(() => {
    const el = [".ng-h1", ".ng-lead", ".ng-st-p1", ".ng-st-p2", ".ng-st-p3"].map((s) => {
      const e = document.querySelector(s);
      const cs = getComputedStyle(e);
      return { s, op: Number(cs.opacity), vis: cs.visibility };
    });
    return el.filter((x) => x.op < 0.99 || x.vis !== "visible");
  });
  check(vis.length === 0, "言葉は、はじめから全部見えている（隠れた状態で待たない）", `隠れている: ${JSON.stringify(vis)}`);
  await page.locator('.ng-btns a[href="/gourmet"]').click();
  await page.waitForURL("**/gourmet", { timeout: 1500 }).catch(() => {});
  check(new URL(page.url()).pathname === "/gourmet", "入るときは演出を待たずに移動する（1.5 秒以内）", `1.5 秒たっても移動しない: ${page.url()}`);
  check(errors.length === 0, "コンソールエラー・失敗リクエスト 0", `エラー: ${errors.slice(0, 5).join(" | ")}`);
  await ctx.close();
}

/* ═══════════ G スクリプトなし ═══════════ */
console.log("\n== G スクリプトなし ==");
{
  const ctx = await browser.newContext({ ...PC, javaScriptEnabled: false });
  const page = await ctx.newPage();
  const resp = await page.goto(BASE + "/", { waitUntil: "load" });
  check(resp?.status() === 200, "/ が 200", `/ が ${resp?.status()}`);
  const s = await page.evaluate(() => ({
    theme: document.querySelector(".ngp")?.getAttribute("data-theme"),
    h1: document.querySelector("h1")?.textContent,
    st: document.querySelector(".ng-st")?.textContent,
    lead: document.querySelector(".ng-lead")?.textContent,
    op: ["ng-st-p1", "ng-st-p2", "ng-st-p3"].map((c) => Number(getComputedStyle(document.querySelector("." + c)).opacity)),
    links: [...new Set([...document.querySelectorAll(".ng a[href]")].map((a) => a.getAttribute("href")))],
  }));
  check(s.theme === "sometsuke", "色は既定の sometsuke（抽選しない）", `色: ${s.theme}`);
  check(s.h1 === CATCH && s.lead === P1 && s.st === P1 + P2 + P3, "言葉が全部ある", "言葉が足りない");
  check(s.op.every((o) => o > 0.99), "下のブロックの言葉が、はじめから見えている", `下のブロックの opacity: ${s.op}`);
  for (const h of ["/gourmet", "/beauty", "/bodycare", "/find"]) check(s.links.includes(h), `${h} へのリンクがある`, `${h} へのリンクが無い`);
  const all = NO_FOOTER ? s.links : await page.evaluate(() => [...new Set([...document.querySelectorAll("main a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/")))]);
  const failed = [];
  let n = 0;
  for (const h of all) {
    if (!h.startsWith("/")) continue;
    n++;
    const r = await ctx.request.get(BASE + h, { maxRedirects: 5, timeout: 120000 });
    if (r.status() !== 200) failed.push(`${r.status()} ${h}`);
  }
  check(failed.length === 0, `スクリプトなしで、全部の行き先に届く（${n} 本${NO_FOOTER ? "・フッターを除く" : "・フッター含む"}）`, `届かない: ${failed.slice(0, 8).join(", ")}`);
  await ctx.close();
}
/* ═══════════ H 横スクロール（4 幅 × 2 色） ═══════════ */
console.log("\n== H 横スクロール 0（1440・1280・390・360 × 2 色）==");
{
  const over = [];
  for (const w of [1440, 1280, 390, 360]) {
    for (const rv of [0.1, 0.9]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 800 : 900 }, isMobile: w < 500, hasTouch: w < 500 });
      const { page } = await openHome(ctx, { rv });
      await page.waitForTimeout(1200);
      await scrollThrough(page);
      const m = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      if (m.sw > m.cw) over.push(`${w}px ${rv < 0.5 ? "sometsuke" : "akagane"}: ${m.sw} > ${m.cw}`);
      await ctx.close();
    }
  }
  check(over.length === 0, "どの幅・どの色でも横スクロール 0", `横スクロール: ${over.join(" / ")}`);
}

await browser.close();
console.log(`\n違反: ${bad.length}`);
if (bad.length) {
  console.log(bad.map((b) => " - " + b).join("\n"));
  process.exit(1);
}
