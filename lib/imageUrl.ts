/**
 * Image URL sizing utility.
 * Resizes images from various hosts to specific widths.
 * Imports only lib/imageBlocklist (itself import-free) - safe for server and client.
 */
import { isBlockedImage } from "./imageBlocklist";

export function sized(url: string, w: number): string {
  if (!url) return url;
  // 検閲で表示禁止にした画像は、どの経路から来てもここで差し替える（保険）
  if (isBlockedImage(url)) return "/restaurants/_placeholder/feature-point.jpg";

  // Unsplash images: set w parameter
  if (url.includes("images.unsplash.com")) {
    const u = new URL(url);
    u.searchParams.set("w", String(w));
    u.searchParams.set("q", "75");
    if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
    if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
    return u.toString();
  }

  // Wikimedia Commons: 公式の縮小版（thumb）に変える。Wikimedia は事前に決まった幅（標準幅）以外の thumb を 400 で拒否する
  // （2026-09-10 に 640・700・1000 などへ書き換えて本番で画像が欠けた）ので、標準幅だけを使う。元の thumb より大きくはしない（拡大しない）。
  if (url.includes("upload.wikimedia.org")) return wikimediaSized(url, w);

  // All other hosts: return unchanged
  return url;
}

/**
 * Wikimedia の標準の thumb 幅。これ以外の幅は拒否される。
 * 1920 以上は、元の画像がそれより狭いと作れないことがあるので使わない（いまのデータの thumb は最大 1280px）。
 */
const WM_WIDTHS = [250, 330, 500, 960, 1280];

/** 欲しい幅 w に、対数で最も近い標準幅（250〜1280） */
function wmNearest(w: number): number {
  let best = WM_WIDTHS[0];
  let bd = Infinity;
  for (const s of WM_WIDTHS) {
    const d = Math.abs(Math.log(s / w));
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}

/**
 * Wikimedia Commons の画像を、画面に出す幅に近い標準幅の thumb にする（同じ写真の小さい版だけ。写真は変えない）。
 * - thumb の URL（…/thumb/a/ab/File.jpg/1280px-File.jpg）: 幅の数字だけを、欲しい幅に近い標準幅へ（元の幅より大きくしない）
 * - 元の画像の URL（…/commons/a/ab/File.jpg。jpg / png だけ）: thumb の URL にする（元の画像が標準幅より狭いと 400 になることがあるので、1280 までにする）
 * - それ以外（svg・tif・webp・クエリ付きなど）は、そのまま
 */
export function wikimediaSized(url: string, w: number): string {
  const want = wmNearest(w);
  const th = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[a-z-]+\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/[^/?#]+)\/(\d+)px-([^/?#]+)$/);
  if (th) {
    const n = Number(th[2]);
    const use = Math.min(want, n);
    if (!WM_WIDTHS.includes(use) && use !== n) return url;
    return use === n ? url : `${th[1]}/${use}px-${th[3]}`;
  }
  const og = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[a-z-]+)\/([0-9a-f]\/[0-9a-f]{2}\/([^/?#]+\.(?:jpe?g|png)))$/i);
  if (og) return `${og[1]}/thumb/${og[2]}/${want}px-${og[3]}`;
  return url;
}
