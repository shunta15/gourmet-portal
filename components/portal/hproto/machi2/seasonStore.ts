import type { Season } from "./season";

/** いまの季節をページ内の部品(舞う物の canvas など)へ知らせる小さな置き場。クライアント専用。 */
let cur: Season | null = null;
const subs = new Set<(s: Season) => void>();
export const getSeason = () => cur;
export function setSeason(s: Season) { if (s === cur) return; cur = s; subs.forEach((f) => f(s)); }
export function subscribeSeason(f: (s: Season) => void) { subs.add(f); return () => { subs.delete(f); }; }
