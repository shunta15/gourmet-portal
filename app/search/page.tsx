import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";
import { toSearchItem } from "@/lib/regions";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { isPortalLive } from "@/lib/portal/launch";
import { buildFacetPayload } from "@/lib/portal/facets";

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
  // こだわり条件は公開スイッチ（lib/portal/launch.ts）が ON のときだけ。OFF のときは prop ごと渡さない（HTML・RSC のペイロードを従来と同じにするため）
  const facets = isPortalLive() ? buildFacetPayload(restaurants) : null;

  return (
    <Suspense fallback={null}>
      <SearchClient restaurants={searchItems} {...(facets ? { facets } : {})} />
    </Suspense>
  );
}
