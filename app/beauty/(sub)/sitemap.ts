import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { loadArticleItems, articleListHref } from "@/lib/portal/colorplay/articles";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";

export const revalidate = 3600;

const base = verticalSitemap("beauty");

// 共通のサイトマップ(最初・さがす・店のページ)に、COLOR PLAY の特集記事の一覧(/beauty/article)を足す。
// 記事のページ(/beauty/article/{店 ID})は載せない: 同じ本文が店のページ(/beauty/shop/{id}。すでに載っている)にあり、記事のページの canonical は店のページ。
// 一覧の件数は、一覧ページの robots と同じ(引数なしの一覧は記事 3 本以上で index)。"legacy" のあいだは一覧が 404 なので載せない。
export default async function sitemap() {
  const list = await base();
  if (!isColorplay("beauty")) return list;
  const items = await loadArticleItems(BEAUTY_SITE);
  return isIndexable(items.length) ? [...list, { url: absUrl(articleListHref(BEAUTY_SITE)) }] : list;
}
