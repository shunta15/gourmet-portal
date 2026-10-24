import "server-only";
import { getPlaces } from "@/lib/places";
import type { Place } from "@/lib/places/types";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { loadSpecials as loadSpecialList } from "@/components/portal/vkit/special/data";
import { SPL } from "./links";

/**
 * スポーツ(マチノワスポーツ。見本2)の最初のページ・探すページが出す実データ(サーバー専用)。
 * 店は getPlaces("sports")(lib/places/generated/sports.json)、写真は店の実写(public/_portal/vshops/)だけ。
 * 特集は lib/specials/sports.json(/sports/special/<slug>)。店の事実(営業時間・設備など)は新しく作らない。
 */

/** 最初のページ・探すページの「種類」の札(見本は 3 つ。画像の切り出しも 3 つ分) */
export const KINDS = [
  { slug: "gym", name: "ジム・フィットネス", en: "GYM & FITNESS" },
  { slug: "martial-arts", name: "格闘技・武道", en: "MARTIAL ARTS" },
  { slug: "golf", name: "ゴルフ", en: "GOLF" },
] as const;

const KIND_EN: Record<string, string> = { gym: "GYM & FITNESS", "martial-arts": "MARTIAL ARTS", golf: "GOLF", "yoga-pilates": "YOGA & PILATES", dance: "DANCE", "facility-goods": "FACILITY & GOODS" };

/**
 * 探すの「設備・特徴」(見本の 5 項目)。店の紹介記事(Place.article の導入・節)に、その語を使った文があり、打ち消しの文でない店だけが当てはまる。
 * 見本の「女性専用エリアあり」は、記事で言えるのが「女性専用のスタジオ・ロッカー・シャワー室」なので「女性専用の設備あり」に、
 * 「スタジオプログラム」は、記事にプログラムの記述が無く「スタジオがある」ことだけが言えるので「スタジオあり」に替えた。
 */
export const FEATURES = [
  { key: "parking", label: "駐車場あり", re: /駐車場/ },
  { key: "women", label: "女性専用の設備あり", re: /女性専用|女性だけが使える/ },
  { key: "personal", label: "パーソナルトレーニング", re: /パーソナルトレーニング/ },
  { key: "studio", label: "スタジオあり", re: /スタジオ/ },
  { key: "shower", label: "シャワーあり", re: /シャワー/ },
] as const;
export type FeatKey = (typeof FEATURES)[number]["key"];

const NEG = /ありません|ございません|設けていません|備えていません|用意していません/;

function featsOf(p: Place): FeatKey[] {
  const a = p.article;
  if (!a) return [];
  const text = [a.lede, ...(a.sections ?? []).map((s) => s.body)].join("\n");
  const sents = text.split(/(?<=。)/);
  return FEATURES.filter((f) => sents.some((s) => f.re.test(s) && !NEG.test(s))).map((f) => f.key);
}

export type SShop = {
  id: string;
  name: string;
  kind: string;
  kindSlug: string;
  kindEn: string;
  city: string;
  /** 「名古屋市西区」→「名古屋市」(最初のページの地名の札) */
  cityBase: string;
  loc: string;
  pref: string;
  prefName: string;
  address: string;
  /** 写真(店の実写。無ければ空) */
  photo: string;
  /** 写真の切り出し位置(CSS object-position) */
  pos: string;
  href: string;
  feats: FeatKey[];
};

export type SSpecial = { slug: string; title: string; href: string };

/** 見本の写真の切り出し位置(店ごと)。ほかの店は中央 */
const POS: Record<string, string> = { sp0001: "50% 45%", sp0002: "50% 40%", sp0003: "50% 40%" };

export const prefNameOf = (slug: string) => PREFECTURES.find((x) => x.slug === slug)?.name ?? "";

export async function loadShops(): Promise<SShop[]> {
  const places = await getPlaces("sports");
  const cats = VERTICALS.sports.categories;
  return places.map((p) => {
    const prefName = prefNameOf(p.pref);
    const city = p.cityName ?? "";
    return {
      id: p.id,
      name: p.name,
      kindSlug: p.category,
      kind: cats.find((c) => c.slug === p.category)?.name ?? p.category,
      kindEn: KIND_EN[p.category] ?? "",
      city,
      cityBase: city.replace(/^(.+?市).+区$/, "$1"),
      loc: `${prefName}${city}`,
      pref: p.pref,
      prefName,
      address: p.address,
      photo: p.image ?? p.photos?.[0]?.path ?? "",
      pos: POS[p.id] ?? "50% 50%",
      href: SPL.shop(p.id),
      feats: featsOf(p),
    };
  });
}

/** 特集の記事(lib/specials/sports.json の並びのまま) */
export function loadSpecials(): SSpecial[] {
  return loadSpecialList({ key: "sports" }).map((s) => ({ slug: s.slug, title: s.title, href: SPL.specialArticle(s.slug) }));
}

// ------------------------------------------------------------------ 探す
type SP = Record<string, string | string[] | undefined>;
const many = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const norm = (s: string) => s.normalize("NFKC").toLowerCase();

/** 探すの条件(URL の引数 = kind(複数可)・pref・city・feat(複数可。全部に当てはまる店)・q・page。データにある値だけ) */
export type SearchArgs = { kinds: string[]; pref: string; city: string; feats: FeatKey[]; q: string; page: number };

/** 探すの 1 ページの店の数。見本の組み(左に大きな札 1 枚・右に地図の小窓と小さな札 2 枚)をそのまま 1 ページにするので 3 */
export const SEARCH_PAGE_SIZE = 3;

export function parseArgs(sp: SP, shops: SShop[]): SearchArgs {
  const kindOk = new Set(shops.map((s) => s.kindSlug));
  const prefRaw = one(sp.pref);
  const pref = shops.some((s) => s.pref === prefRaw) ? prefRaw : "";
  const cityRaw = one(sp.city);
  const city = shops.some((s) => s.city === cityRaw && (!pref || s.pref === pref)) ? cityRaw : "";
  const featOk = new Set<string>(FEATURES.map((f) => f.key));
  return {
    kinds: [...new Set(many(sp.kind).filter((k) => kindOk.has(k)))],
    pref,
    city,
    feats: [...new Set(many(sp.feat).filter((f) => featOk.has(f)))] as FeatKey[],
    q: one(sp.q).replace(/\s+/g, " ").trim().slice(0, 40),
    page: Math.min(Math.max(parseInt(one(sp.page)) || 1, 1), 500),
  };
}

/** 絞り込む。種類は「どれか」・設備・特徴は「全部」・q は空白で区切った語を全部含む(店名・所在地・住所・種類) */
export function filterShops(shops: SShop[], a: SearchArgs): SShop[] {
  const words = norm(a.q).split(" ").filter(Boolean);
  return shops.filter(
    (s) =>
      (a.kinds.length === 0 || a.kinds.includes(s.kindSlug)) &&
      (!a.pref || s.pref === a.pref) &&
      (!a.city || s.city === a.city) &&
      a.feats.every((f) => s.feats.includes(f)) &&
      (words.length === 0 || words.every((w) => norm(`${s.name} ${s.loc} ${s.address} ${s.kind}`).includes(w))),
  );
}
