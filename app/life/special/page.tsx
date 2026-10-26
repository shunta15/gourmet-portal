import { vkSpecialIndexPage } from "@/components/portal/vkit/special/route";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LifeSpecialIndexPage } from "@/components/portal/life/pages";

// 特集の一覧(/life/special)。メニューの「特集」の行き先。2026-10-26 の見本「特集」のデザイン(components/portal/life/inner/special/)。利用シーン・業種の特集記事(lib/specials/life.json)だけを並べる。店 1 軒の記事は並べない(店は /life/shop)。
// metadata は vkit の特集の一覧(vkSpecialIndexPage)と同じ。静的なページ。
const route = vkSpecialIndexPage(lifeCfg);

export const revalidate = 3600;
export const generateMetadata = route.generateMetadata;
export default LifeSpecialIndexPage;
