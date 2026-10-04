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
import { ARTICLE_STORE_FEATURE_IDS } from "@/lib/articleStores";
import { isRestaurantIndexable } from "@/lib/restaurantIndexable";
import { getTownOfRestaurant } from "@/lib/db/towns";
import { isPortalLive } from "@/lib/portal/launch";
import { restaurantSocialLinks } from "@/lib/portal/shopSocial";
import { shareTarget } from "@/lib/portal/share";
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
    // 記事由来の店は、実写画像・住所・営業時間がそろわなければ noindex（lib/restaurantIndexable.ts）
    robots: isRestaurantIndexable(r.id) ? undefined : { index: false, follow: true },
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

  // 対になる特集記事（DB 経由の店は featureId を持たないので、コード側の対応表でも引く）
  const featureId = r.featureId ?? ARTICLE_STORE_FEATURE_IDS[r.id];

  // Compute related restaurants server-side (same region, not self, slice 4)
  const regionRestaurants = await getRestaurantsByRegion(r.region);
  const related = regionRestaurants
    .filter((x) => x.id !== r.id)
    .slice(0, 4)
    .map(toCardItem);

  // この店がある街（市区町村）。店が2店以上ある街なら「<街>の他の店」へのリンクを出す
  const town = await getTownOfRestaurant(r, regionRestaurants);

  // SNS・共有ボタン・送客の計測は総合サイトの公開スイッチ（lib/portal/launch.ts）が ON のときだけ。OFF では旧 HTML・旧 JS と同一
  const live = isPortalLive();

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
      <RestaurantDetail
        r={r}
        related={related}
        shortVideos={SHORT_VIDEOS}
        geo={GEO[r.id] ?? null}
        featureId={featureId}
        town={town ? { name: town.town, href: town.href, count: town.count } : null}
        portalLive={live}
        social={live ? restaurantSocialLinks(r) : []}
        shareUrl={live ? shareTarget(`/restaurant/${r.id}`) : ""}
        // OFF のときは prop ごと渡さない（RSC のペイロードも従来と同じにするため）。ON のときだけ、プレビュー・ローカルで 3 案の切替を出す
        {...(live && (process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production") ? { previewTools: true } : {})}
      />
    </>
  );
}
