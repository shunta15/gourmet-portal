import { withUnlisted } from "@/lib/unlistedScope";
import { cpArticlePage } from "@/components/portal/colorplay/pages/article";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";

// 特集記事のページ。/beauty/article/{店 ID}。
// 記事のある店(特集記事か、点検に通った紹介記事がある店)だけ。無ければ 404(店のページ /beauty/shop/{id} は別に残る)。
// 同じ本文が店のページにもあるので、canonical は店のページ(pages/article.tsx)。/beauty/feature/{id} → 店のページの転送はそのまま。
const cp = cpArticlePage(BEAUTY_SITE);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => cp.staticParams());

export const generateMetadata = withUnlisted(async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return cp.generateMetadata(props);
});

export default withUnlisted(async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  return cp.Page(props);
});
