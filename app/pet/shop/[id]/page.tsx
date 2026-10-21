import { shopPage } from "@/components/portal/pages/shop";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import { petShopPage } from "@/components/portal/petproto/decided/shop/live/LiveShop";
import { isPetDecided } from "@/lib/portal/petDesign";

// ②店舗紹介(/pet/shop/{id})。lib/portal/petDesign.ts の PET_DESIGN で切り替わる(外枠は PetFrame)。
//   "decided" … 決定デザインの店舗紹介(店舗詳細 + その店の特集記事。実在の店のデータ)
//   "legacy"  … これまでの共通の店ページ(components/portal/pages/shop.tsx)
// URL・generateStaticParams・metadata(title・description・canonical・OGP・robots)は、どちらでも同じ(共通の店ページのもの)。
const legacy = shopPage("pet");
const live = petShopPage();

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = legacy.generateStaticParams;
export const generateMetadata = legacy.generateMetadata;

export default async function Page(props: Parameters<typeof legacy.Page>[0]) {
  return <PetFrame>{isPetDecided() ? await live.Page(props) : await legacy.Page(props)}</PetFrame>;
}
