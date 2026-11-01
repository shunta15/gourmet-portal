import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_PROTO_LINKS } from "@/components/portal/gnoren/common/nav";
import ShopPage from "@/components/portal/gnoren/shop/ShopPage";

// 店舗紹介(見本 3)。見本どおりの再現。中身は components/portal/gnoren/shop/data.ts
export default function Page() {
  return (
    <Shell page="shop" links={GN_PROTO_LINKS}>
      <ShopPage />
    </Shell>
  );
}
