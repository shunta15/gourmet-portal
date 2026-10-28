import "server-only";
import { getPlaces } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import { loadSpecials } from "@/components/portal/vkit/special/data";
import { locOf } from "../shop/data";
import { SHOP_COPY } from "../shop/copy";
import { LFL } from "../../links";

export type Photo = { src: string; alt: string; pos: string };
export type SpShop = { id: string; name: string; kindName: string; area: string; blurb: string; photo: Photo; href: string };
export type SpCard = { slug: string; title: string; lead: string; href: string };
export type SpecialView = {
  /** 特集 1〜3(lib/specials/life.json の並びのまま) */
  cards: SpCard[];
  /** 特集 1 の小さな 3 枚(習い事・神社・工芸): 種類と、その店の実写 */
  tiles: Array<{ label: string; sub: string; photo: Photo }>;
  shops: SpShop[];
};

/** 特集の一覧(見本「特集」)。特集は lib/specials/life.json の先頭 3 本、店は実在の 4 店。写真は店の実写だけ */
export async function loadSpecialView(): Promise<SpecialView> {
  const places = await getPlaces("life");
  const cats = VERTICALS.life.categories;
  const CARD: Record<string, number> = { li0002: 4, li0003: 1, li0004: 4 };
  const photoOf = (i: number, n?: number): Photo => {
    const p = places[i] ?? places[0];
    const f = p.photos?.[n ?? CARD[p.id] ?? 0] ?? p.photos?.[0];
    return { src: f?.path ?? p.image ?? "", alt: `${p.name}${f?.what ? ` — ${f.what}` : ""}`, pos: "50% 50%" };
  };
  // 見本の並び: 白金陶芸教室・藤森神社・中島清吉商店・サンフォトタカハシ
  const ORDER = ["li0002", "li0001", "li0004", "li0003"];
  const idx = (id: string) => Math.max(0, places.findIndex((p) => p.id === id));
  const shops: SpShop[] = ORDER.map((id) => places[idx(id)]).filter(Boolean).map((p) => ({
    id: p.id,
    name: p.name,
    kindName: p.kindName || (cats.find((c) => c.slug === p.category)?.name ?? ""),
    area: locOf(p),
    blurb: SHOP_COPY[p.id]?.blurb ?? "",
    photo: photoOf(places.indexOf(p)),
    href: LFL.shop(p.id),
  }));
  const specials = loadSpecials({ key: "life" });
  const cards: SpCard[] = specials.slice(0, 3).map((s) => ({ slug: s.slug, title: s.title, lead: s.lead, href: LFL.specialArticle(s.slug) }));
  const tiles = [
    { label: "習う", sub: "新しい自分に出会う", photo: photoOf(idx("li0002"), 4) },
    { label: "出かける", sub: "心しずまる場所", photo: photoOf(idx("li0001"), 0) },
    { label: "買う・借りる", sub: "暮らしに息づく手仕事", photo: photoOf(idx("li0004"), 3) },
  ];
  return { cards, tiles, shops };
}
