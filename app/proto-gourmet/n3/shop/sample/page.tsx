import Shell from "@/components/portal/gnoren3/common/Shell";
import ShopPage from "@/components/portal/gnoren3/shop/ShopPage";

// 暖簾 3 店舗紹介(見本 3)。仮の中身は components/portal/gnoren3/shop/data.ts。
export default function Page() {
  return (
    <Shell page="shop">
      <ShopPage />
    </Shell>
  );
}
