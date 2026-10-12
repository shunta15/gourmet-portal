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
import { cleanLine, cleanParagraphs, firstSentence, lineOk } from "./text";
import type { CpFeature, CpPhoto, CpShop } from "./types";

const PREF_BY_SLUG = new Map(PREFECTURES.map((p) => [p.slug, p]));

/**
 * 顔がはっきり写る写真・質の低い写真を、店の写真として出さないか(試作では true。ビューティーの 12 枚が対象)。
 * 2026-10-13 のオーナー指示(「人が映るのしょうがないだろ」・公開の指示)で false: データにある写真は、使えないもの(lib/portal/photoRules の isUsableImage。
 * 表示禁止リスト lib/imageBlocklist.ts を含む)を除いてすべて出す。個別に外すと決めた写真の一覧は、ビューティーの店写真には見つからなかった。
 */
export const AVOID_CLEAR_FACES = false;

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
    tags: p.tags ?? [],
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

/** 特集記事の 1 つのポイント(見出し・向く人・本文・要点) */
export type CpPoint = { name: string; purpose: string; body: string[]; specs: { k: string; v: string }[] };
/** 特集記事(その店の ID と完全に一致する特集だけ)。店のページの紹介文の所に出す */
export type CpStory = { kicker: string; title: string; subtitle: string; lede: string[]; points: CpPoint[]; quote: string; quoteCite: string; closing: string[] };

/** 店のページ用の詳細(実在のデータだけ。メニューは名前だけ・料金は含めない) */
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
  /** 短い紹介(特集記事のある店では使わない) */
  lede: string[];
  sections: { heading: string; body: string[] }[];
  story?: CpStory;
  menus: { name: string; minutes?: number }[];
  sources: { label: string; url: string }[];
  checkedAt?: string;
};

export async function loadDetail(site: CpSite, id: string): Promise<{ detail: CpDetail; sameArea: CpShop[]; sameKind: CpShop[]; total: number } | null> {
  const places = await getGeneratedPlaces(site.key);
  const p = places.find((x) => x.id === id);
  if (!p) return null;
  const strict = site.strict;
  const shop = toShop(site, p);
  // 店と特集記事の対応は ID の完全一致(placeId === p.id)
  const feat = (await getGeneratedFeatures(site.key)).find((f) => f.placeId === p.id);

  // 写真: 店のデータの写真(使えるもの)。特集記事のある店は、その特集の写真(ヒーロー・各ポイント)も同じ店の写真として足す(重なりは除く)
  let list = photoList(p);
  let photos = ordered(list).map((x) => toPhoto(p, x));
  if (feat) {
    const have = new Set(photos.map((x) => x.src));
    const extraSrc = [feat.article.heroImage, ...feat.article.ranking.flatMap((r) => r.images)].filter((x, i, a) => !!x && a.indexOf(x) === i);
    const extra: CpPhoto[] = extraSrc
      .filter((src) => isUsableImage(src) && !have.has(src) && !(AVOID_CLEAR_FACES && (PHOTO_META[src]?.[0] ?? 3) < 2) && !(AVOID_CLEAR_FACES && (PHOTO_META[src]?.[1] ?? 0) >= 2))
      .map((src) => ({ src, alt: feat.photos[src]?.alt ?? `${p.name} — 店の写真`, w: feat.photos[src]?.w, h: feat.photos[src]?.h }));
    photos = [...photos, ...extra];
    // 特集のヒーロー画像があれば先頭に
    const hero = photos.find((x) => x.src === feat.article.heroImage);
    if (hero) photos = [hero, ...photos.filter((x) => x !== hero)];
    list = [];
  }

  const story: CpStory | undefined = feat
    ? {
        kicker: feat.article.kicker,
        title: feat.article.title,
        subtitle: feat.article.subtitle,
        lede: cleanParagraphs(feat.article.lede, strict),
        points: feat.article.ranking
          .map((r) => ({
            name: r.name,
            purpose: cleanLine(r.purpose, strict),
            body: cleanParagraphs(r.desc, strict),
            specs: r.specs.filter((sp) => lineOk(`${sp.k}${sp.v}`, strict)),
          }))
          .filter((r) => r.body.length > 0 && cleanLine(r.name, strict)),
        quote: cleanLine(feat.article.quote, strict),
        quoteCite: feat.article.quoteCite ?? "",
        closing: cleanParagraphs(feat.article.closing, strict),
      }
    : undefined;

  const detail: CpDetail = {
    place: p,
    shop: { ...shop, main: photos[0] ?? null, subs: photos.slice(1, 4) },
    nameKana: p.nameKana,
    photos,
    hours: p.hours ? p.hours.split(" / ") : [],
    holidays: p.holidays,
    phone: p.phone,
    station: p.station,
    headline: cleanLine(p.article?.headline, strict),
    lede: story ? [] : cleanParagraphs(p.article?.lede ?? p.intro, strict),
    sections: story
      ? []
      : (p.article?.sections ?? [])
          .map((s) => ({ heading: s.heading, body: cleanParagraphs(s.body, strict) }))
          .filter((s) => s.body.length > 0 && cleanLine(s.heading, strict)),
    story,
    menus: (p.article?.menus ?? []).filter((m) => lineOk(m.name, strict)).map((m) => ({ name: m.name, minutes: m.minutes })),
    sources: p.article?.sources ?? [],
    checkedAt: p.article?.checkedAt,
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
