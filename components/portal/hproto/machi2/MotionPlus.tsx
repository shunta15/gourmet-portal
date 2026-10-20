"use client";
import { useEffect } from "react";
import { subscribeSeason, getSeason } from "./seasonStore";
import "./motion-plus.css";

/**
 * 追加の動き(DOM に印と変数を付けるだけ。見た目は motion-plus.css)。Lower.tsx・lower.css には触らない。
 *  - 季節が変わる瞬間: 画面の端から季節の物(花びら・光・葉・雪)が一斉に吹き抜ける(Season Gust)
 *  - スクロール: 特集スライド・最新情報が下から拭かれて拡大して入る(Mask Reveal + Scale In) / 速さでカード列が傾く(Velocity Skew) /
 *    最初の画面がじわっと寄る(Hero Zoom) / 見出しの字がずっと波打つ(Wave Loop・見えている間だけ)
 *  - 触ったとき(マウスのみ): 業種の札・カード・スライドが 3D に傾く(Tilt) / ボタンが吸い寄せられる(Magnet) / 光の輪が後ろをついてくる(Cursor Halo)
 * rAF は動いている間だけ回し、画面外・非表示タブでは止める。prefers-reduced-motion では何もしない。スマホ(幅 700 以下)では軽くする。
 */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
type Item = { el: HTMLElement; mode: "tilt" | "magnet"; tx: number; ty: number; cx: number; cy: number };

export default function MotionPlus() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".h2-root");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.matchMedia("(max-width: 700px)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];
    const t0 = performance.now();

    // 1. 季節が変わる瞬間の吹き抜け
    const stage = root.querySelector<HTMLElement>(".h2-hero-stage");
    let last = getSeason();
    if (stage) {
      const box = document.createElement("div");
      box.className = "h2p-gust"; box.setAttribute("aria-hidden", "true");
      stage.appendChild(box);
      const off = subscribeSeason((s) => {
        if (s === last) return;
        last = s;
        if (performance.now() - t0 < 2500 || document.hidden) return;
        const n = small ? 10 : 24;
        for (let k = 0; k < n; k++) {
          const e = document.createElement("i");
          e.className = `h2p-g h2p-g-${s}`;
          const sz = 0.7 + Math.random() * 1.1;
          e.style.cssText = `--y0:${(Math.random() * 100).toFixed(1)}%;--dy:${Math.round((Math.random() - (s === "winter" ? 0.1 : 0.5)) * 150)}px;--z:${sz.toFixed(2)};--d:${(Math.random() * 0.7).toFixed(2)}s;--t:${(1.6 + Math.random() * 1.2).toFixed(2)}s;--r:${Math.round(360 + Math.random() * 720)}deg`;
          e.addEventListener("animationend", () => e.remove(), { once: true });
          box.appendChild(e);
        }
      });
      cleanups.push(() => { off(); box.remove(); });
    }

    // 2. 見えている間だけ: 見出しの波(h2p-vis)
    const vio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("h2p-vis", e.isIntersecting)));
    root.querySelectorAll(".h2-ttl, .h2p-marq").forEach((el) => vio.observe(el));
    cleanups.push(() => vio.disconnect());

    // 3. スクロール連動(--h2p-hp / --h2p-v / --h2p-p)。rAF はスクロール中だけ
    // 拭きの対象は「最初に画面の下にある物」だけ。12 秒スクロールされなければ全部外す(全体スクショ・書き出しで切れたままにしない)
    let wipes = Array.from(root.querySelectorAll<HTMLElement>(".h2-slidewrap, .h2-news")).filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.97);
    let scrolled = false;
    const giveUp = window.setTimeout(() => { if (scrolled) return; wipes.forEach((el) => { el.classList.remove("h2p-wipe"); el.style.removeProperty("--h2p-p"); }); wipes = []; }, 12000);
    cleanups.push(() => window.clearTimeout(giveUp));
    let raf = 0, lastY = window.scrollY, sv = 0;
    const upd = () => {
      raf = 0;
      if (document.hidden) return;
      const y = window.scrollY, vh = window.innerHeight;
      sv += (clamp((y - lastY) / 38, -1, 1) - sv) * 0.22; lastY = y;
      root.style.setProperty("--h2p-v", sv.toFixed(3));
      root.style.setProperty("--h2p-hp", clamp(y / (vh * 0.8), 0, 1).toFixed(3));
      for (const el of wipes) {
        const r = el.getBoundingClientRect();
        const p = clamp((vh * 0.97 - r.top) / (vh * 0.5), 0, 1);
        if (p >= 0.999) { if (el.classList.contains("h2p-wipe")) { el.classList.remove("h2p-wipe"); el.style.removeProperty("--h2p-p"); } }
        else { el.classList.add("h2p-wipe"); el.style.setProperty("--h2p-p", p.toFixed(3)); }
      }
      if (Math.abs(sv) > 0.01) raf = requestAnimationFrame(upd);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(upd); };
    const onScroll = () => { scrolled = true; kick(); };
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", kick);
    kick();
    cleanups.push(() => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", kick); });

    // 4. 触ったとき(マウスのみ・スマホは無し)
    if (fine && !small) {
      const items = new Map<HTMLElement, Item>();
      const halo = document.createElement("div");
      halo.className = "h2p-halo"; halo.setAttribute("aria-hidden", "true");
      document.body.appendChild(halo);
      let hx = -100, hy = -100, hcx = -100, hcy = -100, hr = 0, shown = false, vis2 = true;
      const loop = () => {
        hr = 0;
        if (document.hidden || !vis2) return;
        let again = false;
        hcx += (hx - hcx) * 0.2; hcy += (hy - hcy) * 0.2;
        halo.style.translate = `${hcx.toFixed(1)}px ${hcy.toFixed(1)}px`;
        if (Math.abs(hx - hcx) > 0.3 || Math.abs(hy - hcy) > 0.3) again = true;
        items.forEach((it, el) => {
          it.cx += (it.tx - it.cx) * 0.16; it.cy += (it.ty - it.cy) * 0.16;
          if (it.mode === "tilt") {
            const mag = Math.hypot(it.cx, it.cy);
            el.style.rotate = mag < 0.004 ? "" : `${(-it.cy).toFixed(3)} ${it.cx.toFixed(3)} 0 ${(mag * 9).toFixed(2)}deg`;
          } else {
            el.style.translate = Math.abs(it.cx) < 0.15 && Math.abs(it.cy) < 0.15 ? "" : `${it.cx.toFixed(1)}px ${it.cy.toFixed(1)}px`;
          }
          if (Math.abs(it.tx - it.cx) > 0.003 || Math.abs(it.ty - it.cy) > 0.003) again = true;
          else if (it.tx === 0 && it.ty === 0) { if (it.mode === "tilt") el.style.rotate = ""; else el.style.translate = ""; items.delete(el); }
        });
        if (again) hr = requestAnimationFrame(loop);
      };
      const wake = () => { if (!hr) hr = requestAnimationFrame(loop); };
      const SEL_TILT = ".h2-cat, .h2-card, .h2-slidewrap";
      const SEL_MAG = ".h2-s-go, .h2-pill, .h2-more";
      const mv = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        hx = e.clientX; hy = e.clientY;
        if (!shown) { shown = true; hcx = hx; hcy = hy; halo.classList.add("is-on"); }
        const t = e.target as Element | null;
        halo.classList.toggle("is-link", !!t?.closest?.("a, button, input"));
        const tl = t?.closest?.(SEL_TILT) as HTMLElement | null;
        const mg = t?.closest?.(SEL_MAG) as HTMLElement | null;
        items.forEach((it, el) => { if (el !== tl && el !== mg) { it.tx = 0; it.ty = 0; } });
        for (const [el, mode] of [[tl, "tilt"], [mg, "magnet"]] as const) {
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const nx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1), ny = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
          let it = items.get(el);
          if (!it) { it = { el, mode, tx: 0, ty: 0, cx: 0, cy: 0 }; items.set(el, it); }
          if (mode === "tilt") { it.tx = nx; it.ty = ny; } else { it.tx = nx * 7; it.ty = ny * 5; }
        }
        wake();
      };
      const lv = () => { shown = false; halo.classList.remove("is-on"); items.forEach((it) => { it.tx = 0; it.ty = 0; }); wake(); };
      root.addEventListener("pointermove", mv, { passive: true });
      root.addEventListener("pointerleave", lv);
      const dv = () => { if (!document.hidden) wake(); };
      document.addEventListener("visibilitychange", dv);
      const rio = new IntersectionObserver((es) => { vis2 = es.some((x) => x.isIntersecting); if (vis2) wake(); });
      rio.observe(root);
      cleanups.push(() => { cancelAnimationFrame(hr); root.removeEventListener("pointermove", mv); root.removeEventListener("pointerleave", lv); document.removeEventListener("visibilitychange", dv); rio.disconnect(); halo.remove(); items.forEach((it, el) => { el.style.rotate = ""; el.style.translate = ""; void it; }); });
    }
    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}
