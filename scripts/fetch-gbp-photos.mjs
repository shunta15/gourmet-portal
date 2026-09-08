#!/usr/bin/env node
/**
 * fetch-gbp-photos.mjs
 *
 * Google マップ（GBP）の店舗ページから実店舗写真のURLを取り出す。
 *
 * 【なぜ必要か】
 * runbook.md には「GBP の写真を最優先で使う」と書いてあるが、
 * curl で cid URL を叩くと Google マップの汎用シェルHTMLが返るだけで、
 * og:image は店舗と無関係な静的地図（例の 35.5214505,139.6998144）になる。
 * = curl 方式は機能しない。実店舗写真は Playwright で place ページを
 * 実際に描画しないと取得できない（2026-09-07 実測）。
 *
 * そして稼働中の local-pipeline.sh のプロンプトには GBP 手順自体が無く、
 * 公式HP / Instagram / 食べログ しか探させていなかったため、
 * それらを持たない店舗（よりみち・酒菜ちゃんちゃんこ）が
 * 「画像取得失敗」で毎日スキップされ続けていた。
 *
 * 出力: JSON { photos: string[] }  ※失敗時も exit 0 で { photos: [] }
 */
import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
  console.log(JSON.stringify({ photos: [] }));
  process.exit(0);
}

/** 同一写真の別サイズ違いを1枚として扱うためのキー（=以降のサイズ指定を除去） */
const photoKey = (s) => s.split("=")[0];

/** 取得したURLを高解像度指定に書き換える */
const toHiRes = (s) => `${photoKey(s)}=w1400-h800-p-k-no`;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    locale: "ja-JP",
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  try {
    await page.waitForURL(/\/maps\/place\//, { timeout: 25_000 });
  } catch {
    /* place に来なくても描画済みの img は拾えることがある */
  }
  // 写真は遅延読み込みされるため、枚数が増えなくなるまで待つ。
  // 待ちが短いと1枚しか取れず「画像2枚揃わず失敗」になる（実測）。
  let raw = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(1500);
    const now = await page.$$eval("img", (els) => els.map((e) => e.src).filter(Boolean));
    const usable = now.filter((s) => /googleusercontent\.com|ggpht\.com/.test(s) && !/\/ogw\//.test(s));
    const before = new Set(raw.map((s) => s.split("=")[0])).size;
    raw = [...new Set([...raw, ...usable])];
    const after = new Set(raw.map((s) => s.split("=")[0])).size;
    if (after >= 2 && after === before) break;
  }
  const seen = new Set();
  const photos = [];
  for (const s of raw) {
    // ogw = ログインユーザーのアバター。店舗写真ではないので除外
    if (!/googleusercontent\.com|ggpht\.com/.test(s)) continue;
    if (/\/ogw\//.test(s)) continue;
    const k = photoKey(s);
    if (seen.has(k)) continue;
    seen.add(k);
    photos.push(toHiRes(s));
  }
  console.log(JSON.stringify({ photos }));
} catch (e) {
  process.stderr.write(`[gbp-photos] 失敗: ${e.message}\n`);
  console.log(JSON.stringify({ photos: [] }));
} finally {
  await browser?.close();
}
