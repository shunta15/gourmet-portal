import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { lifeSitemap } from "@/components/portal/life/redirects";
import { countPlaces } from "@/lib/places";
import { articleSitemapPaths } from "@/components/portal/vkit/article/ids";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { loadSpecials } from "@/components/portal/vkit/special/data";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";


// 共通のサイトマップ(最初・エリア・種類・利用シーン・店のページ)に、/life/search(探す)・/life/shop(店舗紹介の一覧)・/life/special(特集の一覧)とその記事(/life/special/{slug})・
// 店の記事のページ /life/article/{id}(店の特集記事・紹介記事の本文がある店だけ。articleIds)を足す。店の記事のカードの一覧だった /life/article は店舗紹介の一覧へ 308 で転送するので載せない。特集の旧 URL(/life/feature/{id})も転送なので載せない。
// 載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。件数は各ページの robots と同じ: /life/search は引数なしの絞り込みなので全店の数、/life/shop・/life/special は countPlaces("life")。
// 旧ページ(エリア・種類・種類×県・利用シーン)は探すの絞り込みへ 308 転送するので載せず、転送先の探すの URL(種類・県だけ)に替える(components/portal/vert/legacyToSearch.ts)。ステイの app/stay/sitemap.ts と同じ作り。
const base = verticalSitemap("life");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await lifeSitemap(await base()); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  const path = VERTICALS.life.path;
  const count = await countPlaces("life");
  if (!isIndexable(count)) return items;
  const articles = await articleSitemapPaths(lifeCfg);
  const specials = loadSpecials(lifeCfg).map((x) => `${path}/special/${x.slug}`);
  const extra = [`${path}/search`, `${path}/shop`, `${path}/special`, ...specials, ...articles].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
