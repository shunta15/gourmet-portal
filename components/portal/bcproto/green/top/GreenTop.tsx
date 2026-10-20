import { PREFECTURES } from "@/lib/areas/prefectures";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { pickShops } from "@/lib/portal/vert/korogashi/data";
import { greenFacets, loadGreenShops, pickGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import type { GreenShop } from "@/lib/portal/vert/bodygreen/types";
import { IMG, searchHref } from "../common/site";
import TopPage, { type TopArea, type TopData } from "./TopPage";

/** 見本の写真の札の 5 都府県(店がある所だけ出す)。写真は見本から切り出した業種の飾り */
const AREA_CARDS: Array<{ slug: string; label: string; en: string; img: string }> = [
  { slug: "tokyo", label: "東京", en: "Tokyo", img: "area1" },
  { slug: "kanagawa", label: "神奈川", en: "Kanagawa", img: "area2" },
  { slug: "osaka", label: "大阪", en: "Osaka", img: "area3" },
  { slug: "kyoto", label: "京都", en: "Kyoto", img: "area4" },
  { slug: "fukuoka", label: "福岡", en: "Fukuoka", img: "area5" },
];

/**
 * 最初のページ(/bodycare)の「案4(緑)」。app/bodycare/(top)/page.tsx が BODYCARE_DESIGN === "green" のときに出す。
 * 店・件数は本番のデータ(loadGreenShops)から数える。星・点数・口コミ・料金・順位は出さない(データに無い)。
 * 節の飛び先: ヘッダー・フッターが /bodycare#gr-kind・#gr-area・#gr-tag に飛ぶ(各節に id を付けてある)。
 */
export default async function GreenTop() {
  const [shops, places] = await Promise.all([loadGreenShops(), getGeneratedPlaces("bodycare")]);
  const facets = greenFacets(shops);

  // 掲載中の店 = 下の段の店(SHOP_PICKS。写真は分類済みの 1 枚)の先頭 5 店。並びは順位ではない
  const picked = pickShops(places).slice(0, 5);
  const picks: GreenShop[] = pickGreenShops(
    shops,
    picked.map((p) => p.id),
  ).map((s) => {
    const k = picked.find((p) => p.id === s.id);
    return k ? { ...s, photo: { src: k.photo, alt: `${k.name} — ${k.what}`, w: k.width, h: k.height } } : s;
  });

  const order = new Map(PREFECTURES.map((p, i) => [p.slug, i]));
  const byCode = <T extends { slug: string }>(a: T[]) => [...a].sort((x, y) => (order.get(x.slug) ?? 99) - (order.get(y.slug) ?? 99));
  const prefCount = new Map(facets.prefs.map((p) => [p.slug, p]));

  const areas: TopArea[] = AREA_CARDS.filter((a) => (prefCount.get(a.slug)?.count ?? 0) > 0).map((a) => ({
    slug: a.slug,
    label: a.label,
    en: a.en,
    count: prefCount.get(a.slug)?.count ?? 0,
    img: `${IMG}/top/${a.img}.webp`,
  }));
  const inCards = new Set(areas.map((a) => a.slug));

  const data: TopData = {
    total: facets.total,
    prefTotal: facets.prefs.length,
    leadA: `${facets.kinds.map((k) => k.name).join("、")}の店を、`,
    leadB: "エリア・種類・こだわりから探せる入口です。",
    kinds: facets.kinds,
    tags: facets.tags,
    prefOptions: byCode(facets.prefs).map((p) => ({ slug: p.slug, name: p.name, count: p.count })),
    areas,
    morePrefs: byCode(facets.prefs)
      .filter((p) => !inCards.has(p.slug))
      .map((p) => ({ slug: p.slug, short: p.short, count: p.count, href: searchHref({ pref: p.slug }) })),
    picks,
  };
  return <TopPage d={data} />;
}
