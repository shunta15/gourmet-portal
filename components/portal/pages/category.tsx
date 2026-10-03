/**
 * 種類ページ（全国）の共通部品。/{v}/{category}
 * 各業種の app/{v}/[category]/page.tsx は categoryPage(key) の結果をそのまま出すだけ。
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { fillTitle } from "@/lib/seo/util";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { loadVertical, notFoundMetadata, pick, type PortalVertical } from "./data";
import { PageFrame, Listing, CategoryLinks, SceneLinks, PrefLinks, baseCrumbs, toneOf } from "./frame";

type Props = { params: Promise<{ category: string }> };

export function categoryPage(key: PortalVertical) {
  return {
    generateStaticParams() {
      return getVertical(key).categories.map((c) => ({ category: c.slug }));
    },

    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { category } = await params;
      const { v, all } = await loadVertical(key);
      const cat = getCategory(v, category);
      if (!cat) return notFoundMetadata();
      const count = pick(all, { category }).length;
      return buildMetadata({
        vertical: key,
        title: fillTitle(v.titleTemplates.area, { area: "全国", category: cat.name, count, brand: v.brand }),
        description: `全国の${cat.name}の店を、エリアから探せます。`,
        path: `${v.path}/${category}`,
        count,
      });
    },

    async Page({ params }: Props) {
      const { category } = await params;
      const { v, all } = await loadVertical(key);
      const cat = getCategory(v, category);
      if (!cat) notFound();
      const places = pick(all, { category });
      return (
        <PageFrame
          tone={toneOf(v)}
          crumbs={[...baseCrumbs(v), { name: cat.name, href: `${v.path}/${category}` }]}
          kicker={`Machinowa — ${VERTICAL_FACE[key].en} / Category`}
          heading={`全国の${cat.name}`}
          lead={`全国の${cat.name}の店を、エリアから探せます。`}
          count={places.length}
        >
          <Listing
            v={v}
            places={places}
            emptyNote={`${cat.name}の掲載は、まだありません（現在 0 件）。掲載できる店が確認でき次第、ここに並びます。`}
          />
          <PrefLinks
            title={`${cat.name}をエリアから探す`}
            countOf={(p) => pick(all, { category, pref: p }).length}
            hrefOf={(p) => `${v.path}/${category}/${p}`}
          />
          <CategoryLinks v={v} title="ほかの種類" all={all} hrefOf={(c) => `${v.path}/${c}`} exclude={category} />
          <SceneLinks v={v} title="利用シーンから探す" />
        </PageFrame>
      );
    },
  };
}
