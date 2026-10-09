/**
 * 暖簾の特集記事のトップ（一覧・地域別・特集を探す）用の純関数と型。サーバー・クライアントのどちらからも使える（データは読まない）。
 * データを読む側は lib/portal/noren/featureList.ts（サーバー専用）。
 */

/** 特集カード 1 枚ぶん。img は「使える写真」だけ（無ければ空文字。カードは写真なしの布だけで出る） */
export type FeatureCardItem = {
  id: string;
  no: string;
  tag: string;
  kicker: string;
  title: string;
  sub: string;
  img: string;
};

/** 題名を「主題（最初の読点まで）」と「続き」に分ける（/gourmet の特集の短冊と同じ規則） */
export function splitTitle(t: string): [string, string] {
  const i = t.search(/[、。，]/);
  if (i <= 0 || i > 12) return [t.length > 12 ? t.slice(0, 12) : t, t.length > 12 ? t.slice(12) : ""];
  return [t.slice(0, i), t.slice(i + 1).replace(/^[、。\s]+/, "")];
}

/** 暖簾の布に染める縦書きの題の大きさ（px）。短いほど大きく */
export function clothFs(main: string): number {
  const n = Array.from(main).length;
  return n <= 6 ? 24 : n <= 10 ? 21 : 19;
}

/** 見出しの暖簾に染める字（漢字・かな・カナだけを、先頭から最大 5 字） */
export function clothChars(label: string, max = 5): string[] {
  return Array.from(label.replace(/[^぀-ヿ㐀-鿿]/g, "")).slice(0, max);
}
