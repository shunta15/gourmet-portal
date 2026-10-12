import { shopPage } from "@/components/portal/pages/shop";
import { cpShopPage } from "@/components/portal/colorplay/pages/shop";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";

// 店のページ。COLOR PLAY（VERTICAL_DESIGN.beauty）なら COLOR PLAY の店ページ、"legacy" ならこれまでの共通の店ページ。
// URL・generateStaticParams・metadata（title・description・canonical・OGP・robots）は、どちらでも同じ（共通の店ページのもの）。
const legacy = shopPage("beauty");
const cp = cpShopPage(BEAUTY_SITE);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = legacy.generateStaticParams;
export const generateMetadata = legacy.generateMetadata;
export default isColorplay("beauty") ? cp : legacy.Page;
