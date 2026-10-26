import { areaPage } from "@/components/portal/pages/area";
import { areaRedirectPage } from "@/components/portal/activity/redirects";

// アクティビティの旧ページ。探す(/activity/search)の絞り込みへの恒久の転送(308)。components/portal/activity/redirects.ts(ボディケアと同じ作り)。
const page = areaRedirectPage(areaPage("activity"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
