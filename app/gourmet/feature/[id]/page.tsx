import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import type { FeatureArticle } from "@/lib/regions";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";
import ArticleView from "@/components/portal/gnoren/real/article/ArticleView";
import { buildArticleVM } from "@/lib/portal/gnoren/article";
import { onePageShopOf } from "@/lib/portal/noren/onePage";
import { decodeRewrittenId, NOREN_FEATURE_REWRITE } from "@/lib/portal/noren/rewrites";

// 特集記事ページの暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/feature/<id> が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical・構造化データは /feature/<id> のまま。この内部のパス /gourmet/feature/<id> は外に出さない）。
// 【暖簾 2 本番化】描画は全記事（店 1 軒・シーン別まとめ・街歩き/コース）とも gnoren の ArticleView（vm = lib/portal/gnoren/article.ts の buildArticleVM）。
// 枠（ヘッダー・フッター）は各 page.tsx で Shell を付ける（app/gourmet/layout.tsx はフォントと base.css だけ）。メタ情報・構造化データ・静的生成は今までと同じ。
// 1 店 1 ページの表（onePage.ts・onePageUnlisted.ts）には依存しない（店 1 軒かどうかは isSingleShopFeature で判定）。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。静的に作る ID も OFF では空にする。
// 時間での作り直し(revalidate)は付けず、管理画面で保存したとき /api/revalidate が作り直す(lib/revalidatePlan.ts)。DB を直接書き換えた場合は再デプロイが要る。
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
  // 非表示の店の記事（lib/hiddenStores.ts）は getFeatureArticleById が null を返す → 404。限定公開の記事は ID 指定で返る（noindex は generateMetadata）
  const article = await getFeatureArticleById(id);
  if (!article) notFound();
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = buildFeatureBreadcrumbJsonLd(article);
  const itemListJsonLd = buildFeatureItemListJsonLd(article);
  const vm = await buildArticleVM(article);
  return (
    <Shell page="feature" links={GN_LIVE_LINKS}>
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
      <ArticleView vm={vm} />
    </Shell>
  );
}
