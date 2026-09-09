import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";
import { toSearchItem } from "@/lib/regions";
import { getAllRestaurants } from "@/lib/db/restaurants";

export const metadata = {
  title: "店舗を探す — マチノワ",
  description:
    "全国の飲食店を、地域・業種・キーワードで探す。編集部おすすめ店から、隠れ家まで。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function SearchPage() {
  const restaurants = await getAllRestaurants();
  const searchItems = restaurants.map(toSearchItem);

  return (
    <Suspense fallback={null}>
      <SearchClient restaurants={searchItems} />
    </Suspense>
  );
}
