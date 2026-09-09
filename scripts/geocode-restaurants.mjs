#!/usr/bin/env node
// 228店舗（data.ts） + 58店舗（teleapo-restaurants）の緯度経度を自動生成
// 無料ソースのみ: Google Maps URL のピン座標 / 国土地理院 住所検索
// 使い方:
//   node --experimental-strip-types scripts/geocode-restaurants.mjs
//   node --experimental-strip-types scripts/geocode-restaurants.mjs --only r123
//   node --experimental-strip-types scripts/geocode-restaurants.mjs --dry-run

import { readFileSync } from "fs";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { chromium } from "playwright";

const SCRATCHPAD = "/private/tmp/claude-501/-Users-shunta-claude/666109d7-a009-4dee-943a-cbc6676e581c/scratchpad/geo";

// ============ ファイルパースで RESTAURANTS を取得 ============

async function parseRestaurants() {
  const restaurants = [];

  // Teleapo から直接インポート
  try {
    const { TELEAPO_RESTAURANTS } = await import(new URL("../lib/teleapo-restaurants.ts", import.meta.url).href);
    for (const r of TELEAPO_RESTAURANTS) {
      restaurants.push({
        id: r.id,
        address: r.address || null,
        sourceUrl: r.source?.url || null,
      });
    }
  } catch (e) {
    console.warn("[WARN] teleapo-restaurants インポート失敗:", e.message);
  }

  // data.ts から抽出（テレアポ以外）
  const dataContent = readFileSync("lib/data.ts", "utf8");

  // RESTAURANTS = [ ... ...TELEAPO_RESTAURANTS, ]
  const startIdx = dataContent.indexOf("export const RESTAURANTS: Restaurant[] = [");
  const endIdx = dataContent.indexOf("...TELEAPO_RESTAURANTS,");
  if (startIdx === -1 || endIdx === -1) {
    console.warn("[WARN] data.ts の RESTAURANTS セクション特定失敗");
  } else {
    const section = dataContent.slice(startIdx + 44, endIdx); // [ の直後から開始

    // { id: ... } ブロックを抽出
    const braceStack = [];
    let objStart = -1;

    for (let i = 0; i < section.length; i++) {
      if (section[i] === "{") {
        if (braceStack.length === 0) objStart = i;
        braceStack.push(i);
      } else if (section[i] === "}") {
        braceStack.pop();
        if (braceStack.length === 0 && objStart >= 0) {
          const obj = section.slice(objStart, i + 1);
          const idMatch = obj.match(/id:\s*"([^"]+)"/);
          const addrMatch = obj.match(/address:\s*"([^"]*)"/);
          const urlMatch = obj.match(/source:\s*\{[^}]*url:\s*"([^"]*)"/);

          if (idMatch) {
            restaurants.push({
              id: idMatch[1],
              address: addrMatch ? addrMatch[1] : null,
              sourceUrl: urlMatch ? urlMatch[1] : null,
            });
          }
          objStart = -1;
        }
      }
    }
  }

  return restaurants.sort((a, b) => {
    const aNum = parseInt(a.id.slice(1), 10);
    const bNum = parseInt(b.id.slice(1), 10);
    return aNum - bNum;
  });
}

const RESTAURANTS = await parseRestaurants();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyIdx = args.indexOf("--only");
const onlyMatch = onlyIdx >= 0 && onlyIdx + 1 < args.length ? args[onlyIdx + 1] : null;

// ============ Maps URL 解析関数（resolve-maps-url.mjs から再利用） ============

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
  return {
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
    page.setDefaultTimeout(35_000);
    let target = u;
    if (u.includes("share.google") || u.includes("/share.google")) {
      try {
        const res = await fetch(u, {
          headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" },
          redirect: "follow",
        });
        const redirected = new URL(res.url);
        const q = redirected.searchParams.get("q");
        if (q && !q.startsWith("Eg")) {
          target = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
        }
      } catch {}
    }
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30_000 });
    try {
      await page.waitForURL(/\/maps\/place\//, { timeout: 25_000 });
    } catch {}
    const finalUrl = page.url();
    await ctx.close();
    return finalUrl;
  } catch (e) {
    throw e;
  } finally {
    try {
      await browser.close();
    } catch {}
  }
}

async function resolveMapsUrl(url) {
  if (!url || (!url.includes("maps.") && !url.includes("share.google"))) {
    return null;
  }

  try {
    // Phase 1: HTTP リダイレクト
    try {
      const finalUrl = await followRedirect(url);
      const parsed = parseFromPlaceUrl(finalUrl);
      if (parsed) {
        return { ...parsed, src: "maps", precision: "exact" };
      }
    } catch (e) {
      // Playwright へ
    }

    // Phase 2: Playwright
    const finalUrl = await resolveViaPlaywright(url);
    const parsed = parseFromPlaceUrl(finalUrl);
    if (parsed) {
      return { ...parsed, src: "maps", precision: "exact" };
    }
  } catch (e) {
    return null;
  }
  return null;
}

// ============ 国土地理院 住所検索関数 ============

function cleanAddress(addr) {
  if (!addr) return addr;
  let cleaned = addr.replace(/^〒\d{3}-?\d{4}\s*/g, ""); // 郵便番号削除
  cleaned = cleaned.replace(/\s/g, ""); // 全スペース削除
  // ビル名・階数削除（建物名と数字パターン）
  cleaned = cleaned.replace(/（[^）]*）/g, ""); // 括弧内削除
  cleaned = cleaned.replace(/[1-9]\s*[F階号]/g, ""); // 1F, B1 等削除
  return cleaned;
}

function isValidGsiTitle(title, inputAddr) {
  if (!title) return false;
  // 丁目または番 または 番地を含むことを確認
  if (!/[丁番]/.test(title)) return false;

  // 入力の都道府県+市区町村 プレフィックスを抽出
  const prefMatch = inputAddr.match(/^(.+?[都道府県])/);
  const prefPart = prefMatch ? prefMatch[1] : "";
  const afterPref = prefMatch ? inputAddr.slice(prefPart.length) : inputAddr;
  const cityMatch = afterPref.match(/^(.+?[市区町村])/);
  const inputPrefix = (prefPart + (cityMatch ? cityMatch[1] : "")).replace(/\s/g, "");

  // タイトルから同じ部分を抽出してマッチング
  const titlePref = title.match(/^(.+?[都道府県])/)?.[1] || "";
  const titleAfterPref = title.slice(titlePref.length);
  const titleCity = titleAfterPref.match(/^(.+?[市区町村])/)?.[1] || "";
  const titlePrefix = (titlePref + titleCity).replace(/\s/g, "");

  // prefixが一致するか（漢数字互換チェック）
  // 全角数字 → 漢数字に統一して比較
  const normalizeKanji = (s) =>
    s.replace(/1/g, "一").replace(/2/g, "二").replace(/3/g, "三").replace(/4/g, "四").replace(/5/g, "五");
  const normalized = normalizeKanji(inputPrefix);
  const titleNormalized = normalizeKanji(titlePrefix);

  return titleNormalized.startsWith(normalized) || normalized.startsWith(titleNormalized);
}

async function searchGsi(address) {
  const cleaned = cleanAddress(address);
  if (!cleaned || cleaned.length < 5) return null;

  const query = encodeURIComponent(cleaned);
  try {
    const res = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${query}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const first = data[0];
    if (
      !first.geometry ||
      !first.geometry.coordinates ||
      !first.properties ||
      !first.properties.title
    ) {
      return null;
    }

    const [lng, lat] = first.geometry.coordinates;
    const title = first.properties.title;

    // バリデーション
    if (!isValidGsiTitle(title, address)) {
      // 1回だけ短縮版で再試行
      const shortened = address.replace(/[1-9号階]*$/, "").replace(/[ロワール緑地]+/g, "");
      if (shortened && shortened !== address) {
        return await searchGsi(shortened);
      }
      return null;
    }

    return { lat, lng, title, src: "gsi", precision: "block" };
  } catch (e) {
    return null;
  }
}

// ============ バリデーション ============

function isSaneCoord(lat, lng) {
  return lat >= 24 && lat <= 46 && lng >= 122 && lng <= 146;
}

function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

// ============ メイン処理 ============

async function main() {
  if (!existsSync(SCRATCHPAD)) {
    mkdirSync(SCRATCHPAD, { recursive: true });
  }

  const report = [];
  const geo = {};
  const unresolved = [];
  const resolved = [];

  console.log(`[*] 処理開始: ${RESTAURANTS.length} 店舗`);

  for (let i = 0; i < RESTAURANTS.length; i++) {
    const r = RESTAURANTS[i];

    if (onlyMatch && r.id !== onlyMatch) continue;

    process.stderr.write(`[${i + 1}/${RESTAURANTS.length}] ${r.id}\n`);

    let point = null;
    let method = "unresolved";
    let title = null;
    let reason = null;

    // Step 1: Google Maps URL
    if (r.sourceUrl && !point) {
      try {
        const result = await resolveMapsUrl(r.sourceUrl);
        if (result && isSaneCoord(result.lat, result.lng)) {
          point = {
            lat: round6(result.lat),
            lng: round6(result.lng),
            src: result.src,
            precision: result.precision,
          };
          method = "maps";
          process.stderr.write(`  └─ Maps: ${point.lat},${point.lng}\n`);
        }
      } catch (e) {
        process.stderr.write(`  └─ Maps 失敗: ${e.message}\n`);
      }
    }

    // Step 2: 国土地理院（Maps で取れなかった場合）
    if (!point && r.address) {
      try {
        const result = await searchGsi(r.address);
        if (result && isSaneCoord(result.lat, result.lng)) {
          point = {
            lat: round6(result.lat),
            lng: round6(result.lng),
            src: result.src,
            precision: result.precision,
          };
          method = "gsi";
          title = result.title;
          process.stderr.write(`  └─ GSI: ${point.lat},${point.lng} (${result.title})\n`);
        } else {
          reason = "GSI検索失敗または無効なタイトル";
        }
        // GSI呼び出しごとに1秒スリープ（dry-run は除外）
        if (!dryRun) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      } catch (e) {
        reason = `GSI例外: ${e.message}`;
        process.stderr.write(`  └─ GSI 例外: ${e.message}\n`);
      }
    }

    // 結果を集計
    if (point) {
      resolved.push({ id: r.id, name: r.name, address: r.address, method, title });
      geo[r.id] = point;
    } else {
      unresolved.push({
        id: r.id,
        name: r.name,
        address: r.address || "住所なし",
        reason: reason || "マップURL・住所未提供",
      });
    }

    // レポート行
    report.push({
      id: r.id,
      name: r.name,
      address: r.address || null,
      method,
      title: title || null,
      status: point ? "resolved" : "unresolved",
      reason,
    });
  }

  // ============ 出力 ============

  if (dryRun) {
    console.log(`\n[DRY RUN] 出力をスキップします`);
    console.log(`[SUMMARY] 解決: ${resolved.length} / ${RESTAURANTS.length}`);
    console.log(`         Maps: ${geo.length}, GSI: ${resolved.filter((r) => r.method === "gsi").length}`);
    console.log(`         未解決: ${unresolved.length}`);
    return;
  }

  // lib/geo.ts を生成
  const geoSorted = Object.keys(geo)
    .sort()
    .reduce((acc, k) => {
      acc[k] = geo[k];
      return acc;
    }, {});

  const geoTs = `// 自動生成: scripts/geocode-restaurants.mjs（無料ソースのみ: Google Maps URL のピン座標 / 国土地理院 住所検索）
export type GeoPoint = { lat: number; lng: number; src: "maps" | "gsi"; precision: "exact" | "block" };
export const GEO: Record<string, GeoPoint> = ${JSON.stringify(geoSorted, null, 2)};
`;

  writeFileSync("/Users/shunta/claude/gourmet-portal/lib/geo.ts", geoTs);
  console.log(`[✓] lib/geo.ts 生成: ${Object.keys(geoSorted).length} 件`);

  // scratchpad/geo/report.json
  writeFileSync(`${SCRATCHPAD}/report.json`, JSON.stringify(report, null, 2));
  console.log(`[✓] ${SCRATCHPAD}/report.json 生成`);

  // ============ サマリー ============

  const mapsCount = resolved.filter((r) => r.method === "maps").length;
  const gsiCount = resolved.filter((r) => r.method === "gsi").length;

  console.log(`\n[SUMMARY]`);
  console.log(`  合計: ${RESTAURANTS.length}`);
  console.log(`  解決: ${resolved.length}`);
  console.log(`    - Google Maps URL: ${mapsCount}`);
  console.log(`    - 国土地理院: ${gsiCount}`);
  console.log(`  未解決: ${unresolved.length}`);

  if (unresolved.length > 0) {
    console.log(`\n[UNRESOLVED]`);
    for (const u of unresolved) {
      console.log(`  ${u.id} ${u.name}`);
      console.log(`    住所: ${u.address}`);
      console.log(`    理由: ${u.reason}`);
    }
  }

  // ランダム5件サンプル
  if (resolved.length > 0) {
    console.log(`\n[SAMPLE - 5件ランダム]`);
    const samples = [];
    for (let i = 0; i < Math.min(5, resolved.length); i++) {
      const idx = Math.floor(Math.random() * resolved.length);
      samples.push(resolved[idx]);
    }
    for (const s of samples) {
      console.log(`  ${s.id} ${s.name}`);
      if (s.address) console.log(`    入力: ${s.address}`);
      if (s.title) console.log(`    マッチ: ${s.title}`);
      console.log(`    方式: ${s.method}`);
    }
  }
}

main().catch((e) => {
  console.error(`[ERROR] ${e.message}`);
  process.exit(1);
});
