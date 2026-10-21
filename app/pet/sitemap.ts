import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { countPlaces } from "@/lib/places";
import { isPetDecided } from "@/lib/portal/petDesign";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・店ページ)に、決定デザインの 2 ページ /pet/search(探す)・/pet/article(記事の一覧)を足す。
// 足すのは PET_DESIGN が "decided" のときだけ("legacy" のあいだは両ページとも 404)。載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。
// 件数は各ページの robots と同じ: /pet/search は引数なしの絞り込みなので全店の数、/pet/article は countPlaces("pet")(app/pet/article/page.tsx と同じ)。
const base = verticalSitemap("pet");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await base(); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  if (!isPetDecided()) return items;
  const path = VERTICALS.pet.path;
  const count = await countPlaces("pet");
  if (!isIndexable(count)) return items;
  const extra = [`${path}/search`, `${path}/article`].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
