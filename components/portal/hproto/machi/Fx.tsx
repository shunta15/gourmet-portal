"use client";
import { useEffect } from "react";

/** 全体の触ったときの動き。.hm-press を押すとぽんと弾む。 */
export default function Fx() {
  useEffect(() => {
    const root = document.querySelector(".hm-root");
    if (!root) return;
    const down = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(".hm-press") as HTMLElement | null;
      if (!el) return;
      el.classList.remove("hm-pop"); void el.offsetWidth; el.classList.add("hm-pop");
      window.setTimeout(() => el.classList.remove("hm-pop"), 600);
    };
    const jump = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(".hm-jump") as HTMLElement | null;
      if (!el) return;
      el.classList.remove("hm-jumping"); void el.offsetWidth; el.classList.add("hm-jumping");
      window.setTimeout(() => el.classList.remove("hm-jumping"), 760);
    };
    root.addEventListener("pointerdown", down, { passive: true });
    root.addEventListener("click", jump);
    return () => { root.removeEventListener("pointerdown", down); root.removeEventListener("click", jump); };
  }, []);
  return null;
}
