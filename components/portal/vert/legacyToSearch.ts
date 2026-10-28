/**
 * 業種の「これまでの種類・県×種類・エリア・利用シーンのページ」から、探す(/{v}/search)の絞り込みへの恒久の転送(308)と、サイトマップの付け替え。
 * 業種のページは 4 種類(最初・店舗紹介・探す・記事)にまとめる(2026-10-23 オーナー決定)。ペット・ステイが使う。
 * ボディケアの components/portal/vert/bodyshop/redirects.ts と同じ作り(ページを消さずに、元のページと同じ「知らない種類・県は 404」を保って転送する)を、探すの URL の作り方だけ受け取る形にしたもの。
 *   /{v}/{category}                  → 探す?kind=
 *   /{v}/{category}/{pref}           → 探す?kind=&pref=
 *   /{v}/{category}/{pref}/{city}    → 探す?kind=&pref=(市区町村の絞り込みは探すに無いので県まで。これまでは常に 404)
 *   /{v}/area/{pref}                 → 探す?pref=
 *   /{v}/area/{pref}/{city}          → 探す?pref=(同上)
 *   /{v}/scene/{slug}                → その利用シーンに当てはまる店がある業種は探すの絞り込み、無ければ探す(知らないシーンは 404)
 * 転送先の件数は、元のページの件数と同じ(同じデータを同じ条件で数える)。
 */
import { use } from "react";
import type { MetadataRoute } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getCategory, getVertical } from "@/lib/verticals";
import { getPlaces } from "@/lib/places";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { pick, type PortalVertical } from "@/components/portal/pages/data";

export type LegacyTarget = {
  /** 探すの URL(種類・都道府県だけの絞り込み。空の項目は付けない) */
  href: (f: { kind?: string; pref?: string }) => string;
  /** 利用シーン → 探すの URL。そのシーンに当てはまる店が無ければ絞り込みなし。知らないシーンは null(404) */
  scene: (slug: string) => Promise<string | null>;
};

type Legacy<P> = {
  generateStaticParams: () => Promise<P[]> | P[];
  generateMetadata: (props: { params: Promise<P> }) => Promise<import("next").Metadata>;
};

export function legacyToSearch(key: PortalVertical, t: LegacyTarget) {
  const vertical = () => getVertical(key);
  return {
    /** /{v}/{category} */
    categoryRedirectPage<P extends { category: string }>(legacy: Legacy<P>) {
      return {
        generateStaticParams: legacy.generateStaticParams,
        generateMetadata: legacy.generateMetadata,
        async Page(props: { params: Promise<P> }) {
          const { category } = await props.params;
          if (!getCategory(vertical(), category)) notFound();
          permanentRedirect(t.href({ kind: category }));
        },
      };
    },

    /** /{v}/{category}/{pref} */
    categoryAreaRedirectPage<P extends { category: string; pref: string }>(legacy: Legacy<P>) {
      return {
        generateStaticParams: legacy.generateStaticParams,
        generateMetadata: legacy.generateMetadata,
        async Page(props: { params: Promise<P> }) {
          const { category, pref } = await props.params;
          if (!getCategory(vertical(), category) || !getPrefBySlug(pref)) notFound();
          permanentRedirect(t.href({ kind: category, pref }));
        },
      };
    },

    /** /{v}/area/{pref} */
    areaRedirectPage<P extends { pref: string }>(legacy: Legacy<P>) {
      return {
        generateStaticParams: legacy.generateStaticParams,
        generateMetadata: legacy.generateMetadata,
        async Page(props: { params: Promise<P> }) {
          const { pref } = await props.params;
          if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
          permanentRedirect(t.href({ pref }));
        },
      };
    },

    /** /{v}/{category}/{pref}/{city}: これまでは常に 404。探すに市区町村の絞り込みは無いので、都道府県までで絞った状態へ */
    categoryCityRedirectPage() {
      return function Page(props: { params: Promise<{ category: string; pref: string; city: string }> }) {
        const { category, pref } = use(props.params);
        if (!getCategory(vertical(), category) || !getPrefBySlug(pref)) notFound();
        permanentRedirect(t.href({ kind: category, pref }));
      };
    },

    /** /{v}/area/{pref}/{city}: 同上 */
    areaCityRedirectPage() {
      return function Page(props: { params: Promise<{ pref: string; city: string }> }) {
        const { pref } = use(props.params);
        if (!PREFECTURES.some((p) => p.slug === pref)) notFound();
        permanentRedirect(t.href({ pref }));
      };
    },

    /** /{v}/scene/{slug} */
    sceneRedirectPage<P extends { slug: string }>(legacy: Legacy<P>) {
      return {
        generateStaticParams: legacy.generateStaticParams,
        generateMetadata: legacy.generateMetadata,
        async Page(props: { params: Promise<P> }) {
          const { slug } = await props.params;
          const to = await t.scene(slug);
          if (to === null) notFound();
          permanentRedirect(to);
        },
      };
    },
  };
}

/**
 * サイトマップの付け替え。共通のサイトマップ(components/portal/pages/sitemap.ts の verticalSitemap)が出す旧ページの URL
 * (エリア・種類・種類×県・利用シーン)を取り除き、転送先の探すの絞り込み URL(種類・県だけ。件数は同じ gate)に替える。
 * 利用シーンは、転送先が こだわり(index しない絞り込み)なので、載せない。共通のサイトマップ自体は触らない(ほかの業種に影響しない)。
 * 探すの URL は、探すページ自身の canonical(種類 1 つ・県 1 つだけ)と同じ形。
 */
export async function searchFormSitemap(
  key: PortalVertical,
  base: MetadataRoute.Sitemap,
  hrefOf: LegacyTarget["href"],
  /** 探すの種類が category でなく「組」のとき(くらし。lib/verticals/lifeKinds.ts)。組の slug を kind に、組に入る category の店を数える */
  groups?: ReadonlyArray<{ slug: string; categories: readonly string[] }>,
): Promise<MetadataRoute.Sitemap> {
  const v = getVertical(key);
  const all = await getPlaces(key);
  const old = new Set<string>();
  for (const p of PREFECTURES) old.add(absUrl(`${v.path}/area/${p.slug}`));
  for (const c of v.categories) {
    old.add(absUrl(`${v.path}/${c.slug}`));
    for (const p of PREFECTURES) old.add(absUrl(`${v.path}/${c.slug}/${p.slug}`));
  }
  for (const s of v.scenes) old.add(absUrl(`${v.path}/scene/${s.slug}`));
  const kept = base.filter((r) => !old.has(r.url));
  if (kept.length === base.length) return base; // 公開前など、旧ページが 1 本も載っていないとき(何も足さない)

  const add: string[] = [];
  const push = (path: string, count: number) => {
    if (isIndexable(count)) add.push(path);
  };
  for (const p of PREFECTURES) push(hrefOf({ pref: p.slug }), pick(all, { pref: p.slug }).length);
  if (groups) {
    for (const g of groups) {
      const inGroup = all.filter((x) => g.categories.includes(x.category));
      push(hrefOf({ kind: g.slug }), inGroup.length);
      for (const p of PREFECTURES) push(hrefOf({ kind: g.slug, pref: p.slug }), inGroup.filter((x) => x.pref === p.slug).length);
    }
  } else {
    for (const c of v.categories) {
      push(hrefOf({ kind: c.slug }), pick(all, { category: c.slug }).length);
      for (const p of PREFECTURES) push(hrefOf({ kind: c.slug, pref: p.slug }), pick(all, { category: c.slug, pref: p.slug }).length);
    }
  }
  // Next.js は <loc> を XML エスケープしないので、クエリの & は自分で &amp; にする(共通のサイトマップと同じ)
  const have = new Set(kept.map((r) => r.url));
  const rows = add.map((path) => ({ url: absUrl(path).replace(/&/g, "&amp;") })).filter((r) => !have.has(r.url));
  return [...kept, ...rows];
}
