import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { staySitemap } from "@/components/portal/stayproto/decided/redirects";
import { countPlaces, getPlaces } from "@/lib/places";
import { hasArticleBody } from "@/components/portal/stayproto/decided/shop/data";
import { STAY_SPECIALS } from "@/components/portal/stayproto/decided/special/data";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・宿のページ)に、決定デザインの /stay/search(探す)・/stay/shop(店舗紹介の一覧)・/stay/special(特集の一覧)と特集の 3 本・
// 紹介記事のある宿の /stay/article/{id}(記事のページに出せる本文がある宿だけ。hasArticleBody。店 1 軒の記事は残す)を足す。
// 宿の記事の一覧 /stay/article は 308 で /stay/shop へ転送するので載せない(2026-10-24 オーナー決定)。
// 旧ページ(エリア・種類・種類×県・利用シーン)は探すの絞り込みへ 308 転送するので載せず、転送先の探すの URL(種類・県だけ)に替える(components/portal/vert/legacyToSearch.ts)。
// 載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。
// 件数は各ページの robots と同じ: /stay/search は引数なしの絞り込みなので全宿の数、/stay/shop・/stay/special は countPlaces("stay")(それぞれの page.tsx と同じ)。ペットの app/pet/sitemap.ts と同じ作り。
const base = verticalSitemap("stay");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await staySitemap(await base()); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  const path = VERTICALS.stay.path;
  const count = await countPlaces("stay");
  if (!isIndexable(count)) return items;
  const articles = (await getPlaces("stay")).filter(hasArticleBody).map((p) => `${path}/article/${encodeURIComponent(p.id)}`);
  const specials = [`${path}/special`, ...STAY_SPECIALS.map((s) => `${path}/special/${s.slug}`)];
  const extra = [`${path}/search`, `${path}/shop`, ...specials, ...articles].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
