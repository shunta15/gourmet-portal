import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";
import ShopPageReal from "@/components/portal/gnoren/real/shop/ShopPageReal";
import { buildShopPage } from "@/lib/portal/gnoren/shop";
import { REGIONS } from "@/lib/regions";
import { getRestaurantById, getAllRestaurantIds } from "@/lib/db/restaurants";
import { buildRestaurantJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { isRestaurantIndexable } from "@/lib/restaurantIndexable";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { decodeRewrittenId } from "@/lib/portal/noren/rewrites";
import { restaurantTitle, restaurantDescription, cuisineLabel } from "@/lib/seoText";

const BASE = "https://machinowa.tokyo";

// 本番の店ページ /restaurant/[id] の暖簾版（公開スイッチ ON のときだけ。OFF は 404、今の /restaurant/[id] はそのまま）。
// 公開スイッチ ON のとき、next.config.ts の rewrites が /restaurant/:id をこのルート（/gourmet/restaurant/:id）に差し替える（ブラウザの URL は /restaurant/<id> のまま）。
// このパスを直接開くと /restaurant/<id> へ恒久リダイレクトする（next.config.ts の redirects）。canonical も /restaurant/<id>。
// 枠は <Shell page="shop">（暖簾 2。components/portal/gnoren/common）、中身は components/portal/gnoren/real/shop/ShopPageReal.tsx（試作 /proto-gourmet/n/shop/sample と同じ見た目・実データ。データ整形は lib/portal/gnoren/shop.ts）。全店（限定公開の店も）を同じ部品で出す。
// メタ情報・構造化データは今の app/restaurant/[id]/page.tsx と同じ値（同じ関数）。今のページのファイルは変えていない。
// 描画の方式は ISR（公開ページは Supabase が真の source-of-truth）。時間での作り直し(revalidate)は付けず、管理画面で保存したとき
// /api/revalidate が作り直す(書き換え後のパス /gourmet/restaurant/<id> も対象。lib/revalidatePlan.ts)。DB を直接書き換えた場合は再デプロイが要る。
// generateStaticParams 外の ID も SSR でレスポンス可
export const dynamicParams = true;

// OFF のあいだは 1 つも作らない（404 になるページを大量にビルドしない）。ON は今の店ページと同じ全 ID
export const generateStaticParams = liveStaticParams(async () => (await getAllRestaurantIds()).map((id) => ({ id })));

// 今の app/restaurant/[id]/page.tsx の generateMetadata と同じ値
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  assertPortalLive();
  const id = decodeRewrittenId((await params).id);
  const r = await getRestaurantById(id);
  if (!r) return { title: "店舗が見つかりません — マチノワ" };
  const region = REGIONS[r.region];
  const cuisine = cuisineLabel(r.cuisine);
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
    keywords: [r.name, r.area, cuisine, region?.name, "マチノワ", ...(r.tags || [])].filter(Boolean) as string[],
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  assertPortalLive();
  const id = decodeRewrittenId((await params).id);
  const r = await getRestaurantById(id);
  if (!r) notFound();
  const region = REGIONS[r.region];

  // 画面に評価の数字を出さないので、構造化データにも評価（aggregateRating）を入れない（2026-10-24 オーナー決定）。地域のパンくずは「さがす」へ（/region/<key> は /search?region=<key> へ統合済み）
  const { aggregateRating: _omitRating, ...restaurantLd } = buildRestaurantJsonLd(r) as Record<string, unknown>;
  void _omitRating;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: region?.name || r.region, url: `${BASE}/search?region=${encodeURIComponent(r.region)}` },
    { name: r.name, url: `${BASE}/restaurant/${r.id}` },
  ]);

  const shop = await buildShopPage(r);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Shell page="shop" links={GN_LIVE_LINKS}>
        <ShopPageReal shop={shop} />
      </Shell>
    </>
  );
}
