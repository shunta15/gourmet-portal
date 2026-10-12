"use client";
/**
 * 入口の「地図で見つける」の全国図の舞台（目印・点線・絵が入る箱）。ピンが立つ動き（lib/portal/noren/jpBand.ts の目印）の合図だけを出す。
 * - 目印は、サーバーで作った <a href>（JavaScript が動かなくても押せる・見える）。この部品は、箱が画面に入ったとき 1 回だけ data-phase を "on" にする（CSS が、ピンを順に立てる）。
 * - data-phase: "static"（既定。サーバーの HTML のまま。ピンは最初から立っている）→ "pre"（動きを出す準備。ピンはまだ立っていない）→ "on"（立てる。1 回だけ）。
 * - 「動きを減らす」設定・IntersectionObserver が無い環境では、static のまま（最初から立っている）。
 */
import { useEffect, useRef, useState } from "react";

export default function BlockTopReveal({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"static" | "pre" | "on">("static");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    setPhase("pre");
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setPhase("on");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} data-phase={phase} role="group" aria-label={label}>
      {children}
    </div>
  );
}
