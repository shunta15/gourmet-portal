import { vkSpecialArticleRoute } from "@/components/portal/vkit/special/route";
import { lifeCfg } from "@/components/portal/vkit/configs";

// 特集の記事(/life/special/{slug})。lib/specials/life.json の 3 本だけ(それ以外の slug は 404)。
// 記事に出てくる店(storeIds)へは、店舗紹介のページ /life/shop/{店 ID} へのリンクを付ける。metadata・構造化データ・事前生成は components/portal/vkit/special/route.tsx。
const route = vkSpecialArticleRoute(lifeCfg);

export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
