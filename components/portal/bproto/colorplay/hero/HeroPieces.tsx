"use client";
/**
 * 案 5「つまむ」: 見出しの札・人物の写真・形・COLOR PLAY の札が、紙の切り抜きのように指でつまんで動かせる。
 *  - つまむ: (マウス)押さえた瞬間に / (指)横に動かすか、少し押さえ続けると、浮き上がって(少し大きく、傾く)、動かすと遅れてついてくる。離すと、勢いのまま飛んで、ばねで元の場所に弾んで収まる
 *  - ふれる/傾ける: 何もない所を触ると、まわりの札が押しのけられる。マウスを載せると少し持ち上がる(CSS)
 *  - スクロール: 札が下に向かって散らばり、重なって積もる(元の並びへ戻すと、また弾んで収まる)。スクロールの勢いでも揺れる
 * 指で縦に払うと、札の上からでも画面がスクロールする(つかむまでは、いつもどおりのスクロール)。
 * 動かすのは transform だけ(位置の基準は CSS の left/top。ここは差分だけ書く)。rAF は動いている間だけ。
 * 「動きを減らす」設定のときは何もしない。JS が無くても、CSS だけで札は並んで読める。
 */
import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

type P = {
  el: HTMLElement;
  x: number; y: number; vx: number; vy: number; // 元の場所からのずれ(px)
  r: number; vr: number; // 回転のずれ(deg)
  s: number; vs: number; // 拡大
  bx: number; by: number; br: number; // スクロールで向かう先(画面に対する割合、deg)
  minX: number; maxX: number; minY: number; maxY: number;
  held: boolean; gx: number; gy: number;
  lx: number; ly: number; lt: number; tvx: number; tvy: number;
};

export default function HeroPieces() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>(".cp-hero");
    if (!hero) return;
    const heroEl: HTMLElement = hero;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const els = Array.from(hero.querySelectorAll<HTMLElement>(".hc-pc"));
    const ps: P[] = els.map((el) => {
      const b = (el.dataset.b || "0,0,0").split(",").map(Number);
      return { el, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, s: 1, vs: 0, bx: b[0] || 0, by: b[1] || 0, br: b[2] || 0, minX: -1e4, maxX: 1e4, minY: -1e4, maxY: 1e4, held: false, gx: 0, gy: 0, lx: 0, ly: 0, lt: 0, tvx: 0, tvy: 0 };
    });

    let on = false;
    let raf = 0;
    let visible = true;
    let last = 0;
    let W = 1, H = 1;
    let o = 0;
    let lastY = 0;
    let z = 20;
    let grabbed: P | null = null;
    let pend: { p: P; x: number; y: number; id: number } | null = null; // 指で押さえたが、まだつかむと決めていない札
    let pendTimer = 0;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const measure = () => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      const hr = hero.getBoundingClientRect();
      const top = window.innerWidth <= 900 ? 64 : 80;
      for (const p of ps) {
        const par = p.el.offsetParent as HTMLElement | null;
        const pr = par ? par.getBoundingClientRect() : hr;
        const ox = pr.left - hr.left + (p.el.offsetLeft - (par ? par.clientLeft : 0));
        const oy = pr.top - hr.top + (p.el.offsetTop - (par ? par.clientTop : 0));
        const w = p.el.offsetWidth;
        const h = p.el.offsetHeight;
        p.minX = 6 - ox;
        p.maxX = W - 6 - w - ox;
        p.minY = top - oy;
        p.maxY = H - 4 - h - oy;
      }
    };

    const kick = () => {
      if (on && visible && !raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const ease = (u: number) => u * u * (3 - 2 * u);

    function frame(now: number) {
      const hero = heroEl;
      raf = 0;
      if (!on || !visible || document.hidden) return;
      const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
      last = now;
      const hr = hero.getBoundingClientRect();
      o = clamp(-hr.top / Math.max(hr.height, 1));
      const u = ease(clamp(o / 0.7));
      const sy = window.scrollY;
      const dS = clamp(sy - lastY, -100, 100);
      lastY = sy;
      let moving = false;
      for (const p of ps) {
        if (p.held) {
          p.vs += (-170 * (p.s - 1.07) - 15 * p.vs) * dt;
          p.s += p.vs * dt;
          const rt = clamp(p.tvx * 0.012, -13, 13);
          p.vr += (-120 * (p.r - rt) - 11 * p.vr) * dt;
          p.r += p.vr * dt;
          moving = true;
        } else {
          const tx = u * p.bx * W;
          const ty = u * p.by * H;
          if (dS !== 0) { p.vy -= dS * 3.2; p.vr += dS * 0.5 * (p.br >= 0 ? 1 : -1); }
          p.vx += (-150 * (p.x - tx) - 12.5 * p.vx) * dt;
          p.vy += (-150 * (p.y - ty) - 12.5 * p.vy) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < p.minX) { p.x = p.minX; p.vx = Math.abs(p.vx) * 0.45; }
          if (p.x > p.maxX) { p.x = p.maxX; p.vx = -Math.abs(p.vx) * 0.45; }
          if (p.y < p.minY) { p.y = p.minY; p.vy = Math.abs(p.vy) * 0.45; }
          if (p.y > p.maxY) { p.y = p.maxY; p.vy = -Math.abs(p.vy) * 0.45; }
          const rt = u * p.br + clamp(p.vx * 0.012, -13, 13);
          p.vr += (-110 * (p.r - rt) - 9 * p.vr) * dt;
          p.r += p.vr * dt;
          p.vs += (-170 * (p.s - 1) - 13 * p.vs) * dt;
          p.s += p.vs * dt;
          if (Math.abs(p.x - tx) > 0.15 || Math.abs(p.y - ty) > 0.15 || Math.abs(p.vx) > 0.8 || Math.abs(p.vy) > 0.8 || Math.abs(p.r - rt) > 0.05 || Math.abs(p.vr) > 0.5 || Math.abs(p.s - 1) > 0.002 || Math.abs(p.vs) > 0.02) moving = true;
        }
        p.el.style.transform = `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0) rotate(calc(var(--rot, 0) * 1deg + ${p.r.toFixed(2)}deg)) scale(${p.s.toFixed(4)})`;
      }
      if (moving) raf = requestAnimationFrame(frame);
    }

    const local = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const grab = (p: P, pt: { x: number; y: number }, id: number) => {
      grabbed = p;
      p.held = true;
      p.gx = pt.x - p.x;
      p.gy = pt.y - p.y;
      p.lx = pt.x; p.ly = pt.y; p.lt = performance.now(); p.tvx = 0; p.tvy = 0;
      p.vs += 3;
      p.el.style.zIndex = String(++z);
      p.el.classList.add("is-held");
      try { hero.setPointerCapture(id); } catch { /* 捕まえられなくても動く */ }
      kick();
    };
    const clearPend = () => {
      pend = null;
      window.clearTimeout(pendTimer);
    };
    const onDown = (e: PointerEvent) => {
      const tgt = (e.target as Element | null)?.closest<HTMLElement>(".hc-pc");
      const p = tgt ? ps.find((q) => q.el === tgt) : undefined;
      const pt = local(e);
      if (p) {
        if (e.pointerType === "touch") {
          // 指: 縦に払ったらスクロール(ブラウザが pointercancel を送る)。横に動かすか、140ms 押さえ続けたらつかむ
          pend = { p, x: pt.x, y: pt.y, id: e.pointerId };
          window.clearTimeout(pendTimer);
          pendTimer = window.setTimeout(() => {
            if (pend) { const q = pend; pend = null; grab(q.p, { x: q.x, y: q.y }, q.id); }
          }, 140);
        } else grab(p, pt, e.pointerId);
      } else {
        // 何もない所を触ると、近くの札が弾かれる
        for (const q of ps) {
          const r = q.el.getBoundingClientRect();
          const hr = hero.getBoundingClientRect();
          const cx = r.left + r.width / 2 - hr.left;
          const cy = r.top + r.height / 2 - hr.top;
          const dx = cx - pt.x, dy = cy - pt.y;
          const d = Math.hypot(dx, dy) || 1;
          const R = Math.min(W, 760) * 0.5;
          if (d < R) {
            const f = 1 - d / R;
            q.vx += (dx / d) * f * 700;
            q.vy += (dy / d) * f * 700 - 120 * f;
            q.vr += (dx > 0 ? 1 : -1) * f * 160;
            q.vs += f * 2.2;
          }
        }
      }
      kick();
    };
    const onMove = (e: PointerEvent) => {
      const pt = local(e);
      if (pend) {
        const dx = pt.x - pend.x, dy = pt.y - pend.y;
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.1) {
          const q = pend;
          clearPend();
          grab(q.p, { x: q.x, y: q.y }, q.id);
        } else return;
      }
      const p = grabbed;
      if (!p) return;
      const nx = clamp(pt.x - p.gx, p.minX, p.maxX);
      const ny = clamp(pt.y - p.gy, p.minY, p.maxY);
      const t = performance.now();
      const dtp = Math.max(8, t - p.lt);
      p.tvx = p.tvx * 0.5 + ((pt.x - p.lx) / dtp) * 1000 * 0.5;
      p.tvy = p.tvy * 0.5 + ((pt.y - p.ly) / dtp) * 1000 * 0.5;
      p.lx = pt.x; p.ly = pt.y; p.lt = t;
      p.x = nx; p.y = ny;
      kick();
    };
    const onUp = () => {
      if (pend) {
        // 軽いタップ: ぽんと弾む
        pend.p.vs += 3.2;
        pend.p.vr += (Math.random() < 0.5 ? -1 : 1) * 160;
        clearPend();
        kick();
        return;
      }
      const p = grabbed;
      if (!p) return;
      grabbed = null;
      p.held = false;
      p.vx = clamp(p.tvx, -2600, 2600);
      p.vy = clamp(p.tvy, -2600, 2600);
      p.el.classList.remove("is-held");
      kick();
    };
    // つかんでいる指は、画面のスクロールにならない
    const onTouchMove = (e: TouchEvent) => { if (grabbed && e.cancelable) e.preventDefault(); };
    const onScroll = () => kick();
    const onVis = () => (document.hidden ? undefined : kick());

    const start = () => {
      if (on) return;
      on = true;
      lastY = window.scrollY;
      measure();
      hero.addEventListener("pointerdown", onDown, { passive: true });
      hero.addEventListener("pointermove", onMove, { passive: true });
      hero.addEventListener("pointerup", onUp, { passive: true });
      hero.addEventListener("pointercancel", onUp, { passive: true });
      hero.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVis);
      ro = new ResizeObserver(() => { measure(); kick(); });
      ro.observe(hero);
      io = new IntersectionObserver((es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) kick();
      });
      io.observe(hero);
      document.fonts?.ready.then(() => on && measure());
      window.setTimeout(() => on && measure(), 1600);
      kick();
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerup", onUp);
      hero.removeEventListener("pointercancel", onUp);
      hero.removeEventListener("touchmove", onTouchMove);
      clearPend();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      ro?.disconnect();
      io?.disconnect();
      ro = null; io = null;
      for (const p of ps) {
        p.el.style.removeProperty("transform");
        p.el.style.removeProperty("z-index");
        p.el.classList.remove("is-held");
        p.x = p.y = p.vx = p.vy = p.r = p.vr = 0; p.s = 1; p.vs = 0; p.held = false;
      }
      grabbed = null;
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
