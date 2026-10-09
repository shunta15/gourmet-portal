"use client";
import { useEffect } from "react";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * 店ごとの暖簾（.vH-door）の持ち上がり具合を、スクロールの位置から決める。ページに 1 つだけ置く（何も描かない）。
 * 画面に入ってきた店の暖簾が上がる（くぐる）。--lift = 布が上がる量、--ex = 戸口が写真いっぱいに広がる量。
 * 動きを減らす設定では、最初から上がった状態。画面の近くにある暖簾だけを毎フレーム更新する。
 */
export default function DoorLift() {
  useEffect(() => {
    const doors = Array.from(document.querySelectorAll<HTMLElement>(".vH-door"));
    if (doors.length === 0) return;
    const set = (el: HTMLElement, lift: number) => {
      el.style.setProperty("--lift", lift.toFixed(4));
      el.style.setProperty("--ex", ease(clamp((lift - 0.12) / 0.8, 0, 1)).toFixed(4));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doors.forEach((d) => set(d, 1));
      return;
    }
    const near = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) near.add(e.target as HTMLElement);
          else near.delete(e.target as HTMLElement);
        }
        update();
      },
      { rootMargin: "20% 0px 20% 0px" }
    );
    doors.forEach((d) => io.observe(d));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      near.forEach((d) => {
        const r = d.getBoundingClientRect();
        // 暖簾が画面の下 22% に入ったところから上がり始め、画面の上 1/6 あたりに来るまでに上がりきる（掛かっているうちに、名前を読める）
        set(d, clamp((vh * 0.78 - r.top) / (vh * 0.62), 0, 1));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
