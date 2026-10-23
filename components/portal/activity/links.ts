/**
 * アクティビティの画面の間のリンクと、探すの絞り込みの URL(純関数。サーバーの部品もクライアントの部品も import してよい)。
 * 行き先は本物のページ: 最初 /activity・探す /activity/search・店 /activity/shop/{id}・特集 /activity/article・店の記事 /activity/article/{id}。
 * 季節・読みもの・はじめての方へは /activity/article の下(season/{id}・magazine/{id}・guide)。店の記事 /activity/article/{id}(id は ac+数字)とはぶつからない。
 */
export const A = "/activity";

/** 探すの絞り込みの引数(URL の名前は vkit の探す(components/portal/vkit/search/data.ts)と同じ: kind・region・pref・scene・q。日付と「お気に入りだけ」はこのページだけの引数) */
export type SearchArgs = {
  kind?: string[];
  region?: string[];
  pref?: string;
  scene?: string[];
  q?: string;
  /** weekend = 今週末 / nextweekend = 来週末 */
  when?: "weekend" | "nextweekend";
  /** 日付を指定(YYYY-MM-DD) */
  date?: string;
  fav?: boolean;
};

export function searchUrl(a: SearchArgs = {}, hash = ""): string {
  const p = new URLSearchParams();
  for (const k of a.kind ?? []) p.append("kind", k);
  if (a.region?.length) p.set("region", a.region.join(","));
  if (a.pref) p.set("pref", a.pref);
  for (const s of a.scene ?? []) p.append("scene", s);
  if (a.q) p.set("q", a.q);
  if (a.when) p.set("when", a.when);
  else if (a.date) p.set("date", a.date);
  if (a.fav) p.set("fav", "1");
  const qs = p.toString();
  return `${A}/search${qs ? `?${qs}` : ""}${hash}`;
}

export const aLinks = {
  top: A,
  search: `${A}/search`,
  course: `${A}/search#course`,
  article: `${A}/article`,
  magazine: `${A}/article#magazine`,
  shop: (id: string) => `${A}/shop/${encodeURIComponent(id)}`,
  /** 店ごとの特集記事(店 ID) */
  story: (id: string) => `${A}/article/${encodeURIComponent(id)}`,
  season: (id: string) => `${A}/article/season/${encodeURIComponent(id)}`,
  mag: (id: string) => `${A}/article/magazine/${encodeURIComponent(id)}`,
  guide: `${A}/article/guide`,
  guideAt: (n: number) => `${A}/article/guide#q${n}`,
  /** お気に入りに入れた体験だけの探す */
  favs: `${A}/search?fav=1`,
  about: "/about",
  contact: "/contact",
};
