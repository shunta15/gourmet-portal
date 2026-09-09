import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { SHORT_VIDEOS, NEIGHBORHOODS, toCardItem } from "@/lib/regions";
import { FEATURES, getNationalStats } from "@/lib/data";
import { getAllRestaurants } from "@/lib/db/restaurants";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  const restaurants = await getAllRestaurants();
  const cuisines = ["ALL", ...new Set(restaurants.map((r) => r.cuisine))];
  const stats = getNationalStats();
  const cardItems = restaurants.map(toCardItem);

  return (
    <HomeClient
      features={FEATURES}
      shortVideos={SHORT_VIDEOS}
      neighborhoods={NEIGHBORHOODS}
      restaurants={cardItems}
      cuisines={cuisines}
      stats={stats}
    />
  );
}
