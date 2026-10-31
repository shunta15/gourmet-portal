import { withUnlisted } from "@/lib/unlistedScope";
import { shopPage } from "@/components/portal/pages/shop";
import { cpShopPage } from "@/components/portal/colorplay/pages/shop";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";

// 店のページ（COLOR PLAY）。
// URL・generateStaticParams・metadata（title・description・canonical・OGP・robots）は、共通の店ページのもの。
const common = shopPage("beauty");
const cp = cpShopPage(BEAUTY_SITE);

export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = withUnlisted(common.generateMetadata);
export default withUnlisted(cp);
