"use client";
/**
 * 案 1「塗る」: マウス・指でなぞった跡に、色のひと塗りとしずくが残って、すぐ消える。
 * 画面の最初の面(.cp-hero)に重ねた canvas に描く(pointer-events なし。イベントは親の .cp-hero で受ける)。
 * 描くのは rAF の中だけ。何も描くものが無くなったら rAF を止める。「動きを減らす」設定のときは何もしない。
 */
import { useEffect, useRef } from "react";

const COLS = ["#fb9bdc", "#f80257", "#4fa9ee", "#c2e5fb", "#ffffff", "#111111"];
type Drop = { x: number; y: number; px: number; py: number; vx: number; vy: number; r: number; col: string };

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

export default function HeroPaint() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const hero = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !hero || !ctx) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let on = false;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let ro: ResizeObserver | null = null;
    let queue: { x: number; y: number; down?: boolean }[] = [];
    let last: { x: number; y: number; w: number } | null = null;
    let drops: Drop[] = [];
    let colIdx = 0;
    let travel = 0;
    let lastInk = 0;
    let lastStroke = 0;
    let lastT = 0;
    let rect: DOMRect | null = null;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // いま背景になっている色(スクロールで塗り重なる)と同じ色は選ばない
    const bg = () => {
      const r = hero.getBoundingClientRect();
      const o = clamp(-r.top / Math.max(r.height, 1));
      return o < 0.17 ? "#d11d22" : o < 0.33 ? "#f80257" : o < 0.5 ? "#4fa9ee" : "#111111";
    };
    const pick = () => {
      const b = bg();
      for (let i = 0; i < COLS.length; i++) {
        colIdx = (colIdx + 1 + Math.floor(Math.random() * 2)) % COLS.length;
        const c = COLS[colIdx];
        if (c !== b && !(b === "#d11d22" && c === "#f80257")) return c;
      }
      return "#fff";
    };
    let col = "#fb9bdc";

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const splash = (x: number, y: number) => {
      col = pick();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, 14 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 9; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 90 + Math.random() * 260;
        drops.push({ x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, r: 2.5 + Math.random() * 4.5, col });
      }
      lastInk = lastStroke = performance.now();
    };

    const draw = (now: number) => {
      raf = 0;
      if (!on) return;
      const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016);
      lastT = now;
      // 少しずつ消す(透明に向かって削る)
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1 - Math.exp(-dt / (now - lastStroke < 600 ? 0.45 : 0.15));
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      if (queue.length) {
        rect = hero.getBoundingClientRect();
        const q = queue;
        queue = [];
        for (const p of q) {
          const x = p.x - rect.left;
          const y = p.y - rect.top;
          if (p.down) {
            splash(x, y);
            last = { x, y, w: 24 };
            continue;
          }
          if (!last) {
            last = { x, y, w: 24 };
            col = pick();
            continue;
          }
          const d = Math.hypot(x - last.x, y - last.y);
          if (d < 2) continue;
          const tw = clamp(46 - d * 0.8, 15, 42);
          const lw = last.w + (tw - last.w) * 0.35;
          ctx.strokeStyle = col;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          travel += d;
          if (travel > 170) {
            travel = 0;
            col = pick();
          }
          if (Math.random() < 0.09 + lw * 0.003) {
            drops.push({ x: x + (Math.random() - 0.5) * lw * 0.6, y: y + lw * 0.3, px: x, py: y, vx: (Math.random() - 0.5) * 14, vy: 30 + Math.random() * 50, r: 2.4 + Math.random() * lw * 0.12, col });
          }
          last = { x, y, w: lw };
          lastInk = lastStroke = now;
        }
      }

      // しずく: 重みで落ちながら細くなり、筋を残す
      drops = drops.filter((d) => {
        d.px = d.x;
        d.py = d.y;
        d.vy += 760 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.r -= dt * 2.1;
        if (d.r < 0.7 || d.y > h + 20) return false;
        ctx.strokeStyle = d.col;
        ctx.fillStyle = d.col;
        ctx.lineWidth = d.r * 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(d.px, d.py);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        lastInk = now;
        return true;
      });

      if (now - lastInk > 1000 && !drops.length && !queue.length) {
        ctx.clearRect(0, 0, w, h);
        lastT = 0;
        return;
      }
      kick();
    };

    const onMove = (e: PointerEvent) => {
      queue.push({ x: e.clientX, y: e.clientY });
      kick();
    };
    const onDown = (e: PointerEvent) => {
      queue.push({ x: e.clientX, y: e.clientY, down: true });
      kick();
    };
    const onEnd = () => {
      last = null;
      travel = 0;
    };

    const start = () => {
      if (on) return;
      on = true;
      size();
      ro = new ResizeObserver(size);
      ro.observe(hero);
      hero.addEventListener("pointermove", onMove, { passive: true });
      hero.addEventListener("pointerdown", onDown, { passive: true });
      hero.addEventListener("pointerup", onEnd, { passive: true });
      hero.addEventListener("pointercancel", onEnd, { passive: true });
      hero.addEventListener("pointerleave", onEnd, { passive: true });
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ro?.disconnect();
      ro = null;
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", onEnd);
      hero.removeEventListener("pointercancel", onEnd);
      hero.removeEventListener("pointerleave", onEnd);
      queue = [];
      drops = [];
      last = null;
      lastT = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
    const onMq = () => (mq.matches ? stop() : start());

    if (!mq.matches) start();
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return <canvas className="hp-trail" ref={ref} aria-hidden="true" />;
}
