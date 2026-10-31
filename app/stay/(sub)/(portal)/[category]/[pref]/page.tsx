import { categoryAreaPage } from "@/components/portal/pages/category-area";
import { stayLegacy } from "@/components/portal/stayproto/decided/redirects";

// 探すの絞り込みへ恒久の転送(308)。業種のページは 4 種類(最初・店舗紹介・探す・記事)にまとめた(2026-10-23 オーナー決定。ボディケアと同じやり方)。知らない種類・県は今までどおり 404。
const page = stayLegacy.categoryAreaRedirectPage(categoryAreaPage("stay"));

export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
