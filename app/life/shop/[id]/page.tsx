import { withUnlisted } from "@/lib/unlistedScope";
import { shopPage } from "@/components/portal/pages/shop";
import { LifeShopPage } from "@/components/portal/life/pages";

// 店の紹介(/life/shop/{id})。オーナーが決めたデザイン(2026-10-26 の見本。components/portal/life/inner/shop/)。外枠は InnerFrame。
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、共通の店ページ(components/portal/pages/shop.tsx)のもの。ステイ・アクティビティと同じ作り。
const common = shopPage("life");

export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = withUnlisted(common.generateMetadata);

export default withUnlisted(async function Page(props: { params: Promise<{ id: string }> }) {
  return <LifeShopPage id={(await props.params).id} />;
});
