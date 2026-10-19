"use client";
import { useEffect } from "react";

/** 全体の触ったときの動き。.h2-press を押すとぽんと弾む。 */
export default function Fx() {
  useEffect(() => {
    const root = document.querySelector(".h2-root");
    if (!root) return;
    const down = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(".h2-press") as HTMLElement | null;
      if (!el) return;
      el.classList.remove("h2-pop"); void el.offsetWidth; el.classList.add("h2-pop");
      window.setTimeout(() => el.classList.remove("h2-pop"), 600);
    };
    root.addEventListener("pointerdown", down, { passive: true });
    return () => root.removeEventListener("pointerdown", down);
  }, []);
  return null;
}
