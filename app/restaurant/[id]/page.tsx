import { notFound } from "next/navigation";
import RestaurantDetail from "@/components/RestaurantDetail";
import { RESTAURANTS, REGIONS } from "@/lib/data";
import {
  buildRestaurantJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/jsonld";

const BASE = "https://gourmet-portal.vercel.app";

export function generateStaticParams() {
  return RESTAURANTS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = RESTAURANTS.find((x) => x.id === id);
  if (!r) return { title: "店舗が見つかりません — マチノワ" };
  const region = REGIONS[r.region];
  const cuisineLabel = r.cuisine.split(" / ").pop() || r.cuisine;
  // ローカルSEO最適化: 「<エリア> <業種> <店名> | マチノワ」パターン
  const title = `${r.name} | ${r.area}の${cuisineLabel} — マチノワ`;
  return {
    title,
    description: r.desc,
    alternates: {
      canonical: `/restaurant/${r.id}`,
    },
    openGraph: {
      title: r.name,
      description: r.desc,
      url: `${BASE}/restaurant/${r.id}`,
      images: [r.image.startsWith("http") ? r.image : `${BASE}${r.image}`],
      type: "article",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: r.name,
      description: r.desc,
      images: [r.image.startsWith("http") ? r.image : `${BASE}${r.image}`],
    },
    keywords: [
      r.name,
      r.area,
      cuisineLabel,
      region?.name,
      "マチノワ",
      ...(r.tags || []),
    ].filter(Boolean) as string[],
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = RESTAURANTS.find((x) => x.id === id);
  if (!r) notFound();
  const region = REGIONS[r.region];

  const restaurantJsonLd = buildRestaurantJsonLd(r);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: region?.name || r.region, url: `${BASE}/region/${r.region}` },
    { name: r.name, url: `${BASE}/restaurant/${r.id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RestaurantDetail r={r} />
    </>
  );
}
