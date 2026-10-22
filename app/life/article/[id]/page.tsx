import { lifeCfg } from "@/components/portal/vkit/configs";
import { vkArticleRoute } from "@/components/portal/vkit/article/route";

// 店の記事(実在の店 1 軒ずつの紹介記事。店の特集記事がある店は、その本文が出る)。/life/article/{id}(id = 店の ID。リンク先の店のページは /life/shop/{id})
// 店が無い・出せる本文が無い店は 404(その店のページ /life/shop/{id} は残る)。metadata(title・description・canonical・OGP・robots)・構造化データ・事前生成の対象は components/portal/vkit/article/route.tsx。
const route = vkArticleRoute(lifeCfg);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
