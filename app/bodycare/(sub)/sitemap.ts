import type { MetadataRoute } from "next";
import { verticalSitemap } from "@/components/portal/pages/sitemap";
import { SPECIALS } from "@/lib/portal/vert/bodygreen/special";
import { assertPortalLive } from "@/lib/portal/launch";
import { absUrl } from "@/lib/seo/util";

export const revalidate = 3600;

const base = verticalSitemap("bodycare");

// 既存の一覧(業種のトップ・探す・店ページ ほか。件数ゲートを通った物だけ)に、業種の特集記事(一覧 1 + 本 3)を足す。
// 特集記事は静的なページで件数ゲートの対象外。
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertPortalLive();
  const rows = await base();
  const special = ["/bodycare/special", ...SPECIALS.map((s) => `/bodycare/special/${s.slug}`)].map((p) => ({ url: absUrl(p) }));
  const have = new Set(rows.map((r) => r.url));
  return [...rows, ...special.filter((r) => !have.has(r.url))];
}
