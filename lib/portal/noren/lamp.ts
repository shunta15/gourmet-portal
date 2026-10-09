/** 時刻から「灯りの強さ」(0.18〜1) を返す純関数。サーバー/クライアント両方で使える。 */
export function lampAt(hour: number): number {
  const ss = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const raw = hour >= 12 ? ss(16.5, 19, hour) : 1 - ss(4.5, 6.5, hour);
  return 0.18 + 0.82 * raw;
}

export type Band = "morning" | "day" | "dusk" | "night" | "late";
export function bandAt(hour: number): Band {
  if (hour >= 23 || hour < 4.5) return "late";
  if (hour < 11) return "morning";
  if (hour < 16.5) return "day";
  if (hour < 19) return "dusk";
  return "night";
}

/** JST の現在時刻。?t=HH:MM があれば確認用にそれを使う（試作の動作確認用） */
export function jstNow(override?: string | null): { h: number; m: number; s: number; hour: number } {
  if (override && /^\d{1,2}:\d{2}$/.test(override)) {
    const [h, m] = override.split(":").map(Number);
    if (h < 24 && m < 60) return { h, m, s: 0, hour: h + m / 60 };
  }
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0) % 24;
  const h = g("hour"), m = g("minute"), s = g("second");
  return { h, m, s, hour: h + m / 60 + s / 3600 };
}

const KAN = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
export function kanjiNum(n: number): string {
  if (n === 0) return "零";
  if (n < 10) return KAN[n];
  const t = Math.floor(n / 10), o = n % 10;
  return (t > 1 ? KAN[t] : "") + "十" + (o ? KAN[o] : "");
}
export function kanjiTime(h: number, m: number): string {
  const ampm = h < 12 ? "午前" : "午後";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm}${kanjiNum(h12)}時${m === 0 ? "" : kanjiNum(m) + "分"}`;
}
