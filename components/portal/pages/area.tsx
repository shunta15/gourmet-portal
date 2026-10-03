/**
 * 地域ページ（県）の共通部品。/{v}/area/{pref}
 * 各業種の app/{v}/area/[pref]/page.tsx は areaPage(key) の結果をそのまま出すだけ。
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { fillTitle } from "@/lib/seo/util";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { loadVertical, notFoundMetadata, pick, type PortalVertical } from "./data";
import { PageFrame, Listing, CategoryLinks, SceneLinks, PrefLinks, baseCrumbs, toneOf } from "./frame";

type Props = { params: Promise<{ pref: string }> };

export function areaPage(key: PortalVertical) {
  return {
    generateStaticParams() {
      return PREFECTURES.map((p) => ({ pref: p.slug }));
    },

    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { pref } = await params;
      const area = getPrefBySlug(pref);
      if (!area) return notFoundMetadata();
      const { v, all } = await loadVertical(key);
      const count = pick(all, { pref }).length;
      return buildMetadata({
        vertical: key,
        title: fillTitle(v.titleTemplates.area, { area: area.short, category: v.name, count, brand: v.brand }),
        description: `${area.short}の${v.name}の店を、種類・利用シーンから探せます。`,
        path: `${v.path}/area/${pref}`,
        count,
      });
    },

    async Page({ params }: Props) {
      const { pref } = await params;
      const area = getPrefBySlug(pref);
      if (!area) notFound();
      const { v, all } = await loadVertical(key);
      const places = pick(all, { pref });
      return (
        <PageFrame
          tone={toneOf(v)}
          crumbs={[...baseCrumbs(v), { name: area.short, href: `${v.path}/area/${pref}` }]}
          kicker={`Machinowa — ${VERTICAL_FACE[key].en} / Area`}
          heading={`${area.short}の${v.name}`}
          lead={`${area.short}の${v.name}の店を、種類・利用シーンから探せます。`}
          count={places.length}
        >
          <Listing
            v={v}
            places={places}
            emptyNote={`${area.short}の${v.name}の掲載は、まだありません（現在 0 件）。掲載できる店が確認でき次第、ここに並びます。`}
          />
          <CategoryLinks v={v} title={`${area.short}を種類から探す`} all={all} pref={pref} hrefOf={(c) => `${v.path}/${c}/${pref}`} />
          <SceneLinks v={v} title="利用シーンから探す" />
          <PrefLinks
            title="ほかのエリア"
            countOf={(p) => pick(all, { pref: p }).length}
            hrefOf={(p) => `${v.path}/area/${p}`}
            exclude={pref}
          />
        </PageFrame>
      );
    },
  };
}
