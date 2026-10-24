import { vkSpecialIndexPage } from "@/components/portal/vkit/special/route";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { SportsSpecialIndexPage } from "@/components/portal/sports/pages";

// 特集の一覧(/sports/special)。メニューの「特集」の行き先。見本2「特集」のデザイン(components/portal/sports/inner/special/)。利用シーン・業種の特集記事(lib/specials/sports.json)だけを並べる。店 1 軒の記事は並べない(店は /sports/shop)。
// metadata は vkit の特集の一覧(vkSpecialIndexPage)と同じ。静的なページ。
const route = vkSpecialIndexPage(sportsCfg);

export const revalidate = 3600;
export const generateMetadata = route.generateMetadata;
export default SportsSpecialIndexPage;
