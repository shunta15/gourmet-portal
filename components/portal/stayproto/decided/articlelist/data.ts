import "server-only";
import { VERTICALS } from "@/lib/verticals";
import { KIND_EN, kindsWithShops, loadStayShops, prefsWithShops, regionOfPref, regionsWithShops, scenesWithShops, sortShops, type LiveShop } from "../common/live";
import { syLinks } from "../common/site";
import { cardCopyText } from "./copy";

/**
 * 宿の記事の一覧(本番 /stay/article)のデータの読み込みと絞り込み(サーバー専用)。search/data.ts(探す)と同じ作り・同じ引数名を写して、
 * 一覧に出す宿を「紹介記事と実物の写真のある宿」だけにし、リンクの土台を /stay/article にしたもの(search/ のファイルは書き換えていない)。
 *
 * URL の引数(探すと同じ名前):
 *   kind=宿の種類のスラッグ(複数可: kind=hotel&kind=ryokan。種類の中は「どれか」)
 *   region=地方のスラッグ(hokkaido・tohoku・kanto・koshinetsu・hokuriku・tokai・kansai・chugoku・shikoku・kyushu・okinawa)
 *   pref=都道府県のスラッグ(指定すると地方はその県の地方になる)
 *   scene=こだわり条件のスラッグ(lib/verticals/stay.ts の scenes。複数可: 全部に当てはまる宿だけ)
 *   q=文字(空白で区切った語を全部含む。宿名・住所・最寄り駅・タグ・カードに出る文言)
 *   sort=area(既定)|new   page=2 以降
 * 並べ替えは エリア順・新着順 の中立の 2 つだけ(おすすめ順・人気順・料金順は無い)。
 */

export const PAGE_SIZE = 10;

export type ListFilters = {
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

/** 記事の一覧に出す宿 = 紹介記事の見出しがあり、実物の写真のある宿(common/live.ts の loadStayArticles と同じ条件)。宿 ID の順 */
export async function loadListShops(): Promise<LiveShop[]> {
  return articleShops(await loadStayShops());
}

export function articleShops(shops: LiveShop[]): LiveShop[] {
  return shops.filter((s) => s.photo && s.article?.headline);
}

export type Facets = {
  kinds: ReturnType<typeof kindsWithShops>;
  regions: ReturnType<typeof regionsWithShops>;
  prefs: ReturnType<typeof prefsWithShops>;
  scenes: ReturnType<typeof scenesWithShops>;
};

/** 記事のある宿の中にある種類・地方・都道府県・こだわり条件(0 件のものは入れない) */
export function facetsOf(shops: LiveShop[]): Facets {
  return { kinds: kindsWithShops(shops), regions: regionsWithShops(shops), prefs: prefsWithShops(shops), scenes: scenesWithShops(shops) };
}

/** URL の引数 → データにある値だけの ListFilters(データにない種類・地方・県・条件は捨てる) */
export function parseFilters(sp: SP, f: Facets): ListFilters {
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
export function filterShops(shops: LiveShop[], f: ListFilters): LiveShop[] {
  const sceneTags = f.scenes.map((slug) => VERTICALS.stay.scenes.find((s) => s.slug === slug)?.matchTags ?? []);
  const words = norm(f.q).split(" ").filter(Boolean);
  const list = shops.filter(
    (s) =>
      (f.kinds.length === 0 || f.kinds.includes(s.kind)) &&
      (!f.region || s.region === f.region) &&
      (!f.pref || s.pref === f.pref) &&
      sceneTags.every((tags) => tags.some((t) => s.tags.includes(t))) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.address} ${s.area} ${s.station} ${s.kindName} ${s.tags.join(" ")} ${cardCopyText(s)}`).includes(w))),
  );
  return sortShops(list, f.sort);
}

/** 記事の一覧の URL(空の項目は付けない。種類・こだわりは繰り返し) */
export function listHref(f: Partial<ListFilters>, hash = ""): string {
  const base = syLinks("live").articles;
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

/** 「長野県・ホテル・温泉」のような、今の絞り込みの言い方(無ければ空) */
export function scopeOf(f: ListFilters, facets: Facets): string {
  const pref = facets.prefs.find((p) => p.slug === f.pref)?.name;
  const region = !f.pref ? facets.regions.find((r) => r.slug === f.region)?.name : "";
  const kinds = f.kinds.map((k) => facets.kinds.find((x) => x.slug === k)?.name).filter(Boolean) as string[];
  const scenes = f.scenes.map((s) => facets.scenes.find((x) => x.slug === s)?.name).filter(Boolean) as string[];
  return [pref ?? region, kinds.join("・"), scenes.join("・"), f.q ? `「${f.q}」` : ""].filter(Boolean).join("・");
}

/** 宿の種類のスラッグ → 英字のラベル(カードの HOTEL / RYOKAN …)。本体は common/live.ts(3 か所で同じ物を使う) */
export { KIND_EN };
