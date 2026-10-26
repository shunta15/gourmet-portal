import "server-only";
import { getPlaces } from "@/lib/places";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { REGIONS } from "@/components/portal/vkit/common/live";
import { loadSpecials as loadSpecialList } from "@/components/portal/vkit/special/data";
import { LFL } from "./links";
import { SHOP_COPY } from "./inner/shop/copy";

/**
 * くらし(マチノワライフ。オーナー決定デザイン 2026-10-26 の見本)の最初のページ・探すページが出す実データ(サーバー専用)。
 * 店は getPlaces("life")(lib/places/generated/life.json)、写真は店の実写(public/_portal/vshops/)だけ。
 * 特集は lib/specials/life.json(/life/special/<slug>)。店の事実(営業時間・設備など)は新しく作らない。
 */

/** 探すの並び(見本 3_探す の 01〜04 = ファッション・雑貨・工芸 / 習い事・教室 / 神社・寺 / 写真館・結婚相談)。順位ではなく種類の順 */
export const KIND_ORDER = ["fashion-craft", "lesson", "shrine-temple", "photo-marriage"] as const;

/** 探すの「エリアで絞り込む」(見本は 東北・関東・関西・すべてのエリア) */
export const AREA_OPTIONS = [
  { slug: "tohoku", name: "東北" },
  { slug: "kanto", name: "関東" },
  { slug: "kansai", name: "関西" },
] as const;

export type LShop = {
  id: string;
  name: string;
  kind: string;
  kindSlug: string;
  city: string;
  loc: string;
  pref: string;
  prefName: string;
  region: string;
  address: string;
  /** 店の実写(無ければ空) */
  photo: string;
  /** 写真の切り出し位置(CSS object-position) */
  pos: string;
  href: string;
  /** 探すの本文(店の紹介記事の導入の文。足さない) */
  blurb: string;
  officialUrl: string | null;
};

export type LSpecial = { slug: string; title: string; lead: string; href: string };

export const prefNameOf = (slug: string) => PREFECTURES.find((x) => x.slug === slug)?.name ?? "";
const regionOf = (pref: string) => REGIONS.find((r) => r.prefs.includes(pref))?.slug ?? "";

/** 札の写真の切り出し位置(店ごと)。ほかの店は中央 */
/** 札・種類の札に使う写真の番号(店の実写の並びの何枚目か)。ほかの店は 1 枚目 */
const CARD_PHOTO: Record<string, number> = { li0002: 4, li0003: 1, li0004: 4 };

const POS: Record<string, string> = { li0001: "50% 50%", li0002: "50% 55%", li0003: "50% 40%", li0004: "50% 50%" };

export async function loadShops(): Promise<LShop[]> {
  const places = await getPlaces("life");
  const cats = VERTICALS.life.categories;
  const rank = (k: string) => {
    const i = (KIND_ORDER as readonly string[]).indexOf(k);
    return i < 0 ? 99 : i;
  };
  return places
    .map((p) => {
      const prefName = prefNameOf(p.pref);
      return {
        id: p.id,
        name: p.name,
        kindSlug: p.category,
        kind: cats.find((c) => c.slug === p.category)?.name ?? p.category,
        city: p.cityName ?? "",
        // 東京の区は、住所の町名までを所在地にする(見本は「東京都港区白金」)
        loc: p.pref === "tokyo" ? (p.address.match(/^[^0-9０-９]+/)?.[0] ?? `${prefName}${p.cityName ?? ""}`) : `${prefName}${p.cityName ?? ""}`,
        pref: p.pref,
        prefName,
        region: regionOf(p.pref),
        address: p.address,
        photo: p.photos?.[CARD_PHOTO[p.id] ?? 0]?.path ?? p.image ?? p.photos?.[0]?.path ?? "",
        pos: POS[p.id] ?? "50% 50%",
        href: LFL.shop(p.id),
        blurb: SHOP_COPY[p.id]?.introP ?? p.article?.lede ?? "",
        officialUrl: /^https?:\/\//.test(p.website || p.url || "") ? p.website || p.url || "" : null,
      } as LShop;
    })
    .sort((a, b) => rank(a.kindSlug) - rank(b.kindSlug) || a.id.localeCompare(b.id));
}

/** 特集の記事(lib/specials/life.json の並びのまま) */
export function loadSpecials(): LSpecial[] {
  return loadSpecialList({ key: "life" }).map((s) => ({ slug: s.slug, title: s.title, lead: s.lead, href: LFL.specialArticle(s.slug) }));
}

// ------------------------------------------------------------------ 探す
type SP = Record<string, string | string[] | undefined>;
const many = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const norm = (s: string) => s.normalize("NFKC").toLowerCase();

/** 探すの条件(URL の引数 = kind(複数可)・region(複数可。all はすべて)・pref・q・page。データにある値だけ) */
export type SearchArgs = { kinds: string[]; regions: string[]; pref: string; q: string; page: number };

/** 探すの 1 ページの店の数(見本は 4 件を縦に並べる) */
export const SEARCH_PAGE_SIZE = 4;

export function parseArgs(sp: SP, shops: LShop[]): SearchArgs {
  const kindOk = new Set(shops.map((s) => s.kindSlug));
  const prefRaw = one(sp.pref);
  const pref = shops.some((s) => s.pref === prefRaw) ? prefRaw : "";
  const regOk = new Set<string>(AREA_OPTIONS.map((a) => a.slug));
  const regions = many(sp.region).includes("all") ? [] : [...new Set(many(sp.region).filter((r) => regOk.has(r)))];
  return {
    kinds: [...new Set(many(sp.kind).filter((k) => kindOk.has(k)))],
    regions,
    pref,
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    page: Math.min(Math.max(parseInt(one(sp.page)) || 1, 1), 500),
  };
}

/** 絞り込む。種類・エリアは「どれか」・q は空白で区切った語を全部含む(店名・所在地・住所・種類) */
export function filterShops(shops: LShop[], a: SearchArgs): LShop[] {
  const words = norm(a.q).split(" ").filter(Boolean);
  return shops.filter(
    (s) =>
      (a.kinds.length === 0 || a.kinds.includes(s.kindSlug)) &&
      (a.regions.length === 0 || a.regions.includes(s.region)) &&
      (!a.pref || s.pref === a.pref) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.loc} ${s.address} ${s.kind}`).includes(w))),
  );
}
