"use client";
import { useEffect, useRef } from "react";

/**
 * 画面いっぱいの花びら。ゆっくり舞い落ち続け、マウス(指)を動かすとその後ろに花びらがついてくる。押すと数枚はじける。
 * 画素の上限: dpr 1.5。非表示タブ・画面が静かなとき(花びらが無い)は rAF を止める。prefers-reduced-motion では動かさない。
 */
type P = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; ph: number; f: number; life: number; max: number; hue: number };
export default function Petals() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.innerWidth < 700;
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0;
    const ps: P[] = [];
    const path = new Path2D("M0,-1 C.7,-.7 .85,.3 .1,1 L0,.78 L-.1,1 C-.85,.3 -.7,-.7 0,-1 Z");
    const mk = (x: number, y: number, trail = false): P => ({
      x, y, vx: trail ? (Math.random() - .5) * 40 : 8 + Math.random() * 16, vy: trail ? 10 + Math.random() * 30 : 18 + Math.random() * 26,
      r: Math.random() * 6.28, vr: (Math.random() - .5) * 3, s: (small ? 5 : 6) + Math.random() * 6, ph: Math.random() * 6.28, f: .7 + Math.random() * .9,
      life: 0, max: trail ? 2.2 + Math.random() * 1.4 : 999, hue: Math.random(),
    });
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
    };
    resize();
    const N = small ? 8 : 14;
    for (let i = 0; i < N; i++) ps.push(mk(Math.random() * W, Math.random() * H));
    let lx = -99, ly = -99, acc = 0;
    const move = (e: PointerEvent) => {
      const d = Math.hypot(e.clientX - lx, e.clientY - ly);
      if (lx > -90 && d > 0) { acc += d; while (acc > 26) { acc -= 26; ps.push(mk(e.clientX + (Math.random() - .5) * 14, e.clientY + (Math.random() - .5) * 14, true)); } }
      lx = e.clientX; ly = e.clientY;
      if (ps.length > N + 70) ps.splice(N, ps.length - N - 70);
      start();
    };
    const down = (e: PointerEvent) => { for (let i = 0; i < 6; i++) { const p = mk(e.clientX, e.clientY, true); p.vx = (Math.random() - .5) * 220; p.vy = -50 - Math.random() * 100; ps.push(p); } start(); };
    const frame = (now: number) => {
      raf = 0;
      if (document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; t += dt;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        p.x += (p.vx + Math.sin(t * p.f + p.ph) * 22) * dt; p.y += p.vy * dt; p.vy += (p.max < 900 ? 14 : 0) * dt; p.r += p.vr * dt;
        const trailing = p.max < 900;
        if (!trailing && (p.y > H + 20 || p.x > W + 20)) { p.y = -20; p.x = Math.random() * W; }
        if (trailing && p.life > p.max) { ps.splice(i, 1); continue; }
        const a = trailing ? Math.min(1, p.life * 6) * Math.max(0, 1 - p.life / p.max) : .8;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(p.s * (.55 + .45 * Math.abs(Math.cos(t * p.f * 1.7 + p.ph))), p.s);
        ctx.globalAlpha = a; ctx.fillStyle = p.hue > .5 ? "#f9c6d3" : "#fbd7df"; ctx.fill(path);
        ctx.lineWidth = .06; ctx.strokeStyle = "rgba(235,120,150,.45)"; ctx.stroke(path); ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    function start() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); };
    // 画面の外(ヒーロー以外)でも落ち続けるのは軽いので常時。ただし非表示タブでは止める
    start();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", down); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }} />;
}
