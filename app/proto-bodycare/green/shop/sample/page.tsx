import { notFound } from "next/navigation";
import GreenShopPage from "@/components/portal/bcproto/green/shop/GreenShopPage";
import { loadBsShop } from "@/lib/portal/vert/bodyshop/model";

// 試作の見本のページ(プレビュー・ローカル専用)。本番の店ページと同じ部品を、実在の 1 店(bo0030)のデータで出す。
export default async function Page() {
  const shop = await loadBsShop("bo0030");
  if (!shop) notFound();
  return <GreenShopPage shop={shop} />;
}
