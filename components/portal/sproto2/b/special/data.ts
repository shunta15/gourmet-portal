import "server-only";
import { getPlaces } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import { loadSpecials } from "@/components/portal/vkit/special/data";
import { prefName } from "../shop/data";

export type Photo = { src: string; alt: string; pos: string };
export type SpShop = { id: string; name: string; kindName: string; area: string; photo: Photo; href: string };
export type SpCard = { slug: string; title: string; lead: string; href: string; photo: Photo };
export type SpecialView = {
  cards: SpCard[];
  /** 01 の小さな 2 枚(ボクシングジム・ゴルフ工房): 特集「ちがい」の節の見出しと、その店の実写 */
  tiles: Array<{ label: string; sub: string; photo: Photo }>;
  shops: SpShop[];
};

/** 特集 3 本(lib/specials/sports.json の並びのまま)と、実在の 3 店。写真は店の実写だけ。 */
export async function loadSpecialView(): Promise<SpecialView> {
  const places = await getPlaces("sports");
  const cats = VERTICALS.sports.categories;
  const ph = (placeIdx: number, n: number, pos = "50% 50%"): Photo => {
    const p = places[placeIdx] ?? places[0];
    const f = p.photos?.[n] ?? p.photos?.[0];
    return { src: f?.path ?? p.image ?? "", alt: `${p.name}${f?.what ? ` — ${f.what}` : ""}`, pos };
  };
  const shops: SpShop[] = places.slice(0, 3).map((p, i) => ({
    id: p.id,
    name: p.name,
    kindName: cats.find((c) => c.slug === p.category)?.name ?? "",
    area: `${prefName(p.pref)}${p.cityName ?? ""}`,
    photo: ph(i, 0, i === 0 ? "50% 60%" : "50% 55%"),
    href: `/proto-sports/shop/${p.id}`,
  }));
  const specials = loadSpecials({ key: "sports" });
  // 特集の写真は、その特集に出てくる店の実写(01 = ジム、02 = ボクシングジムのトレーニングルーム、03 = ボクシングジムのルームランナー)
  const picks: Array<[number, number, string]> = [[0, 0, "50% 50%"], [1, 3, "50% 50%"], [1, 4, "50% 50%"]];
  const cards: SpCard[] = specials.slice(0, 3).map((s, i) => ({
    slug: s.slug,
    title: s.title,
    lead: s.lead,
    href: `/sports/special/${s.slug}`,
    photo: ph(picks[i][0], picks[i][1], picks[i][2]),
  }));
  // 「ちがい」の記事の節見出し「格闘技・武道 ― リングとサンドバッグのあるフロア」「ゴルフ ― …」を、小さな 2 枚の札にする
  const diff = specials.find((s) => s.slug === "difference");
  const sec = (key: string) => (diff?.sections.find((x) => x.heading.startsWith(key))?.heading.split(/\s*―\s*/) ?? []) as string[];
  const box = sec("格闘技");
  const golf = sec("ゴルフ");
  const tiles = [
    { label: box[0] ?? "格闘技・武道", sub: box[1] ?? "", photo: ph(1, 1, "50% 40%") },
    { label: golf[0] ?? "ゴルフ", sub: golf[1] ?? "", photo: ph(2, 2, "50% 50%") },
  ];
  return { cards, tiles, shops };
}
