/**
 * 種類×地域ページ（県）の共通部品。/{v}/{category}/{pref}
 * 各業種の app/{v}/[category]/[pref]/page.tsx は categoryAreaPage(key) の結果をそのまま出すだけ。
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getCategory, getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { fillTitle } from "@/lib/seo/util";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { loadVertical, notFoundMetadata, pick, type PortalVertical } from "./data";
import { PageFrame, Listing, CategoryLinks, SceneLinks, PrefLinks, baseCrumbs, toneOf } from "./frame";

type Props = { params: Promise<{ category: string; pref: string }> };

export function categoryAreaPage(key: PortalVertical) {
  return {
    generateStaticParams() {
      return getVertical(key).categories.flatMap((c) => PREFECTURES.map((p) => ({ category: c.slug, pref: p.slug })));
    },

    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { category, pref } = await params;
      const { v, all } = await loadVertical(key);
      const cat = getCategory(v, category);
      const area = getPrefBySlug(pref);
      if (!cat || !area) return notFoundMetadata();
      const count = pick(all, { category, pref }).length;
      return buildMetadata({
        vertical: key,
        title: fillTitle(v.titleTemplates.area, { area: area.short, category: cat.name, count, brand: v.brand }),
        description: `${area.short}の${cat.name}の店を探せます。`,
        path: `${v.path}/${category}/${pref}`,
        count,
      });
    },

    async Page({ params }: Props) {
      const { category, pref } = await params;
      const { v, all } = await loadVertical(key);
      const cat = getCategory(v, category);
      const area = getPrefBySlug(pref);
      if (!cat || !area) notFound();
      const places = pick(all, { category, pref });
      return (
        <PageFrame
          tone={toneOf(v)}
          crumbs={[
            ...baseCrumbs(v),
            { name: cat.name, href: `${v.path}/${category}` },
            { name: area.short, href: `${v.path}/${category}/${pref}` },
          ]}
          kicker={`Machinowa — ${VERTICAL_FACE[key].en} / ${cat.name}`}
          heading={`${area.short}の${cat.name}`}
          lead={`${area.short}の${cat.name}の店を探せます。`}
          count={places.length}
        >
          <Listing
            v={v}
            places={places}
            emptyNote={`${area.short}の${cat.name}の掲載は、まだありません（現在 0 件）。掲載できる店が確認でき次第、ここに並びます。`}
          />
          <CategoryLinks
            v={v}
            title={`${area.short}のほかの種類`}
            all={all}
            pref={pref}
            hrefOf={(c) => `${v.path}/${c}/${pref}`}
            exclude={category}
          />
          <PrefLinks
            title={`${cat.name}のほかのエリア`}
            countOf={(p) => pick(all, { category, pref: p }).length}
            hrefOf={(p) => `${v.path}/${category}/${p}`}
            exclude={pref}
          />
          <SceneLinks v={v} title="利用シーンから探す" />
        </PageFrame>
      );
    },
  };
}
