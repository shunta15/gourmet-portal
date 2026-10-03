/**
 * 総合サイトの共有画像（OGP）の URL の決め方。クライアントからも使える純関数（データを読まない）。
 *
 * 画像そのものは app/og/** の route handler（next/og の ImageResponse）が作る。
 * 注意: app/opengraph-image.tsx（ルート）はグルメの全ページの共有画像なので触らない。総合サイトのページは
 * buildMetadata（lib/seo/meta.ts）から、ここで決めた URL を openGraph.images / twitter.images に明示指定する。
 *
 *   /                          → /og/home
 *   /{beauty|bodycare|…}/**    → /og/v/{key}            （業種トップ・その配下は業種の色の共有画像）
 *   /area/{pref}               → /og/area/{pref}        （業種横断の街（県））
 *   /station/{pref}/{name}     → /og/station/{pref}/{name}
 *   それ以外（/station・/videos・/map など）→ /og/home
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

/** 共有画像のデザインを変えたら上げる（CDN・SNS のキャッシュを切るためのクエリ） */
export const OG_VERSION = "1";

const NEW_VERTICALS = ["beauty", "bodycare", "pet", "leisure", "stay"];

function seg(s: string): string {
  return encodeURIComponent(s);
}

/** 共有画像のパス（サイト内の相対パス。metadataBase で絶対URLになる） */
export function ogImagePath(path: string): string {
  const parts = path.split("/").filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  let p = "/og/home";
  if (parts[0] && NEW_VERTICALS.includes(parts[0])) {
    p = `/og/v/${parts[0]}`;
  } else if (parts[0] === "area" && parts[1] && parts.length === 2) {
    p = `/og/area/${seg(parts[1])}`;
  } else if (parts[0] === "station" && parts[1] && parts[2] && parts.length === 3) {
    p = `/og/station/${seg(parts[1])}/${seg(parts[2])}`;
  }
  return `${p}?v=${OG_VERSION}`;
}

/** metadata の openGraph.images に渡す形 */
export function ogImage(path: string, alt: string) {
  return { url: ogImagePath(path), width: OG_SIZE.width, height: OG_SIZE.height, alt };
}
