import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { findFeature, getGeneratedFeatures } from "@/lib/places/features";
import { buildMetadata } from "@/lib/seo/meta";
import { article as articleLd, breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import VkFrame from "../common/VkFrame";
import { vkLine } from "../common/live";
import { vkLinks, type VkConfig } from "../config";
import VkArticle from "./VkArticle";
import { loadArticle } from "./articleData";
import { articleIds } from "./ids";

/**
 * 店の記事のルート(/{業種}/article/{id})と、特集の旧 URL(/{業種}/feature/{id})の転送。体験・スポーツ・くらしで共通(各 app/{業種}/ の page.tsx は、これを呼ぶだけ)。
 *
 * 店の特集記事(features-{業種}.json)は、この「店の記事」のページに出す(1 店 1 本。articleData.ts)。特集の URL は別に持たない:
 *   - 本文が出る URL は /{業種}/article/{id} の 1 つだけ(canonical もここ)。/{業種}/feature/{id} は、特集の placeId の記事ページへ恒久の転送(308)。
 *     特集が無い id・placeId の無い特集は 404。サイトマップには記事ページだけを載せる(転送の URL は載せない)。
 *   - 店の紹介ページ(/{業種}/shop/{id})の「紹介記事」・記事の一覧の各行・最初のページの特集は、どれも /{業種}/article/{id} へ 1 回で行く。
 * 店の記事が載る店 = 紹介記事に点検を通る文がある店か、特集のある店(ids.ts の articleIds)。サイトマップ・事前生成・店の紹介のリンクはどれもこの条件。
 */

type Props = { params: Promise<{ id: string }> };

export function vkArticleRoute(cfg: VkConfig) {
  const b = VERTICALS[cfg.key];
  return {
    generateStaticParams: liveStaticParams(async () => (await articleIds(cfg)).map((id) => ({ id }))),

    async generateMetadata({ params }: Props) {
      assertPortalLive();
      const id = safeDecode((await params).id);
      const v = await loadArticle(cfg, id);
      if (!v) return notFoundMetadata();
      const { shop } = v;
      const where = shop.area ? `${shop.area}の` : "";
      return buildMetadata({
        vertical: cfg.key,
        // 特集のある店は、特集の題名と説明(店の特集記事。ほかの業種の特集ページと同じ形)
        title: v.feature ? `${v.feature.title}｜${b.brand}` : `${shop.name}の紹介記事｜${where}${shop.kindName || b.name}｜${b.brand}`,
        description: (v.feature && v.feature.summary) || vkLine(v.headline) || `${shop.name}の紹介記事。所在地や営業時間など、公式サイトなどで確認できた情報をまとめています。`,
        path: `${b.path}/article/${shop.id}`,
        count: await countPlaces(cfg.key),
        ...(v.hero ? { image: { url: v.hero.src, width: v.hero.w, height: v.hero.h, alt: `${shop.name}の写真` } } : {}),
      });
    },

    async Page({ params }: Props) {
      assertPortalLive();
      const id = safeDecode((await params).id);
      const v = await loadArticle(cfg, id);
      if (!v) notFound();
      const url = absUrl(`${b.path}/article/${encodeURIComponent(v.shop.id)}`);
      const image = v.hero ? absUrl(encodeURI(v.hero.src)) : undefined;
      return (
        <VkFrame cfg={cfg}>
          {v.feature ? (
            <JsonLd
              data={{
                ...articleLd({ headline: v.feature.title, description: v.feature.summary || v.headline, image: image ?? "", url, datePublished: v.feature.date }),
                ...(image ? {} : { image: undefined }),
                publisher: { "@type": "Organization", name: "マチノワ", url: "https://machinowa.tokyo" },
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
              }}
            />
          ) : null}
          <JsonLd
            data={breadcrumb([
              { name: "マチノワ", url: absUrl("/") },
              { name: b.name, url: absUrl(b.path) },
              { name: "店舗紹介", url: absUrl(vkLinks(cfg).shops) },
              { name: v.shop.name, url },
            ])}
          />
          <VkArticle cfg={cfg} v={v} />
        </VkFrame>
      );
    },
  };
}

/** /{業種}/feature/{id}: 店の記事ページ(/{業種}/article/{placeId})へ恒久の転送。特集が無い id・店 ID の無い特集は 404 */
export function vkFeatureRedirectRoute(cfg: VkConfig) {
  return {
    generateStaticParams: liveStaticParams(async () => (await getGeneratedFeatures(cfg.key)).filter((f) => f.placeId).map((f) => ({ id: f.id }))),
    async generateMetadata() {
      return notFoundMetadata(); // 転送するページなので、検索エンジンには載せない
    },
    async Page({ params }: Props): Promise<never> {
      assertPortalLive();
      const f = await findFeature(cfg.key, safeDecode((await params).id));
      if (!f?.placeId) notFound();
      permanentRedirect(vkLinks(cfg).article(f.placeId));
    },
  };
}
