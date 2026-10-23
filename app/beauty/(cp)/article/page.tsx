import { cpArticleListPage } from "@/components/portal/colorplay/pages/articleList";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { assertPortalLive } from "@/lib/portal/launch";

// 特集記事の一覧。状態は URL の引数(kind・n)。
// 中身は実在のサロンの特集記事・紹介記事。リンク先は記事のページ /beauty/article/{店 ID}。
const cp = cpArticleListPage(BEAUTY_SITE);

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return cp.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  return cp.Page(props);
}
