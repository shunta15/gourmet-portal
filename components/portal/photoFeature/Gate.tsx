"use client";
import { useEffect, useRef } from "react";
import { NOREN_REAL_DYE } from "@/lib/portal/noren/realTop";
import { panelPlan } from "@/lib/portal/noren/shop";

/**
 * 記事の入口の暖簾（本物の布 = WebGL。入口 /gourmet・店ページと同じ布 components/portal/noren-real/clothInner.ts を使う）。
 * 最初の画面に、店の屋号を染め抜いた藍の暖簾が掛かっていて、風で揺れる。スクロール（またはタップ）で暖簾が割れて上がり、
 * 奥から主役の写真と題が現れる（くぐって店に入る感じ）。上げる距離はスクロール 0.6 画面ぶん。
 * 使えない端末（WebGL なし）・動きを減らす設定・JavaScript なしでは、何もしない（.pf-gate-on が付かず、最初から写真と題が見える）。
 * WebGL の布は 1 ページに 1 つだけ（この入口）。暖簾が上がりきったら描くのをやめる（スクロールで戻ったら、また描く）。
 * 布に入れる字は、店の屋号（記事の対の店ページの店名）の字だけ。スマホは解像度を 1 倍にして軽くする。
 */
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);
/** 暖簾を上げるスクロールの距離（画面の高さに対する割合） */
const LIFT = 0.6;

export default function Gate({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const wall = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const canvas = cv.current;
    const wl = wall.current;
    const page = document.querySelector<HTMLElement>(".pf-root");
    if (!el || !canvas || !wl || !page) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let raf = 0;
    let running = false;
    let cloth: Awaited<ReturnType<typeof makeCloth>> = null;
    let open = 0;
    let t0 = performance.now();
    let lastNow = 0;
    let lastDraw = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let mouse = 0;
    let mouseT = 0;
    let L = { cssW: 0, cssH: 0, rodY: 0, hemY: 0, margin: 0 };
    let planKey = "";
    let lastAspect = 1;
    const family = '"Hiragino Mincho ProN","Yu Mincho","Shippori Mincho B1","Noto Serif JP",serif';

    const layout = () => {
      if (!cloth) return;
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      const mobile = cssW < 640;
      const p = panelPlan(name, mobile);
      const n = p.length;
      const gap = mobile ? 5 : 7;
      const rodY = mobile ? 60 : 78;
      const hemY = cssH - (mobile ? 46 : 38);
      let margin: number;
      if (mobile) margin = 12;
      else {
        const pwT = clamp(cssW * 0.17, 150, 250);
        const doorW = Math.min(cssW * 0.8, n * pwT + (n - 1) * gap);
        margin = Math.round((cssW - doorW) / 2);
      }
      const pw = (cssW - 2 * margin - (n - 1) * gap) / n;
      const aspect = (hemY - rodY) / pw;
      // スマホは解像度を 1 倍に（軽い版）。PC は最大 1.25 倍
      const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
      cloth.resize({ cssW, cssH, dpr, rodY, hemY, gap, margin });
      const key = p.map((x) => x.join("")).join("|");
      if (key !== planKey || Math.abs(aspect / lastAspect - 1) > 0.06) {
        planKey = key;
        lastAspect = aspect;
        cloth.setPanels(p, family, aspect);
      }
      L = { cssW, cssH, rodY, hemY, margin };
    };

    const hole = (h: number) => {
      // 暖簾が掛かっているあいだ（h = 0）は、奥（本文・ボタン）を見せない。暖簾が割れ始めたら、戸口の中心から奥が見え始め、戸口いっぱい → 画面いっぱいに広がる
      const { cssW: W, cssH: H, rodY, hemY, margin } = L;
      const cx = W / 2;
      const cy = (rodY + hemY) / 2;
      const dw = (W - 2 * margin) / 2;
      const dh = (hemY - rodY) / 2;
      const s1 = clamp(h / 0.4, 0, 1);
      const s2 = clamp((h - 0.4) / 0.6, 0, 1);
      const l1 = cx - dw * s1;
      const r1 = cx + dw * s1;
      const t1 = cy - dh * s1;
      const b1 = cy + dh * s1;
      const l = l1 * (1 - s2);
      const r = r1 + (W - r1) * s2;
      const t = t1 * (1 - s2);
      const b = b1 + (H - b1) * s2;
      return `polygon(evenodd, 0px 0px, ${W}px 0px, ${W}px ${H}px, 0px ${H}px, 0px 0px, ${l}px ${t}px, ${l}px ${b}px, ${r}px ${b}px, ${r}px ${t}px, ${l}px ${t}px)`;
    };

    const stop = () => {
      running = false;
      lastNow = 0;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const frame = (now: number) => {
      if (!alive || !cloth) return;
      const vh = window.innerHeight;
      const y = window.scrollY;
      vel = vel * 0.9 + Math.min(1, Math.abs(y - lastY) / 60) * 0.1;
      lastY = y;
      const p = clamp(y / (vh * LIFT), 0, 1);
      const target = ease(clamp((p - 0.02) / 0.92, 0, 1));
      const prev = open;
      // 描く間隔が長い端末でも、同じ時間で追いつく（フレームの数ではなく、時間で近づける）
      const dt = lastNow ? Math.min(0.25, (now - lastNow) / 1000) : 0.016;
      lastNow = now;
      open += (target - open) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - open) < 0.0006) open = target;
      mouse += (mouseT - mouse) * (1 - Math.exp(-dt * 3));
      const t = (now - t0) / 1000;
      const gust = Math.min(1.4, 0.12 + 0.95 * Math.exp(-t / 2.4) + vel * 0.9 + Math.abs(open - prev) * 6);
      // 掛かりきる前（intro）と、まだ割れていないあいだは、壁に穴を開けない
      const introDone = clamp((now - t0) / 1000 / 1.6, 0, 1) >= 1;
      const h = introDone ? ease(clamp((open - 0.05) / 0.95, 0, 1)) : 0;
      wl.style.clipPath = h > 0.001 ? hole(h) : "none";
      el.style.setProperty("--open", open.toFixed(4));
      if (open > 0.3 && !page.classList.contains("pf-gate-open")) page.classList.add("pf-gate-open");
      // タップで上げられるのは、暖簾が下りているあいだだけ
      el.style.pointerEvents = open < 0.4 ? "auto" : "none";
      const done = open >= 0.995 && target >= 0.995;
      el.classList.toggle("is-done", done);
      // 動いていない（風で揺れているだけ）ときは、描く回数を半分にする（軽くする）
      const calm = Math.abs(target - open) < 0.003 && vel < 0.03;
      if (calm && !done && now - lastDraw < 33) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      cloth.render({ time: t, open, gust, mouse, lamp: 0.62, intro: ease(clamp(t / 1.6, 0, 1)) });
      if (done) {
        stop();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || !cloth) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (!running && window.scrollY < window.innerHeight * LIFT * 1.0) {
        el.classList.remove("is-done");
        start();
      }
    };
    const onResize = () => {
      layout();
      onScroll();
    };
    const onMove = (e: MouseEvent) => {
      mouseT = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    const onTap = () => {
      if (open < 0.4) window.scrollTo({ top: window.innerHeight * LIFT * 1.02, behavior: "smooth" });
    };

    (async () => {
      cloth = await makeCloth(canvas);
      if (!alive) {
        cloth?.destroy();
        return;
      }
      if (!cloth) {
        // 布が使えない端末: 何もしない（最初から写真と題が見える）
        page.classList.remove("pf-gate-on");
        return;
      }
      page.classList.add("pf-gate-on");
      layout();
      t0 = performance.now();
      start();
    })();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("click", onTap);
    return () => {
      alive = false;
      stop();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onTap);
      page.classList.remove("pf-gate-open");
      cloth?.destroy();
    };
  }, [name]);

  return (
    <div ref={root} className="pf-gate" aria-hidden="true">
      <div ref={wall} className="pf-gate__wall" />
      <span className="pf-lan pf-lan--l pf-lan--gate" aria-hidden="true"><i className="pf-lan__g" /><i className="pf-lan__c" /><i className="pf-lan__b" /></span>
      <span className="pf-lan pf-lan--r pf-lan--gate" aria-hidden="true"><i className="pf-lan__g" /><i className="pf-lan__c" /><i className="pf-lan__b" /></span>
      <canvas ref={cv} className="pf-gate__cv" />
      <div className="pf-gate__cue">
        <span>暖簾を上げる</span>
        <i />
      </div>
    </div>
  );
}

/** 布を作る（WebGL が使えなければ null）。clothInner は重いので、使える端末でだけ読み込む */
async function makeCloth(canvas: HTMLCanvasElement) {
  try {
    const mod = await import("../noren-real/clothInner");
    return mod.createClothInner(canvas, NOREN_REAL_DYE);
  } catch {
    return null;
  }
}
