import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { featurePath, getGeneratedFeatures } from "@/lib/places/features";
import { PREFECTURES } from "@/lib/areas/prefectures";
import type { Place } from "@/lib/places/types";
import { PHOTO_META } from "./photoMeta";
import { KIND_SHORT, type CpFeature, type CpPhoto, type CpShop } from "./types";

// 効き目を思わせる語を含む「文」は、画面に出さない(店は残す。店名は固有名詞なので、そのまま出す)
export const EFFECT_RE = /改善|小顔|若返|美肌|ビフォー|アフター|効果|痩|やせ|治る/;
const sentences = (t: string | undefined): string[] => (t ?? "").match(/[^。]+。?/g) ?? [];
const clean = (t: string | undefined): string => sentences(t).filter((x) => !EFFECT_RE.test(x)).join("");
const PREF_BY_SLUG = new Map(PREFECTURES.map((p) => [p.slug, p]));

export const DEFAULT_SHOP = "be0031";

function firstSentence(s: string | undefined): string {
  const t = sentences(s).find((x) => !EFFECT_RE.test(x)) ?? "";
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}

function photoList(p: Place): { path: string; what?: string; m: [number, number, number] }[] {
  return (p.photos ?? [])
    .map((x) => ({ path: x.path, what: x.what, m: PHOTO_META[x.path] ?? [3, 0, 0] }))
    .filter((x) => x.m[0] >= 2);
}

function toPhoto(p: Place, x: { path: string; what?: string }): CpPhoto {
  return { src: x.path, alt: `${p.name} — ${x.what ?? "店の写真"}` };
}

function toShop(p: Place): CpShop {
  const list = photoList(p);
  // 大きく使う 1 枚: 顔がはっきり写る写真は避け、文字入りも後回し、質の高い順
  const big = list
    .filter((x) => x.m[1] < 2)
    .sort((a, b) => Number(b.m[0] >= 3) - Number(a.m[0] >= 3) || a.m[2] - b.m[2] || b.m[0] - a.m[0])[0];
  const subs = list.filter((x) => x !== big).slice(0, 3).map((x) => toPhoto(p, x));
  return {
    id: p.id,
    name: p.name,
    kind: p.category,
    kindName: KIND_SHORT[p.category] ?? p.category,
    pref: p.pref,
    prefName: PREF_BY_SLUG.get(p.pref)?.name ?? p.pref,
    city: p.cityName ?? "",
    address: p.address,
    blurb: firstSentence(p.article?.lede ?? p.intro),
    main: big ? toPhoto(p, big) : null,
    subs,
    tags: p.tags ?? [],
  };
}

export async function loadShops(): Promise<CpShop[]> {
  const places = await getGeneratedPlaces("beauty");
  const prefOrder = new Map(PREFECTURES.map((p, i) => [p.slug, i]));
  return places
    .map(toShop)
    .sort((a, b) => (prefOrder.get(a.pref) ?? 99) - (prefOrder.get(b.pref) ?? 99) || a.id.localeCompare(b.id));
}

export async function loadFeatures(): Promise<CpFeature[]> {
  const feats = await getGeneratedFeatures("beauty");
  return feats.map((f) => {
    const first = Object.entries(f.photos)[0];
    return {
      id: f.id,
      title: f.article.title,
      store: f.storeName,
      href: encodeURI(featurePath("beauty", f.id)),
      photo: first ? { src: first[0], alt: first[1].alt } : null,
    };
  });
}

/** 店のページ用の詳細(実在のデータだけ。メニュー・料金は含めない) */
export type CpDetail = {
  shop: CpShop;
  nameKana?: string;
  photos: CpPhoto[];
  hours?: string;
  holidays?: string;
  phone?: string;
  mapUrl?: string;
  headline: string;
  lede: string;
  sections: { heading: string; body: string }[];
  cta: { href: string; label: string };
};

export async function loadDetail(id: string | undefined): Promise<{ detail: CpDetail; sameArea: CpShop[]; sameKind: CpShop[] }> {
  const places = await getGeneratedPlaces("beauty");
  const p = places.find((x) => x.id === id) ?? places.find((x) => x.id === DEFAULT_SHOP)!;
  const shop = toShop(p);
  const photos = photoList(p).filter((x) => x.m[1] < 2).map((x) => toPhoto(p, x));
  const web = p.url ?? p.website;
  const cta = p.reservationUrl
    ? { href: p.reservationUrl, label: "予約ページを見る" }
    : web
      ? { href: web, label: "公式サイトを見る" }
      : { href: p.mapUrl ?? `https://www.google.com/maps/search/${encodeURIComponent(p.name + " " + p.address)}`, label: "地図で見る" };
  const detail: CpDetail = {
    shop,
    nameKana: p.nameKana,
    photos,
    hours: p.hours,
    holidays: p.holidays,
    phone: p.phone,
    mapUrl: p.mapUrl,
    headline: EFFECT_RE.test(p.article?.headline ?? "") ? "" : (p.article?.headline ?? ""),
    lede: clean(p.article?.lede ?? p.intro),
    sections: (p.article?.sections ?? [])
      .filter((s) => !EFFECT_RE.test(s.heading))
      .map((s) => ({ heading: s.heading, body: clean(s.body) }))
      .filter((s) => s.body),
    cta,
  };
  const all = places.filter((x) => x.id !== p.id).map(toShop);
  const sameArea = all
    .filter((x) => x.pref === p.pref)
    .sort((a, b) => Number(b.city === shop.city) - Number(a.city === shop.city))
    .slice(0, 4);
  const sameKind = all
    .filter((x) => x.kind === p.category)
    .sort((a, b) => Number(b.pref === p.pref) - Number(a.pref === p.pref) || a.id.localeCompare(b.id))
    .filter((x) => !sameArea.some((y) => y.id === x.id))
    .slice(0, 4);
  return { detail, sameArea, sameKind };
}
