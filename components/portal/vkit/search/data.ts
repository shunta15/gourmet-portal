import "server-only";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { kindsWithShops, prefsWithShops, regionOfPref, regionsWithShops, scenesWithShops, sortShops, type LiveShop } from "../common/live";
import { vkLinks, type VkConfig } from "../config";

/**
 * 探す(本番 /{業種}/search)のデータの読み込みと絞り込み(サーバー専用)。ステイの search/data.ts を業種の設定で切り替えられるようにしたもの。
 * 店は common/live.ts の loadShops(cfg)(実在の店 = getPlaces(業種))だけ。店が 0 件でも壊れない(空の欄は出さない)。
 *
 * URL の引数(最初のページなどからのリンクと同じ名前 = config.ts の vkLinks(cfg).searchWith):
 *   kind=種類のスラッグ(複数可: kind=gym&kind=golf。種類の中は「どれか」)
 *   region=地方のスラッグ(hokkaido・tohoku・kanto・koshinetsu・hokuriku・tokai・kansai・chugoku・shikoku・kyushu・okinawa)
 *   pref=都道府県のスラッグ(指定すると地方はその県の地方になる)
 *   scene=こだわり条件のスラッグ(lib/verticals/{業種}.ts の scenes。複数可: 全部に当てはまる店だけ)
 *   q=文字(空白で区切った語を全部含む。店名・住所・最寄り駅・タグ)
 *   sort=area(既定)|new   page=2 以降
 * 並べ替えは 新着順・エリア順 の中立の 2 つだけ(おすすめ順・人気順・料金順は無い)。
 */

export const PAGE_SIZE = 10;

export type SearchFilters = {
  kinds: string[];
  region: string;
  pref: string;
  scenes: string[];
  q: string;
  sort: "area" | "new";
  page: number;
};

type SP = Record<string, string | string[] | undefined>;

const many = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const norm = (s: string) => s.toLowerCase().normalize("NFKC");

export type Facets = {
  kinds: Array<{ slug: string; name: string; count: number }>;
  regions: ReturnType<typeof regionsWithShops>;
  prefs: ReturnType<typeof prefsWithShops>;
  scenes: ReturnType<typeof scenesWithShops>;
};

/** データにある種類・地方・都道府県・こだわり条件と、それぞれの店の数(0 のものは入れない) */
export function facetsOf(cfg: VkConfig, shops: LiveShop[]): Facets {
  return { kinds: kindsWithShops(cfg, shops), regions: regionsWithShops(shops), prefs: prefsWithShops(shops), scenes: scenesWithShops(cfg, shops) };
}

/** URL の引数 → データにある値だけの SearchFilters(データにない種類・地方・県・条件は捨てる) */
export function parseFilters(sp: SP, f: Facets): SearchFilters {
  const kindOk = new Set(f.kinds.map((k) => k.slug));
  const sceneOk = new Set(f.scenes.map((s) => s.slug));
  const prefRaw = one(sp.pref);
  const pref = f.prefs.some((p) => p.slug === prefRaw) ? prefRaw : "";
  const regionRaw = one(sp.region);
  let region = f.regions.some((r) => r.slug === regionRaw) ? regionRaw : "";
  // 県を指定したら、地方はその県の地方にそろえる(県が優先)
  if (pref) region = regionOfPref(pref)?.slug ?? region;
  const page = Math.min(Math.max(parseInt(one(sp.page)) || 1, 1), 500);
  return {
    kinds: [...new Set(many(sp.kind).filter((k) => kindOk.has(k)))],
    region,
    pref,
    scenes: [...new Set(many(sp.scene).filter((s) => sceneOk.has(s)))],
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    sort: one(sp.sort) === "new" ? "new" : "area",
    page,
  };
}

/** 絞り込む。種類は「どれか」・こだわり条件は「全部」・q は空白で区切った語を全部含む。並びは エリア順 / 新着順(common/live.ts の sortShops) */
export function filterShops(cfg: VkConfig, shops: LiveShop[], f: SearchFilters): LiveShop[] {
  const sceneTags = f.scenes.map((slug) => VERTICALS[cfg.key].scenes.find((s) => s.slug === slug)?.matchTags ?? []);
  const words = norm(f.q).split(" ").filter(Boolean);
  const list = shops.filter(
    (s) =>
      (f.kinds.length === 0 || f.kinds.includes(s.kind)) &&
      (!f.region || s.region === f.region) &&
      (!f.pref || s.pref === f.pref) &&
      sceneTags.every((tags) => tags.some((t) => s.tags.includes(t))) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.address} ${s.area} ${s.station} ${s.kindName} ${s.tags.join(" ")}`).includes(w))),
  );
  return sortShops(list, f.sort);
}

/** 探すの URL(空の項目は付けない。種類・こだわりは繰り返し) */
export function searchHref(cfg: VkConfig, f: Partial<SearchFilters>, hash = ""): string {
  const base = vkLinks(cfg).search;
  const p = new URLSearchParams();
  for (const k of f.kinds ?? []) p.append("kind", k);
  if (f.region && !f.pref) p.set("region", f.region);
  if (f.pref) p.set("pref", f.pref);
  for (const s of f.scenes ?? []) p.append("scene", s);
  if (f.q) p.set("q", f.q);
  if (f.sort && f.sort !== "area") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const qs = p.toString();
  return `${base}${qs ? `?${qs}` : ""}${hash}`;
}

/** 「長野県・ジム・フィットネス・初心者歓迎」のような、今の絞り込みの言い方(無ければ空) */
export function scopeOf(f: SearchFilters, facets: Facets): string {
  const pref = facets.prefs.find((p) => p.slug === f.pref)?.name;
  const region = !f.pref ? facets.regions.find((r) => r.slug === f.region)?.name : "";
  const kinds = f.kinds.map((k) => facets.kinds.find((x) => x.slug === k)?.name).filter(Boolean) as string[];
  const scenes = f.scenes.map((s) => facets.scenes.find((x) => x.slug === s)?.name).filter(Boolean) as string[];
  return [pref ?? region, kinds.join("・"), scenes.join("・"), f.q ? `「${f.q}」` : ""].filter(Boolean).join("・");
}

/** 都道府県の短い名前(「長野」)。表に無ければ空 */
export function prefShort(slug: string): string {
  return PREFECTURES.find((p) => p.slug === slug)?.short ?? "";
}
