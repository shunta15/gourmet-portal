import { kanjiNum } from "./lamp";
import { nameTokens } from "./shop";

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

/* ───────────── 暖簾の横丁（特集記事）用 ───────────── */

/** 漢数字（一・二・三…、十・十一…）。暖簾に染める番号 */
export function kanjiNo(n: number): string {
  return kanjiNum(n);
}

/**
 * 暖簾に染める名前（データの店名・場所の名前から、かっこの中・「by …」・末尾の支店名（○○店）だけを落としたもの。語のあいだの空白は残す）。
 * 落とした結果が空なら元の名前。
 */
export function clothName(name: string): string {
  const s = name
    .replace(/[（(][^）)]*[）)]/g, " ")
    .replace(/[〜～~][^〜～~]*[〜～~]/g, " ")
    .replace(/\s+by\s+.*$/i, " ");
  const segs = s.split(/[\s\u3000]+/).filter(Boolean);
  while (segs.length > 1 && /(支店|本店|[^\s]{1,8}店)$/.test(segs[segs.length - 1]) && segs[segs.length - 1].length <= 12) segs.pop();
  const c = segs.join(" ");
  return nameTokens(c, 24).length > 0 ? c : name;
}

/** 縦書きの長さの見積もり（字数。欧文・数字の連なりは 1 語 = 0.56em × 字数） */
export function emOf(text: string): number {
  return nameTokens(text, 24).reduce((a, t) => a + (/^[A-Za-z0-9&'.]+$/.test(t) ? Math.max(0.6, t.length * 0.56) : 1), 0);
}

/** 縦書きの列数の目安（長い名前ほど多く） */
export function colsOf(em: number): number {
  return em <= 9 ? 1 : em <= 18 ? 2 : em <= 30 ? 3 : 4;
}

export type BandPanel = { text: string; em: number };

/**
 * 店ごとの暖簾（区切り）に染める名前を、布の枚数に割り振る。1 枚に 1〜2 字（長い名前は、1 枚に縦 1 列で入るだけ）。
 * 店ページの暖簾（lib/portal/noren/shop.ts の panelPlan）と違い、字は削らない（特集の項目の名前は長いこともあるため）。
 */
export function bandPlan(name: string, mobile: boolean): BandPanel[] {
  const tokens = nameTokens(clothName(name), 24);
  const T = tokens.length || 1;
  const solo = mobile ? 3 : 5;
  const n = T <= solo ? T : Math.min(solo, Math.ceil(T / 2));
  const per = Math.ceil(T / n);
  const out: BandPanel[] = [];
  for (let i = 0; i < n; i++) {
    const t = tokens.slice(i * per, (i + 1) * per);
    if (t.length === 0) continue;
    out.push({ text: t.join(""), em: emOf(t.join("")) });
  }
  return out.length > 0 ? out : [{ text: "輪", em: 1 }];
}

/** 縦書きの店名の大きさ（px）。長いほど小さく */
export function bandNameSize(em: number): number {
  if (em <= 6) return 64;
  if (em <= 10) return 52;
  if (em <= 16) return 42;
  if (em <= 24) return 34;
  if (em <= 34) return 28;
  return 24;
}
