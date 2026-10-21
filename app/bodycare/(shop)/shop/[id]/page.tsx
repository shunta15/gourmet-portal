import { bodyShopPage } from "@/components/portal/vert/bodyshop/shopPage";

// ボディケアの店のページ(案4「グリーン」。静的に出る。引数は読まない)。
const page = bodyShopPage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
