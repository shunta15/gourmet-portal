"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 総合サイト全体の動きを1か所で制御する（ページごとに rAF を増やさない）。
 * - [data-reveal]    画面に入ったら .is-in を付ける（1回だけ）
 * - [data-progress]  スクロール進捗を CSS 変数 --p (0〜1) に書く（="through": 画面下端から入って上端へ抜けるまで）
 * - html.mp-scrolled 少しでもスクロールしたらヘッダーを詰める
 * prefers-reduced-motion では登場アニメを使わず、全部すぐ表示する。
 */
export default function PortalMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("mp-js");

    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -4% 0px", threshold: 0.01 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("is-in") : io.observe(el)));

    const prog = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
    let raf = 0;
    const tick = () => {
      const vh = innerHeight;
      for (const el of prog) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const p = (vh - r.top) / (vh + r.height);
        el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
      }
      root.classList.toggle("mp-scrolled", scrollY > 40);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      root.classList.remove("mp-scrolled", "mp-js");
    };
  }, [pathname]);

  return null;
}
