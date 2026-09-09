/**
 * Image URL sizing utility.
 * Resizes images from various hosts to specific widths.
 * No imports - pure function for use in both server and client.
 */

export function sized(url: string, w: number): string {
  if (!url) return url;

  // Unsplash images: set w parameter
  if (url.includes("images.unsplash.com")) {
    const u = new URL(url);
    u.searchParams.set("w", String(w));
    u.searchParams.set("q", "75");
    if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
    if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
    return u.toString();
  }

  // Wikimedia Commons: replace <N>px- with <w>px-
  // Wikimedia は事前生成済みサイズ（元URLの 1280px 等）以外を 400 で拒否するため書き換えない（2026-09-10 本番で画像欠落）

  if (url.includes("upload.wikimedia.org")) return url;

  if (url.includes("upload.wikimedia.org")) {
    // Pattern: /thumb/.../<filename>/<Npx-filename>
    // Replace the Npx- part with wpx-
    return url.replace(/\/(\d+)px-/, `/${w}px-`);
  }

  // All other hosts: return unchanged
  return url;
}
