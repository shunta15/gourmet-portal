import { notFound } from "next/navigation";
import RegionPage from "@/components/RegionPage";
import { REGIONS, type RegionKey } from "@/lib/data";
import { getRestaurantsByRegion } from "@/lib/db/restaurants";

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
  return <RegionPage regionKey={key as RegionKey} restaurants={restaurants} />;
}
