"use client";

import { useEffect } from "react";

/**
 * ヒーローの視差用(探す・店舗紹介で共用)。スクロール量を 0〜1 にして、target の入れ物の --hp に渡す。
 *   0 = ページの先頭(見本どおりの位置・大きさ)/ 1 = ヒーローの下端が画面の上に抜けたとき。
 * 先頭で必ず 0 になるので、レイアウトは見本のまま(MotionFx の --p は画面の中ほどが基準なので、先頭で 0 にならない)。
 * 使い方: <HeroScroll target=".sr-hero" /> を置いて、CSS で scale / translate を calc(var(--hp, 0) * …) にする。
 * 動きを減らす設定では何もしない(--hp は 0 のまま)。スクロール時だけ rAF 1 回(レイアウトの読み取りは resize のときだけ)。
 */
export default function HeroScroll({ target }: { target: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let range = 1;
    let last = "";
    let raf = 0;
    const measure = () => {
      range = Math.max(1, el.getBoundingClientRect().bottom + window.scrollY);
    };
    const apply = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / range)).toFixed(3);
      if (p !== last) {
        last = p;
        el.style.setProperty("--hp", p);
      }
    };
    const on = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(apply);
    };
    measure();
    apply();
    window.addEventListener("scroll", on, { passive: true });
    const onResize = () => {
      measure();
      on();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty("--hp");
    };
  }, [target]);
  return null;
}
