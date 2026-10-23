import { vkSpecialArticleRoute } from "@/components/portal/vkit/special/route";
import { sportsCfg } from "@/components/portal/vkit/configs";

// 特集の記事(/sports/special/{slug})。lib/specials/sports.json の 3 本だけ(それ以外の slug は 404)。
// 記事に出てくる店(storeIds)へは、店舗紹介のページ /sports/shop/{店 ID} へのリンクを付ける。metadata・構造化データ・事前生成は components/portal/vkit/special/route.tsx。
const route = vkSpecialArticleRoute(sportsCfg);

export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
