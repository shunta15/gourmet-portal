"use client";
/**
 * 案 C「転がる」の動き(データは持たない。サーバーが出した DOM に付ける)。
 * 画面の下の床([data-bc-ledge])に、丸い物(マットの巻き 3・木の玉 2・竹の輪 1)を転がす。円の物理を実時間で進めて canvas([data-bc-cv])に描く:
 *   重力・床とのはね返り・転がり摩擦・壁・円どうしのぶつかり。開くと上から落ちてくる。
 *   スクロールの速さが床の傾きになり(物が転がり、ページの紙も --tilt の分だけ傾く)、指でつかんで投げる・なぞって転がせる。
 * 落ち着いて、スクロールも指も無ければ描画を止める(rAF を回さない)。prefers-reduced-motion では動かさない。
 */
import { useEffect } from "react";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

type Kind = "mat" | "ball" | "bamboo";
type Ob = { x: number; y: number; vx: number; vy: number; r: number; ang: number; w: number; kind: Kind; color: string; grab: boolean };

export default function FloorFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-bc]");
    const cv = root?.querySelector<HTMLCanvasElement>("[data-bc-cv]");
    const ledge = root?.querySelector<HTMLElement>("[data-bc-ledge]");
    if (!root || !cv || !ledge) return;
    root.classList.add("bc-js", "bc-ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("bc-still");
      return;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const matColor = getComputedStyle(root).getPropertyValue("--mat").trim() || "#768697";

    let W = 0;
    let H = 0;
    let floorY = 0;
    let dpr = 1;
    let obs: Ob[] = [];
    let raf = 0;
    let last = 0;
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let tilt = 0;
    let awakeUntil = 0;
    let grab: Ob | null = null;
    let gx = 0;
    let gy = 0;
    let pxPrev = 0;
    let brushing = false;

    const build = () => {
      const base = clamp(W * 0.07, 30, 54);
      const spec: [Kind, number, string][] = [
        ["mat", 1.0, matColor],
        ["mat", 0.82, "#d8ceb8"],
        ["mat", 0.82, "#7f8864"],
        ["ball", 0.46, "#d9b88a"],
        ["ball", 0.4, "#c9d0c8"],
        ["bamboo", 0.62, "#7f8f5a"],
      ];
      obs = spec.map(([kind, k, color], i) => ({
        x: clamp(W * (0.12 + 0.15 * i) + (i % 2 ? 24 : -10), 40, W - 40),
        y: -base * 2 - i * 150,
        vx: (i % 2 ? -1 : 1) * (90 + i * 40),
        vy: 0,
        r: base * k,
        ang: i,
        w: 0,
        kind,
        color,
        grab: false,
      }));
    };
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      floorY = H - ledge.getBoundingClientRect().height + 5;
      if (obs.length === 0) build();
      else obs.forEach((o) => ((o.x = clamp(o.x, o.r, W - o.r)), (o.y = Math.min(o.y, floorY - o.r))));
      wake(1500);
    };

    const step = (dt: number) => {
      const g = 2300;
      const ax = clamp(tilt, -1, 1) * 1500;
      for (const o of obs) {
        if (o.grab) continue;
        o.vy += g * dt;
        o.vx += ax * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        // 床
        if (o.y + o.r > floorY) {
          o.y = floorY - o.r;
          if (o.vy > 120) o.vy = -o.vy * 0.34;
          else o.vy = 0;
          o.vx *= 1 - Math.min(1, 0.55 * dt); // 転がり摩擦
        }
        // 壁
        if (o.x < o.r) {
          o.x = o.r;
          o.vx = Math.abs(o.vx) * 0.5;
        } else if (o.x > W - o.r) {
          o.x = W - o.r;
          o.vx = -Math.abs(o.vx) * 0.5;
        }
        // 転がり(床の上では、進んだ分だけ回る)
        const onFloor = o.y + o.r >= floorY - 0.5;
        o.w = onFloor ? o.vx / o.r : o.w * (1 - Math.min(1, 0.8 * dt));
        o.ang += o.w * dt;
      }
      // 円どうし
      for (let i = 0; i < obs.length; i++) {
        for (let j = i + 1; j < obs.length; j++) {
          const a = obs[i];
          const b = obs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const min = a.r + b.r;
          if (d >= min) continue;
          const nx = dx / d;
          const ny = dy / d;
          const ma = a.r * a.r;
          const mb = b.r * b.r;
          const push = min - d;
          const ka = a.grab ? 0 : mb / (ma + mb);
          const kb = b.grab ? 0 : ma / (ma + mb);
          a.x -= nx * push * (ka || 0);
          a.y -= ny * push * (ka || 0);
          b.x += nx * push * (kb || 0);
          b.y += ny * push * (kb || 0);
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = (-(1 + 0.38) * rv) / (1 / ma + 1 / mb);
            if (!a.grab) {
              a.vx -= (imp * nx) / ma;
              a.vy -= (imp * ny) / ma;
            }
            if (!b.grab) {
              b.vx += (imp * nx) / mb;
              b.vy += (imp * ny) / mb;
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const o of obs) {
        // 影
        const h = clamp((floorY - (o.y + o.r)) / 260, 0, 1);
        ctx.fillStyle = `rgba(40,24,8,${0.32 * (1 - h * 0.8)})`;
        ctx.beginPath();
        ctx.ellipse(o.x + 4, floorY + 2, o.r * (1 - h * 0.4) * 1.05, o.r * 0.2 * (1 - h * 0.4), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.beginPath();
        ctx.arc(0, 0, o.r, 0, Math.PI * 2);
        ctx.clip();
        if (o.kind === "mat") {
          ctx.fillStyle = o.color;
          ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
          // 巻いた断面の渦(回る)
          ctx.rotate(o.ang);
          ctx.strokeStyle = "rgba(20,14,8,.34)";
          ctx.lineWidth = Math.max(1.2, o.r * 0.055);
          ctx.beginPath();
          const turns = 3.6;
          for (let t = 0; t <= turns * Math.PI * 2; t += 0.12) {
            const rr = o.r * (0.12 + 0.86 * (t / (turns * Math.PI * 2)));
            const px = Math.cos(t) * rr;
            const py = Math.sin(t) * rr;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.rotate(-o.ang);
          // 端の札(丸い紙)
          ctx.fillStyle = "rgba(246,243,234,.92)";
          ctx.beginPath();
          ctx.arc(0, 0, o.r * 0.26, 0, Math.PI * 2);
          ctx.fill();
        } else if (o.kind === "ball") {
          ctx.fillStyle = o.color;
          ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
          ctx.rotate(o.ang);
          ctx.fillStyle = "rgba(60,36,12,.28)";
          ctx.beginPath();
          ctx.arc(o.r * 0.55, 0, o.r * 0.11, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate(-o.ang);
        } else {
          ctx.fillStyle = "#e1dfc4";
          ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
          ctx.rotate(o.ang);
          ctx.strokeStyle = o.color;
          ctx.lineWidth = o.r * 0.34;
          ctx.beginPath();
          ctx.arc(0, 0, o.r * 0.82, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "rgba(40,50,20,.4)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(o.r * 0.5, 0);
          ctx.lineTo(o.r, 0);
          ctx.stroke();
          ctx.rotate(-o.ang);
        }
        // 丸みの光と影
        const gr = ctx.createRadialGradient(-o.r * 0.38, -o.r * 0.42, o.r * 0.1, 0, 0, o.r * 1.05);
        gr.addColorStop(0, "rgba(255,255,255,.34)");
        gr.addColorStop(0.5, "rgba(255,255,255,0)");
        gr.addColorStop(1, "rgba(20,12,4,.42)");
        ctx.fillStyle = gr;
        ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
        ctx.restore();
        ctx.strokeStyle = "rgba(20,12,4,.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const wake = (ms: number) => {
      awakeUntil = Math.max(awakeUntil, performance.now() + ms);
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      // スクロールの速さ → 床の傾き(物とページの紙)
      const sy = window.scrollY;
      scrollVel = scrollVel * 0.82 + ((sy - lastScrollY) / Math.max(dt, 0.001)) * 0.18;
      lastScrollY = sy;
      tilt += (clamp(scrollVel / 1800, -1, 1) - tilt) * Math.min(1, dt * 8);
      root.style.setProperty("--tilt", (tilt * 1.1).toFixed(3));
      if (grab) {
        const nvx = (gx - grab.x) * 22;
        const nvy = (gy - grab.y) * 22;
        grab.vx = nvx;
        grab.vy = nvy;
        grab.x += nvx * dt;
        grab.y += nvy * dt;
        grab.x = clamp(grab.x, grab.r, W - grab.r);
        grab.y = Math.min(grab.y, floorY - grab.r);
        grab.w = 0;
      }
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      for (let k = 0; k < n; k++) step(dt / n);
      draw();
      let energy = 0;
      for (const o of obs) energy += Math.abs(o.vx) + Math.abs(o.vy) + (o.y + o.r < floorY - 1 ? 500 : 0);
      if (energy > 14 || Math.abs(tilt) > 0.01 || grab || now < awakeUntil) raf = requestAnimationFrame(frame);
      else root.style.setProperty("--tilt", "0");
    };

    // 指・マウス
    const pos = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const p = pos(e);
      let best: Ob | null = null;
      let bd = 1e9;
      for (const o of obs) {
        const d = Math.hypot(o.x - p.x, o.y - p.y);
        if (d < o.r + 14 && d < bd) {
          best = o;
          bd = d;
        }
      }
      pxPrev = p.x;
      if (best) {
        grab = best;
        best.grab = true;
        gx = p.x;
        gy = p.y;
        ledge.style.cursor = "grabbing";
        try {
          ledge.setPointerCapture(e.pointerId);
        } catch {}
      } else {
        brushing = true;
      }
      wake(800);
    };
    const onMove = (e: PointerEvent) => {
      const p = pos(e);
      if (grab) {
        gx = p.x;
        gy = p.y;
      } else if (brushing || e.pointerType === "mouse") {
        // なぞる: 触れた物を、動かした向きへ転がす
        const dx = p.x - pxPrev;
        pxPrev = p.x;
        if (Math.abs(dx) > 1) {
          for (const o of obs) {
            if (Math.abs(o.x - p.x) < o.r + 8 && p.y > o.y - o.r - 12) o.vx += clamp(dx, -40, 40) * 14;
          }
          wake(1200);
        }
      }
    };
    const onUp = () => {
      brushing = false;
      if (grab) {
        grab.grab = false;
        grab.vx = clamp(grab.vx, -2200, 2200);
        grab.vy = clamp(grab.vy, -2200, 2200);
        grab = null;
        ledge.style.cursor = "";
        wake(2500);
      }
    };
    ledge.addEventListener("pointerdown", onDown);
    ledge.addEventListener("pointermove", onMove);
    ledge.addEventListener("pointerup", onUp);
    ledge.addEventListener("pointercancel", onUp);
    const onScroll = () => wake(700);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    // 紙: 見える所に来たら置かれる
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-bc-card]"));
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => en.isIntersecting && en.target.classList.add("is-in")),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.04 }
    );
    cards.forEach((c) => io.observe(c));

    resize();
    wake(3200);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ledge.removeEventListener("pointerdown", onDown);
      ledge.removeEventListener("pointermove", onMove);
      ledge.removeEventListener("pointerup", onUp);
      ledge.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return null;
}
