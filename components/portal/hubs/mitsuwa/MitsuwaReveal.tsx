"use client";
import { useEffect } from "react";

/**
 * 下のブロックの各段落を、スクロールで画面に入ったときに下からせり上げる（見えるだけの演出）。
 * スクリプトが動いたとき（.mws に data-js を付けたあと）だけ隠した状態から始める。動きを減らす設定では何もしない（初めから全部見える）。
 */
export default function MitsuwaReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".mws");
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    root.setAttribute("data-js", "");
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.removeAttribute("data-js");
    };
  }, []);
  return null;
}
