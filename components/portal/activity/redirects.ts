/**
 * アクティビティの、これまでの種類ページ・エリアページ・利用シーン(/activity/{種類}・/activity/{種類}/{県}(/{市})・/activity/area/{県}(/{市})・/activity/scene/{slug})から、
 * 探す(/activity/search)の絞り込みへの恒久の転送(308。オーナー決定 2026-10-23)。ボディケアの components/portal/vert/bodyshop/redirects.ts と同じ作りを、アクティビティ用に写したもの
 * (転送先は探すの引数 kind・pref・scene。市区町村の絞り込みは探すに無いので、市は都道府県までで絞った状態へ)。知らない種類・県・シーンは、元のページと同じく 404。
 * 特集の旧 URL(/activity/feature/{id})は、すでに店の記事のページへの転送(components/portal/vkit/article/route.ts の vkFeatureRedirectRoute)。
 * /activity/article/season・magazine・guide・{id} は、ここの対象ではない(転送しない)。
 */
import { use } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getCategory, getVertical } from "@/lib/verticals";
import { SCENES } from "./filters";
import { searchUrl } from "./links";

const KEY = "activity" as const;

type Legacy<P> = {
  generateStaticParams: () => Promise<P[]> | P[];
  generateMetadata: (props: { params: Promise<P> }) => Promise<import("next").Metadata>;
};

/** /activity/{category} */
export function categoryRedirectPage<P extends { category: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      const { category } = await props.params;
      if (!getCategory(getVertical(KEY), category)) notFound();
      permanentRedirect(searchUrl({ kind: [category] }));
    },
  };
}

/** /activity/{category}/{pref} */
export function categoryAreaRedirectPage<P extends { category: string; pref: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      const { category, pref } = await props.params;
      if (!getCategory(getVertical(KEY), category) || !getPrefBySlug(pref)) notFound();
      permanentRedirect(searchUrl({ kind: [category], pref }));
    },
  };
}

/** /activity/area/{pref} */
export function areaRedirectPage<P extends { pref: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      const { pref } = await props.params;
      if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
      permanentRedirect(searchUrl({ pref }));
    },
  };
}

/** /activity/{category}/{pref}/{city} と /activity/area/{pref}/{city}: これまでは常に 404。探すに市区町村の絞り込みは無いので、都道府県までで絞った状態へ */
export function categoryCityRedirectPage() {
  return function Page(props: { params: Promise<{ category: string; pref: string; city: string }> }) {
    const { category, pref } = use(props.params);
    if (!getCategory(getVertical(KEY), category) || !getPrefBySlug(pref)) notFound();
    permanentRedirect(searchUrl({ kind: [category], pref }));
  };
}
export function areaCityRedirectPage() {
  return function Page(props: { params: Promise<{ pref: string; city: string }> }) {
    const { pref } = use(props.params);
    if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
    permanentRedirect(searchUrl({ pref }));
  };
}

/** /activity/scene/{slug}: 利用シーンは探すの「体験スタイル」(scene)へ */
export function sceneRedirectPage<P extends { slug: string }>(legacy: Legacy<P>) {
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata,
    async Page(props: { params: Promise<P> }) {
      const { slug } = await props.params;
      if (!SCENES.some((s) => s.slug === slug)) notFound();
      permanentRedirect(searchUrl({ scene: [slug] }));
    },
  };
}
