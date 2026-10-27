import { categoryPage } from "@/components/portal/pages/category";
import { categoryRedirectPage } from "@/components/portal/colorplay/pages/redirects";

// /beauty/search?kind=… へ恒久の転送（COLOR PLAY）。
const page = categoryRedirectPage("beauty", categoryPage("beauty"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
