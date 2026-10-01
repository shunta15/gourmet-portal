#!/usr/bin/env node
/**
 * fetch-gbp-details.mjs
 *
 * Google マップ（GBP）の店舗パネルから「店の基本情報」を取り出す。
 * 有料API（Places API 等）は使わない。Playwright でページを開いて読むだけ。
 *
 * 出力 JSON:
 *   { name, address, lat, lng, category, hours: { 月: "11:00–14:00, 17:00–22:00", 火: "定休日", ... },
 *     phone, website, priceRange, status, gbpUrl, fetchedAt }
 *   取れなかった項目は null（推測で埋めない）。評価（星）・口コミ本文は取らない。
 *   住所は郵便番号（〒xxx-xxxx）を除いて保存する。
 *
 * 使い方:
 *   単発:   node scripts/fetch-gbp-details.mjs "<maps-url>"          → stdout に JSON（キャッシュなし）
 *   一括:   node scripts/fetch-gbp-details.mjs --batch [--map automation/stores500/map.json] [--limit 10] [--offset 0]
 *           → automation/stores500/gbp/<articleId>.json に保存。既にあればスキップ。
 *   強制:   --force を付けるとキャッシュを無視して取り直す
 *
 * 入力 URL: maps.google.com/?cid= / google.com/maps/place/... / maps.app.goo.gl/... / share.google/...
 *
 * 守ること:
 *   - 逐次処理のみ。1件ごとに 6〜10 秒あける（Google のボット検知を刺激しない）
 *   - CAPTCHA（/sorry/）が出たら即停止する。回避しない
 *   - share.google は Google 検索に飛ぶが、検索ページはブラウザで開かない（CAPTCHA になるため）。
 *     HTTP リダイレクトだけ辿って q（店名）と kgmid（店舗の固定ID）を取り、
 *     マップ検索の結果のうち kgmid が一致する1件だけを開く。一致しなければ失敗として返す（店名だけで推測しない）。
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

class CaptchaError extends Error {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** share.google などの短縮URLを HTTP だけで辿り、検索URLの q / kgmid を返す（ブラウザでは開かない） */
async function resolveShareUrl(u) {
  let cur = u;
  for (let i = 0; i < 6; i++) {
    const res = await fetch(cur, {
      headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" },
      redirect: "manual",
    });
    const loc = res.headers.get("location");
    if (!loc) break;
    const next = new URL(loc, cur);
    if (next.hostname.endsWith("google.com") && next.pathname === "/search") {
      return { q: next.searchParams.get("q"), kgmid: next.searchParams.get("kgmid") };
    }
    cur = next.href;
  }
  return { q: null, kgmid: null };
}

/** place URL から座標を取る。!3d!4d が店舗そのものの座標。無ければ @lat,lng */
function coordsFromUrl(url) {
  const p = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (p) return { lat: parseFloat(p[1]), lng: parseFloat(p[2]) };
  const a = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (a) return { lat: parseFloat(a[1]), lng: parseFloat(a[2]) };
  return { lat: null, lng: null };
}

/** place URL の !1s0x…:0x… から cid（10進）を作る → https://maps.google.com/?cid=… が正規URL */
function canonicalGbpUrl(url) {
  const m = url.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
  if (m) {
    try {
      return `https://maps.google.com/?cid=${BigInt("0x" + m[1]).toString()}`;
    } catch {}
  }
  return null;
}

/** "17時00分" → "17:00" など。時刻でない文字列（"定休日" "24時間営業"）はそのまま */
function normalizeHoursText(t) {
  const s = (t || "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  const hasTime = /\d+時\d*分?/.test(s);
  if (!hasTime) return s.replace(/\s/g, "");
  return s
    .replace(/(\d{1,2})時(\d{1,2})分/g, (_, h, m) => `${h.padStart(2, "0")}:${m.padStart(2, "0")}`)
    .replace(/(\d{1,2})時/g, (_, h) => `${h.padStart(2, "0")}:00`)
    .replace(/[～〜~]/g, "–")
    .replace(/\s*–\s*/g, "–");
}

/** 曜日行 → { 月: "...", ... }。7曜日そろわない（描画途中の可能性）ものは部分値を出さず null */
function hoursFromRows(rows) {
  if (!rows.length) return null;
  const days = new Set(rows.map((r) => r.day));
  if (days.size < 7) {
    process.stderr.write(`[gbp-details] 営業時間が${days.size}曜日分しか取れず → null\n`);
    return null;
  }
  const byDay = {};
  for (const r of rows) {
    if (r.day in byDay) continue; // 同じ表が2回出ても最初を採用
    const parts = r.cells.map(normalizeHoursText).filter(Boolean);
    byDay[r.day] = parts.length ? parts.join(", ") : null;
  }
  const ordered = {};
  for (const d of DAYS) if (d in byDay) ordered[d] = byDay[d];
  return ordered;
}

/**
 * 営業時間の表から（曜日・時間セル）の行を読む。
 * 営業時間の表がページ内に複数ある店がある（通常営業 / イートイン・テイクアウト別 / ランチ・ディナー別など）。
 * 文書順で最初に出る「曜日行を持つ表」＝通常の営業時間だけを読む（先の表を採る。混ぜない）。
 */
const readHoursRows = (page) =>
  page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    for (const table of document.querySelectorAll("table")) {
      const rows = [];
      for (const tr of table.querySelectorAll("tr")) {
        const tds = tr.querySelectorAll("td");
        if (tds.length < 2) continue;
        const day = txt(tds[0]);
        if (!/^[月火水木金土日]曜日$/.test(day)) continue;
        const lis = [...tds[1].querySelectorAll("li")].map(txt).filter(Boolean);
        const cell = lis.length ? lis : [tds[1].getAttribute("aria-label") || txt(tds[1])];
        rows.push({ day: day[0], cells: cell });
      }
      if (rows.length) return rows;
    }
    return [];
  });

/** ページ内から基本情報を読む。クラス名は変わりやすいので aria-label / data-item-id / 文字パターンを優先 */
export async function extractFromPanel(page) {
  const raw = await page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    const out = {};

    // 店名
    const h1s = [...document.querySelectorAll("h1")].map((e) => txt(e)).filter(Boolean);
    out.name = h1s[0] || null;

    // 住所 / 電話 / ウェブサイト
    const addrBtn = document.querySelector('button[data-item-id="address"]');
    out.address = addrBtn?.getAttribute("aria-label") || null;
    const phoneBtn = document.querySelector('button[data-item-id^="phone"]');
    out.phoneLabel = phoneBtn?.getAttribute("aria-label") || null;
    out.phoneId = phoneBtn?.getAttribute("data-item-id") || null;
    const site = document.querySelector('a[data-item-id="authority"]');
    out.website = site?.getAttribute("href") || null;

    // カテゴリ（店名直下のボタン）
    const cat = document.querySelector("button.DkEaL") || document.querySelector('button[jsaction*="category"]');
    out.category = cat ? txt(cat) : null;

    // 価格帯: 「価格帯、1 人あたり ￥1,000～2,000、20 人が報告」（Google ユーザー報告の1人あたり価格）
    //   ヒストグラム表（aria-label="価格帯のヒストグラム"）は価格帯ではないので拾わない
    const priceLabels = [];
    for (const e of document.querySelectorAll('[aria-label*="あたり"]')) {
      const m = (e.getAttribute("aria-label") || "").match(/あたり[\s\u00a0\u202f]*([¥￥][^、]+)、/);
      if (m) priceLabels.push(m[1].replace(/[\s\u00a0\u202f]+/g, ""));
    }
    out.priceLabels = priceLabels;

    // 閉業・臨時休業の表示（短い葉要素だけを見る。口コミ本文は長いので拾わない）
    const sig = [];
    const main = document.querySelector('[role="main"]') || document.body;
    for (const e of main.querySelectorAll("span, div")) {
      if (e.children.length > 0) continue;
      const t = txt(e);
      if (t.length > 20) continue;
      if (/^(完全に)?閉業|^臨時休業|^一時休業|^営業終了|^移転/.test(t)) sig.push(t);
    }
    out.statusSignals = [...new Set(sig)];
    return out;
  });

  const url = page.url();
  const { lat, lng } = coordsFromUrl(url);

  const hours = hoursFromRows(await readHoursRows(page));

  // 住所（"住所: 〒070-0033 北海道…" → 郵便番号を除去）
  let address = raw.address
    ? raw.address.replace(/^住所:\s*/, "").replace(/^〒\s*\d{3}-?\d{4}\s*/, "").trim()
    : null;
  if (address === "") address = null;

  // 電話
  let phone = null;
  if (raw.phoneLabel) phone = raw.phoneLabel.replace(/^電話番号:\s*/, "").trim() || null;
  if (!phone && raw.phoneId) {
    const m = raw.phoneId.match(/tel:(\d+)/);
    if (m) phone = m[1];
  }

  const priceRange = raw.priceLabels.find(Boolean) || null;

  return {
    name: raw.name,
    address,
    lat,
    lng,
    category: raw.category || null,
    hours,
    phone,
    website: raw.website || null,
    priceRange,
    status: raw.statusSignals.length ? raw.statusSignals.join(" / ") : null,
    gbpUrl: canonicalGbpUrl(url) || url.replace(/\?.*$/, ""),
    fetchedAt: new Date().toISOString(),
  };
}

async function assertNotCaptcha(page) {
  if (/\/sorry\//.test(page.url()) || /consent\.google/.test(page.url())) {
    throw new CaptchaError(`Google が確認ページを返した: ${page.url().slice(0, 80)}`);
  }
}

/** 店舗パネルが描画されるまで待つ。place URL になり、住所 or 営業時間が出たら描画済みとみなす */
async function waitForPanel(page) {
  try {
    await page.waitForURL(/\/maps\/place\//, { timeout: 25_000 });
  } catch {
    /* 検索結果一覧に着地した場合は呼び出し側で扱う */
  }
  await assertNotCaptcha(page);
  try {
    await page.waitForSelector('h1', { timeout: 12_000 });
    await page.waitForSelector('button[data-item-id="address"], tr', { timeout: 8_000 });
  } catch {
    /* 住所の無い店・描画が遅い店。取れた分だけ返す */
  }
  await page.waitForTimeout(1500);
  await pollDayRows(page, 2500); // 営業時間の表が出ているなら7行そろうまで少し待つ（描画途中で1行だけ読む事故の防止）
}

const countDayRows = async (page) => (await readHoursRows(page)).length;

/** 曜日行が7つそろうか ms 経つまで待つ。最後の曜日数を返す */
async function pollDayRows(page, ms) {
  const until = Date.now() + ms;
  let n = await countDayRows(page);
  while (n > 0 && n < 7 && Date.now() < until) {
    await page.waitForTimeout(400);
    n = await countDayRows(page);
  }
  if (n === 0) {
    // 表がまだ無い（畳まれている/未登録）。少しだけ待って再確認
    await page.waitForTimeout(Math.min(1200, ms));
    n = await countDayRows(page);
  }
  return n;
}

/**
 * 店によっては営業時間の表が畳まれていて、営業時間ボタン（data-item-id="oh" など）を押さないと出ない。
 * 押すとパネルが「時間」の詳細ビューに切り替わる（h1 が「時間」になる）ので、
 * 店名・住所などは必ずこの関数を呼ぶ「前」に読み終えておくこと。
 * 営業時間が未登録の店は押すものが無く、hours は null のまま。
 */
async function expandHours(page) {
  if ((await countDayRows(page)) >= 7) return;
  for (const sel of [
    'button[data-item-id="oh"]',
    'div[aria-expanded][jsaction*="openhours"]',
    'div.OMl5r',
    '[aria-label*="1 週間の営業時間を表示"]',
  ]) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) continue;
    // 新レイアウトの営業時間ボタンはマウスクリックに反応しないことがある（実測）。キーボードの Enter を先に試す
    try {
      await loc.focus({ timeout: 2000 });
      await page.keyboard.press("Enter");
    } catch {
      /* 次の手段へ */
    }
    if ((await pollDayRows(page, 3000)) >= 7) return;
    try {
      await loc.click({ timeout: 2500 });
    } catch {
      continue;
    }
    if ((await pollDayRows(page, 3000)) >= 7) return;
  }
}

/** 1件取得。page は新規ページ */
export async function fetchGbpDetails(page, inputUrl) {
  let target = inputUrl;
  let kgmid = null;

  if (/share\.google/.test(inputUrl)) {
    const { q, kgmid: k } = await resolveShareUrl(inputUrl);
    if (!q) throw new Error("share.google から店名(q)を取れなかった");
    kgmid = k;
    target = `https://www.google.com/maps/search/${encodeURIComponent(q)}?hl=ja`;
  }

  await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await waitForPanel(page);
  await assertNotCaptcha(page);

  if (!/\/maps\/place\//.test(page.url())) {
    // 検索結果一覧に着地。kgmid が一致する結果だけを開く（店名だけで選ばない）
    if (!kgmid) throw new Error(`店舗パネルに到達できず(一覧に着地・kgmidなし): ${page.url().slice(0, 100)}`);
    const needle = encodeURIComponent(kgmid); // "/g/11xxx" → "%2Fg%2F11xxx"
    const href = await page.evaluate((n) => {
      const a = [...document.querySelectorAll('a[href*="/maps/place/"]')].find((x) => x.href.includes(n));
      return a ? a.href : null;
    }, needle);
    if (!href) throw new Error(`マップ検索結果に kgmid(${kgmid}) 一致の店が無い`);
    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await waitForPanel(page);
    await assertNotCaptcha(page);
  } else if (kgmid && !decodeURIComponent(page.url()).includes(kgmid)) {
    // 検索が1件に直行したが kgmid が違う = 別の同名店の可能性。採用しない
    throw new Error(`kgmid(${kgmid}) が一致しない店に着地した: ${page.url().slice(0, 100)}`);
  }

  const info = await extractFromPanel(page);
  if (!info.name) throw new Error("店名(h1)を取れなかった");
  if (!info.hours) {
    // 店名・住所などを確保したあとで、畳まれた営業時間を開いて読み直す
    await expandHours(page);
    info.hours = hoursFromRows(await readHoursRows(page));
  }
  return info;
}

// ------------------------------------------------------------------ CLI
function parseArgs(argv) {
  const a = { batch: false, force: false, limit: null, offset: 0, map: null, url: null };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--batch") a.batch = true;
    else if (t === "--force") a.force = true;
    else if (t === "--limit") a.limit = Number(argv[++i]);
    else if (t === "--offset") a.offset = Number(argv[++i]);
    else if (t === "--map") a.map = argv[++i];
    else if (!t.startsWith("--")) a.url = t;
  }
  return a;
}

async function newBrowser() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ userAgent: UA, locale: "ja-JP", viewport: { width: 1280, height: 900 } });
  // ウォームアップ: Maps のトップを1回開いて Cookie を受けておく。
  // これをしないと、最初の1件だけ「簡易表示」（営業時間が当日分のみ・価格帯なし）で返ってくる（2026-10-01 実測）
  const page = await ctx.newPage();
  try {
    await page.goto("https://www.google.com/maps?hl=ja", { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2500);
  } catch {
    /* ウォームアップ失敗は致命的ではない */
  } finally {
    await page.close().catch(() => {});
  }
  return { browser, ctx };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.batch) {
    if (!args.url) {
      console.error("Usage: node scripts/fetch-gbp-details.mjs <maps-url> | --batch [--map map.json] [--limit N] [--offset N] [--force]");
      process.exit(2);
    }
    const { browser, ctx } = await newBrowser();
    try {
      const page = await ctx.newPage();
      console.log(JSON.stringify(await fetchGbpDetails(page, args.url), null, 2));
    } catch (e) {
      console.error(`[gbp-details] 失敗: ${e.message}`);
      process.exitCode = e instanceof CaptchaError ? 3 : 1;
    } finally {
      await browser.close();
    }
    return;
  }

  const mapPath = path.resolve(REPO, args.map || "automation/stores500/map.json");
  const outDir = path.resolve(REPO, "automation/stores500/gbp");
  mkdirSync(outDir, { recursive: true });
  const all = JSON.parse(readFileSync(mapPath, "utf8"));
  const slice = all.slice(args.offset, args.limit != null ? args.offset + args.limit : undefined);

  let browser = null;
  let ctx = null;
  const summary = { total: slice.length, fetched: 0, skippedCached: 0, failed: [], seconds: [] };
  let fetchedBefore = false;
  try {
    for (const [i, item] of slice.entries()) {
      const file = path.join(outDir, `${item.articleId}.json`);
      if (!args.force && existsSync(file)) {
        summary.skippedCached++;
        console.error(`[${i + 1}/${slice.length}] skip(cache) ${item.articleId}`);
        continue;
      }
      // 1件ごとに 6〜10 秒あける（実際にアクセスした直後だけ）
      if (fetchedBefore) await sleep(6000 + Math.random() * 4000);
      fetchedBefore = true;
      // ブラウザは最初に実際に取得するときまで起動しない（全件キャッシュ済みならアクセスゼロ）
      if (!browser) ({ browser, ctx } = await newBrowser());

      const t0 = Date.now();
      const page = await ctx.newPage();
      try {
        const info = await fetchGbpDetails(page, item.mapsUrl);
        writeFileSync(file, JSON.stringify(info, null, 2) + "\n");
        summary.fetched++;
        const sec = (Date.now() - t0) / 1000;
        summary.seconds.push(sec);
        console.error(`[${i + 1}/${slice.length}] ok ${item.articleId} → ${info.name} (${sec.toFixed(1)}s)`);
      } catch (e) {
        summary.failed.push({ articleId: item.articleId, reason: e.message });
        console.error(`[${i + 1}/${slice.length}] FAIL ${item.articleId}: ${e.message}`);
        if (e instanceof CaptchaError) {
          console.error("CAPTCHA/確認ページを検出したため全体を停止する（回避しない）");
          break;
        }
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser?.close();
  }
  console.log(JSON.stringify(summary, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`[fatal] ${e.message}`);
    process.exit(1);
  });
}
