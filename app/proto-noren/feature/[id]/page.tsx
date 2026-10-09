import { notFound } from "next/navigation";
import FeaturePage from "@/components/portal/noren/FeaturePage";
import { getFeatureArticleById } from "@/lib/db/features";
import { FEATURES } from "@/lib/data";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { buildFmap } from "@/lib/portal/fmapData";
import { SAMPLE_LINKS } from "@/lib/portal/noren/nav";
import { protoHref } from "@/lib/portal/noren/feature";

// 暖簾の見本（特集記事ページ）。今の /feature/[id] と同じデータ・同じ取り方で、同じ中身を出す。プレビュー・ローカル専用（門は app/proto-noren/layout.tsx）。
// 中身は components/portal/noren/FeaturePage.tsx（本番の /gourmet/feature/[id] と共通。行き先だけ見本のもの）。
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getFeatureArticleById(id);
  if (!a) return { title: "記事が見つかりません — マチノワ" };
  return { title: `${a.title} — マチノワ`, description: a.lede, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const A = await getFeatureArticleById(id);
  if (!A) notFound();
  return (
    <FeaturePage
      article={A}
      features={FEATURES}
      storeId={ARTICLE_STORE_ID_BY_FEATURE[A.id]}
      fmap={await buildFmap(A)}
      links={SAMPLE_LINKS}
      href={protoHref}
    />
  );
}
