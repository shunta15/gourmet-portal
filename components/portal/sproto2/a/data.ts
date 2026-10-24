import "server-only";
import { getPlaces } from "@/lib/places";
import { PREFECTURES } from "@/lib/areas/prefectures";
import specials from "@/lib/specials/sports.json";

/**
 * スポーツ試作 2-A(見本どおりの再現)が出す実データ(サーバー専用)。
 * 店は実在のスポーツ 3 店(lib/places/generated/sports.json。getPlaces("sports"))、写真は店の実写(public/_portal/vshops/)だけ。
 * 特集は lib/specials/sports.json の 3 本(/sports/special/<slug>)。店の事実(営業時間・設備など)は新しく作らない。
 */
export const KINDS = [
  { slug: "gym", name: "ジム・フィットネス", en: "GYM & FITNESS" },
  { slug: "martial-arts", name: "格闘技・武道", en: "MARTIAL ARTS" },
  { slug: "golf", name: "ゴルフ", en: "GOLF" },
] as const;

export type SShop = {
  id: string;
  name: string;
  kind: string;
  kindSlug: string;
  kindEn: string;
  city: string;
  loc: string;
  pref: string;
  photo: string;
  /** 写真の切り出し位置(CSS object-position) */
  pos: string;
  href: string;
};

export type SSpecial = { slug: string; title: string; href: string };

const POS: Record<string, string> = { sp0001: "50% 45%", sp0002: "50% 40%", sp0003: "50% 40%" };

export async function loadShops(): Promise<SShop[]> {
  const places = await getPlaces("sports");
  return places.map((p) => {
    const pref = PREFECTURES.find((x) => x.slug === p.pref);
    const kind = KINDS.find((k) => k.slug === p.category);
    return {
      id: p.id,
      name: p.name,
      kindSlug: p.category,
      kind: kind?.name ?? p.category,
      kindEn: kind?.en ?? "",
      city: p.cityName ?? "",
      loc: `${pref?.name ?? ""}${p.cityName ?? ""}`,
      pref: p.pref,
      photo: p.image ?? p.photos?.[0]?.path ?? "",
      pos: POS[p.id] ?? "50% 50%",
      href: `/proto-sports/shop/${p.id}`,
    };
  });
}

/** 先頭 3 本(difference・choose・evening-saturday) */
export function loadSpecials(): SSpecial[] {
  return specials.items.slice(0, 3).map((s) => ({ slug: s.slug, title: s.title, href: `/sports/special/${s.slug}` }));
}

export const PREF_OPTIONS = PREFECTURES.map((p) => ({ slug: p.slug, name: p.name }));

export type SearchQ = { f?: string; kind?: string | string[]; pref?: string; city?: string; q?: string };

/** 絞り込み。f=1(「この条件で検索」を押した)のときだけカテゴリで絞る。エリアは都道府県と市区町村。q は店名・所在地の語 */
export function filterShops(shops: SShop[], sp: SearchQ) {
  const kinds = ([] as string[]).concat(sp.kind ?? []);
  const checked = sp.f === "1" ? kinds : [];
  let out = shops;
  if (checked.length) out = out.filter((s) => checked.includes(s.kindSlug));
  if (sp.pref) out = out.filter((s) => s.pref === sp.pref);
  if (sp.city) out = out.filter((s) => s.city === sp.city);
  const q = (sp.q ?? "").normalize("NFKC").trim().toLowerCase();
  if (q) out = out.filter((s) => `${s.name}${s.loc}${s.kind}`.normalize("NFKC").toLowerCase().includes(q));
  return { shops: out, checked };
}
