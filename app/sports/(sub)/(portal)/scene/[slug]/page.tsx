import { scenePage } from "@/components/portal/pages/scene";
import { sportsLegacy } from "@/components/portal/sports/redirects";

// 探すへ恒久の転送(308)。利用シーンの絞り込みは探すに無いので、探す(引数なし)へ。業種のページは 4 種類にまとめた(2026-10-23 オーナー決定。2026-10-27「探すで行こうでOK」)。知らないシーンは今までどおり 404。
const page = sportsLegacy.sceneRedirectPage(scenePage("sports"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
