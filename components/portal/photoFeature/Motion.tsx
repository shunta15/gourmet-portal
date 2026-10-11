"use client";
import { useEffect } from "react";

/**
 * 写真の特集（試作）の動き。軽く、transform と opacity だけ。
 *  - .pf-rv   : 画面に入ると、少しずれた所から現れる（opacity・transform）
 *  - [data-par]   : 写真（img）が、枠の中で少しずつ違う速さでずれる（枠からはみ出さない範囲）
 *  - [data-drift] : 重なった写真が、ほんの少し違う速さで動く（translate）
 * 「動きを減らす」設定では何もしない（最初から全部見える）。effect の後始末（監視・イベント・フレーム・クラス）を戻す。
 */
export default function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pf-root");
    if (!root) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    root.classList.add("pf-js");

    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    root.querySelectorAll(".pf-rv, .pf-rvb, .pf-rvs").forEach((el) => io.observe(el));

    const pars = Array.from(root.querySelectorAll<HTMLElement>("[data-par]"));
    const drifts = Array.from(root.querySelectorAll<HTMLElement>("[data-drift]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of pars) {
        const host = el.parentElement;
        if (!host) continue;
        const r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const k = parseFloat(el.dataset.par || "0.5");
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        // 写真は枠より 8% 大きく置いてあるので、上下 4% までずらしても枠の外は見えない
        el.style.setProperty("--py", `${(-p * r.height * 0.038 * k).toFixed(1)}px`);
      }
      for (const el of drifts) {
        const r = (el.parentElement ?? el).getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) continue;
        const k = parseFloat(el.dataset.drift || "1");
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        el.style.setProperty("--dy", `${(p * k * 22).toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("pf-js");
      for (const el of pars) el.style.removeProperty("--py");
      for (const el of drifts) el.style.removeProperty("--dy");
    };
  }, []);
  return null;
}
