"use client";
import { useEffect } from "react";

/**
 * 下のブロックの登場（クライアント。見た目は何も出さない）。
 *  - 画面に入った [data-rv] に .in を付ける。CSS は、スクリプトが動き、動きを減らす設定でないときだけ、.in の前を隠す。
 *    画面の外へ出たときに戻さない（一度出たら、そのまま）。
 *  - [data-live]（回り続ける輪の場面）は、画面の外にいるあいだ data-vis="0" にして、動き（CSS animation）を止める。
 */
export default function StatementMotion() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ng-st [data-rv]"));
    const live = Array.from(document.querySelectorAll<HTMLElement>(".ng-st [data-live]"));
    if (!els.length && !live.length) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // 場面 3「輪が広がる」: 場面が画面を通るあいだ、進み具合 --p（0〜1）を書く。CSS が、小さな輪から、皿が増えて輪が外へ広がる絵にする。
    // 動きを減らす設定では書かない（CSS の既定の 1＝広がりきった姿のまま）
    const a3 = document.querySelector<HTMLElement>(".ng-st .act.a3");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const upd = () => {
      raf = 0;
      if (!a3 || mq.matches) return;
      const r = a3.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = (vh - r.top) / (vh + r.height); // 0: 下から入り始め → 1: 上へ出きる
      const p = Math.min(1, Math.max(0, (t - 0.16) / 0.42));
      a3.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(upd);
    };
    if (a3) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      upd();
    }
    const vis = new IntersectionObserver(
      (es) => {
        for (const e of es) (e.target as HTMLElement).dataset.vis = e.isIntersecting ? "1" : "0";
      },
      { threshold: 0 },
    );
    live.forEach((el) => vis.observe(el));
    return () => {
      io.disconnect();
      vis.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
