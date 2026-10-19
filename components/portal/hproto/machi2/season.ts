/** 季節(最初の画面の絵・舞う物・札)。サーバー・クライアント両方から import できる(副作用なし)。 */
export type Season = "spring" | "summer" | "autumn" | "winter";
export const SEASONS: readonly Season[] = ["spring", "summer", "autumn", "winter"] as const;
export const SEASON_LABEL: Record<Season, string> = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" };
/** 1 つの季節を見せる長さ(秒)。css の --season-dur と同じ値にする */
export const SEASON_SEC = 6;

/** 日本時間の今日の月から季節(3〜5 春・6〜8 夏・9〜11 秋・12〜2 冬)。サーバーで呼ぶ(ページは動的) */
export function seasonOfMonth(m: number): Season {
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}
export function seasonNowJst(now: Date = new Date()): Season {
  const m = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", month: "numeric" }).format(now));
  return seasonOfMonth(m);
}
export const seasonSrc = (img: string, s: Season) => `${img}/season-${s}.webp`;
