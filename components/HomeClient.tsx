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
import Neighborhoods from "./Neighborhoods";
import Footer from "./Footer";
import { useReveal } from "@/lib/hooks";
import type { RegionKey } from "@/lib/data";

export default function HomeClient() {
  const [region, setRegion] = useState<RegionKey>("shitamachi");
  useReveal([region]);

  useEffect(() => {
    document.body.setAttribute("data-region", region);
  }, [region]);

  return (
    <>
      <Hero />
      <SearchBar region={region} onRegion={setRegion} />
      <Marquee
        items={[
          "RAMEN / 拉麺",
          "YAKINIKU / 焼肉",
          "SUSHI / 鮨",
          "IZAKAYA / 居酒屋",
          "SOBA / 蕎麦",
          "TEMPURA / 天婦羅",
          "ROBATA / 炉端",
          "KAPPO / 割烹",
        ]}
      />
      <FeaturesCarousel />
      <ShortVideos />
      <Marquee
        dark
        reverse
        items={[
          "街の“いいお店”、ぜんぶここに。",
          "編集部厳選",
          "全国 30 店舗掲載中",
          "北海道から沖縄まで",
        ]}
      />
      <RestaurantGrid region={region} onRegion={setRegion} />
      <Stats />
      <RegionsShowcase region={region} />
      <Neighborhoods />
      <Footer />
    </>
  );
}
