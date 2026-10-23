import { vkSpecialIndexPage } from "@/components/portal/vkit/special/route";
import { lifeCfg } from "@/components/portal/vkit/configs";

// 特集の一覧(/life/special)。メニューの「特集」の行き先。利用シーン・業種の特集記事(lib/specials/life.json の 3 本)だけを並べる。店 1 軒の記事は並べない(店は /life/shop)。
// 作りの手本はボディケアの /bodycare/special。部品・色・書体はこの業種のもの(components/portal/vkit/special/)。静的なページ。
const route = vkSpecialIndexPage(lifeCfg);

export const revalidate = 3600;
export const generateMetadata = route.generateMetadata;
export default route.Page;
