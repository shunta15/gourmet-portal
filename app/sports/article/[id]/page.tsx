import { sportsCfg } from "@/components/portal/vkit/configs";
import { vkArticleRoute } from "@/components/portal/vkit/article/route";
import { SportsArticlePage } from "@/components/portal/sports/pages";

// 店の記事(実在の店 1 軒ずつの紹介記事。店の特集記事がある店は、その本文が出る)。/sports/article/{id}(id = 店の ID。リンク先の店のページは /sports/shop/{id})。見本2の部品で組んだ記事のページ(components/portal/sports/inner/story/)。
// 店が無い・出せる本文が無い店は 404(その店のページ /sports/shop/{id} は残る)。metadata(title・description・canonical・OGP・robots)・事前生成の対象は components/portal/vkit/article/route.tsx と同じ。
const route = vkArticleRoute(sportsCfg);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;

export default async function Page(props: { params: Promise<{ id: string }> }) {
  return <SportsArticlePage id={(await props.params).id} />;
}
