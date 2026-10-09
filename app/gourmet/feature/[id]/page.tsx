import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeaturePage from "@/components/portal/noren/FeaturePage";
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
import type { FeatureArticle } from "@/lib/regions";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { buildFmap } from "@/lib/portal/fmapData";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
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
  return ids.map((id) => ({ id }));
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
  const article = await getFeatureArticleById(id);
  if (!article) notFound();
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = buildFeatureBreadcrumbJsonLd(article);
  const itemListJsonLd = buildFeatureItemListJsonLd(article);
  // この記事と対になる店舗ページ（記事由来の店 r299〜）。あれば「店舗情報（営業時間・地図）」を出す
  const storeId = ARTICLE_STORE_ID_BY_FEATURE[article.id];
  // 「店を地図でまとめて見る」は、座標のある店が 2 軒以上のときだけ（null なら出さない）
  const fmap = await buildFmap(article);
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
      <FeaturePage
        article={article}
        features={FEATURES}
        storeId={storeId}
        fmap={fmap}
        links={LIVE_LINKS}
        href={(h) => h}
      />
    </>
  );
}
