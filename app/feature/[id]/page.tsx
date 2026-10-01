import { notFound } from "next/navigation";
import FeatureClient from "@/components/FeatureClient";
import {
  buildArticleJsonLd,
  buildFeatureBreadcrumbJsonLd,
  buildFeatureItemListJsonLd,
} from "@/lib/jsonld";
import {
  getFeatureArticleById,
  getAllFeatureArticleIds,
  isFeatureIndexable,
} from "@/lib/db/features";
import { FEATURES } from "@/lib/data";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import type { FeatureArticle } from "@/lib/regions";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await getAllFeatureArticleIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getFeatureArticleById(id);
  if (!a) return { title: "記事が見つかりません — マチノワ" };
  const isIndexable = isFeatureIndexable(id);
  const a2 = a as FeatureArticle & { ogImage?: string };
  return {
    title: `${a.title} — マチノワ`,
    description: a.lede,
    alternates: {
      canonical: `/feature/${a.id}`,
    },
    openGraph: {
      title: a.title,
      description: a.lede,
      url: `https://machinowa.tokyo/feature/${a.id}`,
      images: [a2.ogImage ?? a.heroImage],
      type: "article",
      locale: "ja_JP",
    },
    robots: isIndexable ? undefined : { index: false, follow: true },
  };
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getFeatureArticleById(id);
  if (!article) notFound();
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = buildFeatureBreadcrumbJsonLd(article);
  const itemListJsonLd = buildFeatureItemListJsonLd(article);
  // この記事と対になる店舗ページ（記事由来の店 r299〜）。あれば「店舗情報（営業時間・地図）」を出す
  const storeId = ARTICLE_STORE_ID_BY_FEATURE[article.id];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <FeatureClient
        article={article}
        features={FEATURES}
        storeHref={storeId ? `/restaurant/${storeId}` : undefined}
      />
    </>
  );
}
