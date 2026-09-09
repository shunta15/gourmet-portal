import { notFound } from "next/navigation";
import RegionPage from "@/components/RegionPage";
import { REGIONS, type RegionKey, toCardItem } from "@/lib/regions";
import { getRestaurantsByRegion } from "@/lib/db/restaurants";
import { getFeaturesByRegion } from "@/lib/featureRegions";
import { getRegionStats } from "@/lib/data";
import { GEO } from "@/lib/geo";

const KEYS = Object.keys(REGIONS) as RegionKey[];

// 公開ページは Supabase を真の source-of-truth として使う
export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return KEYS.map((key) => ({ key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const r = REGIONS[key as RegionKey];
  if (!r) return { title: "地域が見つかりません — マチノワ" };
  return {
    title: `${r.name} — ミニポータル / マチノワ`,
    description: `${r.tagline}。${r.subtitle}`,
    alternates: {
      canonical: `/region/${key}`,
    },
    openGraph: {
      title: `${r.name} — ${r.nameEn}`,
      description: r.subtitle,
      url: `https://machinowa.tokyo/region/${key}`,
      images: [r.heroImages[0]],
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!KEYS.includes(key as RegionKey)) notFound();
  // DB から該当 region の店舗を取得して Client へ渡す
  const restaurants = await getRestaurantsByRegion(key as RegionKey);
  const cardItems = restaurants.map(toCardItem);
  const features = getFeaturesByRegion(key as RegionKey);
  const stats = getRegionStats(key as RegionKey);

  // Map points (restaurants with geo data)
  const mapPoints = restaurants
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

  return (
    <RegionPage
      regionKey={key as RegionKey}
      restaurants={cardItems}
      features={features}
      stats={stats}
      mapPoints={mapPoints}
    />
  );
}
