/**
 * 利用シーンページの共通部品。/{v}/scene/{slug}
 * 各業種の app/{v}/scene/[slug]/page.tsx は scenePage(key) の結果をそのまま出すだけ。
 * 店は scene.matchTags にタグ一致したものだけ（事実の根拠があるタグだけが付く前提）。
 */
import { liveStaticParams } from "@/lib/portal/launch";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVertical } from "@/lib/verticals";
import type { Scene, Vertical } from "@/lib/verticals/types";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { loadVertical, notFoundMetadata, pick, type PortalVertical } from "./data";
import { PageFrame, Listing, CategoryLinks, SceneLinks, PrefLinks, baseCrumbs, toneOf } from "./frame";

type Props = { params: Promise<{ slug: string }> };

function findScene(v: Vertical, slug: string): Scene | null {
  return v.scenes.find((s) => s.slug === slug) ?? null;
}

export function scenePage(key: PortalVertical) {
  return {
    generateStaticParams: liveStaticParams(() => {
      return getVertical(key).scenes.map((s) => ({ slug: s.slug }));
    }),

    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { slug } = await params;
      const { v, all } = await loadVertical(key);
      const scene = findScene(v, slug);
      if (!scene) return notFoundMetadata();
      const count = pick(all, { scene }).length;
      return buildMetadata({
        vertical: key,
        title: `「${scene.name}」で探す${v.name}の店${count > 0 ? `${count}選` : ""}｜${v.brand}`,
        description: `「${scene.name}」で使える${v.name}の店を、エリア・種類とあわせて探せます。`,
        path: `${v.path}/scene/${slug}`,
        count,
      });
    },

    async Page({ params }: Props) {
      const { slug } = await params;
      const { v, all } = await loadVertical(key);
      const scene = findScene(v, slug);
      if (!scene) notFound();
      const places = pick(all, { scene });
      return (
        <PageFrame
          tone={toneOf(v)}
          crumbs={[...baseCrumbs(v), { name: scene.name, href: `${v.path}/scene/${slug}` }]}
          kicker={`Machinowa — ${VERTICAL_FACE[key].en} / Scene`}
          heading={`「${scene.name}」で探す${v.name}の店`}
          lead={`「${scene.name}」で使える${v.name}の店を、エリア・種類とあわせて探せます。`}
          count={places.length}
        >
          <Listing
            v={v}
            places={places}
            emptyNote={`「${scene.name}」の掲載は、まだありません（現在 0 件）。掲載できる店が確認でき次第、ここに並びます。`}
          />
          <CategoryLinks v={v} title="種類から探す" all={all} hrefOf={(c) => `${v.path}/${c}`} />
          <PrefLinks
            title="エリアから探す"
            countOf={(p) => pick(all, { scene, pref: p }).length}
            hrefOf={(p) => `${v.path}/area/${p}`}
          />
          <SceneLinks v={v} title="ほかの利用シーン" current={scene} />
        </PageFrame>
      );
    },
  };
}
