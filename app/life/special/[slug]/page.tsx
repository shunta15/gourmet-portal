import { vkSpecialArticleRoute } from "@/components/portal/vkit/special/route";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LifeSpecialArticlePage } from "@/components/portal/life/pages";

// 特集の記事(/life/special/{slug})。lib/specials/life.json の記事だけ(それ以外の slug は 404)。2026-10-26 の見本の部品で組んだ記事のページ(components/portal/life/inner/story/)。
// 記事に出てくる店(storeIds)へは、店舗紹介のページ /life/shop/{店 ID} へのリンクを付ける。metadata・事前生成は components/portal/vkit/special/route.tsx と同じ。
const route = vkSpecialArticleRoute(lifeCfg);

export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  return <LifeSpecialArticlePage slug={(await props.params).slug} />;
}
