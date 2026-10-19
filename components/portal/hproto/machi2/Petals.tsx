"use client";
import { useEffect, useRef } from "react";
import { getSeason, subscribeSeason } from "./seasonStore";
import type { Season } from "./season";

/**
 * 画面いっぱいに舞う物。季節で変わる(春=桜の花びら・夏=光の粒+空の小さな花火・秋=紅葉・冬=雪)。
 * ゆっくり舞い続け、マウス(指)を動かすとその後ろについてくる。押すと数枚はじける(夏は小さな花火)。
 * 季節が切り替わると前の季節の物はフェードで消え、次の物が出てくる。
 * 画素の上限: dpr 1.5。非表示タブでは rAF を止める。prefers-reduced-motion では動かさない。
 */
type P = {
  k: Season; x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; ph: number; f: number; sw: number;
  life: number; max: number; hue: number; trail: boolean; out: number; // out: 消え始めてからの秒(-1 = まだ)
};
type FW = { x: number; y: number; r: number; age: number; life: number; n: number; col: string; col2: string; off: number };

const LEAFCOL = ["#d6402b", "#e8602a", "#f08a2a", "#f2b52e", "#c4372a", "#e9742c"];
const FWCOL: [string, string][] = [["#ff5fa8", "#ffd1e8"], ["#ffc83a", "#fff0b0"], ["#ff4d6d", "#ffd1d9"], ["#ffffff", "#ffe29a"], ["#b6ff6a", "#f4ffd0"]];

export default function Petals() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.innerWidth < 700;
    const PETAL = new Path2D("M0,-1 C.7,-.7 .85,.3 .1,1 L0,.78 L-.1,1 C-.85,.3 -.7,-.7 0,-1 Z");
    const LEAF = new Path2D("M0,-1 C.95,-.55 .95,.5 0,1 C-.95,.5 -.95,-.55 0,-1 Z");
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, t = 0, season: Season | null = null, fwT = 1.2, fwSlot = 0;
    const ps: P[] = [];
    const fws: FW[] = [];
    const N = small ? 12 : 22;
    const R = Math.random;

    const mk = (k: Season, x: number, y: number, trail = false): P => {
      const p: P = { k, x, y, vx: 0, vy: 0, r: R() * 6.28, vr: (R() - .5) * 3, s: 6, ph: R() * 6.28, f: .7 + R() * .9, sw: 22, life: 0, max: trail ? 2.2 + R() * 1.4 : 999, hue: R(), trail, out: -1 };
      if (k === "spring") { p.vx = trail ? (R() - .5) * 40 : 8 + R() * 16; p.vy = trail ? 10 + R() * 30 : 18 + R() * 26; p.s = (small ? 5 : 6) + R() * 6; p.sw = 22; }
      else if (k === "autumn") { p.vx = trail ? (R() - .5) * 50 : 6 + R() * 26; p.vy = trail ? 12 + R() * 34 : 28 + R() * 30; p.s = (small ? 6 : 7.5) + R() * 7; p.vr = (R() - .5) * 4.5; p.sw = 30; }
      else if (k === "winter") { const d = R(); p.s = 1.6 + d * (small ? 2.6 : 3.6); p.vx = trail ? (R() - .5) * 36 : (R() - .5) * 8; p.vy = trail ? 10 + R() * 26 : 12 + d * 34; p.sw = 12 + d * 14; p.hue = d; }
      else { p.s = 1.3 + R() * 2.8; p.vx = (R() - .5) * (trail ? 44 : 10); p.vy = trail ? (R() - .6) * 30 : -(3 + R() * 10); p.sw = 9; if (trail) p.max = 1.3 + R() * 1.0; }
      return p;
    };
    const fill = (k: Season) => { const n = Math.round(N * (k === "winter" ? 3.4 : k === "summer" ? 1.5 : 1)); for (let i = 0; i < n; i++) ps.push(mk(k, R() * W, R() * H)); };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
    };
    resize();
    const onSeason = (s: Season) => {
      if (s === season) return;
      season = s;
      for (const p of ps) if (!p.trail && p.out < 0) p.out = 0;
      fill(s);
      fwT = 1.0;
      start();
    };

    const burstFW = (x: number, y: number, r: number): void => {
      const [col, col2] = FWCOL[Math.floor(R() * FWCOL.length)];
      fws.push({ x, y, r: r * 1.25, age: 0, life: 1.5 + R() * .3, n: 24 + Math.floor(R() * 8), col, col2, off: R() * 6.28 });
    };
    const skyFW = () => {
      const stage = document.querySelector<HTMLElement>(".h2-hero-stage"); if (!stage) return;
      const r = stage.getBoundingClientRect();
      if (r.bottom < 60 || r.top > H - 60 || r.width < 50) return;
      const u = r.width / 1182;
      // 絵の花火(中央)と重ならない空: 左(絵の左の空)と右(塔の左上)
      const slots: [number, number][] = [[388, 70], [872, 64], [352, 30]];
      const [sx, sy] = slots[fwSlot++ % slots.length];
      burstFW(r.left + (sx + (R() - .5) * 20) * u, r.top + (sy + (R() - .5) * 16) * u, (30 + R() * 8) * u);
    };

    let lx = -99, ly = -99, acc = 0;
    const move = (e: PointerEvent) => {
      const d = Math.hypot(e.clientX - lx, e.clientY - ly);
      if (season && lx > -90 && d > 0) { acc += d; while (acc > 26) { acc -= 26; ps.push(mk(season, e.clientX + (R() - .5) * 14, e.clientY + (R() - .5) * 14, true)); } }
      lx = e.clientX; ly = e.clientY;
      let trails = 0; for (const p of ps) if (p.trail) trails++;
      if (trails > 70) { let rm = trails - 70; for (let i = 0; i < ps.length && rm > 0; i++) if (ps[i].trail) { ps.splice(i, 1); i--; rm--; } }
      start();
    };
    const down = (e: PointerEvent) => {
      if (!season) return;
      for (let i = 0; i < 6; i++) { const p = mk(season, e.clientX, e.clientY, true); p.vx = (R() - .5) * 220; p.vy = -50 - R() * 100; ps.push(p); }
      if (season === "summer") burstFW(e.clientX, e.clientY, 26 + R() * 10);
      start();
    };
    const draw = (p: P, a: number) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = a;
      if (p.k === "spring") {
        ctx.rotate(p.r); ctx.scale(p.s * (.55 + .45 * Math.abs(Math.cos(t * p.f * 1.7 + p.ph))), p.s);
        ctx.fillStyle = p.hue > .5 ? "#f9c6d3" : "#fbd7df"; ctx.fill(PETAL);
        ctx.lineWidth = .06; ctx.strokeStyle = "rgba(235,120,150,.45)"; ctx.stroke(PETAL);
      } else if (p.k === "autumn") {
        ctx.rotate(p.r); ctx.scale(p.s * .62 * (.45 + .55 * Math.abs(Math.cos(t * p.f * 1.3 + p.ph))), p.s);
        ctx.fillStyle = LEAFCOL[Math.floor(p.hue * LEAFCOL.length) % LEAFCOL.length]; ctx.fill(LEAF);
        ctx.lineWidth = .07; ctx.strokeStyle = "rgba(110,40,20,.55)"; ctx.stroke(LEAF);
        ctx.beginPath(); ctx.moveTo(0, -.9); ctx.lineTo(0, 1.25); ctx.stroke();
      } else if (p.k === "winter") {
        ctx.beginPath(); ctx.arc(0, 0, p.s, 0, 6.2832); ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.fill();
        ctx.lineWidth = .7; ctx.strokeStyle = "rgba(120,170,205,.5)"; ctx.stroke();
      } else {
        const tw = .55 + .45 * Math.sin(t * 3 * p.f + p.ph);
        ctx.globalAlpha = a * tw;
        ctx.beginPath(); ctx.arc(0, 0, p.s * 2.6, 0, 6.2832); ctx.fillStyle = "rgba(255,196,90,.28)"; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, p.s, 0, 6.2832); ctx.fillStyle = "#fff6c8"; ctx.fill();
      }
      ctx.restore();
    };
    const frame = (now: number) => {
      raf = 0;
      if (document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; t += dt;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        if (p.out >= 0) { p.out += dt; if (p.out > 1.1) { ps.splice(i, 1); continue; } }
        p.x += (p.vx + Math.sin(t * p.f + p.ph) * p.sw) * dt; p.y += p.vy * dt;
        if (p.trail && p.k !== "summer") p.vy += 14 * dt;
        p.r += p.vr * dt;
        if (!p.trail) {
          if (p.k === "summer") { if (p.y < -10) p.y = H + 10; if (p.x > W + 10) p.x = -10; if (p.x < -10) p.x = W + 10; }
          else if (p.y > H + 20 || p.x > W + 20) { p.y = -20; p.x = R() * W; }
        } else if (p.life > p.max) { ps.splice(i, 1); continue; }
        const base = p.trail ? Math.min(1, p.life * 6) * Math.max(0, 1 - p.life / p.max) : (p.k === "winter" ? .55 + .4 * p.hue : p.k === "summer" ? .9 : .8);
        const fin = p.trail ? 1 : Math.min(1, p.life * 1.2);
        const fout = p.out >= 0 ? Math.max(0, 1 - p.out / 1.1) : 1;
        draw(p, base * fin * fout);
      }
      if (season === "summer") { fwT -= dt; if (fwT <= 0) { fwT = 1.5 + R() * 1.6; skyFW(); } }
      for (let i = fws.length - 1; i >= 0; i--) {
        const f = fws[i]; f.age += dt;
        if (f.age > f.life) { fws.splice(i, 1); continue; }
        const q = f.age / f.life, e = 1 - Math.pow(1 - Math.min(1, q * 1.7), 3), Rr = f.r * e;
        const a = q < .25 ? 1 : Math.max(0, 1 - (q - .25) / .75);
        const droop = f.r * .5 * q * q;
        ctx.save(); ctx.lineCap = "round"; ctx.shadowColor = f.col; ctx.shadowBlur = 8;
        if (q < .16) { ctx.globalAlpha = (1 - q / .16) * .9; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * .25 * (1 - q / .16) + 2, 0, 6.2832); ctx.fillStyle = "#fff"; ctx.fill(); }
        for (let ring = 0; ring < 2; ring++) {
          const n = ring ? Math.round(f.n * .55) : f.n, rr = ring ? Rr * .6 : Rr;
          ctx.strokeStyle = ring ? f.col2 : f.col; ctx.fillStyle = ring ? f.col2 : f.col; ctx.globalAlpha = a * .95; ctx.lineWidth = Math.max(1.8, f.r * .06);
          for (let i2 = 0; i2 < n; i2++) {
            const an = f.off + (i2 / n) * 6.2832 + (ring ? .15 : 0), c = Math.cos(an), s = Math.sin(an), len = rr * .26;
            ctx.beginPath(); ctx.moveTo(f.x + c * (rr - len), f.y + s * (rr - len) + droop); ctx.lineTo(f.x + c * rr, f.y + s * rr + droop); ctx.stroke();
          }
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    function start() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); };
    start();
    const un = subscribeSeason(onSeason);
    const cur = getSeason(); if (cur) onSeason(cur);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", vis);
    return () => { un(); cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", down); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }} />;
}
