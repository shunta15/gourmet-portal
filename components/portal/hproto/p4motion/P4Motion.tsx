"use client";

import { useLayoutEffect } from "react";

/**
 * 総合トップ(見本4)の動きの司令塔。見た目は変えず、クラスと CSS 変数を切り替えるだけ(動きそのものは p4motion.css)。
 * - 画面に入った段を IntersectionObserver で見つけて .p4m-in を付ける(スクロールのたびに重い計算はしない)。
 * - パララックスは scroll を requestAnimationFrame でまとめ、transform だけを書く。
 * - ホバーの傾きは pointermove を requestAnimationFrame でまとめ、CSS 変数 2 つだけ書く。マウスのときだけ。
 * - prefers-reduced-motion: reduce のときは何もしない(今と同じ見た目で出る)。
 */
export default function P4Motion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".p4m");
    if (!root) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const cleanups: (() => void)[] = [];
    const vh = window.innerHeight;

    // 1. 段の登場。最初から画面に入っている段は動かさず(読み込み直後のちらつきを避ける)、まだ下にある段だけ隠して、入ってきたら出す
    const ios = Array.from(root.querySelectorAll<HTMLElement>(".p4m-io"));
    const pending: HTMLElement[] = [];
    for (const el of ios) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("p4m-in");
      else pending.push(el);
    }
    root.classList.add("p4m-on");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("p4m-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    pending.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // 2. ヒーローが画面の外にある間は、ずっと続く動き(呼吸・ゆれ)を止める
    const collage = root.querySelector<HTMLElement>(".p4m-collage");
    if (collage) {
      const hio = new IntersectionObserver(([e]) => root.classList.toggle("p4m-paused", !e.isIntersecting), { threshold: 0 });
      hio.observe(collage);
      cleanups.push(() => hio.disconnect());
    }

    // 3. パララックス: 街並みの線画(ゆっくり)・写真のコラージュ(もっと少し)・下の段の街の絵(画面の中心との距離)
    const street = root.querySelector<HTMLElement>(".p4m-street");
    const pars = Array.from(root.querySelectorAll<HTMLElement>(".p4m-par"));
    const parVisible = new Set<HTMLElement>();
    const pio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const t = e.target as HTMLElement;
        if (e.isIntersecting) parVisible.add(t);
        else parVisible.delete(t);
      }
      schedule();
    });
    pars.forEach((el) => pio.observe(el.parentElement ?? el));
    cleanups.push(() => pio.disconnect());
    let ticking = false;
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    const tick = () => {
      ticking = false;
      const y = window.scrollY;
      root.classList.toggle("p4m-scrolled", y > 0);
      if (y < 1600) {
        if (street) street.style.transform = `translate3d(0,${Math.min(y * 0.12, 30).toFixed(1)}px,0)`;
        if (collage) collage.style.transform = `translate3d(0,${Math.min(y * 0.05, 14).toFixed(1)}px,0)`;
      }
      // 読みを先にまとめてから書く
      const reads: [HTMLElement, number][] = [];
      for (const el of pars) {
        const host = el.parentElement ?? el;
        const r = host.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) continue;
        const k = Number(el.dataset.par ?? 0.05);
        reads.push([el, clamp((r.top + r.height / 2 - window.innerHeight / 2) * k, 14)]);
      }
      for (const [el, d] of reads) el.style.transform = `translate3d(0,${d.toFixed(1)}px,0)`;
    };
    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    cleanups.push(() => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    });
    schedule();

    // 4. ホバー: 触ったものに .p4m-hov を付け、カーソルの位置に少し傾ける(CSS 変数 --rx / --ry だけ書く)
    let cur: HTMLElement | null = null;
    let raf = 0;
    let px = 0;
    let py = 0;
    const leave = () => {
      if (!cur) return;
      cur.classList.remove("p4m-hov");
      cur.style.removeProperty("--rx");
      cur.style.removeProperty("--ry");
      cur = null;
    };
    const apply = () => {
      raf = 0;
      if (!cur) return;
      const r = cur.getBoundingClientRect();
      const nx = clamp(((px - r.left) / r.width) * 2 - 1, 1);
      const ny = clamp(((py - r.top) / r.height) * 2 - 1, 1);
      cur.style.setProperty("--ry", `${(nx * 7).toFixed(2)}deg`);
      cur.style.setProperty("--rx", `${(-ny * 7).toFixed(2)}deg`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const t = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (t !== cur) {
        leave();
        cur = t;
        if (t) t.classList.add("p4m-hov");
      }
      if (!t) return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", leave);
    cleanups.push(() => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
      leave();
    });

    return () => {
      cleanups.forEach((f) => f());
      root.classList.remove("p4m-on", "p4m-paused", "p4m-scrolled");
      for (const el of ios) el.classList.remove("p4m-in");
      for (const el of [street, collage, ...pars]) if (el) el.style.transform = "";
    };
  }, []);
  return null;
}
