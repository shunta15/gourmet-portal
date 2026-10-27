import { categoryPage } from "@/components/portal/pages/category";
import { sportsLegacy } from "@/components/portal/sports/redirects";

// 探すの絞り込みへ恒久の転送(308)。業種のページは 4 種類(最初・店舗紹介・探す・記事)にまとめた(2026-10-23 オーナー決定。2026-10-27「探すで行こうでOK」)。知らない種類・県は今までどおり 404。
const page = sportsLegacy.categoryRedirectPage(categoryPage("sports"));

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
