"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollSpyTabs } from "../../common/Motion";

export type ShopTab = { id: string; label: string; sub: string };

/**
 * 追従するタブ(本番の店舗紹介。ShopTabs.tsx の本番版)。タブの並びは、ページにある節だけ(props)。場所を取らない(高さ 0)で
 * 「about」の節の上に待機し、そこがヘッダーの下まで来たら薄い帯として現れる。今の節の下線が滑る(ScrollSpyTabs)。
 * rAF はスクロール時だけ・非表示タブでは止める。
 */
export default function LiveShopTabs({ tabs }: { tabs: ShopTab[] }) {
  const sent = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  const [offset, setOffset] = useState(120);

  useEffect(() => {
    const calcOffset = () => {
      const w = document.documentElement.clientWidth;
      const u = Math.min(w, 1600) / 948;
      setOffset(w >= 860 ? Math.round((43 + 30) * u + 8) : 54 + 44 + 6);
    };
    calcOffset();
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = sent.current;
      if (!el) return;
      const w = document.documentElement.clientWidth;
      const hh = w >= 860 ? (43 * Math.min(w, 1600)) / 948 : 54;
      setOn(el.getBoundingClientRect().top < hh + 20);
    };
    const onScroll = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(calc);
    };
    const onResize = () => {
      calcOffset();
      onScroll();
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <span ref={sent} className="lsp-tabs-sent" aria-hidden="true" />
      <div className={`lsp-tabs ${on ? "is-on" : ""}`}>
        <ScrollSpyTabs items={tabs} variant="line" offset={offset} className="lsp-tabs-nav" />
      </div>
    </>
  );
}
