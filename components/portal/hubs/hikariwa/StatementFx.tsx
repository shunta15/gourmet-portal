"use client";
import { useEffect } from "react";

/** 下のブロックの段落を、画面に入ったときに 1 つずつ現す（スクリプトなしでは最初から見える） */
export default function StatementFx() {
  useEffect(() => {
    const sec = document.querySelector<HTMLElement>(".hk-st");
    if (!sec) return;
    const ps = Array.from(sec.querySelectorAll<HTMLElement>("p"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    // すでに画面の中にあるものは、そのまま見せる
    const vh = window.innerHeight;
    const pending = ps.filter((p) => p.getBoundingClientRect().top > vh * 0.92);
    if (!pending.length) return;
    sec.classList.add("js");
    ps.forEach((p) => {
      if (!pending.includes(p)) p.setAttribute("data-in", "");
    });
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    pending.forEach((p) => io.observe(p));
    return () => {
      io.disconnect();
      sec.classList.remove("js");
    };
  }, []);
  return null;
}
