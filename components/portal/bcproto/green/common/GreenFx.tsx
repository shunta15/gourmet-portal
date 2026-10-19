"use client";

import { useEffect } from "react";

/**
 * グリーン案の画面全体の動き(layout に 1 つだけ置く。見た目は base.css)。
 *  - [data-rv] : 画面に入ると出る(.is-in が付く)。[data-rv-group] の中は順番に 70ms ずつずらす(--d)
 *  - [data-par="0.1"] : スクロールに合わせて少しずれる(translate。値が大きいほど動く。負で逆向き)
 *  - [data-scrollp] : 画面を通り抜ける進み具合を --p(0〜1)で渡す(地図が少し寄る等。CSS 側で scale: calc(1 + var(--p) * .08))
 *  - 上端の進み具合の線(.gr-progress)・ヘッダーの隠れる/現れる([data-gr-head] に is-hidden / is-scrolled)
 *  - 端の若葉(.gr-edge)のパララックス(--sy)
 * prefers-reduced-motion では動かさず、すべて表示済みにする。画面外・非表示タブでは何も回さない(スクロール駆動のみ)。
 */
export default function GreenFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".gr-root");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const head = root.querySelector<HTMLElement>("[data-gr-head]");
    const bar = root.querySelector<HTMLElement>(".gr-progress");
    const edges = Array.from(root.querySelectorAll<HTMLElement>(".gr-edge"));
    const cleanups: Array<() => void> = [];

    // ---- 出現 ----
    const seen = new WeakSet<Element>();
    const io =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (ents) => {
              for (const en of ents) {
                if (en.isIntersecting) {
                  en.target.classList.add("is-in");
                  io?.unobserve(en.target);
                }
              }
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
          )
        : null;
    const register = () => {
      root.querySelectorAll<HTMLElement>("[data-rv]:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const g = el.closest("[data-rv-group]");
        if (g && !el.style.getPropertyValue("--d")) {
          const idx = Array.prototype.indexOf.call(g.querySelectorAll("[data-rv]"), el);
          el.style.setProperty("--d", `${Math.min(Math.max(idx, 0), 10) * 70}ms`);
        }
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
    };
    register();
    const mo = new MutationObserver(() => register());
    mo.observe(root, { childList: true, subtree: true });
    cleanups.push(() => {
      mo.disconnect();
      io?.disconnect();
    });

    // ---- スクロール駆動 ----
    let raf = 0;
    let lastY = window.scrollY;
    let hidden = false;
    const setHy = (h: boolean) => {
      if (h === hidden) return;
      hidden = h;
      head?.classList.toggle("is-hidden", h);
      root.style.setProperty("--gr-hy", h ? "0px" : "var(--gr-hh)");
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max)).toFixed(4)})`;
      head?.classList.toggle("is-scrolled", y > 8);
      const dy = y - lastY;
      if (!reduce) {
        if (y < 120) setHy(false);
        else if (dy > 4) setHy(true);
        else if (dy < -4) setHy(false);
      }
      lastY = y;
      if (reduce) return;
      for (const e of edges) e.style.setProperty("--sy", String(Math.round(y)));
      const vh = window.innerHeight;
      root.querySelectorAll<HTMLElement>("[data-par],[data-scrollp]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const par = el.getAttribute("data-par");
        if (par) el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(par)).toFixed(1)}px`;
        if (el.hasAttribute("data-scrollp")) {
          const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
          el.style.setProperty("--p", p.toFixed(3));
        }
      });
    };
    const onScroll = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    });

    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}
