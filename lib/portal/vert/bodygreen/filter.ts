/**
 * 探す(/bodycare/search)の絞り込みを GreenShop の配列に対して行う純関数(サーバー・クライアントのどちらからも読める)。
 * 本番の parseFilters / filterShops(lib/portal/colorplay/search.ts)と同じ規則: 軸は kind・pref・tag(1 つ)・q・sort(area|name)・n の 6 つ。
 * 知らない種類・県・こだわりは捨てる。q は空白で区切った語をすべて含む(AND)。写真の無い店は並びの最後。
 */
import { PAGE_MAX, PAGE_SIZE, norm } from "@/lib/portal/colorplay/search";
import type { Filters } from "@/lib/portal/colorplay/types";
import type { GreenFacets, GreenShop } from "./types";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export { PAGE_SIZE, PAGE_MAX };

/** 店舗紹介の一覧(/bodycare/shop)の URL の引数 n → 正しい件数(知らない値は 1 ページぶん) */
export function parseGreenListN(sp: SP): number {
  return Math.min(Math.max(parseInt(one(sp.n)) || PAGE_SIZE, PAGE_SIZE), PAGE_MAX);
}

/** URL の引数 → 正しい値だけの Filters */
export function parseGreenFilters(sp: SP, facets: GreenFacets): Required<Filters> {
  const k = one(sp.kind);
  const p = one(sp.pref);
  const t = one(sp.tag);
  const n = Math.min(Math.max(parseInt(one(sp.n)) || PAGE_SIZE, PAGE_SIZE), PAGE_MAX);
  return {
    kind: facets.kinds.some((x) => x.slug === k) ? k : "",
    pref: facets.prefs.some((x) => x.slug === p) ? p : "",
    tag: facets.tags.some((x) => x.name === t) ? t : "",
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    sort: one(sp.sort) === "name" ? "name" : "area",
    n,
  };
}

/** 絞り込む(件数の突き合わせは本番と同じ数になる) */
export function filterGreenShops(shops: GreenShop[], f: Filters): GreenShop[] {
  const words = norm(f.q ?? "").split(" ").filter(Boolean);
  let list = shops.filter(
    (s) =>
      (!f.kind || s.kind === f.kind) &&
      (!f.pref || s.pref === f.pref) &&
      (!f.tag || s.tags.includes(f.tag)) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.address} ${s.prefName} ${s.city} ${s.kindName}`).includes(w))),
  );
  if (f.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  return [...list.filter((s) => s.photo), ...list.filter((s) => !s.photo)];
}

/** 種類・県・こだわりだけで数える(q を使わない) */
export function countGreen(shops: GreenShop[], f: { kind?: string; pref?: string; tag?: string }): number {
  return shops.filter((s) => (!f.kind || s.kind === f.kind) && (!f.pref || s.pref === f.pref) && (!f.tag || s.tags.includes(f.tag))).length;
}
