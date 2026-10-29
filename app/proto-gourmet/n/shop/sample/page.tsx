import Shell from "@/components/portal/gnoren/common/Shell";
import ShopPage from "@/components/portal/gnoren/shop/ShopPage";

// 店舗紹介(見本 3)。見本どおりの再現。中身は components/portal/gnoren/shop/data.ts
export default function Page() {
  return (
    <Shell page="shop">
      <ShopPage />
    </Shell>
  );
}
