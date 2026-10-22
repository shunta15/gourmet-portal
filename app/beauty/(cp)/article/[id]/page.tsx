import { notFound } from "next/navigation";
import { cpArticlePage } from "@/components/portal/colorplay/pages/article";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";

// 特集記事のページ(COLOR PLAY のときだけ。"legacy" のあいだは 404)。/beauty/article/{店 ID}。
// 記事のある店(特集記事か、点検に通った紹介記事がある店)だけ。無ければ 404(店のページ /beauty/shop/{id} は別に残る)。
// 同じ本文が店のページにもあるので、canonical は店のページ(pages/article.tsx)。/beauty/feature/{id} → 店のページの転送はそのまま。
const cp = cpArticlePage(BEAUTY_SITE);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => (isColorplay("beauty") ? cp.staticParams() : []));

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return isColorplay("beauty") ? cp.generateMetadata(props) : notFoundMetadata();
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  if (!isColorplay("beauty")) notFound();
  return cp.Page(props);
}
