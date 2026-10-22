import { lifeCfg } from "@/components/portal/vkit/configs";
import { vkFeatureRedirectRoute } from "@/components/portal/vkit/article/route";

// 店の特集記事の旧 URL(/life/feature/{id})。本文は店の記事のページ(/life/article/{店 ID})にあるので、そこへ恒久の転送(同じ本文を 2 つの URL に出さない)。
const route = vkFeatureRedirectRoute(lifeCfg);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
