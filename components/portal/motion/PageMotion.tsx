"use client";

import { useEffect } from "react";
import "./motion.css";

/**
 * ページ全体の動き(data 属性で動く汎用版)。何も描画しない。各業種の外枠に 1 つ置く。
 * 属性が付いた要素だけに効くので、付けていないページ・要素には影響しない。使い方は README.md。
 *  - data-mo / data-mo-group / data-mo-delay : スクロール出現(is-in を付ける)
 *  - data-mo-px / data-mo-p                  : スクロール連動(--mo-y / --mo-p)
 *  - data-mo-hover~="tilt"                   : 傾き(--mo-rx / --mo-ry)。他の hover は CSS だけ
 *  - data-mo-live                            : ずっと動く物。画面外は is-off で止める
 * prefers-reduced-motion: reduce のときは JS は何もしない(CSS 側で全部「表示済み」)。
 * 複数置かれても <html data-mo-fx> の印で 1 つ目だけが動く。
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

interface PxRec {
  el: HTMLElement;
  k: number;
  last: string;
}
interface PRec {
  el: HTMLElement;
  last: string;
}

export default function PageMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const html = document.documentElement;
    if (html.dataset.moFx) return; // 2 つ目以降は動かない
    html.dataset.moFx = "1";
    const cleanups: Array<() => void> = [];

    // ---- 1 フレームにまとめる rAF(非表示タブでは何もしない) ----
    let raf = 0;
    let frame: () => void = () => {};
    const schedule = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(() => frame());
    };

    // ---- 出現(data-mo) ----
    const hasIO = "IntersectionObserver" in window;
    const io = hasIO
      ? new IntersectionObserver(
          (ents) => {
            for (const en of ents) {
              if (en.isIntersecting) {
                en.target.classList.add("is-in");
                io?.unobserve(en.target);
              }
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        )
      : null;
    // wipe(clip-path で上端 1px だけ残して隠す)は、Chrome の IO が clip-path を考慮するため交差率がほぼ 0 になる → 閾値 0 で観察する
    const ioWipe = hasIO
      ? new IntersectionObserver(
          (ents) => {
            for (const en of ents) {
              if (en.isIntersecting) {
                en.target.classList.add("is-in");
                ioWipe?.unobserve(en.target);
              }
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0 },
        )
      : null;
    // ---- ずっと動く物(data-mo-live): 画面の外では止める ----
    const liveIo = hasIO
      ? new IntersectionObserver(
          (ents) => {
            for (const en of ents) en.target.classList.toggle("is-off", !en.isIntersecting);
          },
          { rootMargin: "80px 0px 80px 0px" },
        )
      : null;

    const seen = new WeakSet<Element>();
    const liveSeen = new WeakSet<Element>();
    const pxSeen = new WeakSet<Element>();
    const pSeen = new WeakSet<Element>();
    const pxs: PxRec[] = [];
    const ps: PRec[] = [];

    const register = () => {
      let added = false;
      document.querySelectorAll<HTMLElement>("[data-mo]").forEach((el) => {
        if (el.classList.contains("is-in") || seen.has(el)) return;
        seen.add(el);
        const own = el.getAttribute("data-mo-delay");
        const g = el.closest<HTMLElement>("[data-mo-group]");
        if (own !== null && own !== "" && Number.isFinite(Number(own))) {
          el.style.setProperty("--mo-d", `${Number(own)}ms`);
        } else if (g) {
          const step = parseFloat(g.getAttribute("data-mo-group") ?? "") || 80;
          const idx = Array.prototype.indexOf.call(g.querySelectorAll("[data-mo]"), el);
          el.style.setProperty("--mo-d", `${Math.min(Math.max(idx, 0), 12) * step}ms`);
        }
        if (io && ioWipe) (el.getAttribute("data-mo") === "wipe" ? ioWipe : io).observe(el);
        else el.classList.add("is-in");
      });
      if (liveIo) {
        document.querySelectorAll<HTMLElement>("[data-mo-live]").forEach((el) => {
          if (liveSeen.has(el)) return;
          liveSeen.add(el);
          const dl = el.getAttribute("data-mo-live-delay");
          if (dl !== null && dl !== "" && Number.isFinite(Number(dl))) el.style.setProperty("animation-delay", `${Number(dl)}s`);
          liveIo.observe(el);
        });
      }
      document.querySelectorAll<HTMLElement>("[data-mo-px]").forEach((el) => {
        if (pxSeen.has(el)) return;
        pxSeen.add(el);
        const k = clamp(parseFloat(el.getAttribute("data-mo-px") ?? ""), -0.3, 0.3);
        if (Number.isFinite(k) && k !== 0) {
          pxs.push({ el, k, last: "" });
          added = true;
        }
      });
      document.querySelectorAll<HTMLElement>("[data-mo-p]").forEach((el) => {
        if (pSeen.has(el)) return;
        pSeen.add(el);
        ps.push({ el, last: "" });
        added = true;
      });
      for (let i = pxs.length - 1; i >= 0; i--) if (!pxs[i].el.isConnected) pxs.splice(i, 1);
      for (let i = ps.length - 1; i >= 0; i--) if (!ps[i].el.isConnected) ps.splice(i, 1);
      if (added) schedule();
    };
    register();

    // 保険: 画面の中にあるのに出ていない要素(IntersectionObserver が拾えなかったとき)を、読み込み後に 1 回だけ出す
    const sweep = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-mo]:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh && r.right > 0 && r.left < window.innerWidth) el.classList.add("is-in");
      });
    };
    const sweepTimer = window.setTimeout(sweep, 3000);
    cleanups.push(() => window.clearTimeout(sweepTimer));

    // 後から増えた要素(探すページの絞り込み結果など)も登録
    let mtimer = 0;
    const mo = new MutationObserver(() => {
      if (mtimer) return;
      mtimer = window.setTimeout(() => {
        mtimer = 0;
        register();
      }, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => {
      mo.disconnect();
      if (mtimer) window.clearTimeout(mtimer);
      io?.disconnect();
      ioWipe?.disconnect();
      liveIo?.disconnect();
    });

    // ---- 非表示タブでは続く動きを止める ----
    const onVis = () => {
      html.toggleAttribute("data-mo-hidden", document.hidden);
      if (!document.hidden) schedule();
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    cleanups.push(() => {
      document.removeEventListener("visibilitychange", onVis);
      html.removeAttribute("data-mo-hidden");
    });

    // ---- 1 フレームの処理(読んでから書く) ----
    frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      // 読む
      const pxR = pxs.map((r) => r.el.getBoundingClientRect());
      const pR = ps.map((r) => r.el.getBoundingClientRect());
      // 書く
      for (let i = 0; i < pxs.length; i++) {
        const r = pxR[i];
        if (r.bottom < -vh || r.top > vh * 2) continue; // 上下 1 画面以上離れた要素は触らない
        const off = r.top + r.height / 2 - vh / 2;
        const s = (off * pxs[i].k).toFixed(1);
        if (s !== pxs[i].last) {
          pxs[i].last = s;
          pxs[i].el.style.setProperty("--mo-y", `${s}px`);
        }
      }
      for (let i = 0; i < ps.length; i++) {
        const r = pR[i];
        const p = clamp((vh - r.top) / (vh + r.height));
        const s = p.toFixed(3);
        if (s !== ps[i].last) {
          ps[i].last = s;
          ps[i].el.style.setProperty("--mo-p", s);
        }
      }
    };
    frame();
    const onScroll = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame = () => {};
    });

    // ---- 傾き(data-mo-hover~="tilt")。document に 1 つ委譲 ----
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let cur: HTMLElement | null = null;
      const find = (t: EventTarget | null): HTMLElement | null =>
        t instanceof Element ? t.closest<HTMLElement>('[data-mo-hover~="tilt"]') : null;
      const reset = (el: HTMLElement) => {
        el.style.setProperty("--mo-rx", "0deg");
        el.style.setProperty("--mo-ry", "0deg");
      };
      const onOver = (e: PointerEvent) => {
        const el = find(e.target);
        if (el === cur) return;
        if (cur) reset(cur);
        cur = el;
      };
      const onMove = (e: PointerEvent) => {
        if (!cur) return;
        const r = cur.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const nx = clamp((e.clientX - r.left) / r.width) - 0.5; // -0.5〜0.5
        const ny = clamp((e.clientY - r.top) / r.height) - 0.5;
        cur.style.setProperty("--mo-rx", `${(-ny * 12).toFixed(2)}deg`);
        cur.style.setProperty("--mo-ry", `${(nx * 16).toFixed(2)}deg`);
      };
      const onOut = (e: PointerEvent) => {
        if (!cur) return;
        const to = e.relatedTarget;
        if (to instanceof Node && cur.contains(to)) return;
        reset(cur);
        cur = null;
      };
      document.addEventListener("pointerover", onOver);
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut);
      cleanups.push(() => {
        document.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerout", onOut);
        if (cur) reset(cur);
        cur = null;
      });
    }

    return () => {
      cleanups.forEach((f) => f());
      delete html.dataset.moFx;
    };
  }, []);
  return null;
}
