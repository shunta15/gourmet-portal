#!/usr/bin/env node
// Maps URL を解決して正式店舗名・座標・住所を取得する
// 使い方: node scripts/resolve-maps-url.mjs "https://maps.app.goo.gl/..."
// 出力: JSON { name, lat, lng, prefecture, city, address, placeId }
//
// 設計思想:
// - claude に店舗特定をさせない（同名店舗を拾うリスク）
// - Maps URL のリダイレクト先 URL から店舗名・座標を機械的に抽出
// - Nominatim (OpenStreetMap) で無料の逆ジオコーディング（API課金ゼロ）

const url = process.argv[2];
if (!url) {
  console.error("Usage: node resolve-maps-url.mjs <maps-url>");
  process.exit(2);
}

async function followRedirect(u) {
  // Node fetch follows redirects automatically; we read final URL via .url
  const res = await fetch(u, {
    headers: { "User-Agent": "Mozilla/5.0 machinowa/1.0" },
    redirect: "follow",
  });
  return res.url;
}

async function reverseGeocode(lat, lng) {
  const u = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja&zoom=18`;
  const res = await fetch(u, {
    headers: { "User-Agent": "machinowa/1.0 (linkateinc315@link8.info)" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

function parseMapsUrl(finalUrl) {
  // 期待形式: https://www.google.com/maps/place/<NAME>/@<lat>,<lng>,<zoom>z/data=...!1s<placeId>!...
  // 例: /maps/place/%E3%81%82%E3%81%9D%E3%81%B3%E5%89%B2%E7%83%B9+%E8%B3%A2%E5%A4%AA%E6%9C%97/@33.8825376,130.8827424,17z/
  const nameMatch = finalUrl.match(/\/maps\/place\/([^/]+)\//);
  const coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const placeIdMatch = finalUrl.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i);
  if (!nameMatch || !coordMatch) {
    throw new Error(`Maps URL の構造を解析できません: ${finalUrl}`);
  }
  const name = decodeURIComponent(nameMatch[1]).replace(/\+/g, " ");
  const lat = parseFloat(coordMatch[1]);
  const lng = parseFloat(coordMatch[2]);
  const placeId = placeIdMatch ? placeIdMatch[1] : null;
  return { name, lat, lng, placeId, finalUrl };
}

try {
  const finalUrl = await followRedirect(url);
  const parsed = parseMapsUrl(finalUrl);
  let address = null;
  let prefecture = null;
  let city = null;
  try {
    const geo = await reverseGeocode(parsed.lat, parsed.lng);
    address = geo.display_name || null;
    prefecture = geo.address?.province || geo.address?.state || null;
    city = geo.address?.city || geo.address?.town || geo.address?.suburb || null;
  } catch (e) {
    // 逆ジオコーディング失敗してもメイン情報は出す
    process.stderr.write(`[warn] reverse geocode failed: ${e.message}\n`);
  }
  const out = {
    name: parsed.name,
    lat: parsed.lat,
    lng: parsed.lng,
    placeId: parsed.placeId,
    prefecture,
    city,
    address,
    finalUrl: parsed.finalUrl,
  };
  console.log(JSON.stringify(out, null, 2));
} catch (e) {
  console.error(`[error] ${e.message}`);
  process.exit(1);
}
