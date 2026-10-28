import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoreArticle from "../../bcproto/green/article/StoreArticle";
import JsonLd from "../../JsonLd";
import { notFoundMetadata } from "../../pages/data";
import { bsHasArticle, loadBsShop } from "@/lib/portal/vert/bodyshop/model";
import { articleTitleOf, loadBsArticleItems } from "@/lib/portal/vert/bodyshop/articles";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { getVertical } from "@/lib/verticals";
import { safeDecode } from "@/lib/stations/query";

/**
 * ボディケアの店の特集記事(/bodycare/article/<店の ID>)。【2026-10-26 試作】枠は app/bodycare/(shop)/layout.tsx(GreenShell)。
 * 記事のある店(bsHasArticle)だけ。無い店・店が無い ID は 404(店のページ /bodycare/shop/<ID> は別に残る)。canonical は記事自身。
 */
const path = (id: string) => `/bodycare/article/${encodeURIComponent(id)}`;

export function bodyArticlePage() {
  type Props = { params: Promise<{ id: string }> };
  async function load(raw: string) {
    const shop = await loadBsShop(safeDecode(raw));
    return shop && bsHasArticle(shop) ? shop : null;
  }
  return {
    async generateStaticParams() {
      return (await loadBsArticleItems()).map((i) => ({ id: i.id }));
    },
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const s = await load((await params).id);
      if (!s) return notFoundMetadata();
      const hero = s.photos[0];
      return buildMetadata({
        vertical: "bodycare",
        title: `${articleTitleOf(s)}｜${s.name}｜マチノワ ボディケア`,
        description: s.panels[0]?.open[0]?.match(/[^。]+。?/)?.[0] ?? `${s.name}の${s.hasStory ? "特集記事" : "紹介記事"}。`,
        path: path(s.id),
        count: s.total,
        ...(hero ? { image: { url: hero.src, width: hero.w, height: hero.h, alt: hero.alt } } : {}),
      });
    },
    async Page({ params }: Props) {
      const s = await load((await params).id);
      if (!s) notFound();
      const v = getVertical("bodycare");
      const items = await loadBsArticleItems();
      const more = items
        .filter((x) => x.id !== s.id)
        .sort((a, b) => Number(b.kindSlug === s.kindSlug) * 2 + Number(b.prefName === s.prefName) - (Number(a.kindSlug === s.kindSlug) * 2 + Number(a.prefName === s.prefName)))
        .slice(0, 3);
      return (
        <>
          <StoreArticle shop={s} more={more} />
          <JsonLd
            data={breadcrumb([
              { name: "マチノワ", url: absUrl("/") },
              { name: v.name, url: absUrl(v.path) },
              { name: "店舗紹介", url: absUrl(`${v.path}/shop`) },
              { name: s.name, url: absUrl(`${v.path}/shop/${s.id}`) },
              { name: "特集記事", url: absUrl(path(s.id)) },
            ])}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Article",
              headline: articleTitleOf(s),
              author: { "@type": "Organization", name: "マチノワ編集部" },
              mainEntityOfPage: absUrl(path(s.id)),
              about: { "@type": "LocalBusiness", name: s.name, address: s.address },
            }}
          />
        </>
      );
    },
  };
}
