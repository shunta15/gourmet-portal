import { vkArticleListPage } from "@/components/portal/vkit/articlelist/ArticleListPage";
import { activityCfg } from "@/components/portal/vkit/configs";
import { ActivityArticleListPage } from "@/components/portal/activity/pages";
import { assertPortalLive } from "@/lib/portal/launch";

// 特集のページ(/activity/article)。オーナーが決めたデザイン(components/portal/activity/)。利用シーン・ジャンル・季節の特集・はじめての方へ・読みもの・店ごとの特集記事。
// metadata(title・description・canonical・robots)は、これまでの記事の一覧(vkit/articlelist/ArticleListPage.tsx の vkArticleListPage)と同じ。
// robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex。buildMetadata の count)。引数つきの URL は noindex(正本は引数なしの /activity/article)。
const live = vkArticleListPage(activityCfg);

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page() {
  return <ActivityArticleListPage />;
}
