"use client";
import { useEffect, useRef, useState } from "react";
import Lantern from "../noren/Lantern";
import type { LanternReal } from "./lanternReal";

/**
 * 店ページ・特集記事の提灯（リアル版）。本番の CSS の提灯（Lantern.tsx）と同じ外枠（.vN-lan。位置・大きさ・揺れ・紐は今の CSS のまま）に、
 * 入口と同じ WebGL の赤提灯（lanternReal.ts のシェーダー）を描く。字は今のまま（灯・宵・酒）。灯りの強さは時刻連動の --lamp。
 * - WebGL のコンテキストは、ページで 1 つだけ共有（画面外の提灯は描かない。特集記事は店ごとに提灯があるため）。
 * - WebGL が使えない・「動きを減らす」設定のときは、今の CSS の提灯（Lantern.tsx）をそのまま出す。
 * lib/portal/noren/realTop.ts の NOREN_REAL_INNER が true のときだけ、呼び出し側（ShopHero・FeaturePage）がこの部品を使う。
 */
type Item = { el: HTMLSpanElement; cv: HTMLCanvasElement; idx: number; vis: boolean; F: number; root: HTMLElement };
const MARKS = ["灯", "酒", "宵"];
const items = new Set<Item>();
let shared: { gl: LanternReal; cv: HTMLCanvasElement } | null | undefined;
let sharedP: Promise<typeof shared> | null = null;
let raf = 0;
let last = 0;
let lamp = 0.5;
let lampAt = -9999;

function initShared(root: HTMLElement): Promise<typeof shared> {
  if (sharedP) return sharedP;
  sharedP = (async () => {
    const { createLanternReal } = await import("./lanternReal");
    const cv = document.createElement("canvas");
    const gl = createLanternReal(cv);
    if (!gl) return null;
    const brush = getComputedStyle(root).getPropertyValue("--vN-brush").trim() || '"Yuji Boku", serif';
    try {
      await document.fonts.load(`400 100px ${brush}`, MARKS.join(""));
      await document.fonts.ready;
    } catch {}
    gl.setGlyphs(MARKS, brush);
    shared = { gl, cv };
    return shared;
  })();
  return sharedP;
}

function tick(now: number) {
  raf = requestAnimationFrame(tick);
  if (document.hidden || !shared || now - last < 42) return;
  last = now;
  for (const it of items) {
    if (!it.vis || it.F <= 0 || !it.el.isConnected) continue;
    if (now - lampAt > 1000) {
      lampAt = now;
      lamp = parseFloat(getComputedStyle(it.root).getPropertyValue("--lamp")) || 0.5;
    }
    const F = it.F;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = 13 * F, cssH = 15.9 * F;
    const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
    if (it.cv.width !== w || it.cv.height !== h) {
      it.cv.width = w;
      it.cv.height = h;
    }
    shared.gl.resize({ cssW, cssH, dpr, lans: [{ cx: 6.5 * F, top: 4 * F, F }], pivotY: 0 });
    shared.gl.render({ time: now / 1000, lamp, idxA: it.idx, swing: 0, cord: 0 });
    const g = it.cv.getContext("2d");
    if (!g) continue;
    g.clearRect(0, 0, w, h);
    g.drawImage(shared.cv, 0, 0, w, h);
  }
}

export default function LanternInner({ className = "", mark = "灯" }: { className?: string; mark?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [css, setCss] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCss(true);
      return;
    }
    const e = el.current!;
    const c = cv.current!;
    const root = e.closest(".vN") as HTMLElement | null;
    if (!root) {
      setCss(true);
      return;
    }
    let alive = true;
    const it: Item = { el: e, cv: c, idx: Math.max(0, MARKS.indexOf(mark)), vis: false, F: 0, root };
    initShared(root).then((s) => {
      if (!alive) return;
      if (!s) {
        setCss(true);
        return;
      }
      items.add(it);
      if (!raf) raf = requestAnimationFrame(tick);
    });
    const measure = () => {
      it.F = e.offsetParent === null ? 0 : parseFloat(getComputedStyle(e).fontSize) || 0;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(e);
    const io = new IntersectionObserver((es) => {
      it.vis = es[0].isIntersecting;
      measure();
    }, { rootMargin: "120px" });
    io.observe(e);
    return () => {
      alive = false;
      ro.disconnect();
      io.disconnect();
      items.delete(it);
      if (items.size === 0 && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
  }, [mark]);

  if (css) return <Lantern className={className} mark={mark} />;
  return (
    <span ref={el} className={`vN-lan ${className}`} aria-hidden="true">
      <i className="vN-lan-cord" />
      <canvas ref={cv} style={{ position: "absolute", left: "-4em", top: "-4em", width: "13em", height: "15.9em", pointerEvents: "none" }} />
    </span>
  );
}
