/**
 * これまでの種類ページ・エリアページ(/{v}/{種類}・/{v}/{種類}/{県}・/{v}/area/{県})から、さがす(/{v}/search)の該当の絞り込みへの恒久の転送(308)。
 * COLOR PLAY のとき(lib/portal/verticalDesign.ts)だけ転送する。"legacy" のあいだは、元のページをそのまま出す。
 * 転送先の件数は、元のページの件数と同じ(種類・県は同じデータを同じ条件で数える)。知らない種類・県は、元のページと同じく 404。
 */
import { notFound, permanentRedirect } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getCategory, getVertical } from "@/lib/verticals";
import { CP_SITES } from "@/lib/portal/colorplay/site";
import { searchHref, shopHref } from "@/lib/portal/colorplay/search";
import { findFeature } from "@/lib/places/features";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import StubPage from "@/components/portal/pages/stub";
import { isColorplay } from "@/lib/portal/verticalDesign";

type CpVerticalKey = keyof typeof CP_SITES;

type Legacy<P> = {
  generateStaticParams: () => Promise<P[]> | P[];
  generateMetadata: (props: { params: Promise<P> }) => Promise<import("next").Metadata>;
  Page: (props: { params: Promise<P> }) => Promise<React.JSX.Element> | React.JSX.Element;
};

/** /{v}/{category} */
export function categoryRedirectPage<P extends { category: string }>(key: CpVerticalKey, legacy: Legacy<P>) {
  const site = CP_SITES[key];
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (isColorplay(key)) {
        const { category } = await props.params;
        if (!getCategory(getVertical(key), category)) notFound();
        permanentRedirect(searchHref(site, { kind: category }));
      }
      return legacy.Page(props);
    },
  };
}

/** /{v}/{category}/{pref} */
export function categoryAreaRedirectPage<P extends { category: string; pref: string }>(key: CpVerticalKey, legacy: Legacy<P>) {
  const site = CP_SITES[key];
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (isColorplay(key)) {
        const { category, pref } = await props.params;
        if (!getCategory(getVertical(key), category) || !getPrefBySlug(pref)) notFound();
        permanentRedirect(searchHref(site, { kind: category, pref }));
      }
      return legacy.Page(props);
    },
  };
}

/** /{v}/area/{pref} */
export function areaRedirectPage<P extends { pref: string }>(key: CpVerticalKey, legacy: Legacy<P>) {
  const site = CP_SITES[key];
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (isColorplay(key)) {
        const { pref } = await props.params;
        if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
        permanentRedirect(searchHref(site, { pref }));
      }
      return legacy.Page(props);
    },
  };
}

/** /{v}/feature/{id}: 特集記事は店のページと一緒(1 店 1 ページ)なので、その店のページへ恒久の転送。店との対応は特集の placeId と店 ID の完全一致 */
export function featureRedirectPage<P extends { id: string }>(key: CpVerticalKey, legacy: Legacy<P>) {
  const site = CP_SITES[key];
  const decode = (x: string) => {
    try {
      return decodeURIComponent(x);
    } catch {
      return x;
    }
  };
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (isColorplay(key)) {
        const { id } = await props.params;
        const f = await findFeature(key, decode(id));
        if (!f || !f.placeId) notFound();
        permanentRedirect(shopHref(site, f.placeId));
      }
      return legacy.Page(props);
    },
  };
}

/**
 * /{v}/{category}/{pref}/{city} と /{v}/area/{pref}/{city}: これまでは常に 404(市区町村のデータが無かった)。「さがす」には市区町村の絞り込みが無いので、
 * COLOR PLAY のあいだは都道府県までで絞った状態(種類つき/エリアだけ)へ転送する。"legacy" なら今までどおり 404。
 */
export function categoryCityRedirectPage(key: CpVerticalKey) {
  const site = CP_SITES[key];
  return async function Page(props: { params: Promise<{ category: string; pref: string; city: string }> }) {
    if (isColorplay(key)) {
      const { category, pref } = await props.params;
      if (!getCategory(getVertical(key), category) || !getPrefBySlug(pref)) notFound();
      permanentRedirect(searchHref(site, { kind: category, pref }));
    }
    return StubPage();
  };
}

export function areaCityRedirectPage(key: CpVerticalKey) {
  const site = CP_SITES[key];
  return async function Page(props: { params: Promise<{ pref: string; city: string }> }) {
    if (isColorplay(key)) {
      const { pref } = await props.params;
      if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
      permanentRedirect(searchHref(site, { pref }));
    }
    return StubPage();
  };
}

/** /{v}/scene/{slug}: 利用シーンは「さがす」の「こだわり」(店のタグ)の絞り込みへ。対応するタグがデータに無いシーンは /{v}/search へ */
export function sceneRedirectPage<P extends { slug: string }>(key: CpVerticalKey, legacy: Legacy<P>) {
  const site = CP_SITES[key];
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      if (isColorplay(key)) {
        const { slug } = await props.params;
        const scene = getVertical(key).scenes.find((s) => s.slug === slug);
        if (!scene) notFound();
        const places = await getGeneratedPlaces(key);
        const tag = scene.matchTags.find((t) => places.some((p) => p.tags.includes(t)));
        permanentRedirect(searchHref(site, tag ? { tag } : {}));
      }
      return legacy.Page(props);
    },
  };
}
