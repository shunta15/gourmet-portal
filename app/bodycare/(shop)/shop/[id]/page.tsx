import { bodyShopPage } from "@/components/portal/vert/bodyshop/shopPage";

// ボディケアの店のページ。案は lib/portal/vert/bodycareStructure.ts の BODYCARE_SHOP_DESIGN で選ぶ(静的に出る。引数は読まない)。
const page = bodyShopPage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
