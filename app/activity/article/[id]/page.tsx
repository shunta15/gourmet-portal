import { withUnlisted } from "@/lib/unlistedScope";
import { activityCfg } from "@/components/portal/vkit/configs";
import { vkArticleRoute } from "@/components/portal/vkit/article/route";
import { ActivityStoryPage } from "@/components/portal/activity/pages";

// 店ごとの特集記事(実在の店 1 軒ずつの記事。店の特集記事がある店は、その本文が出る)。/activity/article/{id}(id = 店の ID。リンク先の店のページは /activity/shop/{id})
// 店が無い・出せる本文が無い店は 404(その店のページ /activity/shop/{id} は残る)。metadata(title・description・canonical・OGP・robots)・事前生成の対象は components/portal/vkit/article/route.tsx(そのまま)。
// 描くのは、オーナーが決めたデザイン(components/portal/activity/Story.tsx)。構造化データの作りは route.tsx と同じ(components/portal/activity/pages.tsx)。
const route = vkArticleRoute(activityCfg);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = withUnlisted(route.generateMetadata);

export default withUnlisted(async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ActivityStoryPage id={(await params).id} />;
});
