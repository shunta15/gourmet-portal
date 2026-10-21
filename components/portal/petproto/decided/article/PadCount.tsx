"use client";

import { useEffect, useRef } from "react";

/** 「01」「02」のような 0 埋めの数字がカウントアップ(画面に入ったとき)。表示は最終値で出して、入ったら 0 から数える。common の CountUp は 0 埋めができないのでここに置く */
export default function PadCount({ to, pad = 2, duration = 900, className }: { to: number; pad?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => String(Math.round(n)).padStart(pad, "0");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    el.textContent = fmt(0);
    let raf = 0;
    let elapsed = 0;
    let last = 0;
    const step = (t: number) => {
      const dt = last ? Math.min(t - last, 50) : 0; // 非表示タブで止まっていた時間は数えない
      last = t;
      elapsed += dt;
      const p = Math.min(1, elapsed / duration);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else el.textContent = fmt(to);
    };
    const io = new IntersectionObserver(
      (ents) => {
        if (ents.some((x) => x.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.textContent = fmt(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, pad, duration]);
  return (
    <span ref={ref} className={`ab-num ${className ?? ""}`.trim()}>
      {fmt(to)}
    </span>
  );
}
