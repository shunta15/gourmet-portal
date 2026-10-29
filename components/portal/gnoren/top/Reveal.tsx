"use client";

import { useEffect } from "react";

/** 画面に入ったセクションをふわっと(下から)出す。prefers-reduced-motion のときは何もしない(最初から全部見える)。 */
export default function Reveal() {
  useEffect(() => {
    const root = document.querySelector(".gn-top");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    root.classList.add("gn-top-js");
    return () => {
      io.disconnect();
      root.classList.remove("gn-top-js");
    };
  }, []);
  return null;
}
