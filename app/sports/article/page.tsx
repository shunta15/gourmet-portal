import VkFrame from "@/components/portal/vkit/common/VkFrame";
import { vkArticleListPage } from "@/components/portal/vkit/articlelist/ArticleListPage";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { assertPortalLive } from "@/lib/portal/launch";

// 記事の一覧(/sports/article)。中身は実在の店の紹介記事(紹介記事と実物の写真のある店)。カードのリンク先は店の記事 /sports/article/{id}。
// 状態は URL の引数(kind・region・pref・scene・q・sort・page。探す /sports/search と同じ名前)。引数つきの URL は noindex(正本は引数なしの /sports/article)。
// robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex。buildMetadata の count)。
const live = vkArticleListPage(sportsCfg);

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  assertPortalLive();
  return <VkFrame cfg={sportsCfg}>{await live.Page(props)}</VkFrame>;
}
