import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { shopListHref } from "@/components/portal/bcproto/green/common/site";
import { SPECIALS } from "@/lib/portal/vert/bodygreen/special";
import { loadGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import { isIndexable } from "@/lib/seo/gate";
import { assertPortalLive } from "@/lib/portal/launch";
import { absUrl } from "@/lib/seo/util";

export const revalidate = 3600;

const base = verticalSitemap("bodycare");

// 既存の一覧(業種のトップ・探す・店ページ ほか。件数ゲートを通った物だけ)に、店舗紹介の一覧(/bodycare/shop。探すと同じ gate = 掲載 3 件以上)と、業種の特集記事(一覧 1 + 本 3)を足す。
// 特集記事は静的なページで件数ゲートの対象外。店舗紹介の一覧の「さらに見る」(?n=)は noindex なので載せない。
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertPortalLive();
  const rows = await base();
  const shops = isIndexable((await loadGreenShops()).length) ? [shopListHref()] : [];
  const special = [...shops, "/bodycare/special", ...SPECIALS.map((s) => `/bodycare/special/${s.slug}`)].map((p) => ({ url: absUrl(p) }));
  const have = new Set(rows.map((r) => r.url));
  return [...rows, ...special.filter((r) => !have.has(r.url))];
}
