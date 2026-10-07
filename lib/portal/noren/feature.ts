/**
 * 暖簾の見本（特集記事ページ）用の純関数。サーバー・クライアントのどちらからも使える（データは読まない）。
 */

/** 今のサイト内の行き先のうち、見本にある店ページ・特集ページは見本の行き先に付け替える（それ以外は今の本物のページのまま） */
export function protoHref(h: string): string {
  if (h.startsWith("/restaurant/") || h.startsWith("/feature/")) {
    // /feature/search・/feature/region/... は見本に無いので、そのまま
    if (/^\/feature\/(search|region)(\/|$)/.test(h)) return h;
    return `/proto-noren${h}`;
  }
  return h;
}

/** 題名（HTML タグ付き）の字数の見積もり */
export function plainLen(html: string): number {
  return Array.from(html.replace(/<[^>]*>/g, "").replace(/\s/g, "")).length;
}

/** 縦書きの題名の大きさ（px）。長い題名ほど小さく、列が増えても収まるように */
export function titleSize(len: number): number {
  if (len <= 14) return 78;
  if (len <= 24) return 64;
  if (len <= 36) return 52;
  if (len <= 52) return 44;
  return 38;
}

/** "STORE 01" / "SPOT 01" のような英字＋数字は分割して見せる（今のページと同じ規則） */
export function splitRank(rank: string): { label: string; num: string } {
  const m = rank.match(/^([A-Z]+)\s+(\d+)$/);
  return m ? { label: m[1], num: m[2] } : { label: "", num: rank };
}

/** 写真の並べ方（6 列のうち何列ぶんか）。枚数ごとに、行がきれいに埋まる組み合わせ */
export function photoSpans(n: number): number[] {
  switch (n) {
    case 1: return [6];
    case 2: return [3, 3];
    case 3: return [2, 2, 2];
    case 4: return [3, 3, 3, 3];
    case 5: return [2, 2, 2, 3, 3];
    default: return Array.from({ length: Math.min(n, 6) }, () => 2);
  }
}
