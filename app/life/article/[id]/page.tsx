import { lifeCfg } from "@/components/portal/vkit/configs";
import { vkArticleRoute } from "@/components/portal/vkit/article/route";
import { LifeArticlePage } from "@/components/portal/life/pages";

// 店の記事(実在の店 1 軒ずつの紹介記事。店の特集記事がある店は、その本文が出る)。/life/article/{id}(id = 店の ID。リンク先の店のページは /life/shop/{id})。2026-10-26 の見本の部品で組んだ記事のページ(components/portal/life/inner/story/)。
// 店が無い・出せる本文が無い店は 404(その店のページ /life/shop/{id} は残る)。metadata(title・description・canonical・OGP・robots)・事前生成の対象は components/portal/vkit/article/route.tsx と同じ。
const route = vkArticleRoute(lifeCfg);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;

export default async function Page(props: { params: Promise<{ id: string }> }) {
  return <LifeArticlePage id={(await props.params).id} />;
}
