"use client";

import { useEffect } from "react";

// 最初のページのヒーロー専用の動き(Shell の MotionFx とは別。common は触らない)。
//  1. マウスでわずかに動く視差(2 層): 写真は逆向きにゆっくり、手書き文字は同じ向きに速く。--th-x / --th-y(-1〜1)を .tp-hero-in に渡す
//  2. スクロールで文字の層だけ先に上へ抜ける視差: --th-s(0〜1)
//  3. 検索の箱のプレースホルダーがタイプライターのように打たれる
// hover できる画面でだけマウス、PC 幅(860px 以上)でだけ視差。動きを減らす設定では何もしない(すべて最終の状態のまま)。画面の外・非表示タブでは何もしない。

const PLACEHOLDER = "エリア・駅名・お店の名前で探す";
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function HeroFx({ placeholder = PLACEHOLDER }: { placeholder?: string } = {}) {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".tp-hero-in");
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: Array<() => void> = [];

    // ---- タイプライター(検索の箱のプレースホルダー。ポップインのあとに打つ) ----
    const input = hero.querySelector<HTMLInputElement>(".tp-search-in");
    if (input) {
      let i = 0;
      let timer = 0;
      input.placeholder = "";
      const type = () => {
        if (input.value || document.activeElement === input) {
          input.placeholder = placeholder;
          return;
        }
        i += 1;
        input.placeholder = placeholder.slice(0, i);
        if (i < placeholder.length) timer = window.setTimeout(type, 58);
      };
      timer = window.setTimeout(type, 1500);
      cleanups.push(() => {
        window.clearTimeout(timer);
        input.placeholder = placeholder;
      });
    }

    // ---- 視差(マウス・スクロール) ----
    const wide = window.matchMedia("(min-width: 860px)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let lastS = -1;
    let visible = true;
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (!wide.matches || document.hidden || !visible) return;
      cx += (tx - cx) * 0.085;
      cy += (ty - cy) * 0.085;
      if (Math.abs(tx - cx) < 0.0008) cx = tx;
      if (Math.abs(ty - cy) < 0.0008) cy = ty;
      hero.style.setProperty("--th-x", cx.toFixed(4));
      hero.style.setProperty("--th-y", cy.toFixed(4));
      const s = clamp(window.scrollY / Math.max(1, hero.offsetHeight * 0.95), 0, 1);
      const ss = s.toFixed(4);
      if (ss !== String(lastS)) {
        lastS = Number(ss);
        hero.style.setProperty("--th-s", ss);
      }
      if (cx !== tx || cy !== ty) schedule();
    };
    const schedule = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !visible) return;
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      ty = clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      schedule();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };
    const io = new IntersectionObserver(
      (ents) => {
        visible = ents.some((x) => x.isIntersecting);
        if (visible) schedule();
      },
      { rootMargin: "60px 0px 60px 0px" },
    );
    io.observe(hero);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
    }
    schedule();
    cleanups.push(() => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      hero.style.removeProperty("--th-x");
      hero.style.removeProperty("--th-y");
      hero.style.removeProperty("--th-s");
    });

    return () => cleanups.forEach((f) => f());
  }, [placeholder]);
  return null;
}
