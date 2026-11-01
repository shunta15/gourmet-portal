import { categoryAreaPage } from "@/components/portal/pages/category-area";
import { categoryAreaRedirectPage } from "@/components/portal/colorplay/pages/redirects";

// COLOR PLAY のあいだは /beauty/search?kind=…&pref=… へ恒久の転送。"legacy" なら元のページ。
const page = categoryAreaRedirectPage("beauty", categoryAreaPage("beauty"));

export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
