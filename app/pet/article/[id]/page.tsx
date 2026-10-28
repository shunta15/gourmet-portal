import { withUnlisted } from "@/lib/unlistedScope";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import { petArticlePage } from "@/components/portal/petproto/decided/article/live/LiveArticle";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";

// ペットの店の特集記事(/pet/article/{店の ID})。【2026-10-26 試作】外枠は PetFrame。記事のある店だけ(無い店は 404。店のページ /pet/shop/{id} は残る)。
// 限定公開の店(lib/unlisted.ts)は、自分のページを描くあいだだけ通す(withUnlisted)。
const page = petArticlePage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => page.generateStaticParams());
export const generateMetadata = withUnlisted(async function generateMetadata(props: Parameters<typeof page.generateMetadata>[0]) {
  assertPortalLive();
  return page.generateMetadata(props);
});
export default withUnlisted(async function Page(props: Parameters<typeof page.Page>[0]) {
  assertPortalLive();
  return <PetFrame>{await page.Page(props)}</PetFrame>;
});
