/**
 * COLOR PLAY(本番のビューティー・ボディケア)のデータ読み込み。サーバー専用(lib/places の JSON を読む。クライアントから import しない)。
 * 店の紹介文・事実は既存のデータをそのまま使う(新しい事実・数字を足さない)。店と写真の対応は ID の完全一致(Place.photos)。
 */
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { featurePath, getGeneratedFeatures } from "@/lib/places/features";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { isUsableImage } from "@/lib/portal/photoRules";
import type { Place } from "@/lib/places/types";
import type { CpSite } from "./site";
import { PHOTO_META } from "./photoMeta";
import { cleanLine, cleanParagraphs, firstSentence } from "./text";
import type { CpFeature, CpPhoto, CpShop } from "./types";

const PREF_BY_SLUG = new Map(PREFECTURES.map((p) => [p.slug, p]));

/**
 * 顔がはっきり写る写真・質の低い写真は、店の写真として出さない(試作で決めた方針。ビューティーの 12 枚)。
 * false にすると、データにある写真は(使えないものを除いて)すべて出す。
 */
export const AVOID_CLEAR_FACES = true;

type Ph = { path: string; what?: string; width?: number; height?: number; m: [number, number, number] };

function photoList(p: Place): Ph[] {
  return (p.photos ?? [])
    .filter((x) => isUsableImage(x.path))
    .map((x) => ({ path: x.path, what: x.what, width: x.width, height: x.height, m: PHOTO_META[x.path] ?? ([3, 0, 0] as [number, number, number]) }))
    .filter((x) => !AVOID_CLEAR_FACES || (x.m[0] >= 2 && x.m[1] < 2));
}

const toPhoto = (p: Place, x: Ph): CpPhoto => ({ src: x.path, alt: `${p.name} — ${x.what ?? "店の写真"}`, w: x.width, h: x.height });

/** 大きく使う 1 枚を先頭に(文字入りは後回し・質の高い順)。ほかは元の並び */
function ordered(list: Ph[]): Ph[] {
  const big = [...list].sort((a, b) => Number(b.m[0] >= 3) - Number(a.m[0] >= 3) || a.m[2] - b.m[2] || b.m[0] - a.m[0])[0];
  return big ? [big, ...list.filter((x) => x !== big)] : [];
}

function toShop(site: CpSite, p: Place): CpShop {
  const list = ordered(photoList(p));
  const kindName = site.kinds.find((k) => k.slug === p.category)?.name ?? p.category;
  return {
    id: p.id,
    name: p.name,
    kind: p.category,
    kindName,
    pref: p.pref,
    prefName: PREF_BY_SLUG.get(p.pref)?.name ?? p.pref,
    city: p.cityName ?? "",
    address: p.address,
    blurb: firstSentence(p.article?.lede ?? p.intro, site.strict),
    main: list[0] ? toPhoto(p, list[0]) : null,
    subs: list.slice(1, 4).map((x) => toPhoto(p, x)),
  };
}

export async function loadShops(site: CpSite): Promise<CpShop[]> {
  const places = await getGeneratedPlaces(site.key);
  const prefOrder = new Map(PREFECTURES.map((p, i) => [p.slug, i]));
  return places
    .map((p) => toShop(site, p))
    .sort((a, b) => (prefOrder.get(a.pref) ?? 99) - (prefOrder.get(b.pref) ?? 99) || a.id.localeCompare(b.id));
}

export async function loadFeatures(site: CpSite): Promise<CpFeature[]> {
  const feats = await getGeneratedFeatures(site.key);
  return feats.map((f) => {
    const first = Object.entries(f.photos)[0];
    return {
      id: f.id,
      title: f.article.title,
      store: f.storeName,
      href: encodeURI(featurePath(site.key, f.id)),
      photo: first ? { src: first[0], alt: first[1].alt, w: first[1].w, h: first[1].h } : null,
    };
  });
}

/** 店のページ用の詳細(実在のデータだけ。メニュー・料金は含めない) */
export type CpDetail = {
  place: Place;
  shop: CpShop;
  nameKana?: string;
  photos: CpPhoto[];
  hours: string[];
  holidays?: string;
  phone?: string;
  station?: string;
  headline: string;
  lede: string[];
  sections: { heading: string; body: string[] }[];
  feature?: { href: string; title: string };
};

export async function loadDetail(site: CpSite, id: string): Promise<{ detail: CpDetail; sameArea: CpShop[]; sameKind: CpShop[]; total: number } | null> {
  const places = await getGeneratedPlaces(site.key);
  const p = places.find((x) => x.id === id);
  if (!p) return null;
  const shop = toShop(site, p);
  const photos = ordered(photoList(p)).map((x) => toPhoto(p, x));
  const strict = site.strict;
  const feats = await getGeneratedFeatures(site.key);
  const feat = feats.find((f) => f.placeId === p.id);
  const detail: CpDetail = {
    place: p,
    shop,
    nameKana: p.nameKana,
    photos,
    hours: p.hours ? p.hours.split(" / ") : [],
    holidays: p.holidays,
    phone: p.phone,
    station: p.station,
    headline: cleanLine(p.article?.headline, strict),
    lede: cleanParagraphs(p.article?.lede ?? p.intro, strict),
    sections: (p.article?.sections ?? [])
      .map((s) => ({ heading: s.heading, body: cleanParagraphs(s.body, strict) }))
      .filter((s) => s.body.length > 0 && cleanLine(s.heading, strict)),
    feature: feat ? { href: encodeURI(featurePath(site.key, feat.id)), title: feat.article.title } : undefined,
  };
  const all = places.filter((x) => x.id !== p.id).map((x) => toShop(site, x));
  const sameArea = all
    .filter((x) => x.pref === p.pref)
    .sort((a, b) => Number(b.city === shop.city) - Number(a.city === shop.city) || a.id.localeCompare(b.id))
    .slice(0, 4);
  const sameKind = all
    .filter((x) => x.kind === p.category)
    .sort((a, b) => Number(b.pref === p.pref) - Number(a.pref === p.pref) || a.id.localeCompare(b.id))
    .filter((x) => !sameArea.some((y) => y.id === x.id))
    .slice(0, 4);
  return { detail, sameArea, sameKind, total: places.length };
}
