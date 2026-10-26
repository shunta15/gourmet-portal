import { areaPage } from "@/components/portal/pages/area";
import { areaRedirectPage } from "@/components/portal/colorplay/pages/redirects";

// COLOR PLAY のあいだは /beauty/search?pref=… へ恒久の転送。"legacy" なら元のエリアページ。
const page = areaRedirectPage("beauty", areaPage("beauty"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
