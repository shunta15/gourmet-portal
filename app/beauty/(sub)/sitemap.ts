import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { loadShops } from "@/lib/portal/colorplay/data";
import { shopListHref } from "@/lib/portal/colorplay/shopList";
import { loadSpecials, specialHref, specialListHref } from "@/lib/portal/colorplay/specials";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";

export const revalidate = 3600;

const base = verticalSitemap("beauty");

// 共通のサイトマップ(最初・さがす・店のページ)に、店舗紹介の一覧(/beauty/shop)と、特集の一覧(/beauty/special)・特集の記事 3 本を足す。
// 載せるかは、それぞれのページの robots と同じ gate(掲載が 3 件未満なら載せない。lib/seo/gate.ts)。引数つきの一覧(?n=)は noindex なので載せない。
// 店 1 軒の記事のページ(/beauty/article/{店 ID})は載せない: 同じ本文が店のページ(/beauty/shop/{id}。すでに載っている)にあり、記事のページの canonical は店のページ。
// 店の記事の一覧(/beauty/article)は店舗紹介の一覧へ 308 転送するので載せない。
export default async function sitemap() {
  const list = await base();
  const total = (await loadShops(BEAUTY_SITE)).length;
  if (!isIndexable(total)) return list;
  const extra = [shopListHref(BEAUTY_SITE), specialListHref(BEAUTY_SITE), ...loadSpecials(BEAUTY_SITE).map((s) => specialHref(BEAUTY_SITE, s.slug))].map((p) => ({ url: absUrl(p) }));
  return [...list, ...extra];
}
