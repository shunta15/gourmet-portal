/**
 * これまでの種類ページ・エリアページ(/{v}/{種類}・/{v}/{種類}/{県}・/{v}/area/{県})から、さがす(/{v}/search)の該当の絞り込みへの恒久の転送(308)。
 * COLOR PLAY のとき(lib/portal/verticalDesign.ts)だけ転送する。"legacy" のあいだは、元のページをそのまま出す。
 * 転送先の件数は、元のページの件数と同じ(種類・県は同じデータを同じ条件で数える)。知らない種類・県は、元のページと同じく 404。
 */
import { notFound, permanentRedirect } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getCategory, getVertical } from "@/lib/verticals";
import { CP_SITES } from "@/lib/portal/colorplay/site";
import { searchHref } from "@/lib/portal/colorplay/search";
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
