import { shopPage } from "@/components/portal/pages/shop";
import VkFrame from "@/components/portal/vkit/common/VkFrame";
import { vkShopPage } from "@/components/portal/vkit/shop/ShopPage";
import { sportsCfg } from "@/components/portal/vkit/configs";

// 店の紹介(/sports/shop/{id})。ステイの決定デザインと同じ組み立て(components/portal/vkit/shop/。料金・口コミは出さず、外へ出るリンクは公式サイトだけ)。外枠は VkFrame。
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、共通の店ページ(components/portal/pages/shop.tsx)のもの。ステイの app/stay/shop/[id] と同じ作り。
const common = shopPage("sports");
const live = vkShopPage(sportsCfg);

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = common.generateMetadata;

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  return <VkFrame cfg={sportsCfg}>{await live.Page(props)}</VkFrame>;
}
