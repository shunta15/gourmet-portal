import { shopPage } from "@/components/portal/pages/shop";
import { ActivityShopPage } from "@/components/portal/activity/pages";

// 店の紹介(/activity/shop/{id})。オーナーが決めたデザイン(components/portal/activity/Shop.tsx。料金・口コミは出さず、外へ出るリンクは公式サイトだけ)。外枠は ActivityFrame。
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、共通の店ページ(components/portal/pages/shop.tsx)のもの。ステイの app/stay/shop/[id] と同じ作り。
const common = shopPage("activity");

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = common.generateMetadata;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ActivityShopPage id={(await params).id} />;
}
