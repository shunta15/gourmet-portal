/**
 * 総合トップ「輪」（回して選ぶ、1画面の入口）の動作検査。Playwright。
 *
 *   PORTAL_LAUNCHED=1 npx next start -p 3242   # 公開スイッチ ON の本番ビルドを起動してから
 *   node proto-portal/check-hub.mjs [--base http://localhost:3242] [--shots 出力ディレクトリ]
 *
 * 検査（PC 1440×900・スマホ 390×844）:
 *  構造: 1 画面（.hub の高さ ≤ 画面の高さ。小さい画面では 660px）／ <main> の直下は .hub とフッターだけ／ h1 が 1 つ／ 検索の入口（/find）が 1 つ／
 *        「掲載準備中」は業種ごとに 1 回（ビューティー・ボディケア・ペット・おでかけ・ステイの 5 回）／ 正面の表示には 1 回
 *  輪を回す: キー（→ ← Home End）・ドラッグ（スマホは指の横スワイプ）・ホイール（PC・輪の上）・矢印ボタン・一覧へのフォーカス・印のタップ／クリック。
 *        回すたびに、正面の業種（slider の aria-valuenow）が変わる。輪の外のホイールはページをスクロールする
 *        縦スワイプ（スマホ）はページをスクロールし、輪は回らない
 *  業種の扱い: グルメ → /gourmet に入れる。ビューティー・ボディケア → 「ページを見る」で /beauty・/bodycare に入れる。
 *        ペット・おでかけ・ステイ → 正面に来ても「掲載準備中」と出るだけで、輪・一覧・正面の表示のどこにもリンク（a[href]）が無い。押しても移動しない
 *  いま営業中: グルメの正面に、数字（営業中 N 軒・営業時間が確かな M 店のうち）が出る（N ≤ M ≤ 掲載店数）
 *  動きを減らす設定: 輪は出ず（.hub-dial が display:none）、6 業種の一覧が全部見える。入口のリンクは 3 つ
 *  共通: 横スクロール 0、コンソールエラー 0、壊れ画像 0
 * 違反があれば終了コード 1。
 */
import { chromium } from "playwright";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:3242");
const SHOTS = arg("shots", "");
const bad = [];
const ok = (m) => console.log("  OK  " + m);
const ng = (m) => {
  bad.push(m);
  console.log("  NG  " + m);
};
const check = (cond, good, bads) => (cond ? ok(good) : ng(bads ?? good));

/**
 * コンソールエラーと、失敗したリクエスト（404 など）を集める。
 * `/_vercel/insights/script.js`（Vercel の計測スクリプト）は Vercel の上でだけ配られるので、ローカルの `next start` では 404 になる。数えない。
 * 「Failed to load resource」のコンソール行は URL が無いので、response のほうで URL を見て数える。
 */
function watchErrors(page, errors) {
  page.on("console", (m) => m.type() === "error" && !/^Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  page.on("response", (r) => r.status() >= 400 && !/\/_vercel\//.test(r.url()) && errors.push(`${r.status()} ${r.url()}`));
}

const NAMES = ["グルメ", "ビューティー", "ボディケア", "ペット", "おでかけ", "ステイ"];
const browser = await chromium.launch();

/** 輪をグルメに戻す（slider にフォーカスして Home） */
async function reset(page) {
  await page.evaluate(() => document.querySelector(".hub-front").focus());
  await page.keyboard.press("Home");
  await page.waitForTimeout(1500);
}
/** 輪の正面の業種（0〜5）。aria-valuenow は 1〜6 */
const front = (page) => page.evaluate(() => Number(document.querySelector(".hub-front")?.getAttribute("aria-valuenow")) - 1);
const settle = (page, ms = 1700) => page.waitForTimeout(ms);

async function swipeTouch(cdp, x0, y0, x1, y1, steps = 12, dt = 14) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / steps, y: y0 + ((y1 - y0) * i) / steps }] });
    await new Promise((r) => setTimeout(r, dt));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

for (const vp of [
  { name: "PC 1440×900", width: 1440, height: 900, mobile: false },
  { name: "スマホ 390×844", width: 390, height: 844, mobile: true },
]) {
  console.log(`\n== ${vp.name} ==`);
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.mobile, isMobile: vp.mobile });
  const page = await ctx.newPage();
  const errors = [];
  watchErrors(page, errors);
  const resp = await page.goto(BASE + "/", { waitUntil: "load", timeout: 120000 });
  check(resp?.status() === 200, "/ が 200", `/ が ${resp?.status()}`);
  await page.waitForTimeout(2600);

  // ── 構造 ──
  const st = await page.evaluate(() => {
    const hub = document.querySelector(".hub");
    const main = document.querySelector("main");
    const r = hub?.getBoundingClientRect();
    const kids = [...(main?.children ?? [])].map((e) => (e.matches(".hub") ? "hub" : e.id === "mp-footer" ? "footer" : e.tagName.toLowerCase() + "." + e.className));
    const panels = [...document.querySelectorAll(".hub-panel")];
    const soonTotal = (document.body.innerText + panels.map((p) => p.textContent).join("\n")).split("掲載準備中").length - 1;
    const soonPanels = panels.map((p) => (p.textContent.match(/掲載準備中/g) || []).length);
    const onPanel = document.querySelector(".hub-panel[data-on]");
    return {
      hubH: r?.height ?? 0,
      innerH: innerHeight,
      kids,
      h1: document.querySelectorAll("h1").length,
      find: [...document.querySelectorAll(".hub a[href='/find']")].length,
      soonTotal: (document.querySelector("main")?.textContent.match(/掲載準備中/g) || []).length,
      soonPanels,
      soonOnFront: (onPanel?.textContent.match(/掲載準備中/g) || []).length,
      tabletext: soonTotal,
      scrollW: document.documentElement.scrollWidth - innerWidth,
      imgs: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length,
    };
  });
  check(st.hubH <= Math.max(st.innerH, 660) + 1, `1 画面（.hub の高さ ${Math.round(st.hubH)} ≤ ${Math.max(st.innerH, 660)}）`, `.hub が画面より高い（${Math.round(st.hubH)} > ${Math.max(st.innerH, 660)}）`);
  check(st.kids.length === 2 && st.kids[0] === "hub" && st.kids[1] === "footer", "<main> の直下は .hub とフッターだけ", `<main> の直下: ${st.kids.join(" / ")}`);
  check(st.h1 === 1, "h1 が 1 つ", `h1 が ${st.h1} 個`);
  check(st.find === 1, "検索の入口（/find）が 1 つ", `/find へのリンクが ${st.find} 個`);
  check(JSON.stringify(st.soonPanels) === "[0,1,1,1,1,1]", "「掲載準備中」は業種ごとに 1 回（グルメは 0）", `「掲載準備中」の回数 ${JSON.stringify(st.soonPanels)}`);
  check(st.soonTotal === 5, "ページ全体で「掲載準備中」は 5 回（業種ごとに 1 回）", `ページ全体で ${st.soonTotal} 回`);
  check(st.scrollW === 0, "横スクロール 0", `横スクロール量 ${st.scrollW}`);
  check(st.imgs === 0, "壊れ画像 0", `壊れ画像 ${st.imgs}`);

  // ── いま営業中 ──
  const open = await page.evaluate(() => {
    const el = document.querySelector(".hub-panel[data-on] .hub-open");
    const nums = [...(document.querySelectorAll(".hub-panel[data-on] .hub-facts b") ?? [])].map((b) => b.textContent.replace(/,/g, ""));
    return { on: el?.hasAttribute("data-on"), nums, text: el?.textContent ?? "" };
  });
  if (open.nums.length === 3 && open.on) {
    const [total, , openN] = open.nums.map(Number);
    const known = Number((open.text.match(/確かな([\d,]+)店/) || [])[1]?.replace(/,/g, ""));
    check(openN >= 0 && openN <= known && known <= total, `いま営業中 ${openN} 軒 ≤ 営業時間が確かな ${known} 店 ≤ 掲載 ${total} 店`, `営業中の数が不整合（${openN} / ${known} / ${total}）`);
  } else ng(`グルメの正面に「いま営業中」が出ていない（${JSON.stringify(open)}）`);

  // ── 初期の正面 ──
  check((await front(page)) === 0, "最初の正面はグルメ", `最初の正面が ${await front(page)}`);

  // ── キー ──
  await page.keyboard.press("ArrowRight");
  await settle(page);
  check((await front(page)) === 1, "→ でビューティーへ", `→ の後の正面 ${await front(page)}`);
  const frontSoon = await page.evaluate(() => (document.querySelector(".hub-panel[data-on]")?.textContent.match(/掲載準備中/g) || []).length);
  check(frontSoon === 1, "ビューティーが正面のとき「掲載準備中」が 1 回", `正面の「掲載準備中」が ${frontSoon} 回`);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await settle(page);
  check((await front(page)) === 5, "← 2 回で（グルメの前の）ステイへ。輪はぐるりと回る", `← 2 回の後の正面 ${await front(page)}`);
  await page.keyboard.press("ArrowRight");
  await settle(page);
  check((await front(page)) === 0, "→ でグルメへ戻る", `戻った正面 ${await front(page)}`);

  // ── ドラッグ・スワイプ ──
  if (!vp.mobile) {
    await page.mouse.move(900, 650);
    await page.mouse.down();
    for (let i = 1; i <= 13; i++) {
      await page.mouse.move(900 - i * 20, 650);
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await settle(page);
    const f = await front(page);
    check(f === 1 || f === 2, `左へドラッグで次の業種へ（正面 ${f}）`, `左ドラッグの後の正面 ${f}`);
    await page.mouse.move(500, 650);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(500 + i * 30, 650);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(220);
    await page.mouse.up();
    await settle(page);
    const g = await front(page);
    check(g !== f, `右へドラッグで前の業種へ（正面 ${f} → ${g}）`, `右ドラッグでも正面が変わらない（${f}）`);
    // 小さなドラッグは元の業種に戻る（ぴたりと止まる）
    const before = await front(page);
    await page.mouse.move(700, 650);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) {
      await page.mouse.move(700 + i * 8, 650);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(250);
    await page.mouse.up();
    await settle(page);
    check((await front(page)) === before, "小さなドラッグ（48px・止めて離す）は元の業種に戻る", `小さなドラッグで正面が ${before} → ${await front(page)}`);
    // 止まったときは、どの印も整数の位置（角度が 60° の倍数）にある
    const angs = await page.evaluate(() => [...document.querySelectorAll(".hub-seal")].map((e) => parseFloat(e.style.getPropertyValue("--ang"))));
    check(angs.every((a) => Math.abs(Math.round(a / 60) * 60 - a) < 0.2), `止まったとき、印が 60° の倍数の位置にぴたりと並ぶ（${angs.map((a) => a.toFixed(1)).join(", ")}）`, `印の角度が中途半端: ${angs.map((a) => a.toFixed(2)).join(", ")}`);
    await reset(page);
  } else {
    const cdp = await ctx.newCDPSession(page);
    await swipeTouch(cdp, 320, 650, 120, 650);
    await settle(page);
    const f = await front(page);
    check(f === 1 || f === 2, `指で左へスワイプして次の業種へ（正面 ${f}）`, `左スワイプの後の正面 ${f}`);
    await swipeTouch(cdp, 120, 650, 330, 650);
    await settle(page);
    check((await front(page)) === 0 || (await front(page)) === 5, `右スワイプで前へ（正面 ${await front(page)}）`, `右スワイプの後の正面 ${await front(page)}`);
    await reset(page);
    const f0 = await front(page);
    await swipeTouch(cdp, 200, 700, 200, 380, 14, 14);
    await page.waitForTimeout(700);
    const sy = await page.evaluate(() => scrollY);
    check(sy > 100 && (await front(page)) === f0, `縦スワイプはページをスクロールし、輪は回らない（scrollY ${Math.round(sy)}）`, `縦スワイプ: scrollY ${sy}, 正面 ${f0} → ${await front(page)}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
  }

  // ── ホイール（PC。輪の上だけ） ──
  if (!vp.mobile) {
    await page.evaluate(() => scrollTo(0, 0));
    const a = await front(page);
    await page.mouse.move(720, 700);
    await page.mouse.wheel(0, 100);
    await settle(page, 1300);
    const b = await front(page);
    check(b === (a + 1) % 6, `輪の上のホイール（下）で次の業種へ（${a} → ${b}）`, `ホイール後の正面 ${a} → ${b}`);
    await page.mouse.wheel(0, -100);
    await settle(page, 1300);
    check((await front(page)) === a, "ホイール（上）で戻る", `ホイール（上）の後の正面 ${await front(page)}`);
    await page.mouse.move(720, 300);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(700);
    const sy = await page.evaluate(() => scrollY);
    check(sy > 100 && (await front(page)) === a, `輪の外（名前のあたり）のホイールはページをスクロールする（scrollY ${Math.round(sy)}・輪は回らない）`, `輪の外のホイール: scrollY ${sy}, 正面 ${await front(page)}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
  }

  // ── 矢印ボタン・印のクリック／タップ ──
  const a0 = await front(page);
  await page.click(".hub-nav.next");
  await settle(page);
  check((await front(page)) === (a0 + 1) % 6, "右の矢印ボタンで次へ", `矢印ボタンの後の正面 ${await front(page)}`);
  const nb = ((await front(page)) + 1) % 6;
  const seal = await page.evaluate((i) => {
    const el = document.querySelector(`.hub-seal[data-i="${i}"]`);
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, nb);
  if (vp.mobile) await page.touchscreen.tap(seal.x, seal.y);
  else await page.mouse.click(seal.x, seal.y);
  await settle(page);
  check((await front(page)) === nb, `正面でない印（${NAMES[nb]}）を押すと、輪がそこへ回る`, `印を押した後の正面 ${await front(page)}（期待 ${nb}）`);

  // ── 業種の扱い ──
  const cases = [];
  for (let i = 0; i < 6; i++) {
    await reset(page);
    for (let k = 0; k < i; k++) await page.keyboard.press("ArrowRight");
    await settle(page, 1500);
    const info = await page.evaluate(() => {
      const p = document.querySelector(".hub-panel[data-on]");
      const hubLinks = [...document.querySelectorAll(".hub a[href]")].map((a) => a.getAttribute("href"));
      return {
        front: Number(document.querySelector(".hub-front").getAttribute("aria-valuenow")) - 1,
        panelLinks: [...p.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        text: p.textContent.replace(/\s+/g, " "),
        hubLinks,
        valuetext: document.querySelector(".hub-front").getAttribute("aria-valuetext"),
        cursor: document.querySelector(".hub-front").getAttribute("data-cursor"),
      };
    });
    cases.push(info);
    check(info.front === i, `${NAMES[i]}を正面に（${info.valuetext}）`, `${NAMES[i]}を正面にできない（${info.front}）`);
  }
  const paths = ["/gourmet", "/beauty", "/bodycare"];
  for (let i = 0; i < 3; i++) check(JSON.stringify(cases[i].panelLinks) === JSON.stringify([paths[i]]), `${NAMES[i]}の正面の表示に入口のリンク（${paths[i]}）が 1 つ`, `${NAMES[i]}の正面のリンク ${JSON.stringify(cases[i].panelLinks)}`);
  for (let i = 3; i < 6; i++) {
    const c = cases[i];
    check(c.panelLinks.length === 0 && c.text.includes("掲載準備中") && !c.cursor, `${NAMES[i]}: 正面に来ても「掲載準備中」と出るだけでリンクにしない`, `${NAMES[i]}の正面: links=${JSON.stringify(c.panelLinks)} text=${c.text.slice(0, 40)} cursor=${c.cursor}`);
  }
  const allHubLinks = new Set(cases.flatMap((c) => c.hubLinks));
  const leaked = ["/pet", "/leisure", "/stay"].filter((p) => [...allHubLinks].some((h) => h === p || h.startsWith(p + "/")));
  check(leaked.length === 0, "輪・一覧・正面の表示のどこにも、ペット・おでかけ・ステイへのリンク（a[href]）が無い", `リンクがある: ${leaked.join(", ")}`);
  // ペットが正面のとき、正面の印・名前を押しても移動しない
  await reset(page);
  for (let k = 0; k < 3; k++) await page.keyboard.press("ArrowRight");
  await settle(page, 1500);
  const urlBefore = page.url();
  const fr = await page.evaluate(() => {
    const r = document.querySelector(".hub-front").getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (vp.mobile) await page.touchscreen.tap(fr.x, fr.y);
  else await page.mouse.click(fr.x, fr.y);
  await page.waitForTimeout(1300);
  check(page.url() === urlBefore && (await front(page)) === 3, "ペットが正面のとき、正面の印を押しても移動しない（輪もそのまま）", `押した後 ${page.url()} / 正面 ${await front(page)}`);

  // ── 入る ──
  await reset(page);
  await page.click(".hub-panel[data-on] .hub-go");
  await page.waitForURL("**/gourmet", { timeout: 60000 }).catch(() => {});
  check(new URL(page.url()).pathname === "/gourmet", "グルメの「入る」で /gourmet へ", `グルメの入口の移動先 ${page.url()}`);
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2400);
  await page.evaluate(() => document.querySelector(".hub-front").focus());
  await page.keyboard.press("ArrowRight");
  await settle(page, 1500);
  await page.click(".hub-panel[data-on] .hub-go");
  await page.waitForURL("**/beauty", { timeout: 60000 }).catch(() => {});
  check(new URL(page.url()).pathname === "/beauty", "ビューティーの「ページを見る」で /beauty へ入れる", `ビューティーの入口の移動先 ${page.url()}`);
  // 正面の印を押しても入れる（グルメ）
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2400);
  const fr2 = await page.evaluate(() => {
    const r = document.querySelector(".hub-front").getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (vp.mobile) await page.touchscreen.tap(fr2.x, fr2.y);
  else await page.mouse.click(fr2.x, fr2.y);
  await page.waitForURL("**/gourmet", { timeout: 60000 }).catch(() => {});
  check(new URL(page.url()).pathname === "/gourmet", "正面の印（グルメ）を押しても /gourmet へ入れる", `正面の印の移動先 ${page.url()}`);

  // ── 検索の入口 ──
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1800);
  await page.click(".hub-find");
  await page.waitForURL("**/find", { timeout: 60000 }).catch(() => {});
  check(new URL(page.url()).pathname === "/find", "検索の入口で /find へ", `検索の入口の移動先 ${page.url()}`);

  if (SHOTS) {
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SHOTS}/hub-${vp.mobile ? "m" : "pc"}.jpg`, type: "jpeg", quality: 70 });
  }
  check(errors.length === 0, "コンソールエラー 0", `コンソールエラー ${errors.length}: ${errors.slice(0, 3).join(" | ")}`);
  await ctx.close();
}

// ── 動きを減らす設定 ──
console.log("\n== 動きを減らす設定（PC・スマホ）==");
for (const vp of [
  { width: 1440, height: 900, mobile: false },
  { width: 390, height: 844, mobile: true },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce", hasTouch: vp.mobile, isMobile: vp.mobile });
  const page = await ctx.newPage();
  const errors = [];
  watchErrors(page, errors);
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const panels = [...document.querySelectorAll(".hub-panel")];
    return {
      dial: getComputedStyle(document.querySelector(".hub-dial")).display,
      visible: panels.filter((p) => getComputedStyle(p).visibility === "visible" && parseFloat(getComputedStyle(p).opacity) > 0.99).length,
      links: [...document.querySelectorAll(".hub-panel a[href]")].map((a) => a.getAttribute("href")),
      scrollW: document.documentElement.scrollWidth - innerWidth,
      h: [...document.querySelectorAll(".hub-panel")].map((p) => Math.round(p.getBoundingClientRect().height)),
    };
  });
  const tag = vp.mobile ? "スマホ" : "PC";
  check(r.dial === "none", `${tag}: 輪は出ない`, `${tag}: 輪が出ている（${r.dial}）`);
  check(r.visible === 6, `${tag}: 6 業種の一覧が全部見える`, `${tag}: 見える業種 ${r.visible}`);
  check(JSON.stringify(r.links) === JSON.stringify(["/gourmet", "/beauty", "/bodycare"]), `${tag}: 入口のリンクは 3 つ（グルメ・ビューティー・ボディケア）`, `${tag}: リンク ${JSON.stringify(r.links)}`);
  check(r.scrollW === 0, `${tag}: 横スクロール 0`, `${tag}: 横スクロール ${r.scrollW}`);
  check(errors.length === 0, `${tag}: コンソールエラー 0`, `${tag}: コンソールエラー ${errors.slice(0, 2).join(" | ")}`);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/hub-reduced-${vp.mobile ? "m" : "pc"}.jpg`, type: "jpeg", quality: 65 });
  await ctx.close();
}

await browser.close();
console.log(`\n違反: ${bad.length}`);
if (bad.length) {
  for (const b of bad) console.log("  - " + b);
  process.exit(1);
}
