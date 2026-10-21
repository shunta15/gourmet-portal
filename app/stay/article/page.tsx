import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { stayArticleListPage } from "@/components/portal/stayproto/decided/articlelist/ArticleListPage";
import { assertPortalLive } from "@/lib/portal/launch";

// 宿の記事の一覧(決定デザイン・見本「3_探す」と同じ組み立て)。/stay/article
// 中身は実在の宿の紹介記事(紹介記事と実物の写真のある宿)。カードのリンク先は宿の記事 /stay/article/{id}。外枠は StayFrame。
// 状態は URL の引数(kind・region・pref・scene・q・sort・page。探す /stay/search と同じ名前)。引数つきの URL は noindex(正本は引数なしの /stay/article)。
// robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex。buildMetadata の count)。
const live = stayArticleListPage();

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  assertPortalLive();
  return <StayFrame>{await live.Page(props)}</StayFrame>;
}
