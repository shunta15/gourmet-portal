import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { countPlaces } from "@/lib/places";
import { articleSitemapPaths } from "@/components/portal/vkit/article/ids";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・店のページ)に、/sports/search(探す)・/sports/article(記事の一覧)・
// 記事のページ /sports/article/{id}(店の特集記事・紹介記事の本文がある店だけ。articleIds)を足す。特集の旧 URL(/sports/feature/{id})は記事ページへの転送なので載せない。
// 載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。件数は各ページの robots と同じ: /sports/search は引数なしの絞り込みなので全店の数、/sports/article は countPlaces("sports")。
// ステイの app/stay/sitemap.ts と同じ作り。
const base = verticalSitemap("sports");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await base(); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  const path = VERTICALS.sports.path;
  const count = await countPlaces("sports");
  if (!isIndexable(count)) return items;
  const articles = await articleSitemapPaths(sportsCfg);
  const extra = [`${path}/search`, `${path}/article`, ...articles].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
