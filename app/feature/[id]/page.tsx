import { notFound } from "next/navigation";
import FeatureClient from "@/components/FeatureClient";
import { FEATURE_ARTICLES, FEATURES } from "@/lib/data";

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
  if (!a) return { title: "記事が見つかりません — 味処 日本" };
  return {
    title: `${a.title} — 味処 日本`,
    description: a.lede,
    openGraph: {
      title: a.title,
      description: a.lede,
      images: [a.heroImage],
    },
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
  return <FeatureClient article={article} />;
}
