import { withUnlisted } from "@/lib/unlistedScope";
import { bodyArticlePage } from "@/components/portal/vert/bodyshop/articlePage";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";

// ボディケアの店の特集記事(/bodycare/article/<店の ID>)。【2026-10-26 試作】枠は (shop) のレイアウト(GreenShell)。限定公開の店(lib/unlisted.ts)は自分のページを描くあいだだけ通す。
const page = bodyArticlePage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => page.generateStaticParams());
export const generateMetadata = withUnlisted(async function generateMetadata(props: Parameters<typeof page.generateMetadata>[0]) {
  assertPortalLive();
  return page.generateMetadata(props);
});
export default withUnlisted(async function Page(props: Parameters<typeof page.Page>[0]) {
  assertPortalLive();
  return page.Page(props);
});
