"use client";
/**
 * 「重ねる」案(?fx=2)の、触る・なぞる(クライアント)。マウスや指の位置を -1〜1 にして CSS 変数 --mx / --my に入れるだけ(動かすのは CSS)。
 * 画面に見えているときだけ聞く。動きを減らす設定のときは何もしない。タッチはスクロールを奪わない(passive)。
 */
import { useEffect, useRef } from "react";

export default function FxPointer({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let vis = false;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.setProperty("--mx", cx.toFixed(3));
      el.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(tick);
    };
    const go = () => {
      if (vis && !raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
      go();
    };
    const end = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") { tx = 0; ty = 0; go(); }
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; go(); }, { rootMargin: "0px" });
    io.observe(el);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", move, { passive: true });
    addEventListener("pointerup", end, { passive: true });
    addEventListener("pointercancel", end, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", move);
      removeEventListener("pointerup", end);
      removeEventListener("pointercancel", end);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className={className} id={id}>{children}</div>;
}
