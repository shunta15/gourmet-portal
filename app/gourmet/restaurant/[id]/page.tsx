import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GourmetNorenShop from "@/components/portal/pages/gourmet-noren-shop";
import PhotoFeatureShell from "@/components/portal/photoFeature/PhotoFeatureShell";
import PhotoFeaturePage from "@/components/portal/photoFeature/PhotoFeaturePage";
import { REGIONS } from "@/lib/regions";
import { getRestaurantById, getAllRestaurantIds } from "@/lib/db/restaurants";
import { buildRestaurantJsonLd, buildBreadcrumbJsonLd, buildArticleJsonLd } from "@/lib/jsonld";
import { getFeatureArticleById } from "@/lib/db/features";
import { ARTICLE_STORE_FEATURE_IDS, ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { featuresOfShop } from "@/lib/portal/noren/shopFeatures";
import { NOREN_SHOP_ONE_PAGE, onePageFeatureOf, shopOnePageEligible } from "@/lib/portal/noren/onePage";
import { NOREN_FEATURE_PHOTO, isDummyFeatureImage, isSingleShopFeature } from "@/lib/portal/noren/featureSingle";
import { RELEASE_FEATURE } from "@/lib/portal/noren/release";
import { buildPhotoFeature, buildShopPage } from "@/lib/portal/photoFeature/build";
import { getRelatedFeatured } from "@/lib/portal/photoFeature/related";
import { getShopInfo } from "@/lib/portal/photoFeature/shopInfo";
import { isRestaurantIndexable } from "@/lib/restaurantIndexable";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { decodeRewrittenId } from "@/lib/portal/noren/rewrites";
import { restaurantTitle, restaurantDescription, cuisineLabel } from "@/lib/seoText";

const BASE = "https://machinowa.tokyo";

// 本番の店ページ /restaurant/[id] の暖簾版（公開スイッチ ON のときだけ。OFF は 404、今の /restaurant/[id] はそのまま）。
// 公開スイッチ ON のとき、next.config.ts の rewrites が /restaurant/:id をこのルート（/gourmet/restaurant/:id）に差し替える（ブラウザの URL は /restaurant/<id> のまま）。
// このパスを直接開くと /restaurant/<id> へ恒久リダイレクトする（next.config.ts の redirects）。canonical も /restaurant/<id>。
// 枠は app/gourmet/layout.tsx（暖簾）、中身は components/portal/pages/gourmet-noren-shop.tsx（見本 /proto-noren/restaurant/[id] と共通）。
// メタ情報・構造化データは今の app/restaurant/[id]/page.tsx と同じ値（同じ関数）。今のページのファイルは変えていない。
// 描画の方式も今の店ページと同じ（公開ページは Supabase が真の source-of-truth。60 秒ごとに ISR で再生成）。
export const revalidate = 60;
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

  const restaurantJsonLd = buildRestaurantJsonLd(r);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "トップ", url: BASE },
    { name: region?.name || r.region, url: `${BASE}/region/${r.region}` },
    { name: r.name, url: `${BASE}/restaurant/${r.id}` },
  ]);

  // 1 店 1 ページ（見本。lib/portal/noren/onePage.ts）: 対象（lib/portal/noren/onePage.ts の表）の特集記事の店は、/restaurant/<店の ID> で「写真が主役の特集記事 + 記事の終わりの店舗情報」を 1 ページで出す。
  // 店と記事の対応は ID の完全一致（onePageFeatureOf）。既存の対応表 ARTICLE_STORE_ID_BY_FEATURE と食い違うとき・記事が店 1 軒の記事でないときは、1 ページ化せず今までの店ページを出す。
  const featureId = NOREN_FEATURE_PHOTO ? onePageFeatureOf(r.id) : null;
  const article = featureId && ARTICLE_STORE_ID_BY_FEATURE[featureId] === r.id ? await getFeatureArticleById(featureId) : null;
  if (featureId && article && isSingleShopFeature(article)) {
    const page = `/restaurant/${r.id}`;
    const data = buildPhotoFeature(article, r);
    const shopInfo = await getShopInfo(r, LIVE_LINKS, page);
    const related = await getRelatedFeatured(featureId, { region: r.region, cuisine: r.cuisine });
    // 関連記事: 店ページと同じ選び方・同じ本数（featuresOfShop の既定 3 本 = この記事自身 + ほか最大 2 本）。この記事（=このページ）自身は除く
    const shopFeatures = (await featuresOfShop(r.id, featureId))
      .filter((f) => !f.paired)
      .map((f) => ({ id: f.id, href: LIVE_LINKS.feature(f.id), title: f.title, sub: f.sub, image: f.image && !(RELEASE_FEATURE && isDummyFeatureImage(f.image)) ? f.image : "" }));
    const articleJsonLd = buildArticleJsonLd(article, page);
    // 1 ページ版は点数・口コミ件数を画面に出さないので、構造化データにも評価（aggregateRating）を入れない（画面に無い評価を構造化データに載せない）。地域のパンくずは「さがす」へ
    const { aggregateRating: _omit, ...restaurantLd } = restaurantJsonLd as Record<string, unknown>;
    void _omit;
    const onePageBreadcrumb = buildBreadcrumbJsonLd([
      { name: "トップ", url: BASE },
      { name: region?.name || r.region, url: `${BASE}/search?region=${encodeURIComponent(r.region)}` },
      { name: r.name, url: `${BASE}/restaurant/${r.id}` },
    ]);
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(onePageBreadcrumb) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <PhotoFeatureShell>
          <PhotoFeaturePage
            data={data}
            shopHref={null}
            listHref="/feature"
            topHref={LIVE_LINKS.top}
            searchHref="/search"
            related={related}
            shopInfo={shopInfo}
            onePage
            shopFeatures={shopFeatures}
          />
        </PhotoFeatureShell>
      </>
    );
  }

  // 特集記事の無い店（第 2 段。2026-10-13）: 対の特集記事を持たない店は、店のデータ（紹介文・本文・特徴・写真・基本情報）から、同じ部品で「入口の暖簾 → 巻頭 → 紹介文 → 写真と本文 → 特徴 → 店舗情報」の 1 ページを出す。
  // 切り替えは NOREN_SHOP_ONE_PAGE（RELEASE_FEATURE と同じ。false で今までの店ページ）。形になる条件（紹介文と本文がある）に合わない店・記事の対を持つ店（上の分岐に入らなかったとき）は、今までの店ページ。
  const hasPair = !!(r.featureId ?? ARTICLE_STORE_FEATURE_IDS[r.id]);
  if (NOREN_SHOP_ONE_PAGE && !featureId && !hasPair && shopOnePageEligible(r)) {
    const page = `/restaurant/${r.id}`;
    const data = buildShopPage(r);
    const shopInfo = await getShopInfo(r, LIVE_LINKS, page);
    const related = await getRelatedFeatured("", { region: r.region, cuisine: r.cuisine });
    const shopFeatures = (await featuresOfShop(r.id))
      .map((f) => ({ id: f.id, href: LIVE_LINKS.feature(f.id), title: f.title, sub: f.sub, image: f.image && !(RELEASE_FEATURE && isDummyFeatureImage(f.image)) ? f.image : "" }));
    // 1 ページ版は点数・口コミ件数を画面に出さないので、構造化データにも評価（aggregateRating）を入れない。地域のパンくずは「さがす」へ
    const { aggregateRating: _omit, ...restaurantLd } = restaurantJsonLd as Record<string, unknown>;
    void _omit;
    const onePageBreadcrumb = buildBreadcrumbJsonLd([
      { name: "トップ", url: BASE },
      { name: region?.name || r.region, url: `${BASE}/search?region=${encodeURIComponent(r.region)}` },
      { name: r.name, url: `${BASE}/restaurant/${r.id}` },
    ]);
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(onePageBreadcrumb) }} />
        <PhotoFeatureShell>
          <PhotoFeaturePage
            data={data}
            shopHref={null}
            listHref="/feature"
            topHref={LIVE_LINKS.top}
            searchHref="/search"
            related={related}
            shopInfo={shopInfo}
            onePage
            shopFeatures={shopFeatures}
          />
        </PhotoFeatureShell>
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <GourmetNorenShop id={r.id} links={LIVE_LINKS} shop={r} />
    </>
  );
}
