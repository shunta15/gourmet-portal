import { notFound } from "next/navigation";
import FeatureClient from "@/components/FeatureClient";
import { FEATURE_ARTICLES, FEATURE_INDEXABLE_IDS, FEATURES } from "@/lib/data";
import {
  buildArticleJsonLd,
  buildFeatureBreadcrumbJsonLd,
  buildFeatureItemListJsonLd,
} from "@/lib/jsonld";

export function generateStaticParams() {
  return FEATURES.map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = FEATURE_ARTICLES[id];
  if (!a) return { title: "記事が見つかりません — マチノワ" };
  const isIndexable = FEATURE_INDEXABLE_IDS.has(id);
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
      images: [a.ogImage ?? a.heroImage],
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
  const article = FEATURE_ARTICLES[id];
  if (!article) notFound();
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = buildFeatureBreadcrumbJsonLd(article);
  const itemListJsonLd = buildFeatureItemListJsonLd(article);
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
      <FeatureClient article={article} />
    </>
  );
}
