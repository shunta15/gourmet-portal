"use client";
/**
 * 「弾む」案(?fx=3)の動かす部分(クライアント)。見た目の文字・形は、サーバーで作った印付きの要素を拾って動かす。
 *   [data-fx-group="drop"]  … 見出し。見えたとき 1 字ずつ落ちてきて弾む。マウス/指に押されて逃げ、押すとへこみ、スクロールの速さで伸びて傾く
 *   [data-fx-group="type"]  … 住所・電話。見えたとき 1 字ずつ打たれるように現れる(場所は最初から確保済みで、レイアウトは動かない)
 *   [data-fx-shape]         … 丸・ハート・飾りの形。落ちてきて弾み、近づく指/マウスから逃げ、押すと弾ける
 * ばね(ニュートン法の半陰的オイラー)を requestAnimationFrame で回す。画面に見えているもの・動いているものがあるときだけ回し、全部が静止したら止める。
 * 動かすのは transform と opacity だけ。動きを減らす設定のときは何もしない(文字はそのまま読める)。タッチはスクロールを奪わない(pointer イベントを聞くだけ)。
 */
import { useEffect } from "react";

type Item = {
  el: HTMLElement;
  cx: number; // 静止時の中心(ページ座標)
  cy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  s: number; // つぶれ具合(縦の倍率)
  vs: number;
  delay: number; // 出るまでの待ち(秒)
  on: boolean;
  shape: boolean;
  mass: number;
};
type Group = { root: HTMLElement; mode: "drop" | "type" | "shape"; items: Item[]; vis: boolean; t0: number; started: boolean; rest: boolean };

const K = 170; // ばねの強さ
const C = 12; // 減衰(弾みは残しつつ、1 秒たらずで静止して読める)
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export default function FxPhysics() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const groups: Group[] = [];
    const rnd = (a: number) => (Math.random() - 0.5) * a;

    const measure = (g: Group) => {
      for (const it of g.items) {
        const r = it.el.getBoundingClientRect();
        it.cx = r.left + scrollX + r.width / 2 - it.x;
        it.cy = r.top + scrollY + r.height / 2 - it.y;
      }
    };

    const mk = (el: HTMLElement, shape: boolean, i: number, mode: Group["mode"]): Item => ({
      el, cx: 0, cy: 0, x: 0, y: mode === "type" ? 0 : shape ? -(260 + rnd(160) + i * 6) : -(150 + rnd(70) + i * 3), vx: 0, vy: 0, r: shape ? rnd(50) : rnd(26), vr: 0, s: mode === "type" ? 0 : 1, vs: 0,
      delay: shape ? 0.1 + i * 0.12 : Math.min(i * 0.04, 0.7), on: false, shape, mass: Number(el.dataset.m) || 1,
    });

    // 文字
    document.querySelectorAll<HTMLElement>("[data-fx-group]").forEach((root) => {
      const mode = root.dataset.fxGroup === "type" ? "type" : "drop";
      const items = [...root.querySelectorAll<HTMLElement>(".fxc")].map((el, i) => mk(el, false, i, mode));
      groups.push({ root, mode, items, vis: false, t0: 0, started: false, rest: false });
      root.dataset.fxReady = "1";
    });
    // 形(飛び出す場所ごとにまとめる)
    document.querySelectorAll<HTMLElement>("[data-fx-field]").forEach((root) => {
      const items = [...root.querySelectorAll<HTMLElement>("[data-fx-shape]")].map((el, i) => mk(el, true, i, "shape"));
      groups.push({ root, mode: "shape", items, vis: false, t0: 0, started: false, rest: false });
      root.dataset.fxReady = "1";
    });

    let px = -9999, py = -9999, pointer = false;
    let sv = 0, lastY = scrollY, stretch = 0;
    let raf = 0;
    let last = 0;

    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          const g = groups.find((x) => x.root === e.target)!;
          g.vis = e.isIntersecting;
          if (g.vis && !g.started) {
            g.started = true;
            g.t0 = performance.now() / 1000;
            measure(g);
          }
          if (g.vis) g.rest = false;
        }
        wake();
      },
      { rootMargin: "60px 0px" },
    );
    groups.forEach((g) => io.observe(g.root));

    const apply = (it: Item, g: Group) => {
      if (g.mode === "type") {
        it.el.style.opacity = it.on ? "1" : "0";
        it.el.style.transform = it.on ? `scale(${(1 + (1 - it.s) * 0.9).toFixed(3)})` : "";
        return;
      }
      const sy = clamp(it.s * (1 + stretch), 0.3, 1.8);
      const sx = 1 / Math.sqrt(sy);
      it.el.style.opacity = it.on ? "1" : "0";
      it.el.style.transform = `translate3d(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px,0) rotate(${it.r.toFixed(1)}deg) skewX(${clamp(sv * 0.18, -10, 10).toFixed(1)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
    };

    const tick = (nowMs: number) => {
      raf = 0;
      const now = nowMs / 1000;
      const dt = Math.min(0.033, last ? now - last : 0.016);
      last = now;
      // スクロールの速さ(1 フレームあたり)
      const dy = scrollY - lastY;
      lastY = scrollY;
      sv += (dy - sv) * 0.25;
      stretch += (clamp(Math.abs(sv) * 0.012, 0, 0.32) - stretch) * 0.2;
      let busy = false;
      const ppx = px + scrollX, ppy = py + scrollY;
      for (const g of groups) {
        if (!g.vis || !g.started) continue;
        let moving = false;
        for (const it of g.items) {
          const t = now - g.t0;
          if (!it.on) {
            if (t >= it.delay) {
              it.on = true;
              if (g.mode === "type") it.s = 0;
            } else {
              moving = true;
              continue;
            }
          }
          if (g.mode === "type") {
            // 打たれる: 小さく弾んで 1 に
            const a = -K * (it.s - 1) - C * it.vs;
            it.vs += a * dt;
            it.s += it.vs * dt;
            if (Math.abs(it.s - 1) > 0.004 || Math.abs(it.vs) > 0.01) moving = true;
            else it.s = 1;
            apply(it, g);
            continue;
          }
          const k = g.mode === "shape" ? K * 0.42 / it.mass : K;
          const c = g.mode === "shape" ? C * 0.62 : C;
          let ax = -k * it.x - c * it.vx;
          let ay = -k * it.y - c * it.vy;
          let ar = -k * 1.4 * it.r - c * it.vr * 1.2;
          let as = -K * 1.6 * (it.s - 1) - C * 1.1 * it.vs;
          if (pointer) {
            const ex = it.cx + it.x - ppx, ey = it.cy + it.y - ppy;
            const d = Math.hypot(ex, ey) || 1;
            const R = g.mode === "shape" ? 200 + (Number(it.el.dataset.r) || 0) : 110;
            if (d < R) {
              const f = (1 - d / R) ** 2 * (g.mode === "shape" ? 5200 : 3600) / it.mass;
              ax += (ex / d) * f;
              ay += (ey / d) * f;
              ar += (ex / d) * f * 0.05;
            }
          }
          it.vx += ax * dt; it.vy += ay * dt; it.vr += ar * dt; it.vs += as * dt;
          it.x += it.vx * dt; it.y += it.vy * dt; it.r += it.vr * dt; it.s += it.vs * dt;
          // 着地(下向きに基準線を越えたとき)にぺしゃんと
          if (it.vy > 260 && it.y > -4 && it.y < 12 && g.mode === "drop") it.vs -= Math.min(it.vy, 900) * 0.0011 * 60 * 0.12;
          // 形はゆっくり漂う(止まって見えない)
          if (g.mode === "shape") {
            const ph = now * 0.9 + g.items.indexOf(it) * 1.7;
            it.y += Math.sin(ph) * 0.18;
            it.x += Math.cos(ph * 0.8) * 0.12;
            moving = true;
          } else if (Math.abs(it.x) + Math.abs(it.y) + Math.abs(it.vx) + Math.abs(it.vy) + Math.abs(it.r) + Math.abs(it.vr) + Math.abs(it.s - 1) * 20 + Math.abs(it.vs) > 0.12 || stretch > 0.01) moving = true;
          else { it.x = it.y = it.vx = it.vy = it.r = it.vr = 0; it.s = 1; it.vs = 0; }
          apply(it, g);
        }
        g.rest = !moving;
        if (moving) busy = true;
      }
      if (busy || pointer || Math.abs(sv) > 0.2) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const press = (cx: number, cy: number) => {
      for (const g of groups) {
        if (!g.vis) continue;
        for (const it of g.items) {
          if (!it.on) continue;
          const d = Math.hypot(it.cx + it.x - (cx + scrollX), it.cy + it.y - (cy + scrollY));
          const R = g.mode === "shape" ? 160 + (Number(it.el.dataset.r) || 0) * 0.5 : 120;
          if (d < R && g.mode !== "type") {
            const f = 1 - d / R;
            it.vs -= 9 * f; // 押すとへこむ
            it.vy += 520 * f / it.mass;
            it.vr += rnd(900) * f;
            if (g.mode === "shape") { it.vx += rnd(1400); it.vy -= 900 * f; }
          }
        }
      }
      wake();
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX; py = e.clientY; pointer = true;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      px = e.clientX; py = e.clientY; pointer = true;
      press(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") pointer = false;
    };
    const onLeave = () => { pointer = false; };
    const onScroll = () => wake();
    const onResize = () => { groups.forEach((g) => { if (g.started) { for (const it of g.items) { it.x = it.y = 0; } measure(g); } }); };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      for (const g of groups) for (const it of g.items) { it.el.style.transform = ""; it.el.style.opacity = ""; }
    };
  }, []);
  return null;
}
