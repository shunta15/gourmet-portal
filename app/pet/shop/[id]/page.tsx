import { shopPage } from "@/components/portal/pages/shop";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import { petShopPage } from "@/components/portal/petproto/decided/shop/live/LiveShop";

// ②店舗紹介(/pet/shop/{id})。決定デザインの店舗紹介(店舗詳細 + その店の特集記事。実在の店のデータ)。外枠は PetFrame。
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、共通の店ページのもの。
const common = shopPage("pet");
const live = petShopPage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = common.generateStaticParams;
export const generateMetadata = common.generateMetadata;

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  return <PetFrame>{await live.Page(props)}</PetFrame>;
}
