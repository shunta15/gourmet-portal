import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { countPlaces, getPlaces } from "@/lib/places";
import { hasArticleBody } from "@/components/portal/stayproto/decided/shop/data";
import { isStayDecided } from "@/lib/portal/stayDesign";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

export const revalidate = 3600;

// 共通のサイトマップ(最初・エリア・種類・利用シーン・宿のページ)に、決定デザインの /stay/search(探す)・/stay/article(記事の一覧)・
// 紹介記事のある宿の /stay/article/{id}(記事のページに出せる本文がある宿だけ。hasArticleBody)を足す。
// 足すのは STAY_DESIGN が "decided" のときだけ("legacy" のあいだは /stay/search は 404)。載せるかは他のページと同じ gate(掲載が 3 件未満なら載せない)。
// 件数は各ページの robots と同じ: /stay/search は引数なしの絞り込みなので全宿の数、/stay/article は countPlaces("stay")。ペットの app/pet/sitemap.ts と同じ作り。
const base = verticalSitemap("stay");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await base(); // 公開スイッチ OFF のあいだは、ここで 404(assertPortalLive)
  if (!isStayDecided()) return items;
  const path = VERTICALS.stay.path;
  const count = await countPlaces("stay");
  if (!isIndexable(count)) return items;
  const articles = (await getPlaces("stay")).filter(hasArticleBody).map((p) => `${path}/article/${encodeURIComponent(p.id)}`);
  const extra = [`${path}/search`, `${path}/article`, ...articles].map((p) => ({ url: absUrl(p) }));
  const have = new Set(items.map((i) => i.url));
  return [...items, ...extra.filter((e) => !have.has(e.url))];
}
