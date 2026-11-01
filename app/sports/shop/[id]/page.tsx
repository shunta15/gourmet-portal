import { withUnlisted } from "@/lib/unlistedScope";
import { shopPage } from "@/components/portal/pages/shop";
import { SportsShopPage } from "@/components/portal/sports/pages";

// 店の紹介(/sports/shop/{id})。オーナーが決めたデザイン(見本2。components/portal/sports/inner/shop/)。外枠は InnerFrame。
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、共通の店ページ(components/portal/pages/shop.tsx)のもの。ステイ・アクティビティと同じ作り。
const common = shopPage("sports");

export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = withUnlisted(common.generateMetadata);

export default withUnlisted(async function Page(props: { params: Promise<{ id: string }> }) {
  return <SportsShopPage id={(await props.params).id} />;
});
