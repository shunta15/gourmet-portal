"use client";
import { useEffect } from "react";

/**
 * ページ全体の動き(DOM に印を付けるだけ。見た目は css)。
 *  - [data-io] が画面に入ったら .is-in(札のフリップ・棚のスタガー・帯の文字・見出しの下線)
 *  - [data-live] は見えている間だけ .is-live(流れる光など、終わらない動きを画面外で止める)
 *  - 最初の画面: マウスで奥行き(パララックス。--px/--py を -1〜1 で。rAF は動いている間だけ・非表示タブでは止める)
 *  - 上端の進みバー(--sp)
 *  - 棚(スマホ幅の横スクロール)をマウスでつかんで動かし、放したあと慣性で滑る
 * prefers-reduced-motion では何もしない(css も最終の状態のまま)。
 */
export default function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".h2-root");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];

    // 1. 入ったら .is-in(出る動き)→ 3.5 秒後に .is-done(動きの記録を外す。書き出し・全体スクショでやり直しにならないように) / 見えている間だけ .is-live
    const timers: number[] = [];
    const reveal = (el: Element) => { el.classList.add("is-in"); timers.push(window.setTimeout(() => el.classList.add("is-done"), 3500)); };
    const once = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { reveal(e.target); once.unobserve(e.target); } }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    root.querySelectorAll("[data-io]").forEach((el) => once.observe(el));
    // 折り返しのすぐ下にある大きな箱(特集スライド・最新情報)は、ちらっと見えた時点で出す
    const early = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { reveal(e.target); early.unobserve(e.target); } }), { threshold: 0.04 });
    root.querySelectorAll("[data-io-early]").forEach((el) => early.observe(el));
    const live = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting)));
    root.querySelectorAll("[data-live]").forEach((el) => live.observe(el));
    // 画面に入らないまま長く置かれても、動きの最後の状態に必ずなる(全体スクショ・タブ復帰・遅い回線用)。10 秒で残りを全部出す。
    const fb = window.setTimeout(() => root.querySelectorAll("[data-io]:not(.is-in), [data-io-early]:not(.is-in)").forEach((el) => { reveal(el); once.unobserve(el); early.unobserve(el); }), 10000);
    cleanups.push(() => { window.clearTimeout(fb); timers.forEach((t) => window.clearTimeout(t)); once.disconnect(); early.disconnect(); live.disconnect(); });

    // 2. パララックス(最初の画面・マウスのみ)
    const stage = root.querySelector<HTMLElement>(".h2-hero-stage");
    if (stage) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, vis = true;
      const step = () => {
        raf = 0;
        if (document.hidden || !vis) return;
        cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09;
        stage.style.setProperty("--px", cx.toFixed(3)); stage.style.setProperty("--py", cy.toFixed(3));
        if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(step);
      };
      const kick = () => { if (!raf && vis && !document.hidden) raf = requestAnimationFrame(step); };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = stage.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
        kick();
      };
      const leave = () => { tx = 0; ty = 0; kick(); };
      const hero = stage.parentElement ?? stage;
      hero.addEventListener("pointermove", move, { passive: true });
      hero.addEventListener("pointerleave", leave);
      const vio = new IntersectionObserver((es) => { vis = es.some((e) => e.isIntersecting); if (vis) kick(); });
      vio.observe(hero);
      const dv = () => { if (!document.hidden) kick(); };
      document.addEventListener("visibilitychange", dv);
      cleanups.push(() => { cancelAnimationFrame(raf); hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave); vio.disconnect(); document.removeEventListener("visibilitychange", dv); });
    }

    // 2b. 街の絵の奥行き(--bp: 帯が画面の下から上へ抜けるあいだ +1 → -1。奥と手前が逆向きに少しずれる。rAF は見えている間だけ)
    const band = root.querySelector<HTMLElement>(".h2-band");
    if (band) {
      let rb = 0, shown = false;
      const upd = () => { rb = 0; if (document.hidden || !shown) return; const r = band.getBoundingClientRect(), vh = window.innerHeight; band.style.setProperty("--bp", Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2))).toFixed(3)); };
      const on = () => { if (!rb) rb = requestAnimationFrame(upd); };
      const bio = new IntersectionObserver((es) => { shown = es.some((e) => e.isIntersecting); if (shown) on(); });
      bio.observe(band);
      window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
      cleanups.push(() => { cancelAnimationFrame(rb); bio.disconnect(); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); });
    }

    // 3. 進みバー
    const bar = document.querySelector<HTMLElement>(".h2-progress");
    if (bar) {
      let r2 = 0;
      const upd = () => { r2 = 0; const max = document.documentElement.scrollHeight - window.innerHeight; bar.style.setProperty("--sp", String(max > 0 ? Math.min(1, window.scrollY / max) : 0)); };
      const on = () => { if (!r2) r2 = requestAnimationFrame(upd); };
      upd();
      window.addEventListener("scroll", on, { passive: true });
      window.addEventListener("resize", on);
      cleanups.push(() => { cancelAnimationFrame(r2); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); });
    }

    // 4. 棚をマウスでつかんで動かす + 放したあとの慣性(タッチは標準の慣性スクロールのまま)
    root.querySelectorAll<HTMLElement>(".h2-strip").forEach((el) => {
      let down = false, sx = 0, sl = 0, lastX = 0, lastT = 0, v = 0, raf = 0, moved = false;
      const glide = () => {
        v *= 0.94;
        el.scrollLeft -= v;
        if (Math.abs(v) > 0.3 && !document.hidden) raf = requestAnimationFrame(glide); else raf = 0;
      };
      const pd = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || e.button !== 0 || el.scrollWidth <= el.clientWidth + 2) return;
        cancelAnimationFrame(raf); down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; lastX = e.clientX; lastT = performance.now(); v = 0;
        el.style.scrollSnapType = "none";
      };
      const pm = (e: PointerEvent) => {
        if (!down) return;
        const dx = e.clientX - sx;
        if (Math.abs(dx) > 4) moved = true;
        el.scrollLeft = sl - dx;
        const now = performance.now(), dt = Math.max(1, now - lastT);
        v = ((e.clientX - lastX) / dt) * 16; lastX = e.clientX; lastT = now;
      };
      const pu = () => {
        if (!down) return; down = false;
        if (Math.abs(v) > 0.5) raf = requestAnimationFrame(glide);
        window.setTimeout(() => { el.style.scrollSnapType = ""; }, 600);
      };
      const click = (e: Event) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
      el.addEventListener("pointerdown", pd); window.addEventListener("pointermove", pm, { passive: true }); window.addEventListener("pointerup", pu);
      el.addEventListener("click", click, true);
      cleanups.push(() => { cancelAnimationFrame(raf); el.removeEventListener("pointerdown", pd); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pu); el.removeEventListener("click", click, true); });
    });

    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}
