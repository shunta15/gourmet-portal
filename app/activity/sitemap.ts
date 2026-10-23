import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { countPlaces } from "@/lib/places";
import { articleSitemapPaths } from "@/components/portal/vkit/article/ids";
import { activityCfg } from "@/components/portal/vkit/configs";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import { editorialPaths } from "@/components/portal/activity/pages";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・店のページ)に、/activity/search(探す)・/activity/shop(店舗紹介の一覧)・/activity/article(特集)・
// 記事のページ /activity/article/{id}(店の特集記事・紹介記事の本文がある店だけ。articleIds)と、季節・読みもの・ガイドの記事(/activity/article/season/{id}・magazine/{id}・guide)を足す。特集の旧 URL(/activity/feature/{id})は記事ページへの転送なので載せない。
// 載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。件数は各ページの robots と同じ: /activity/search は引数なしの絞り込みなので全店の数、/activity/shop・/activity/article は countPlaces("activity")。
// ステイの app/stay/sitemap.ts と同じ作り。
const base = verticalSitemap("activity");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await base(); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  const path = VERTICALS.activity.path;
  const count = await countPlaces("activity");
  if (!isIndexable(count)) return items;
  const articles = await articleSitemapPaths(activityCfg);
  // 季節の特集・読みもの・はじめての方へ(lib/activity/editorial.json にあるものだけ)
  const editorial = (await editorialPaths()).map((e) => e.path);
  const extra = [`${path}/search`, `${path}/shop`, `${path}/article`, ...articles, ...editorial].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
