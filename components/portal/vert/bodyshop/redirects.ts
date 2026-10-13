/**
 * ボディケアの、これまでの種類ページ・エリアページ・利用シーン・特集(/bodycare/{種類}・/bodycare/{種類}/{県}・/bodycare/area/{県}・/bodycare/scene/{slug}・/bodycare/feature/{id})から、
 * さがす(/bodycare/search)の絞り込み・店のページへの恒久の転送(308)。ビューティーの components/portal/colorplay/pages/redirects.ts を、ボディケア用に写したもの
 * (あちらは CP_SITES のキーが beauty だけで、ボディケアを渡せないため。ビューティー側は書き換えない)。
 * lib/portal/vert/bodycareStructure.ts の bodycareSearchOn() のときだけ転送する。そうでなければ、元のページをそのまま出す(本番は今のまま)。
 * 転送先の件数は、元のページの件数と同じ(同じデータを同じ条件で数える)。知らない種類・県は、元のページと同じく 404。
 */
import { use } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getCategory, getVertical } from "@/lib/verticals";
import { searchHref } from "@/lib/portal/colorplay/search";
import { BODYCARE_SITE as site } from "@/lib/portal/vert/bodysearch/site";
import { bodycareSearchOn } from "@/lib/portal/vert/bodycareStructure";
import { findFeature } from "@/lib/places/features";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import StubPage from "@/components/portal/pages/stub";

const KEY = "bodycare" as const;

type Legacy<P> = {
  generateStaticParams: () => Promise<P[]> | P[];
  generateMetadata: (props: { params: Promise<P> }) => Promise<import("next").Metadata>;
  Page: (props: { params: Promise<P> }) => Promise<React.JSX.Element> | React.JSX.Element;
};

const decode = (x: string) => {
  try {
    return decodeURIComponent(x);
  } catch {
    return x;
  }
};

/** 店のページ(さがすの結果のカードの行き先・特集の転送先) */
export const bodyShopHref = (id: string) => `/bodycare/shop/${id}`;

/** 利用シーン → さがすの「こだわり」(店のタグ)。対応するタグがデータに無いシーンは undefined */
export async function sceneTag(slug: string): Promise<string | undefined | null> {
  const scene = getVertical(KEY).scenes.find((s) => s.slug === slug);
  if (!scene) return null;
  const places = await getGeneratedPlaces(KEY);
  return scene.matchTags.find((t) => places.some((p) => p.tags.includes(t)));
}

/** /bodycare/{category} */
export function categoryRedirectPage<P extends { category: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (bodycareSearchOn()) {
        const { category } = await props.params;
        if (!getCategory(getVertical(KEY), category)) notFound();
        permanentRedirect(searchHref(site, { kind: category }));
      }
      return legacy.Page(props);
    },
  };
}

/** /bodycare/{category}/{pref} */
export function categoryAreaRedirectPage<P extends { category: string; pref: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (bodycareSearchOn()) {
        const { category, pref } = await props.params;
        if (!getCategory(getVertical(KEY), category) || !getPrefBySlug(pref)) notFound();
        permanentRedirect(searchHref(site, { kind: category, pref }));
      }
      return legacy.Page(props);
    },
  };
}

/** /bodycare/area/{pref} */
export function areaRedirectPage<P extends { pref: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (bodycareSearchOn()) {
        const { pref } = await props.params;
        if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
        permanentRedirect(searchHref(site, { pref }));
      }
      return legacy.Page(props);
    },
  };
}

/** /bodycare/feature/{id}: 特集記事は店のページと一緒(1 店 1 ページ)なので、その店のページへ。店との対応は特集の placeId と店 ID の完全一致 */
export function featureRedirectPage<P extends { id: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (bodycareSearchOn()) {
        const { id } = await props.params;
        const f = await findFeature(KEY, decode(id));
        if (!f || !f.placeId) notFound();
        permanentRedirect(bodyShopHref(f.placeId));
      }
      return legacy.Page(props);
    },
  };
}

/**
 * /bodycare/{category}/{pref}/{city} と /bodycare/area/{pref}/{city}: これまでは常に 404。さがすに市区町村の絞り込みは無いので、都道府県までで絞った状態へ。
 * そうでないとき(本番は今のまま)は、これまでの stub と同じ(同期の部品が notFound() を呼ぶ。出力も今までと同じ)。
 */
export function categoryCityRedirectPage() {
  return function Page(props: { params: Promise<{ category: string; pref: string; city: string }> }) {
    if (!bodycareSearchOn()) return StubPage();
    const { category, pref } = use(props.params);
    if (!getCategory(getVertical(KEY), category) || !getPrefBySlug(pref)) notFound();
    permanentRedirect(searchHref(site, { kind: category, pref }));
  };
}
export function areaCityRedirectPage() {
  return function Page(props: { params: Promise<{ pref: string; city: string }> }) {
    if (!bodycareSearchOn()) return StubPage();
    const { pref } = use(props.params);
    if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
    permanentRedirect(searchHref(site, { pref }));
  };
}

/** /bodycare/scene/{slug}: 利用シーンは「さがす」の「こだわり」(店のタグ)へ。対応するタグがデータに無いシーンは /bodycare/search へ */
export function sceneRedirectPage<P extends { slug: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (bodycareSearchOn()) {
        const { slug } = await props.params;
        const tag = await sceneTag(slug);
        if (tag === null) notFound();
        permanentRedirect(searchHref(site, tag ? { tag } : {}));
      }
      return legacy.Page(props);
    },
  };
}
