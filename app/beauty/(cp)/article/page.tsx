import { notFound } from "next/navigation";
import { cpArticleListPage } from "@/components/portal/colorplay/pages/articleList";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";
import { assertPortalLive } from "@/lib/portal/launch";

// 特集記事の一覧(COLOR PLAY のときだけ。"legacy" のあいだは 404)。状態は URL の引数(kind・n)。
// 中身は実在のサロンの特集記事・紹介記事。リンク先は記事のページ /beauty/article/{店 ID}。
const cp = cpArticleListPage(BEAUTY_SITE);

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return isColorplay("beauty") ? cp.generateMetadata(props) : notFoundMetadata();
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  if (!isColorplay("beauty")) notFound();
  return cp.Page(props);
}
