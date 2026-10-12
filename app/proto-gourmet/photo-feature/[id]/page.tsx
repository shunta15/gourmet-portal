import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoFeaturePage from "@/components/portal/photoFeature/PhotoFeaturePage";
import { getFeatureArticleById } from "@/lib/db/features";
import { getRestaurantById } from "@/lib/db/restaurants";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { isSingleShopFeature } from "@/lib/portal/noren/featureSingle";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { buildPhotoFeature } from "@/lib/portal/photoFeature/build";

// 写真が主役の特集記事（試作）。店 1 軒の記事（isSingleShopFeature）だけ。プレビュー・ローカル専用（門は ../layout.tsx）。
// 記事は今の特集と同じ取り方（getFeatureArticleById）。写真は、記事の写真 + 対の店ページの写真（ARTICLE_STORE_ID_BY_FEATURE の店。ID の完全一致だけ）。
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = await getFeatureArticleById(id);
  if (!a) return { title: "記事が見つかりません — マチノワ" };
  return { title: `${a.title} — マチノワ（試作）`, description: a.lede, robots: { index: false, follow: false } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ film?: string }> }) {
  const { id } = await params;
  // 見本だけ: ?film=1 で「横に流れる帯」あり（既定は帯なし。本番のページは URL を読まない）
  const film = (await searchParams).film === "1" ? true : undefined;
  const A = await getFeatureArticleById(id);
  if (!A || !isSingleShopFeature(A)) notFound();
  const sid = ARTICLE_STORE_ID_BY_FEATURE[A.id];
  const store = sid ? await getRestaurantById(sid) : null;
  const data = buildPhotoFeature(A, store, { film });
  return (
    <PhotoFeaturePage
      data={data}
      shopHref={store ? `${LIVE_LINKS.shopBase}/${store.id}` : null}
      listHref="/feature"
      topHref="/proto-gourmet/photo-feature"
      proto
    />
  );
}
