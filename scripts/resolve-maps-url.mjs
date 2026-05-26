#!/usr/bin/env node
// Maps URL を解決して正式店舗名・座標・住所を取得する
// 使い方: node scripts/resolve-maps-url.mjs "https://maps.app.goo.gl/..." | "https://maps.google.com/?cid=..." | "https://share.google/..."
// 出力: JSON { name, lat, lng, prefecture, city, address, finalUrl }
//
// 設計思想:
// - claude に店舗特定をさせない（同名店舗を拾うリスク）
// - 段階的に解決:
//   1. HTTP リダイレクト（maps.app.goo.gl で /maps/place/<name>/@lat,lng/ を取得）
//   2. Playwright Chromium ヘッドレス（cid= / share.google で SPA レンダリング必要）
// - API 課金ゼロ（Nominatim 逆ジオコーディングのみ、すべて無料）

import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node resolve-maps-url.mjs <maps-url>");
  process.exit(2);
}

async function followRedirect(u) {
  const res = await fetch(u, {
    headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" },
    redirect: "follow",
  });
  return res.url;
}

function parseFromPlaceUrl(finalUrl) {
  const nameMatch = finalUrl.match(/\/maps\/place\/([^/]+)\//);
  const coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!nameMatch || !coordMatch) return null;
  const name = decodeURIComponent(nameMatch[1]).replace(/\+/g, " ");
  return {
    name,
    lat: parseFloat(coordMatch[1]),
    lng: parseFloat(coordMatch[2]),
  };
}

async function resolveViaPlaywright(u) {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      locale: "ja-JP",
    });
    const page = await ctx.newPage();
    let target = u;
    // share.google は search ページに飛ぶので、q= を抽出して maps/search に navigate
    if (u.includes("share.google") || u.includes("/share.google")) {
      try {
        const res = await fetch(u, {
          headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" },
          redirect: "follow",
        });
        const redirected = new URL(res.url);
        const q = redirected.searchParams.get("q");
        if (q && !q.startsWith("Eg")) {
          // q がストア名（短い）であれば maps/search に渡す
          target = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
        }
      } catch {}
    }
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30_000 });
    try {
      await page.waitForURL(/\/maps\/place\//, { timeout: 25_000 });
    } catch {
      // /maps/place/ にならなくても DOM パースを試す
    }
    const finalUrl = page.url();
    let address = null;
    try {
      const addrEl = await page.$(
        'button[aria-label="住所をコピーします"] .Io6YTe',
      );
      if (addrEl) {
        address = (await addrEl.textContent())?.trim() || null;
      }
    } catch {}
    let title = null;
    try {
      const t = await page.title();
      title = t.replace(/\s*-\s*Google\s*マップ\s*$/, "").trim();
    } catch {}
    return { finalUrl, address, title };
  } finally {
    await browser.close();
  }
}

function parseJapaneseAddress(addr) {
  if (!addr) return { prefecture: null, city: null };
  const cleaned = addr.replace(/^〒\d{3}-?\d{4}\s*/, "");
  const prefMatch = cleaned.match(/^(.+?[都道府県])/);
  const prefecture = prefMatch ? prefMatch[1] : null;
  const afterPref = prefecture ? cleaned.slice(prefecture.length) : cleaned;
  const cityMatch = afterPref.match(/^(.+?[市区町村])/);
  const city = cityMatch ? cityMatch[1] : null;
  return { prefecture, city };
}

async function reverseGeocode(lat, lng) {
  const u = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja&zoom=18`;
  const res = await fetch(u, {
    headers: { "User-Agent": "machinowa/1.0 (linkateinc315@link8.info)" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

async function main() {
  let name = null;
  let lat = null;
  let lng = null;
  let address = null;
  let prefecture = null;
  let city = null;
  let finalUrl = null;

  // Phase 1: シンプル HTTP リダイレクト
  try {
    finalUrl = await followRedirect(url);
    const parsed = parseFromPlaceUrl(finalUrl);
    if (parsed) {
      name = parsed.name;
      lat = parsed.lat;
      lng = parsed.lng;
      process.stderr.write(`[phase1] redirect OK: ${name}\n`);
    } else {
      process.stderr.write(
        `[phase1] redirect ではジオ情報取れず: ${finalUrl}\n`,
      );
    }
  } catch (e) {
    process.stderr.write(`[phase1] redirect failed: ${e.message}\n`);
  }

  // Phase 2: Playwright（Phase 1 で取れなかったら）
  if (!name) {
    try {
      process.stderr.write(`[phase2] Playwright 起動中...\n`);
      // share.google など特殊 URL は元の URL も渡す
      const targetForPlaywright =
        url.includes("share.google") || url.includes("/share.google")
          ? url
          : finalUrl || url;
      const result = await resolveViaPlaywright(targetForPlaywright);
      const placeParsed = parseFromPlaceUrl(result.finalUrl);
      if (placeParsed) {
        name = placeParsed.name;
        lat = placeParsed.lat;
        lng = placeParsed.lng;
      } else if (result.title) {
        name = result.title;
      }
      if (result.address) {
        address = result.address;
      }
      if (!name) {
        throw new Error(`Playwright 経由でも店舗名取れず`);
      }
      process.stderr.write(`[phase2] Playwright OK: ${name}\n`);
    } catch (e) {
      console.error(`[error] Playwright 解析失敗: ${e.message}`);
      process.exit(1);
    }
  }

  // 住所→都道府県・市区町村
  if (address) {
    const parsed = parseJapaneseAddress(address);
    prefecture = parsed.prefecture;
    city = parsed.city;
  }

  // Phase 3: 座標があれば Nominatim で補完
  if ((!prefecture || !city) && lat != null && lng != null) {
    try {
      const geo = await reverseGeocode(lat, lng);
      address = address || geo.display_name || null;
      prefecture =
        prefecture || geo.address?.province || geo.address?.state || null;
      city =
        city ||
        geo.address?.city ||
        geo.address?.town ||
        geo.address?.suburb ||
        null;
    } catch (e) {
      process.stderr.write(`[warn] reverse geocode failed: ${e.message}\n`);
    }
  }

  const out = { name, lat, lng, prefecture, city, address, finalUrl };
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(`[fatal] ${e.message}`);
  process.exit(1);
});
