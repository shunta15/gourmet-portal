"use client";

import { useEffect } from "react";

/**
 * 下のブロックの手触り(軽いスクリプト)。canvas は増やさない。
 * - ガラスに乗せた位置を CSS 変数 --wx / --wy に入れる(曇りの晴れ始めの位置)
 * - 触って操作する端末では、ガラスが画面の真ん中あたりに入ったら晴らす(.is-in)
 * 毎コマ React の state は書かない。
 */
export default function KumoriFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".k-below");
    if (!root) return;
    const panes = Array.from(root.querySelectorAll<HTMLElement>("[data-wipe]"));
    const move = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--wx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--wy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    panes.forEach((p) => {
      p.addEventListener("pointerenter", move);
      p.addEventListener("pointermove", move);
    });
    let io: IntersectionObserver | undefined;
    if (window.matchMedia("(hover: none)").matches) {
      io = new IntersectionObserver(
        (es) => es.forEach((en) => en.target.classList.toggle("is-in", en.isIntersecting)),
        { rootMargin: "-26% 0px -26% 0px" },
      );
      panes.forEach((p) => io!.observe(p));
    }
    return () => {
      io?.disconnect();
      panes.forEach((p) => {
        p.removeEventListener("pointerenter", move);
        p.removeEventListener("pointermove", move);
      });
    };
  }, []);
  return null;
}
