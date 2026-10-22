import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { countPlaces, getPlaces } from "@/lib/places";
import { hasArticleBody } from "@/components/portal/vkit/shop/data";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・店のページ)に、/activity/search(探す)・/activity/article(記事の一覧)・
// 紹介記事のある店の /activity/article/{id}(記事のページに出せる本文がある店だけ。hasArticleBody)を足す。
// 載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。件数は各ページの robots と同じ: /activity/search は引数なしの絞り込みなので全店の数、/activity/article は countPlaces("activity")。
// ステイの app/stay/sitemap.ts と同じ作り。
const base = verticalSitemap("activity");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await base(); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  const path = VERTICALS.activity.path;
  const count = await countPlaces("activity");
  if (!isIndexable(count)) return items;
  const articles = (await getPlaces("activity")).filter(hasArticleBody).map((p) => `${path}/article/${encodeURIComponent(p.id)}`);
  const extra = [`${path}/search`, `${path}/article`, ...articles].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
