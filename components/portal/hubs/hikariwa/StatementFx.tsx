"use client";
import { useEffect, useRef } from "react";
import type { RGB } from "@/lib/portal/hubs/hikariwa/colors";
import { createFlowRing } from "./flowRing";

/**
 * 下のブロックの仕掛け（クライアント）。
 *  1. 背景に、最初の画面と同じ 6 色の大きな光の輪を流す（画面に出ているあいだだけ動く）。
 *  2. 段落を、画面に入ったときに 1 つずつ現す（スクリプトなしでは最初から見える）。
 */
export default function StatementFx({ colors, kinds }: { colors: RGB[]; kinds: ("live" | "quiet" | "faint")[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const g1Ref = useRef<HTMLCanvasElement>(null);
  const g2Ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sec = boxRef.current?.parentElement;
    const cv = cvRef.current;
    const g1 = g1Ref.current;
    const g2 = g2Ref.current;
    if (!sec || !cv || !g1 || !g2) return;
    const stop = createFlowRing({ root: sec, canvas: cv, glow: [g1, g2], colors, kinds });
    return stop;
  }, [colors, kinds]);

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

  return (
    <div ref={boxRef} className="hk-sfx" aria-hidden="true">
      <canvas ref={cvRef} className="hk-sc" />
      <canvas ref={g1Ref} className="hk-sg" data-k="0" />
      <canvas ref={g2Ref} className="hk-sg" data-k="1" />
    </div>
  );
}
