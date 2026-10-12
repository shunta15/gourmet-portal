// 国土地理院ベクトルタイル（experimental_bvmap）の取得。取得したものは cache/ に置き（コミットしない）、同じタイルを二度取らない。
// 間隔を空け、失敗は再試行する。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "cache");
fs.mkdirSync(DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
export async function getTile(z, x, y) {
  const f = path.join(DIR, `${z}-${x}-${y}.pbf`);
  if (fs.existsSync(f)) return fs.readFileSync(f);
  const url = `https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/${z}/${x}/${y}.pbf`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const wait = Math.max(0, last + 250 - Date.now());
    if (wait) await sleep(wait);
    last = Date.now();
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        fs.writeFileSync(f, Buffer.alloc(0));
        return Buffer.alloc(0);
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(f, buf);
      return buf;
    } catch (e) {
      await sleep(800 * (attempt + 1));
      if (attempt === 3) throw new Error(`tile ${z}/${x}/${y}: ${e.message}`);
    }
  }
}
export const lonLatToTile = (lon, lat, z) => {
  const n = 2 ** z;
  const x = ((lon + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  return [x, y];
};
export const tileToLonLat = (x, y, z) => {
  const n = 2 ** z;
  const lon = (x / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  return [lon, lat];
};
