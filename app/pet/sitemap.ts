import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { petSitemap } from "@/components/portal/petproto/decided/redirects";
import { PET_SPECIALS } from "@/components/portal/petproto/decided/special/data";
import { countPlaces } from "@/lib/places";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・店ページ)に、決定デザインの /pet/search(探す)・/pet/shop(店舗紹介の一覧)・/pet/special(特集の一覧)と特集の 4 本を足す。
// 店の記事の一覧 /pet/article は 308 で /pet/shop へ転送するので載せない(2026-10-24 オーナー決定)。
// 旧ページ(エリア・種類・種類×県・利用シーン)は探すの絞り込みへ 308 転送するので載せず、転送先の探すの URL(種類・県だけ)に替える(components/portal/vert/legacyToSearch.ts)。
// 載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。
// 件数は各ページの robots と同じ: /pet/search は引数なしの絞り込みなので全店の数、/pet/shop・/pet/special は countPlaces("pet")(それぞれの page.tsx と同じ)。
const base = verticalSitemap("pet");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await petSitemap(await base()); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  const path = VERTICALS.pet.path;
  const count = await countPlaces("pet");
  if (!isIndexable(count)) return items;
  const extra = [`${path}/search`, `${path}/shop`, `${path}/special`, ...PET_SPECIALS.map((s) => `${path}/special/${s.slug}`)].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
