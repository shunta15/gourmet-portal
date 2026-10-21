import { shopPage } from "@/components/portal/pages/shop";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { stayShopPage } from "@/components/portal/stayproto/decided/shop/ShopPage";
import { isStayDecided } from "@/lib/portal/stayDesign";

// 宿の紹介(/stay/shop/{id})。lib/portal/stayDesign.ts の STAY_DESIGN で切り替わる(外枠は StayFrame)。
//   "decided" … 決定デザインの宿の紹介(実在の宿のデータ。料金・口コミは出さず、予約は「公式サイトで空室・料金を確認」の外部リンク)
//   "legacy"  … これまでの共通の店ページ(components/portal/pages/shop.tsx)
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、どちらでも同じ(共通の店ページのもの)。ペットの app/pet/shop/[id] と同じ作り。
const legacy = shopPage("stay");
const live = stayShopPage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = legacy.generateStaticParams;
export const generateMetadata = legacy.generateMetadata;

export default async function Page(props: Parameters<typeof legacy.Page>[0]) {
  return <StayFrame>{isStayDecided() ? await live.Page(props) : await legacy.Page(props)}</StayFrame>;
}
