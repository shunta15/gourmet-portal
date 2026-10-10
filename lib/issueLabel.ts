/**
 * 「号」の名前と年のラベル(import なしの軽い関数。サーバー・クライアントのどちらからも使える)。
 * 暖簾の特集記事(components/portal/noren/FeaturePage.tsx)と、旧デザインの部品が同じものを使う。
 */

/**
 * 特集記事の日付（"2026-10-01" など。"2026/10/01"・"2026.10.01" も可）から、流れる帯に出す号の名前（"2026年 10月号"）を作る。
 * 日付が無い・読めない・月が 1〜12 でないときは null（帯にこの項目を出さない）。
 */
export function issueLabel(date: string | null | undefined): string | null {
  const m = /^\s*(\d{4})[-/.](\d{1,2})(?:\D|$)/.exec(date ?? "");
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return `${m[1]}年 ${month}月号`;
}

/**
 * 今の年のラベル(例 "2026年")。記事の日付が無い所(サイトの横のラベル・地域のページなど)用。
 * 日本時間の年。サーバーとブラウザで年がずれないよう、実行する場所のタイムゾーンに依らず日本時間で数える。
 */
export function yearLabel(now: Date = new Date()): string {
  return `${new Date(now.getTime() + 9 * 3600 * 1000).getUTCFullYear()}年`;
}
