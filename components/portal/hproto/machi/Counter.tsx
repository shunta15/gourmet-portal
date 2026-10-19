"use client";
import { useEffect, useRef, useState } from "react";

/** 画面に入ったとき一度だけ 0 から数え上がる。reduced-motion では最終値のまま。 */
export default function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setV(0);
    let raf = 0, started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now(), dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { run(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className={className}>{v}</span>;
}
