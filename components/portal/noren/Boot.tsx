"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { bandAt, jstNow, lampAt } from "@/lib/portal/noren/lamp";

/**
 * ルートに --lamp（灯りの強さ）と data-band を与え、.vN-rv の要素をスクロールで表示し、ヘッダーをスクロールで墨にする。
 * ?t=21:30 のように付けると時刻を指定して見た目を確認できる（試作の動作確認用）。
 * ページを移動したとき（レイアウトは残る）も、新しい .vN-rv を拾い直す。
 */
export default function Boot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".vN");
    if (!root) return;
    const q = new URLSearchParams(location.search).get("t");
    const set = () => {
      const t = jstNow(q);
      root.style.setProperty("--lamp", lampAt(t.hour).toFixed(3));
      root.dataset.band = bandAt(t.hour);
    };
    set();
    const iv = window.setInterval(set, 30000);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".vN");
    if (!root) return;
    root.classList.add("js");
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    root.querySelectorAll(".vN-rv:not(.in)").forEach((el) => io.observe(el));

    const hd = document.querySelector<HTMLElement>(".vN-hd");
    const onScroll = () => hd?.classList.toggle("is-solid", window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
