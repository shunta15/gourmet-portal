"use client";
/**
 * 案 3「流れる」の動かし役。1 つの rAF で次を動かす(画面に見えている間だけ。見えなくなったら止める)。
 *  - 帯(.hf-track): 行ごとに逆向きに流れ続ける。スクロールの速さで速くなり、字が傾く(skewX)
 *  - 人物の写真: マウス・指・端末の傾きに合わせて、奥行きのある傾き(perspective)。何も触っていない間はゆっくり揺れる
 *  - 形(.hf-sh): ばねで弾みながら漂う。ポインタが近づくと逃げ、スクロールすると散ってから下の画面に吸い込まれる
 * 動かすのは transform と opacity だけ。「動きを減らす」設定のときは何もしない(CSS が帯と形を隠す)。
 */
import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

type Shape = { el: HTMLElement; hx: number; hy: number; d: number; ox: number; oy: number; vx: number; vy: number; ph: number; w1: number; w2: number; a: number; r0: number };

export default function HeroFlow() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>(".cp-hero");
    if (!hero) return;
    const photo = hero.querySelector<HTMLElement>(".cp-hero-photo");
    const img = photo?.querySelector<HTMLElement>("img") ?? null;
    const field = hero.querySelector<HTMLElement>(".hf-shapes");
    const tracks = Array.from(hero.querySelectorAll<HTMLElement>(".hf-track"));
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const dir = tracks.map((t) => Number(t.dataset.dir) || 1);
    const base = tracks.map((t) => Number(t.dataset.v) || 60);
    const unit = tracks.map(() => 0);
    const xs = tracks.map(() => 0);
    const shapes: Shape[] = Array.from(hero.querySelectorAll<HTMLElement>(".hf-sh")).map((el, i) => ({
      el,
      hx: Number(el.dataset.x) / 100,
      hy: Number(el.dataset.y) / 100,
      d: Number(el.dataset.d) || 1,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      ph: i * 1.7 + Math.random() * 2,
      w1: 0.55 + Math.random() * 0.7,
      w2: 0.5 + Math.random() * 0.7,
      a: 7 + Math.random() * 9,
      r0: (i % 2 ? 1 : -1) * (8 + (i * 13) % 34),
    }));

    let on = false;
    let raf = 0;
    let visible = true;
    let last = 0;
    let W = 1;
    let H = 1;
    let sv = 0; // スクロールの速さ(px/秒、下へが正)
    let lastY = 0;
    let lastYT = 0;
    let skew = 0;
    let px: number | null = null; // ポインタ(画面の面の中の位置)
    let py = 0;
    let tx = 0; // 傾きの目標(-1〜1)
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let oriT = 0; // 端末の傾きを最後に受けた時刻
    let ox = 0;
    let oy = 0;
    let pointerT = 0;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let oriOn = false;

    const measure = () => {
      W = Math.max(1, field?.clientWidth ?? hero.clientWidth);
      H = Math.max(1, field?.clientHeight ?? hero.clientHeight);
      tracks.forEach((t, i) => {
        unit[i] = (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      });
    };

    const kick = () => {
      if (on && visible && !raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!on || !visible || document.hidden) return;
      const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
      last = now;
      const t = now / 1000;
      sv *= Math.exp(-dt * 4.5);
      const r = hero.getBoundingClientRect();
      const o = clamp(-r.top / Math.max(r.height, 1));

      // 帯: 流れる(速さはスクロールで増える)と傾く
      const boost = 1 + Math.min(Math.abs(sv) / 420, 7);
      skew += (clamp(-sv / 110, -1, 1) * 16 - skew) * Math.min(1, dt * 8);
      for (let i = 0; i < tracks.length; i++) {
        const u = unit[i];
        if (!u) continue;
        xs[i] = (xs[i] + base[i] * boost * dt) % u;
        const x = dir[i] > 0 ? xs[i] - u : -xs[i];
        tracks[i].style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      }

      // 写真の傾き: ポインタ/指 → 端末の傾き → ゆっくり揺れる、の順に優先
      if (px !== null && now - pointerT < 2500) {
        tx = clamp(((px - r.left) / Math.max(r.width, 1)) * 2 - 1, -1, 1);
        ty = clamp(((py - r.top) / Math.max(r.height, 1)) * 2 - 1, -1, 1);
      } else if (now - oriT < 1500) {
        tx = ox;
        ty = oy;
      } else {
        tx = Math.sin(t * 0.7) * 0.4;
        ty = Math.cos(t * 0.5) * 0.25;
      }
      cx += (tx - cx) * Math.min(1, dt * 6);
      cy += (ty - cy) * Math.min(1, dt * 6);
      if (photo) photo.style.transform = `perspective(900px) rotateY(${(cx * 9).toFixed(2)}deg) rotateX(${(-cy * 7).toFixed(2)}deg)`;
      if (img) img.style.translate = `${(-cx * 9).toFixed(1)}px ${(-cy * 7).toFixed(1)}px`;

      // 形: ばね。スクロールで散って、下へ吸い込まれる
      const u = clamp(o / 0.72);
      const k1 = clamp(u / 0.45);
      const k2 = clamp((u - 0.45) / 0.55);
      const fr = field?.getBoundingClientRect();
      const fx = fr ? fr.left : 0;
      const fy = fr ? fr.top : 0;
      for (const s of shapes) {
        const hx = s.hx * W;
        const hy = s.hy * H;
        let gx = 0;
        let gy = 0;
        let sc = 1;
        let op = 1;
        if (u > 0) {
          const dx = hx - W / 2;
          const dy = hy - H * 0.45;
          const L = Math.hypot(dx, dy) || 1;
          const out = (110 + s.d * 90) * k1;
          gx = (dx / L) * out * (1 - k2) + (W * 0.5 - hx) * k2;
          gy = (dy / L) * out * (1 - k2) + (H * 1.08 - hy) * k2;
          sc = 1 - k2 * 0.85;
          op = 1 - clamp((u - 0.78) / 0.22);
        }
        gx += Math.sin(t * s.w1 + s.ph) * s.a;
        gy += Math.cos(t * s.w2 + s.ph) * s.a;
        if (px !== null) {
          const ddx = hx + s.ox - (px - fx);
          const ddy = hy + s.oy - (py - fy);
          const dist = Math.hypot(ddx, ddy) || 1;
          if (dist < 140) {
            const f = 1 - dist / 140;
            s.vx += (ddx / dist) * f * f * 2600 * dt;
            s.vy += (ddy / dist) * f * f * 2600 * dt;
          }
        }
        s.vy += -sv * 0.35 * s.d * dt; // スクロールの勢いでぽんと跳ねる
        const ax = -58 * (s.ox - gx) - 7 * s.vx;
        const ay = -58 * (s.oy - gy) - 7 * s.vy;
        s.vx += ax * dt;
        s.vy += ay * dt;
        s.ox += s.vx * dt;
        s.oy += s.vy * dt;
        const px2 = -cx * s.d * 22;
        const py2 = -cy * s.d * 16;
        const rot = s.r0 + s.vx * 0.06 + Math.sin(t * s.w1 + s.ph) * 6;
        s.el.style.transform = `translate(-50%,-50%) translate3d(${(s.ox + px2).toFixed(1)}px,${(s.oy + py2).toFixed(1)}px,0) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        s.el.style.opacity = op.toFixed(3);
      }
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      if (lastYT) {
        const dt = Math.max(8, now - lastYT);
        const v = ((y - lastY) / dt) * 1000;
        sv = sv * 0.5 + clamp(v, -4000, 4000) * 0.5;
      }
      lastY = y;
      lastYT = now;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      pointerT = performance.now();
      kick();
    };
    const onLeave = () => {
      px = null;
    };
    const onDown = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      pointerT = performance.now();
      // 触った所から、近くの形をはじく
      const fr = field?.getBoundingClientRect();
      if (fr) {
        for (const s of shapes) {
          const ddx = s.hx * W + s.ox - (px - fr.left);
          const ddy = s.hy * H + s.oy - (py - fr.top);
          const dist = Math.hypot(ddx, ddy) || 1;
          if (dist < 260) {
            const f = 1 - dist / 260;
            s.vx += (ddx / dist) * f * 900;
            s.vy += (ddy / dist) * f * 900 - 160 * f;
          }
        }
      }
      if (e.pointerType === "touch") askOrientation();
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") px = null;
    };
    const onOri = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      ox = clamp(e.gamma / 26, -1, 1);
      oy = clamp((e.beta - 50) / 26, -1, 1);
      oriT = performance.now();
    };
    const addOri = () => {
      if (oriOn) return;
      oriOn = true;
      window.addEventListener("deviceorientation", onOri, { passive: true });
    };
    // iOS は最初に触った時に許可を聞く。それ以外(Android など)は聞かずに受け取れる
    const askOrientation = () => {
      const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
      if (!D) return;
      if (typeof D.requestPermission === "function") {
        if (oriOn) return;
        D.requestPermission().then((s) => s === "granted" && addOri()).catch(() => {});
      }
    };
    const onVis = () => (document.hidden ? undefined : kick());

    const start = () => {
      if (on) return;
      on = true;
      measure();
      lastY = window.scrollY;
      lastYT = 0;
      window.addEventListener("scroll", onScroll, { passive: true });
      hero.addEventListener("pointermove", onMove, { passive: true });
      hero.addEventListener("pointerdown", onDown, { passive: true });
      hero.addEventListener("pointerup", onUp, { passive: true });
      hero.addEventListener("pointercancel", onUp, { passive: true });
      hero.addEventListener("pointerleave", onLeave, { passive: true });
      document.addEventListener("visibilitychange", onVis);
      const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
      if (D && typeof D.requestPermission !== "function") addOri();
      ro = new ResizeObserver(measure);
      ro.observe(hero);
      io = new IntersectionObserver((es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) kick();
      });
      io.observe(hero);
      document.fonts?.ready.then(() => on && measure());
      kick();
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("deviceorientation", onOri);
      oriOn = false;
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", onUp);
      hero.removeEventListener("pointercancel", onUp);
      hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      ro?.disconnect();
      io?.disconnect();
      ro = null;
      io = null;
      tracks.forEach((t) => t.style.removeProperty("transform"));
      photo?.style.removeProperty("transform");
      img?.style.removeProperty("translate");
      shapes.forEach((s) => {
        s.el.style.removeProperty("transform");
        s.el.style.removeProperty("opacity");
        s.ox = s.oy = s.vx = s.vy = 0;
      });
    };
    const onMq = () => (mq.matches ? stop() : start());

    if (!mq.matches) start();
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return <span ref={ref} hidden />;
}
