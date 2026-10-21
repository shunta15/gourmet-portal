"use client";

import { useEffect, useState } from "react";
import { ScrollSpyTabs } from "../common/Motion";

export type ShopTab = { id: string; label: string; sub?: string };

/** 追従するタブ(トップ / 客室 / 温泉 / …)。節の上端を合わせる位置は、ヘッダー+タブの高さ(画面の幅で変わる)に合わせる */
export default function ShopTabs({ tabs }: { tabs: ShopTab[] }) {
  const [offset, setOffset] = useState(110);
  useEffect(() => {
    const calc = () => {
      const w = document.documentElement.clientWidth;
      const u = Math.min(w, 1600) / 864;
      const hh = w >= 1000 ? Math.max(52, 49 * u) : 56;
      const th = w >= 1000 ? Math.max(46, 34 * u) : 46;
      setOffset(Math.round(hh + th + 8));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return <ScrollSpyTabs items={tabs} offset={offset} className="sh-tabs" />;
}
