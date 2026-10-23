/**
 * 探すの絞り込みに使う決まりごと(純関数・定数。サーバーもクライアントも import してよい)。
 * 種類・こだわり(体験スタイル)・地方は、実在の店のデータにあるものだけを数える。URL の引数の名前は vkit の探すと同じ(links.ts の SearchArgs)。
 */

/** 種類(lib/verticals/activity.ts の categories) */
export const KINDS = [
  { slug: "sea-river", name: "海・川" },
  { slug: "mountain-sky", name: "山・空" },
  { slug: "craft", name: "ものづくり体験" },
  { slug: "sightseeing", name: "観光・見学" },
] as const;

/** 体験スタイル(lib/verticals/activity.ts の scenes。店のデータの tags の語と同じ) */
export const SCENES = [
  { slug: "with-children", name: "子連れ" },
  { slug: "beginner", name: "初心者歓迎" },
  { slug: "hands-free", name: "手ぶらでOK" },
  { slug: "rainy-day", name: "雨の日" },
  { slug: "parking", name: "駐車場あり" },
] as const;

/** 地方の札(画面の 6 つ。「中国・四国」は中国と四国、「九州・沖縄」は九州と沖縄を 1 つにする。slugs は vkit の REGIONS の slug) */
export const REGION_GROUPS = [
  { key: "kanto", name: "関東", slugs: ["kanto"] },
  { key: "koshinetsu", name: "甲信越", slugs: ["koshinetsu"] },
  { key: "tokai", name: "東海", slugs: ["tokai"] },
  { key: "kansai", name: "関西", slugs: ["kansai"] },
  { key: "chushikoku", name: "中国・四国", slugs: ["chugoku", "shikoku"] },
  { key: "kyushu", name: "九州・沖縄", slugs: ["kyushu", "okinawa"] },
] as const;

export type RegionKey = (typeof REGION_GROUPS)[number]["key"];

export function regionKeyOf(regionSlug: string): RegionKey | "" {
  return REGION_GROUPS.find((g) => (g.slugs as readonly string[]).includes(regionSlug))?.key ?? "";
}

/** 画面の地方の札 → URL の region 引数(vkit の region の slug。複数は , でつなぐ) */
export function regionArg(key: string): string[] {
  return [...(REGION_GROUPS.find((g) => g.key === key)?.slugs ?? [])];
}

// ------------------------------------------------------------------ 日付から探す
/**
 * 店の営業日(営業時間・定休日の案内から作る。サーバーで作り、クライアントへは数字と文字だけ渡す)。
 *   d: 月〜日(0〜6)ごとに o = 営業 / c = 休み / u = 案内からは分からない
 *   n: 第N◯曜が休み [曜日(0=月), [N,…]]
 *   range: 営業する期間 [開始の月, 日, 終了の月, 日](「営業は3月21日〜11月30日」のような案内がある店)
 *   yearend: 定休日の案内に「年末年始」がある店(12月29日〜1月3日は、営業とは言い切れないので u に戻す)
 * 祝日・臨時休業は反映できない(画面に「祝日・臨時休業は反映していません」と出す)
 * 営業時間の案内が無い店・不定休の店は、その曜日が u(= 営業日は店に確認)。勝手に営業とも休みとも決めない。
 */
export type OpenDay = {
  d: ("o" | "c" | "u")[];
  n?: [number, number[]][];
  range?: [number, number, number, number];
  yearend?: 1;
};

export type DayState = "open" | "closed" | "unknown";

/** 日付(年・月・日)が、その店の営業日か。年は曜日の計算だけに使う */
export function stateOn(od: OpenDay | null | undefined, y: number, m: number, d: number): DayState {
  if (!od) return "unknown";
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = (dt.getUTCDay() + 6) % 7; // 月=0
  const nth = Math.floor((d - 1) / 7) + 1;
  if (od.range) {
    const [m1, d1, m2, d2] = od.range;
    const k = m * 100 + d;
    const a = m1 * 100 + d1;
    const b = m2 * 100 + d2;
    const inside = a <= b ? k >= a && k <= b : k >= a || k <= b;
    if (!inside) return "closed";
  }
  if (od.n?.some(([w, list]) => w === wd && list.includes(nth))) return "closed";
  const s = od.d[wd];
  if (s === "o" && od.yearend && ((m === 12 && d >= 29) || (m === 1 && d <= 3))) return "unknown";
  return s === "o" ? "open" : s === "c" ? "closed" : "unknown";
}

/** 日本時間の「今日」(ブラウザの時計の年月日。クライアントで使う) */
export function todayYmd(now = new Date()): [number, number, number] {
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
}

/** 「今週末」「来週末」の土曜・日曜(年月日の組を 2 つ)。今日が土日なら、その週末が「今週末」 */
export function weekendDays(which: "weekend" | "nextweekend", now = new Date()): [number, number, number][] {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const wd = (base.getDay() + 6) % 7; // 月=0 … 日=6
  // 今週末の土曜までの日数(土日なら、その週の土曜は過去か今日。日曜なら昨日の土曜を含める)
  const toSat = wd === 6 ? -1 : 5 - wd;
  const add = which === "nextweekend" ? 7 : 0;
  const out: [number, number, number][] = [];
  for (const k of [0, 1]) {
    const t = new Date(base.getFullYear(), base.getMonth(), base.getDate() + toSat + add + k);
    out.push([t.getFullYear(), t.getMonth() + 1, t.getDate()]);
  }
  return out;
}

/** 指定の「日付の条件」に対する、その店の判定。週末は土日のどちらかが営業なら営業、両方休みなら休み、それ以外は分からない */
export type DateFilter = { kind: "none" } | { kind: "weekend" | "nextweekend" } | { kind: "date"; ymd: [number, number, number] };

export function stateFor(od: OpenDay | null | undefined, f: DateFilter, now = new Date()): DayState {
  if (f.kind === "none") return "open";
  if (f.kind === "date") return stateOn(od, ...f.ymd);
  const days = weekendDays(f.kind, now).map(([y, m, d]) => stateOn(od, y, m, d));
  if (days.includes("open")) return "open";
  if (days.every((x) => x === "closed")) return "closed";
  return "unknown";
}

export function parseYmd(s: string | undefined): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? [y, mo, d] : null;
}

/** 「10月31日(土)」 */
export function ymdLabel([y, m, d]: [number, number, number]): string {
  const w = "月火水木金土日"[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7];
  return `${m}月${d}日(${w})`;
}
