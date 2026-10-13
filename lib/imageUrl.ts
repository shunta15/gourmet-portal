/**
 * Image URL sizing utility.
 * Resizes images from various hosts to specific widths.
 * Imports only lib/imageBlocklist (itself import-free) - safe for server and client.
 */
import { isBlockedImage } from "./imageBlocklist";
import { LOCAL_THUMBS } from "./localThumbs";

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

  // 自前の店の写真（/restaurants/…）: 縮小版（public/_thumbs/<幅>/restaurants/<相対パス>.webp。scripts/thumbs.mjs が作る）があれば、それにする
  if (url.startsWith("/restaurants/")) return localSized(url, w);

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
 * - 元の画像の URL（…/commons/a/ab/File.jpg。jpg / png だけ）: 欲しい幅が 500 以下のときだけ thumb の URL にする（元の画像が 960・1280 より狭いと 400 になるので、それ以上は元の URL のまま）
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
  // 元の画像が狭いと、その幅の thumb は 400 になる。確認の済んでいない幅（501 以上）へは上げず、元の URL のまま返す
  if (og) return want <= 500 ? `${og[1]}/thumb/${og[2]}/${want}px-${og[3]}` : url;
  return url;
}

/**
 * 自前の店の写真の縮小版。lib/localThumbs.ts の一覧（scripts/thumbs.mjs が作る。縮小版がある画像の相対パス）にあるものだけ。
 * 縮小版は 480 と 960（元の幅が狭いものは 480 だけ）。欲しい幅が 700 以下なら 480、1000 以下なら 960（無ければ 480）、それより大きければ元の画像。
 * 一覧に無い画像・クエリのある URL は、そのまま。縮小版の読み込みに失敗したら、<head> の script（app/layout.tsx）が元の画像に戻す。
 */
let thumbMap: Map<string, number> | null = null;
function thumbTier(rel: string): number {
  if (!thumbMap) {
    thumbMap = new Map();
    for (const line of LOCAL_THUMBS.split("\n")) {
      const i = line.indexOf("\t");
      thumbMap.set(i < 0 ? line : line.slice(0, i), i < 0 ? 2 : 1);
    }
  }
  return thumbMap.get(rel) ?? 0;
}
function localThumb(url: string, width: 480 | 960): string | null {
  if (!url.startsWith("/restaurants/") || /[?#]/.test(url)) return null;
  const rel = url.slice("/restaurants/".length);
  let dec = rel;
  try {
    dec = decodeURIComponent(rel);
  } catch {}
  const tier = thumbTier(dec);
  if (!tier || (width === 960 && tier < 2)) return null;
  return `/_thumbs/${width}/restaurants/${rel}.webp`;
}
function localSized(url: string, w: number): string {
  if (w > 1000) return url;
  const t = (w <= 700 ? localThumb(url, 480) : localThumb(url, 960) ?? localThumb(url, 480)) ?? null;
  return t ?? url;
}

/**
 * カードの img 用の srcset（幅 480・960 の 2 段。無ければ undefined）。sizes と一緒に使う。
 * 自前の縮小版（480 と 960 がある画像）と、Wikimedia の thumb（330 と 500。スマホの高精細な画面でも 500 までにする）が対象。
 */
export function sizedSrcSet(url: string): string | undefined {
  if (!url || isBlockedImage(url)) return undefined;
  const a = localThumb(url, 480);
  const b = localThumb(url, 960);
  if (a && b) return `${a} 480w, ${b} 960w`;
  if (/^https:\/\/upload\.wikimedia\.org\/wikipedia\/[a-z-]+\/thumb\/.+\/\d+px-/.test(url)) {
    const x = wikimediaSized(url, 330);
    const y = wikimediaSized(url, 500);
    if (x !== y && /\/330px-/.test(x) && /\/500px-/.test(y)) return `${x} 330w, ${y} 500w`;
  }
  return undefined;
}

/** カードの img の sizes（実測のカードの表示幅: PC 約 320px、スマホは 2 列で約 175px = 画面の 4 割ほど） */
export const CARD_SIZES = "(max-width: 760px) 40vw, 320px";
