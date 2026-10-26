import { withUnlisted } from "@/lib/unlistedScope";
import { shopPage } from "@/components/portal/pages/shop";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { stayShopPage } from "@/components/portal/stayproto/decided/shop/ShopPage";

// 宿の紹介(/stay/shop/{id})。決定デザインの宿の紹介(実在の宿のデータ。料金・口コミは出さず、予約は「公式サイトで空室・料金を確認」の外部リンク)。外枠は StayFrame。
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、共通の店ページのもの。ペットの app/pet/shop/[id] と同じ作り。
const common = shopPage("stay");
const live = stayShopPage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = withUnlisted(common.generateMetadata);

export default withUnlisted(async function Page(props: Parameters<typeof live.Page>[0]) {
  return <StayFrame>{await live.Page(props)}</StayFrame>;
});
