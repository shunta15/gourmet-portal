import { notFound } from "next/navigation";
import RegionPage from "@/components/RegionPage";
import { REGIONS, type RegionKey } from "@/lib/data";

const KEYS = Object.keys(REGIONS) as RegionKey[];

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
  return <RegionPage regionKey={key as RegionKey} />;
}
