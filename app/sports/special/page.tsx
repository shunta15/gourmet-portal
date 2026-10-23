import { vkSpecialIndexPage } from "@/components/portal/vkit/special/route";
import { sportsCfg } from "@/components/portal/vkit/configs";

// 特集の一覧(/sports/special)。メニューの「特集」の行き先。利用シーン・業種の特集記事(lib/specials/sports.json の 3 本)だけを並べる。店 1 軒の記事は並べない(店は /sports/shop)。
// 作りの手本はボディケアの /bodycare/special。部品・色・書体はこの業種のもの(components/portal/vkit/special/)。静的なページ。
const route = vkSpecialIndexPage(sportsCfg);

export const revalidate = 3600;
export const generateMetadata = route.generateMetadata;
export default route.Page;
