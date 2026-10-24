/**
 * automation/v2/lib/maps.mjs — Google マップの店のパネルから、基本情報と写真の URL を読む(Playwright・有料 API なし)
 *
 * 守ること(オーナー指示 2026-10-25):
 *  - 1 店ずつ順番に。店と店の間は呼び出し側で 6〜10 秒あける(write.mjs)
 *  - CAPTCHA・確認ページ・「通常と異なるトラフィック」が出たら、その場で CaptchaError を投げて止める(回り込まない)
 *  - ログインしないと見えない所(「写真をもっと見る」を押すとログインの案内が出る)には進まない。
 *    ログインなしで見える写真(店のパネルの写真の一覧。通常 10 枚)だけを取る
 *  - 店の取り違えを防ぐ: 着いた店の cid が、第1段で確認した cid と一致しなければ失敗(店名では決めない)
 */
import { chromium } from "playwright";
import {
  CaptchaError,
  assertNotCaptcha,
  expandHours,
  extractFromPanel,
  hoursFromRows,
  readHoursRows,
  waitForPanel,
} from "../../../scripts/fetch-gbp-details.mjs";
import { sleep } from "./util.mjs";

export { CaptchaError };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const photoKey = (s) => s.split("=")[0];
export const hiRes = (s, px = 1200) => `${photoKey(s)}=s${px}`;

async function assertNoTrafficWall(page) {
  await assertNotCaptcha(page);
  const t = await page.evaluate(() => (document.body?.innerText || "").slice(0, 3000));
  if (/通常と異なるトラフィック|unusual traffic|私はロボットではありません|I'm not a robot/i.test(t)) {
    throw new CaptchaError("Google が確認ページ(通常と異なるトラフィック)を返した");
  }
}

export class MapsSession {
  constructor() {
    this.browser = null;
    this.ctx = null;
  }

  async ensure() {
    if (!this.browser) this.browser = await chromium.launch({ headless: true });
    if (!this.ctx) {
      this.ctx = await this.browser.newContext({ userAgent: UA, locale: "ja-JP", viewport: { width: 1280, height: 900 } });
      // ウォームアップ(最初の 1 件が営業時間の半端な表示になるのを防ぐ。fetch-gbp-details.mjs と同じ)
      const page = await this.ctx.newPage();
      try {
        await page.goto("https://www.google.com/maps?hl=ja", { waitUntil: "domcontentloaded", timeout: 30_000 });
        await page.waitForTimeout(2500);
        await assertNoTrafficWall(page);
      } finally {
        await page.close().catch(() => {});
      }
    }
  }

  /**
   * 1 店ぶん。{ info, photoUrls, notes } を返す。
   *  info = fetch-gbp-details.mjs と同じ形(name, address, lat, lng, category, hours, phone, website, status, gbpUrl)
   *  photoUrls = ログインなしで見える写真の元 URL(サイズ指定を外したもの。重複なし・パネルの並び順)
   */
  async fetchStore(mapUrl, expectCid) {
    await this.ensure();
    const page = await this.ctx.newPage();
    const notes = [];
    try {
      await page.goto(mapUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await waitForPanel(page);
      await assertNoTrafficWall(page);
      if (!/\/maps\/place\//.test(page.url())) throw new Error(`店のパネルに着かなかった: ${page.url().slice(0, 100)}`);

      const info = await extractFromPanel(page);
      if (!info.name) throw new Error("店名(h1)を取れなかった");
      const gotCid = /[?&]cid=(\d+)/.exec(info.gbpUrl || "")?.[1];
      if (expectCid && gotCid && gotCid !== String(expectCid)) {
        throw new Error(`別の店に着いた(cid が違う): 期待 ${expectCid} / 実際 ${gotCid}(${info.name})`);
      }
      if (!info.hours) {
        await expandHours(page);
        info.hours = hoursFromRows(await readHoursRows(page));
      }
      if (info.status) notes.push(`閉業・休業の表示: ${info.status}`);

      // 写真: 同じ店のパネルをもう一度開いて、写真の一覧を開く(営業時間を開いたあとはパネルが「時間」の画面になっているため)
      await sleep(2000);
      await page.goto(mapUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await waitForPanel(page);
      await assertNoTrafficWall(page);
      const photoUrls = await this.collectPhotos(page, notes);
      return { info, photoUrls, notes };
    } finally {
      await page.close().catch(() => {});
    }
  }

  async collectPhotos(page, notes) {
    const seen = new Map(); // key → 元 URL
    const grabGallery = () =>
      page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("div")) {
          const bg = getComputedStyle(el).backgroundImage;
          const m = bg && bg.match(/url\("?([^")]+)"?\)/);
          if (m && /googleusercontent\.com|ggpht\.com/.test(m[1]) && !/\/ogw\/|\/a\//.test(m[1]) && el.clientWidth >= 100 && el.clientHeight >= 80) out.push(m[1]);
        }
        return out;
      });
    const btn = page
      .locator('button[aria-label*="写真を表示"], button:has-text("枚の写真"), button[aria-label*="写真:"]')
      .first();
    if (!(await btn.count())) {
      notes.push("写真の一覧を開くボタンが無い(写真 0 枚の店の可能性)");
      return [];
    }
    try {
      await btn.click({ timeout: 6000 });
    } catch (e) {
      notes.push(`写真の一覧を開けなかった: ${e.message.slice(0, 60)}`);
      return [];
    }
    await page.waitForTimeout(3500);
    await assertNoTrafficWall(page);
    // 一覧を下へ送る(ログインなしで見えるのは通常 10 枚。増えなくなったら止める。「もっと見る」は押さない)
    await page.mouse.move(200, 550);
    let last = -1;
    let stable = 0;
    for (let i = 0; i < 10; i++) {
      for (const u of await grabGallery()) if (!seen.has(photoKey(u))) seen.set(photoKey(u), u);
      if (seen.size === last) {
        if (++stable >= 2) break;
      } else {
        stable = 0;
        last = seen.size;
      }
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(900);
    }
    if (seen.size === 0) notes.push("写真の一覧に写真が出なかった");
    return [...seen.values()];
  }

  async close() {
    await this.browser?.close().catch(() => {});
  }
}
