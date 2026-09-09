import { notFound } from "next/navigation";
import RestaurantDetail from "@/components/RestaurantDetail";
import { REGIONS, SHORT_VIDEOS, toCardItem } from "@/lib/regions";
import {
  getRestaurantById,
  getAllRestaurantIds,
  getRestaurantsByRegion,
} from "@/lib/db/restaurants";
import {
  buildRestaurantJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/jsonld";
import { GEO } from "@/lib/geo";
import {
  restaurantTitle,
  restaurantDescription,
  cuisineLabel,
} from "@/lib/seoText";

const BASE = "https://machinowa.tokyo";

// 公開ページは Supabase が真の source-of-truth。
// 60秒ごとに ISR で再生成、admin での編集が最大60秒で反映される。
export const revalidate = 60;
// generateStaticParams 外の ID も SSR でレスポンス可
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await getAllRestaurantIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getRestaurantById(id);
  if (!r) return { title: "店舗が見つかりません — マチノワ" };
  const region = REGIONS[r.region];
  const cuisine = cuisineLabel(r.cuisine);
  // 指名検索の意図（営業時間・定休日・場所）に応えるスニペットを生成する。
  // 生成ルールと背景は lib/seoText.ts を参照。
  const title = restaurantTitle(r);
  const description = restaurantDescription(r);
  return {
    title,
    description,
    alternates: {
      canonical: `/restaurant/${r.id}`,
    },
    openGraph: {
      title: r.name,
      description,
      url: `${BASE}/restaurant/${r.id}`,
      images: [r.image.startsWith("http") ? r.image : `${BASE}${r.image}`],
      type: "article",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: r.name,
      description,
      images: [r.image.startsWith("http") ? r.image : `${BASE}${r.image}`],
    },
    keywords: [
      r.name,
      r.area,
      cuisine,
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
  const r = await getRestaurantById(id);
  if (!r) notFound();
  const region = REGIONS[r.region];

  const restaurantJsonLd = buildRestaurantJsonLd(r);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: region?.name || r.region, url: `${BASE}/region/${r.region}` },
    { name: r.name, url: `${BASE}/restaurant/${r.id}` },
  ]);

  // Compute related restaurants server-side (same region, not self, slice 4)
  const regionRestaurants = await getRestaurantsByRegion(r.region);
  const related = regionRestaurants
    .filter((x) => x.id !== r.id)
    .slice(0, 4)
    .map(toCardItem);

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
      <RestaurantDetail r={r} related={related} shortVideos={SHORT_VIDEOS} geo={GEO[r.id] ?? null} />
    </>
  );
}
