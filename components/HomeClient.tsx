"use client";
import { useEffect, useState } from "react";
import Hero from "./Hero";
import SearchBar from "./SearchBar";
import Marquee from "./Marquee";
import FeaturesCarousel from "./FeaturesCarousel";
import ShortVideos from "./ShortVideos";
import RestaurantGrid from "./RestaurantGrid";
import Stats from "./Stats";
import RegionsShowcase from "./RegionsShowcase";
import SceneSection from "./SceneSection";
import Neighborhoods from "./Neighborhoods";
import Footer from "./Footer";
import { useReveal } from "@/lib/hooks";
import type {
  RegionKey,
  Feature,
  ShortVideo,
  Neighborhood,
  RestaurantCardItem,
  Stat,
} from "@/lib/regions";

interface HomeClientProps {
  features: Feature[];
  shortVideos: ShortVideo[];
  neighborhoods: Neighborhood[];
  restaurants: RestaurantCardItem[];
  cuisines: string[];
  stats: Stat[];
}

export default function HomeClient({
  features,
  shortVideos,
  neighborhoods,
  restaurants,
  cuisines,
  stats,
}: HomeClientProps) {
  const [region, setRegion] = useState<RegionKey>("tokyo");
  useReveal([region]);

  useEffect(() => {
    document.body.setAttribute("data-region", region);
  }, [region]);

  return (
    <>
      <Hero />
      <SearchBar region={region} onRegion={setRegion} cuisines={cuisines} />
      <Marquee
        items={[
          "拉麺",
          "焼肉",
          "鮨",
          "居酒屋",
          "蕎麦",
          "天婦羅",
          "炉端",
          "割烹",
        ]}
      />
      {features.length > 0 && <FeaturesCarousel features={features} />}
      <ShortVideos shortVideos={shortVideos} />
      <Marquee
        dark
        reverse
        items={[
          "街の\"いいお店\"、ぜんぶここに。",
          "編集部厳選",
          "丁寧に選ぶ一軒",
          "全国を、舌で歩く。",
        ]}
      />
      <RestaurantGrid restaurants={restaurants} />
      <Stats stats={stats} />
      <SceneSection />
      <RegionsShowcase region={region} />
      {neighborhoods.length > 0 && <Neighborhoods neighborhoods={neighborhoods} />}
      <Footer />
    </>
  );
}
