"use client";

import { useEffect } from "react";

/**
 * スクロールで要素をふわっと出す(data-rv を付けた要素)。メモ紙は少し傾きながら落ち着く。
 * - JS が動いたときだけ .is-armed を付けて隠す(JS が無ければ最初から見える)。
 * - prefers-reduced-motion のときは何もしない(最初から全部見える)。
 */
export default function FeatureReveal({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    root.classList.add("is-armed");
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("is-armed");
      els.forEach((el) => el.classList.remove("is-in"));
    };
  }, [rootId]);
  return null;
}
