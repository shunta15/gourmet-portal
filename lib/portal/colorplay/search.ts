/**
 * さがす(/{v}/search)の絞り込み。URL の引数(kind・pref・q・sort・n)で状態が決まる(純関数。JS なしでも動く)。
 */
import type { CpSite } from "./site";
import type { CpShop, Filters } from "./types";

export const PAGE_SIZE = 20;
export const PAGE_MAX = 200;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export const norm = (s: string) => s.toLowerCase().normalize("NFKC");

/** URL の引数 → 正しい値だけの Filters(知らない種類・県は捨てる) */
export function parseFilters(sp: SP, _site: CpSite, kindSlugs: Set<string>, prefSlugs: Set<string>, tagNames: Set<string>): Required<Filters> {
  const k = one(sp.kind);
  const p = one(sp.pref);
  const t = one(sp.tag);
  const n = Math.min(Math.max(parseInt(one(sp.n)) || PAGE_SIZE, PAGE_SIZE), PAGE_MAX);
  return {
    kind: kindSlugs.has(k) ? k : "",
    pref: prefSlugs.has(p) ? p : "",
    tag: tagNames.has(t) ? t : "",
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    sort: one(sp.sort) === "name" ? "name" : "area",
    n,
  };
}

/** 絞り込む。q は空白で区切った語をすべて含む(AND)。写真の無い店は並びの最後(それぞれの中の並びは元のまま) */
export function filterShops(shops: CpShop[], f: Filters): CpShop[] {
  const words = norm(f.q ?? "").split(" ").filter(Boolean);
  let list = shops.filter(
    (s) =>
      (!f.kind || s.kind === f.kind) &&
      (!f.pref || s.pref === f.pref) &&
      (!f.tag || s.tags.includes(f.tag)) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.address} ${s.prefName} ${s.city} ${s.kindName}`).includes(w))),
  );
  if (f.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  return [...list.filter((s) => s.main), ...list.filter((s) => !s.main)];
}

/** 種類・県だけで数える(q を使わない。件数の突き合わせ用) */
export function countBy(shops: CpShop[], f: { kind?: string; pref?: string; tag?: string }): number {
  return shops.filter((s) => (!f.kind || s.kind === f.kind) && (!f.pref || s.pref === f.pref) && (!f.tag || s.tags.includes(f.tag))).length;
}

/** さがすの URL(空の項目は付けない) */
export function searchHref(site: CpSite, f: Filters, hash = ""): string {
  const p = new URLSearchParams();
  if (f.kind) p.set("kind", f.kind);
  if (f.pref) p.set("pref", f.pref);
  if (f.tag) p.set("tag", f.tag);
  if (f.q) p.set("q", f.q);
  if (f.sort && f.sort !== "area") p.set("sort", f.sort);
  if (f.n && f.n > PAGE_SIZE) p.set("n", String(f.n));
  const s = p.toString();
  return `${site.base}/search${s ? `?${s}` : ""}${hash}`;
}

export const shopHref = (site: CpSite, id: string) => `${site.base}/shop/${encodeURIComponent(id)}`;
