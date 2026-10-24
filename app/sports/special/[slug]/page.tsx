import { vkSpecialArticleRoute } from "@/components/portal/vkit/special/route";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { SportsSpecialArticlePage } from "@/components/portal/sports/pages";

// 特集の記事(/sports/special/{slug})。lib/specials/sports.json の記事だけ(それ以外の slug は 404)。見本2の部品で組んだ記事のページ(components/portal/sports/inner/story/)。
// 記事に出てくる店(storeIds)へは、店舗紹介のページ /sports/shop/{店 ID} へのリンクを付ける。metadata・事前生成は components/portal/vkit/special/route.tsx と同じ。
const route = vkSpecialArticleRoute(sportsCfg);

export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  return <SportsSpecialArticlePage slug={(await props.params).slug} />;
}
