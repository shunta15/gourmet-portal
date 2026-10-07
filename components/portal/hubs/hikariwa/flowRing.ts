/**
 * 下のブロックの背景に流れる、大きな光の輪（クライアント専用）。
 * 最初の画面の輪と同じ 6 色・同じ描き方。画面の右に大きく据え、スクロールに合わせて回り、ゆっくり波が広がる。
 * 画面に出ているあいだだけ動く。動きを減らす設定では、止めた 1 枚を描く。
 */
import type { RGB } from "@/lib/portal/hubs/hikariwa/colors";
import { WHITE, makeBlob, makeSprite, mix, rgba, rng } from "./glowKit";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function createFlowRing(o: {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  glow: [HTMLCanvasElement, HTMLCanvasElement];
  colors: RGB[];
  kinds: ("live" | "quiet" | "faint")[];
}): () => void {
  const { root, canvas, colors, kinds } = o;
  const ctx = canvas.getContext("2d")!;
  const [g1c, g2c] = o.glow;
  const g1 = g1c.getContext("2d")!;
  const g2 = g2c.getContext("2d")!;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sprites = colors.map((c) => makeSprite(c));
  const blobs = colors.map((c) => makeBlob(c));
  const warm = makeSprite([255, 226, 190]);
  const cores = colors.map((c) => mix(c, WHITE, 0.62));

  let W = 1;
  let H = 1;
  let dpr = 1;
  let cx = 0;
  let cy = 0;
  let R = 400;
  const TILT = 74 * DEG;
  const sT = Math.sin(TILT);
  const cT = Math.cos(TILT);
  const RO = -9 * DEG;
  const D = 3.6;
  const proj = (x: number, z: number): [number, number, number] => {
    const dep = z * cT;
    const s = D / (D - dep);
    const X = x * s * R;
    const Y = z * sT * s * R;
    return [cx + X * Math.cos(RO) - Y * Math.sin(RO), cy + X * Math.sin(RO) + Y * Math.cos(RO), s];
  };

  const measure = () => {
    const r = root.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    g1c.width = Math.ceil(W / 4);
    g1c.height = Math.ceil(H / 4);
    g2c.width = Math.ceil(W / 10);
    g2c.height = Math.ceil(H / 10);
    const wide = W >= 700;
    R = wide ? Math.min(W * 0.262, H * 0.4, 520) : Math.min(W * 0.6, 300);
    cx = wide ? W * 0.735 : W * 0.7;
    cy = wide ? H * 0.46 : H * 0.62;
  };

  const rr = rng(4242);
  const ND = 220;
  const dx = new Float32Array(ND);
  const dz = new Float32Array(ND);
  const ds = new Float32Array(ND);
  const dph = new Float32Array(ND);
  for (let k = 0; k < ND; k++) {
    const r = 1.05 + 0.9 * Math.sqrt(rr());
    const th = rr() * TAU;
    dx[k] = r * Math.cos(th);
    dz[k] = r * Math.sin(th);
    ds[k] = 0.9 + rr() * 1.5;
    dph[k] = rr() * TAU;
  }
  const ripples: { x: number; z: number; age: number; i: number }[] = [];
  let nextRip = 1.2;

  let raf = 0;
  let last = 0;
  let t = 0;
  let visible = false;
  let destroyed = false;

  const draw = () => {
    const sc = typeof window !== "undefined" ? window.scrollY : 0;
    const rect = root.getBoundingClientRect();
    const prog = clamp((window.innerHeight - rect.top) / (rect.height + window.innerHeight));
    const rot = prog * 2.4 + t * 0.045; // 弧いくつぶん回ったか（ラジアンではなく、周）
    void sc;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineJoin = "round";
    g1.setTransform(1, 0, 0, 1, 0, 0);
    g1.clearRect(0, 0, g1c.width, g1c.height);
    g1.setTransform(0.25, 0, 0, 0.25, 0, 0);
    g1.globalCompositeOperation = "lighter";

    // 街の灯
    for (let k = 0; k < ND; k++) {
      const [X, Y, s] = proj(dx[k], dz[k]);
      if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) continue;
      let lit = 0;
      for (const rp of ripples) {
        const u = rp.age / 5;
        const rho = 1.2 * (1 - Math.pow(1 - u, 2.2));
        const q = (Math.hypot(dx[k] - rp.x, dz[k] - rp.z) - rho) / 0.12;
        if (q > -3 && q < 3) lit += Math.exp(-q * q) * Math.pow(1 - u, 1.4);
      }
      const tw = 0.7 + 0.3 * Math.sin(t * 1.1 + dph[k]);
      const sz = ds[k] * s * (1 + lit * 1.6);
      ctx.globalAlpha = Math.min(1, (0.3 + lit * 0.6) * tw);
      ctx.drawImage(warm, X - sz * 2.2, Y - sz * 2.2, sz * 4.4, sz * 4.4);
    }
    ctx.globalAlpha = 1;

    // 輪をひとつに見せる細い円
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(206,220,255,0.18)";
    ctx.beginPath();
    for (let k = 0; k <= 120; k++) {
      const ph = (k / 120) * TAU;
      const [X, Y] = proj(Math.sin(ph), -Math.cos(ph));
      if (k === 0) ctx.moveTo(X, Y);
      else ctx.lineTo(X, Y);
    }
    ctx.stroke();

    // 6 つの弧
    const SEG = 30;
    const half = 28 * DEG;
    for (let i = 0; i < 6; i++) {
      const kind = kinds[i];
      const phc = Math.PI + i * (Math.PI / 3) + rot * TAU;
      const baseW = kind === "live" ? 5.4 : kind === "quiet" ? 3.4 : 2.4;
      const kindA = kind === "live" ? 1.05 : kind === "quiet" ? 0.95 : 0.75;
      let px0 = 0;
      let py0 = 0;
      for (let k = 0; k <= SEG; k++) {
        const ph = phc - half + (k / SEG) * 2 * half;
        const [X, Y, s] = proj(Math.sin(ph), -Math.cos(ph));
        const dep = clamp(0.55 + 0.45 * ((s - 0.88) / 0.24), 0, 1);
        const fr = k / SEG;
        const taper = kind === "live" ? 0.85 + 0.15 * Math.sin(fr * Math.PI) : 0.55 + 0.45 * Math.sin(fr * Math.PI);
        const A = kindA * dep * taper;
        if (k > 0) {
          const bw = baseW * s * Math.max(0.6, R / 420);
          if (kind === "faint") {
            if (k % 2 === 0) {
              const sz = 4.2 * s;
              ctx.globalAlpha = Math.min(1, A * 0.95);
              ctx.drawImage(sprites[i], X - sz, Y - sz, sz * 2, sz * 2);
              ctx.globalAlpha = 1;
            }
          } else {
            ctx.beginPath();
            ctx.moveTo(px0, py0);
            ctx.lineTo(X, Y);
            ctx.lineWidth = bw * 1.9;
            ctx.strokeStyle = rgba(colors[i], A * 0.5);
            ctx.stroke();
            ctx.lineWidth = bw * 0.66;
            ctx.strokeStyle = rgba(cores[i], A * 0.95);
            ctx.stroke();
          }
          const sr = (kind === "live" ? 0.1 : kind === "quiet" ? 0.062 : 0.045) * R * s;
          g1.globalAlpha = Math.min(1, A * (kind === "faint" ? 0.17 : 0.24));
          g1.drawImage(blobs[i], X - sr, Y - sr, sr * 2, sr * 2);
        }
        px0 = X;
        py0 = Y;
      }
    }

    // 広がる輪
    for (const rp of ripples) {
      const u = rp.age / 5;
      const rho = 1.2 * (1 - Math.pow(1 - u, 2.2));
      const al = Math.pow(1 - u, 1.8) * clamp(u / 0.05) * 0.5;
      ctx.beginPath();
      for (let k = 0; k <= 72; k++) {
        const ph = (k / 72) * TAU;
        const [X, Y] = proj(rp.x + Math.cos(ph) * rho, rp.z + Math.sin(ph) * rho);
        if (k === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      }
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = rgba(mix(colors[rp.i], WHITE, 0.5), al);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    g2.setTransform(1, 0, 0, 1, 0, 0);
    g2.globalCompositeOperation = "copy";
    g2.drawImage(g1c, 0, 0, g2c.width, g2c.height);
  };

  const tick = (now: number) => {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    t += dt;
    nextRip -= dt;
    if (nextRip <= 0) {
      nextRip = 3.2 + Math.random() * 1.6;
      const i = Math.random() < 0.55 ? 0 : Math.floor(Math.random() * 6);
      const ph = Math.PI + i * (Math.PI / 3) + (Math.random() - 0.5) * 0.6 + (window.scrollY / 1000) * 0;
      if (ripples.length < 3) ripples.push({ x: Math.sin(ph), z: -Math.cos(ph), age: 0, i });
    }
    for (const rp of ripples) rp.age += dt;
    for (let k = ripples.length - 1; k >= 0; k--) if (ripples[k].age >= 5) ripples.splice(k, 1);
    draw();
    schedule();
  };
  const active = () => visible && !document.hidden && !destroyed && !mq.matches;
  const schedule = () => {
    if (raf || !active()) return;
    raf = requestAnimationFrame(tick);
  };
  const resume = () => {
    if (raf) return;
    last = performance.now();
    schedule();
  };
  const onVis = () => (document.hidden ? undefined : resume());
  document.addEventListener("visibilitychange", onVis);
  const io = new IntersectionObserver((es) => {
    visible = es[0]?.isIntersecting ?? false;
    if (visible) resume();
  });
  io.observe(root);
  const ro = new ResizeObserver(() => {
    measure();
    if (mq.matches) draw();
    resume();
  });
  ro.observe(root);
  measure();
  if (mq.matches) {
    t = 3;
    draw();
  }
  return () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVis);
    io.disconnect();
    ro.disconnect();
  };
}
