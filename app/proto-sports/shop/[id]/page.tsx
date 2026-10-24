import type { Metadata } from "next";
import ShopPage from "@/components/portal/sproto2/b/shop/ShopPage";
import { loadShopView } from "@/components/portal/sproto2/b/shop/data";
import { SHOP_COPY } from "@/components/portal/sproto2/b/shop/copy";

// 試作の店舗紹介(/proto-sports/shop/{id})。実在のスポーツ 3 店(sp0001・sp0002・sp0003)。店の中身は lib/places/generated/sports.json と shop/copy.ts。
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(SHOP_COPY).map((id) => ({ id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const v = await loadShopView(id);
  return { title: `${v.place.name}(試作)｜マチノワスポーツ`, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShopPage v={await loadShopView(id)} />;
}
