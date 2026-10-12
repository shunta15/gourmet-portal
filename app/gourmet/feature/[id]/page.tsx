import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import FeaturePage from "@/components/portal/noren/FeaturePage";
import FeatureSinglePage from "@/components/portal/noren/FeatureSinglePage";
import FeatureScenePage from "@/components/portal/noren/FeatureScenePage";
import PhotoFeatureShell from "@/components/portal/photoFeature/PhotoFeatureShell";
import PhotoFeaturePage from "@/components/portal/photoFeature/PhotoFeaturePage";
import {
  buildArticleJsonLd,
  buildFeatureBreadcrumbJsonLd,
  buildFeatureItemListJsonLd,
} from "@/lib/jsonld";
import {
  getFeatureArticleById,
  getAllFeatureArticleIds,
  isFeatureIndexable,
} from "@/lib/db/features";
import { FEATURES } from "@/lib/data";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { getRestaurantById } from "@/lib/db/restaurants";
import type { FeatureArticle } from "@/lib/regions";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { buildFmap } from "@/lib/portal/fmapData";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { NOREN_FEATURE_PHOTO, NOREN_FEATURE_SINGLE, isSingleShopFeature } from "@/lib/portal/noren/featureSingle";
import { buildPhotoFeature } from "@/lib/portal/photoFeature/build";
import { isFeaturedPhotoId } from "@/lib/portal/photoFeature/featured";
import { getRelatedFeatured } from "@/lib/portal/photoFeature/related";
import { onePageShopOf } from "@/lib/portal/noren/onePage";
import { NOREN_FEATURE_SCENE, isSceneShopFeature } from "@/lib/portal/noren/featureScene";
import { NOREN_FEATURE_ROUNDUP_PHOTO } from "@/lib/portal/noren/featureScene";
import RoundupArticle from "@/components/portal/photoFeature/roundup/RoundupArticle";
import { pairFeatureNote, pairShopNote, pairedShopOfFeature } from "@/lib/portal/noren/pair";
import { decodeRewrittenId, NOREN_FEATURE_REWRITE } from "@/lib/portal/noren/rewrites";

// 特集記事ページの暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature/<id> が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical・構造化データは /feature/<id> のまま。この内部のパス /gourmet/feature/<id> は外に出さない）。
// 枠は app/gourmet/layout.tsx（暖簾の枠）、中身は components/portal/noren/FeaturePage.tsx（見本 /proto-noren/feature/[id] と共通）。
// データの取り方・メタ情報・構造化データ・描画の方式は、今の app/feature/[id]/page.tsx と同じ（同じ関数・同じ値）。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。静的に作る ID も OFF では空にする。
export const revalidate = 60;
export const dynamicParams = true;

// 特集の暖簾化を使わないあいだ（NOREN_FEATURE_REWRITE=false）は、この内部のパスを直接開いても 404（/feature/<id> と同じ中身の重複ページを出さない）。
// 静的に作る ID も空にする（536 本ぶんのビルドを省く）。true にすれば書き換え・リダイレクトと一緒に効く。
export const generateStaticParams = liveStaticParams(async () => {
  if (!NOREN_FEATURE_REWRITE) return [];
  const ids = await getAllFeatureArticleIds();
  // 1 店 1 ページにした記事は、/feature/<ID> が /restaurant/<店の ID> への転送になる（このページは出さない）ので、静的に作らない
  return ids.filter((id) => !onePageShopOf(id)).map((id) => ({ id }));
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  assertPortalLive();
  if (!NOREN_FEATURE_REWRITE) notFound();
  // 書き換え（rewrites）経由だと params.id が百分率エンコードのまま届く（日本語・& の ID）ので、元の ID に戻す
  const id = decodeRewrittenId((await params).id);
  const a = await getFeatureArticleById(id);
  if (!a) return { title: "記事が見つかりません — マチノワ" };
  const isIndexable = isFeatureIndexable(id);
  const a2 = a as FeatureArticle & { ogImage?: string };
  return {
    title: `${a.title} — マチノワ`,
    description: a.lede,
    alternates: {
      canonical: `/feature/${a.id}`,
    },
    openGraph: {
      title: a.title,
      description: a.lede,
      url: `https://machinowa.tokyo/feature/${a.id}`,
      images: [a2.ogImage ?? a.heroImage],
      type: "article",
      locale: "ja_JP",
    },
    robots: isIndexable ? undefined : { index: false, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  assertPortalLive();
  if (!NOREN_FEATURE_REWRITE) notFound();
  // 書き換え（rewrites）経由だと params.id が百分率エンコードのまま届く（日本語・& の ID）ので、元の ID に戻す
  const id = decodeRewrittenId((await params).id);
  // 1 店 1 ページにした記事（lib/portal/noren/onePage.ts の表）: /feature/<ID> は next.config.ts の redirects で /restaurant/<店の ID> へ恒久転送される。ここへ来たとき（設定を通らない呼び方）も同じ行き先へ
  const onePageShop = onePageShopOf(id);
  if (onePageShop) permanentRedirect(`/restaurant/${onePageShop}`);
  const article = await getFeatureArticleById(id);
  if (!article) notFound();
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = buildFeatureBreadcrumbJsonLd(article);
  const itemListJsonLd = buildFeatureItemListJsonLd(article);
  // この記事と対になる店舗ページ（記事由来の店 r299〜）。あれば「店舗情報（営業時間・地図）」を出す
  const storeId = ARTICLE_STORE_ID_BY_FEATURE[article.id];
  // 店 1 軒の記事（POINT 01〜の視点の並び）は、店 1 軒用の枠（FeatureSinglePage）で出す。複数の店・場所の記事は今のまま（FeaturePage）。
  // 切り替えは lib/portal/noren/featureSingle.ts の NOREN_FEATURE_SINGLE（false で全記事が FeaturePage に戻る）。
  const single = NOREN_FEATURE_SINGLE && isSingleShopFeature(article);
  // 利用シーン+店舗紹介の記事（ID が scene- で始まり、全項目が店ページを指す）は、専用の枠（FeatureScenePage）。切り替えは lib/portal/noren/featureScene.ts の NOREN_FEATURE_SCENE。
  const sceneShop = !single && isSceneShopFeature(article.id, article);
  const scene = sceneShop && NOREN_FEATURE_SCENE;
  // 利用シーン+店舗紹介の記事（シーン別まとめ記事）は、店舗特集記事と同じ「写真が主役の形」で出す。切り替えは NOREN_FEATURE_ROUNDUP_PHOTO（false で上の scene の枠 FeatureScenePage に戻る）。街歩き・コースの記事は入らない。
  // （NOREN_FEATURE_SCENE が false でも、NOREN_FEATURE_ROUNDUP_PHOTO が true なら新しい枠で出す。両方 false は今までの FeaturePage）
  const roundupPhoto = sceneShop && NOREN_FEATURE_ROUNDUP_PHOTO;
  // 屋号は、対の店ページ（ARTICLE_STORE_ID_BY_FEATURE の店）の店名だけを使う（記事の題名から店名を作らない）
  const shop = single && storeId ? await getRestaurantById(storeId) : null;
  // 店ページとの切り替えの帯: 対の店ページがある記事だけ（店ページ側と同じ関数 pairedShopOfFeature の対応表。店名の部分一致はしない）
  const pair = single && shop && pairedShopOfFeature(article.id) === shop.id
    ? { shopNote: pairShopNote(shop), featureNote: pairFeatureNote(article.ranking.length) }
    : null;
  // 1 店 1 ページの対象（isFeaturedPhotoId = onePage.ts の表。ID の完全一致）は、写真が主役の形（components/portal/photoFeature/）で出す。ただし /feature/<ID> は /restaurant/<店の ID> へ転送されるので、ここへ来るのは転送を通らない呼び方だけ（実際は上の permanentRedirect で止まる）。切り替えは NOREN_FEATURE_PHOTO（false で FeatureSinglePage に戻る）。
  // 対象以外の店 1 軒の記事・複数の店の記事は、この分岐に入らない（出力は今までどおり）。
  const photo = NOREN_FEATURE_PHOTO && single && isFeaturedPhotoId(article.id);
  const photoData = photo ? buildPhotoFeature(article, shop) : null;
  const photoRelated = photo ? await getRelatedFeatured(article.id, shop ? { region: shop.region, cuisine: shop.cuisine } : null) : [];
  // 「店を地図でまとめて見る」は、座標のある店が 2 軒以上のときだけ（null なら出さない）
  const fmap = single ? null : await buildFmap(article);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {photoData ? (
        <PhotoFeatureShell>
          <PhotoFeaturePage
            data={photoData}
            shopHref={pair && shop ? `${LIVE_LINKS.shopBase}/${shop.id}` : null}
            listHref="/feature"
            topHref={LIVE_LINKS.top}
            searchHref="/search"
            related={photoRelated}
          />
        </PhotoFeatureShell>
      ) : single ? (
        <FeatureSinglePage
          article={article}
          store={
            shop
              ? { id: shop.id, name: shop.name, cuisine: shop.cuisine, area: shop.area, nearest: shop.nearest, address: shop.address }
              : null
          }
          pair={pair}
          links={LIVE_LINKS}
          href={(h) => h}
        />
      ) : roundupPhoto ? (
        <RoundupArticle article={article} />
      ) : scene ? (
        <FeatureScenePage article={article} features={FEATURES} fmap={fmap} links={LIVE_LINKS} href={(h) => h} />
      ) : (
        <FeaturePage
          article={article}
          features={FEATURES}
          storeId={storeId}
          fmap={fmap}
          links={LIVE_LINKS}
          href={(h) => h}
        />
      )}
    </>
  );
}
