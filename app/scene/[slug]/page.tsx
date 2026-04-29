import { notFound } from "next/navigation";
import SceneHub from "@/components/SceneHub";
import { SCENES, getSceneBySlug } from "@/lib/scenes";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";

const BASE = "https://gourmet-portal.vercel.app";

export function generateStaticParams() {
  return SCENES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSceneBySlug(slug);
  if (!s) return { title: "シーンが見つかりません — マチノワ" };
  return {
    title: `${s.title} | マチノワ`,
    description: s.description,
    alternates: { canonical: `/scene/${s.slug}` },
    openGraph: {
      title: s.title,
      description: s.description,
      url: `${BASE}/scene/${s.slug}`,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: s.title,
      description: s.description,
    },
    keywords: s.keywords,
  };
}

export default async function ScenePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSceneBySlug(slug);
  if (!s) notFound();

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: "シーン", url: `${BASE}/scene/${s.slug}` },
    { name: s.title, url: `${BASE}/scene/${s.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <SceneHub scene={s} />
    </>
  );
}
