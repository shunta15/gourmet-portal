import { areaPage } from "@/components/portal/pages/area";
import { sportsLegacy } from "@/components/portal/sports/redirects";

// 探すの絞り込みへ恒久の転送(308)。業種のページは 4 種類にまとめた(2026-10-23 オーナー決定。2026-10-27「探すで行こうでOK」)。知らない県は今までどおり 404。
const page = sportsLegacy.areaRedirectPage(areaPage("sports"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
