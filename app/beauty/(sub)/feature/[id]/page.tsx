import { featurePage } from "@/components/portal/pages/feature";
import { featureRedirectPage } from "@/components/portal/colorplay/pages/redirects";

// COLOR PLAY では特集記事は店のページと一緒（1 店 1 ページ）なので /beauty/shop/{店 ID} へ恒久の転送。
const page = featureRedirectPage("beauty", featurePage("beauty"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
