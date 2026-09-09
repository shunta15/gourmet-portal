import { notFound } from "next/navigation";
import SceneHub from "@/components/SceneHub";
import { SCENES, getSceneBySlug } from "@/lib/scenes";
import { toCardItem } from "@/lib/regions";
import { buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { GEO } from "@/lib/geo";

const BASE = "https://machinowa.tokyo";

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

  const restaurants = await getAllRestaurants();
  const totalCount = restaurants.length;

  // Filter restaurants that match scene tags server-side
  const matchedRestaurants = restaurants.filter((r) =>
    s.matchTags.some((t) => (r.tags || []).includes(t))
  );
  const matched = matchedRestaurants.map(toCardItem);

  // Map points (matched restaurants with geo data)
  const mapPoints = matchedRestaurants
    .filter((r) => GEO[r.id])
    .map((r) => {
      const geo = GEO[r.id];
      const cuisine = r.cuisine.split(" / ").pop() || r.cuisine;
      return {
        id: r.id,
        name: r.name,
        lat: geo.lat,
        lng: geo.lng,
        href: `/restaurant/${r.id}`,
        sub: `${cuisine} · ${r.area}`,
      };
    });

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: "シーン", url: `${BASE}/scene` },
    { name: s.title, url: `${BASE}/scene/${s.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <SceneHub scene={s} matched={matched} totalCount={totalCount} mapPoints={mapPoints} />
    </>
  );
}
