"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./kumori.css";
import { KUMORI_BOKEH, KUMORI_PHOTO, photoUrl, type KumoriEntry } from "@/lib/portal/vert/kumori/data";

type Props = { entries: KumoriEntry[]; lead: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => 1 - Math.pow(1 - t, 2.2);

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Drop = { x: number; y: number; r: number; v: number; dist: number; max: number; wait: number; f: number; ph: number; text: boolean };

function DeepCopy({ lead }: { lead: string }) {
  return (
    <>
      <p className="k-deep-eye">MACHINOWA Beauty</p>
      <h2 className="k-deep-h">掲載準備中です</h2>
      <p className="k-deep-lead">{lead}</p>
    </>
  );
}

export default function KumoriHero({ entries, lead }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<HTMLCanvasElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const glass = glassRef.current!;
    const fogC = fogRef.current!;
    const dropC = dropRef.current!;
    const img = imgRef.current!;
    const fctx = fogC.getContext("2d")!;
    const dctx = dropC.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = rng(20261008);
    const rr = rng(77);

    let W = 0, H = 0, s = 1, Fw = 0, Fh = 0;
    const tex = document.createElement("canvas");
    const tmask = document.createElement("canvas");
    let fontFamily = "sans-serif";
    let drops: Drop[] = [];
    let pwx = -0.15;
    let progress = 0;
    let frame = 0;
    let lastT = 0;
    let running = false;
    let raf = 0;
    let visible = true;
    let ready = false;
    let lastScrollY = -1;
    let hover: { x: number; y: number; r: number; tr: number } | null = null;
    let lastPt: { x: number; y: number } | null = null;
    let travel = 0;
    let inkData: Uint8ClampedArray | null = null;
    let inkW = 0;
    let inkH = 0;
    let bulbPts: { x: number; y: number }[] = [];
    let press: { x: number; y: number; r: number } | null = null;
    let hoverT = 0;
    let lastWipe = 0;
    let intro: { t0: number; px: number; py: number } | null = null;
    let brandLines: { y: number; x0: number; x1: number }[] = [];
    let entryEls: { el: HTMLElement; cx: number }[] = [];
    const trim = document.createElement("canvas");
    let crop = { z: 1.55, ox: 0.04, oy: 0.5, px: 0.5, py: 0.55 };

    /* ---------- 曇りの層(下絵)---------- */
    function buildTex() {
      tex.width = Fw;
      tex.height = Fh;
      const t = tex.getContext("2d")!;
      const bg0 = t.createLinearGradient(0, 0, 0, Fh);
      bg0.addColorStop(0, "#7a5233");
      bg0.addColorStop(0.55, "#b98550");
      bg0.addColorStop(1, "#5c3a24");
      t.fillStyle = bg0;
      t.fillRect(0, 0, Fw, Fh);
      if (img.complete && img.naturalWidth) {
        const sm = document.createElement("canvas");
        sm.width = 36;
        sm.height = Math.max(8, Math.round((36 * Fh) / Fw));
        const sc = sm.getContext("2d")!;
        const ir = img.naturalWidth / img.naturalHeight;
        const cr = sm.width / sm.height;
        let sw: number, sh: number, sx: number, sy: number;
        if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) * crop.px; sy = 0; }
        else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) * crop.py; }
        const sw2 = sw / crop.z, sh2 = sh / crop.z;
        sx += (sw - sw2) * crop.ox;
        sy += (sh - sh2) * crop.oy;
        sw = sw2;
        sh = sh2;
        sc.drawImage(img, sx, sy, sw, sh, 0, 0, sm.width, sm.height);
        t.imageSmoothingEnabled = true;
        t.imageSmoothingQuality = "high";
        t.drawImage(sm, 0, 0, Fw, Fh);
      }
      t.globalCompositeOperation = "multiply";
      t.fillStyle = "rgb(236,172,104)";
      t.fillRect(0, 0, Fw, Fh);
      t.globalCompositeOperation = "screen";
      const short = Math.min(Fw, Fh);
      for (const b of KUMORI_BOKEH) {
        const g = t.createRadialGradient(b.x * Fw, b.y * Fh, 0, b.x * Fw, b.y * Fh, b.r * Math.max(Fw, Fh) * 1.1);
        g.addColorStop(0, `rgba(255,190,108,${Math.min(0.95, b.a * 2.1)})`);
        g.addColorStop(1, "rgba(255,196,118,0)");
        t.fillStyle = g;
        t.fillRect(0, 0, Fw, Fh);
      }
      t.globalCompositeOperation = "source-over";
      // 曇り(上が濃く、下が薄い)
      const g = t.createLinearGradient(0, 0, 0, Fh);
      g.addColorStop(0, "rgba(238,233,226,.93)");
      g.addColorStop(0.45, "rgba(238,226,208,.8)");
      g.addColorStop(1, "rgba(240,218,186,.6)");
      t.fillStyle = g;
      t.fillRect(0, 0, Fw, Fh);
      // むら
      for (let i = 0; i < 46; i++) {
        const x = rnd() * Fw, y = rnd() * Fh * (0.4 + rnd() * 0.6), r = (70 + rnd() * 190) * s;
        const light = rnd() > 0.45;
        const gg = t.createRadialGradient(x, y, 0, x, y, r);
        gg.addColorStop(0, light ? "rgba(246,249,250,.13)" : "rgba(120,132,138,.1)");
        gg.addColorStop(1, "rgba(0,0,0,0)");
        t.fillStyle = gg;
        t.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // 細かい粒
      for (let i = 0; i < Math.round((W * H) / 150); i++) {
        const x = rnd() * Fw, y = rnd() * Fh;
        t.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.03 + rnd() * 0.09})` : `rgba(110,122,128,${0.03 + rnd() * 0.07})`;
        t.fillRect(x, y, 1.2 * s + rnd(), 1.2 * s + rnd());
      }
      // 流れ跡のかすかな縦筋
      for (let i = 0; i < 38; i++) {
        const x = rnd() * Fw, y = rnd() * Fh * 0.8, l = (60 + rnd() * 260) * s;
        t.strokeStyle = rnd() > 0.5 ? "rgba(250,252,253,.16)" : "rgba(96,108,114,.1)";
        t.lineWidth = (1.5 + rnd() * 5) * s;
        t.lineCap = "round";
        t.beginPath();
        t.moveTo(x, y);
        t.lineTo(x + (rnd() - 0.5) * 6 * s, y + l);
        t.stroke();
      }
      // 水滴の粒
      const beads = Math.round((W * H) / 560);
      for (let i = 0; i < beads; i++) {
        const x = rnd() * Fw;
        const y = Math.pow(rnd(), 1.35) * Fh;
        const big = rnd() > 0.965;
        const r = (big ? 4.2 + rnd() * 3.8 : 1.0 + Math.pow(rnd(), 3) * 3.4) * s;
        if (big) {
          const bg = t.createRadialGradient(x, y + r * 0.35, 0, x, y, r);
          bg.addColorStop(0, "rgba(255,206,140,.75)");
          bg.addColorStop(0.7, "rgba(224,232,236,.4)");
          bg.addColorStop(1, "rgba(96,104,110,.5)");
          t.fillStyle = bg;
        } else t.fillStyle = "rgba(246,250,252,.32)";
        t.beginPath();
        t.arc(x, y, r, 0, Math.PI * 2);
        t.fill();
        if (r > 1.2 * s) {
          t.strokeStyle = "rgba(70,80,86,.4)";
          t.lineWidth = Math.max(0.6, r * 0.18);
          t.beginPath();
          t.arc(x, y, r * 0.96, 0.15 * Math.PI, 0.85 * Math.PI);
          t.stroke();
          t.fillStyle = "rgba(255,255,255,.9)";
          t.beginPath();
          t.arc(x - r * 0.32, y - r * 0.36, Math.max(0.5, r * 0.26), 0, Math.PI * 2);
          t.fill();
        }
      }
      // 鏡のまわりの電球が、曇りににじむ(曇りが灯りを散らす)
      t.globalCompositeOperation = "screen";
      for (const b of bulbPts) {
        const x = b.x * s, y = b.y * s;
        const hg = t.createRadialGradient(x, y, 0, x, y, 62 * s);
        hg.addColorStop(0, "rgba(255,228,170,.95)");
        hg.addColorStop(0.22, "rgba(255,210,140,.62)");
        hg.addColorStop(1, "rgba(255,190,110,0)");
        t.fillStyle = hg;
        t.fillRect(x - 62 * s, y - 62 * s, 124 * s, 124 * s);
      }
      t.globalCompositeOperation = "source-over";
      void short;
    }

    function buildMask() {
      tmask.width = Fw;
      tmask.height = Fh;
      const m = tmask.getContext("2d")!;
      m.clearRect(0, 0, Fw, Fh);
      const mobile = W < 700;
      const lines = mobile ? ["マチノワ", "ビュー", "ティー"] : ["マチノワ", "ビューティー"];
      const shortH = H < 700;
      const fs = mobile ? Math.min(W * 0.2, 92, H * 0.108) : Math.min(W * 0.094, H * 0.19);
      const x0 = mobile ? W * 0.07 : W * 0.06;
      const y0 = mobile ? (shortH ? 60 : 78) : H * 0.17;
      const lh = fs * (mobile ? 1.06 : 1.1);
      const lw = fs * 0.082 * s;
      m.font = `400 ${fs * s}px ${fontFamily}`;
      m.textBaseline = "alphabetic";
      m.lineJoin = "round";
      m.lineCap = "round";
      m.fillStyle = "#000";
      m.strokeStyle = "#000";
      m.shadowColor = "#000";
      m.shadowBlur = 2.2 * s;
      brandLines = [];
      lines.forEach((ln, i) => {
        const base = (y0 + i * lh + fs * 0.88) * s;
        const x = x0 * s;
        m.lineWidth = lw;
        m.strokeText(ln, x, base);
        m.fillText(ln, x, base);
        m.lineWidth = lw * 0.62;
        m.strokeText(ln, x + 1.8 * s, base + 1.4 * s);
        const w = m.measureText(ln).width;
        brandLines.push({ y: base, x0: x, x1: x + w });
      });
      // 指の腹のむら・書き終わりのかすれ(細かく削る)
      m.shadowBlur = 0;
      m.globalCompositeOperation = "destination-out";
      const bx1 = Math.max(...brandLines.map((l) => l.x1));
      for (let i = 0; i < 420; i++) {
        m.fillStyle = `rgba(0,0,0,${0.3 + rnd() * 0.6})`;
        m.beginPath();
        m.arc(x0 * s + rnd() * (bx1 - x0 * s), y0 * s + rnd() * lines.length * lh * s, (0.5 + rnd() * 1.5) * s, 0, Math.PI * 2);
        m.fill();
      }
      m.globalCompositeOperation = "source-over";
      // 縁にたまる曇りの盛り上がり(明るい輪郭)
      trim.width = Fw;
      trim.height = Fh;
      const rc = trim.getContext("2d")!;
      rc.font = m.font;
      rc.lineJoin = "round";
      rc.strokeStyle = "rgba(252,253,254,.9)";
      rc.shadowColor = "rgba(255,255,255,.6)";
      rc.shadowBlur = 3 * s;
      lines.forEach((ln, i) => {
        rc.lineWidth = lw + 4 * s;
        rc.strokeText(ln, x0 * s, (y0 + i * lh + fs * 0.88) * s);
      });
      rc.shadowBlur = 0;
      rc.globalCompositeOperation = "destination-out";
      lines.forEach((ln, i) => {
        rc.fillStyle = "#000";
        rc.lineWidth = lw + 0.4 * s;
        rc.strokeStyle = "#000";
        rc.strokeText(ln, x0 * s, (y0 + i * lh + fs * 0.88) * s);
        rc.fillText(ln, x0 * s, (y0 + i * lh + fs * 0.88) * s);
      });
      const bottom = y0 + lines.length * lh;
      stage.style.setProperty("--k-bb", `${Math.round(bottom)}px`);
      stage.style.setProperty("--k-bt", `${Math.round(y0)}px`);
      stage.style.setProperty("--k-bx", `${Math.round(x0)}px`);
      const menuTop = bottom + (mobile ? (shortH ? 38 : 50) : 58);
      stage.style.setProperty("--k-menu-top", `${Math.round(menuTop)}px`);
      const rowH = Math.max(44, Math.min(62, Math.floor((H - menuTop - (shortH ? 18 : 74)) / 6)));
      stage.style.setProperty("--k-row", `${rowH}px`);
      inkH = Math.min(Fh, Math.ceil(bottom * s) + 12);
      inkW = Fw;
      inkData = m.getImageData(0, 0, inkW, inkH).data;
    }

    /** 字の線の、いちばん下の点(水滴の出どころ) */
    function lowestInk(x: number, yTop: number, yBot: number): number | null {
      if (!inkData) return null;
      const xi = Math.max(0, Math.min(inkW - 1, Math.round(x)));
      for (let y = Math.min(inkH - 1, Math.round(yBot)); y >= Math.round(yTop); y--) {
        if (inkData[(y * inkW + xi) * 4 + 3] > 150) return y;
      }
      return null;
    }

    function clearText() {
      fctx.globalCompositeOperation = "destination-out";
      fctx.globalAlpha = 1;
      fctx.drawImage(tmask, 0, 0);
      fctx.globalCompositeOperation = "source-over";
      fctx.drawImage(trim, 0, 0);
    }

    function refogAll() {
      fctx.globalCompositeOperation = "source-over";
      fctx.globalAlpha = 1;
      fctx.drawImage(tex, 0, 0);
      clearText();
    }

    /* ---------- 水滴 ---------- */
    function newDrop(fromText: boolean, wait: number, at?: { x: number; y: number }): Drop {
      let x: number, y: number;
      if (at) { x = at.x; y = at.y; }
      else if (fromText && brandLines.length) {
        let found = false;
        x = 0;
        y = 0;
        for (let k = 0; k < 30 && !found; k++) {
          const ln = brandLines[Math.floor(rr() * brandLines.length)];
          const lx = ln.x0 + (ln.x1 - ln.x0) * (0.04 + rr() * 0.94);
          const ly = lowestInk(lx, ln.y - 90 * s, ln.y + 20 * s);
          if (ly !== null) { x = lx; y = ly - 2 * s; found = true; }
        }
        if (!found) { x = rr() * Fw; y = rr() * Fh * 0.3; fromText = false; }
      } else { x = rr() * Fw; y = rr() * Fh * 0.35; }
      return { x, y, r: (2.6 + rr() * 2.4) * s, v: (16 + rr() * 30) * s, dist: 0, max: (fromText ? 150 + rr() * 150 : 80 + rr() * 200) * s, wait, f: 0.6 + rr() * 1.4, ph: rr() * 6, text: fromText };
    }

    function seedDrops() {
      drops = [];
      for (let i = 0; i < 3; i++) drops.push(newDrop(true, 0.6 + i * 1.3 + rr() * 1.2));
      for (let i = 0; i < 4; i++) drops.push(newDrop(false, rr() * 6));
    }

    function stepDrops(dt: number, t: number) {
      dctx.clearRect(0, 0, Fw, Fh);
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        if (d.wait > 0) { d.wait -= dt; continue; }
        const v = d.v * (0.25 + 1.1 * Math.abs(Math.sin(t * d.f + d.ph)));
        const ny = d.y + v * dt;
        const nx = d.x + Math.sin(t * 0.7 + d.ph) * 0.05 * s;
        fctx.globalCompositeOperation = "destination-out";
        fctx.strokeStyle = "rgba(0,0,0,.92)";
        fctx.lineCap = "round";
        fctx.lineWidth = d.r * 1.35;
        fctx.beginPath();
        fctx.moveTo(d.x, d.y);
        fctx.lineTo(nx, ny);
        fctx.stroke();
        fctx.globalCompositeOperation = "source-over";
        d.dist += ny - d.y;
        d.x = nx;
        d.y = ny;
        const fade = clamp(1 - (d.dist - d.max * 0.8) / (d.max * 0.2));
        if (d.dist > d.max || d.y > Fh + 8) { drops[i] = newDrop(d.text, 3 + rr() * 8); continue; }
        // 粒そのもの(縁の影・中の屈折の光・ハイライト)
        const r = d.r * (0.85 + 0.15 * fade);
        dctx.globalAlpha = 0.35 + 0.65 * fade;
        const g = dctx.createRadialGradient(d.x, d.y + r * 0.3, 0, d.x, d.y, r * 1.2);
        g.addColorStop(0, "rgba(255,214,150,.9)");
        g.addColorStop(0.65, "rgba(228,236,240,.55)");
        g.addColorStop(1, "rgba(60,66,72,.65)");
        dctx.fillStyle = g;
        dctx.beginPath();
        dctx.ellipse(d.x, d.y, r, r * 1.25, 0, 0, Math.PI * 2);
        dctx.fill();
        dctx.fillStyle = "rgba(255,255,255,.95)";
        dctx.beginPath();
        dctx.arc(d.x - r * 0.33, d.y - r * 0.5, Math.max(0.6, r * 0.27), 0, Math.PI * 2);
        dctx.fill();
        dctx.globalAlpha = 1;
      }
    }

    /* ---------- 拭く ---------- */
    function stamp(x: number, y: number, px: number, py: number, r: number, a = 1) {
      lastWipe = performance.now();
      fctx.globalCompositeOperation = "destination-out";
      const g = fctx.createRadialGradient(x, y, r * 0.1, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.8, `rgba(0,0,0,${a * 0.97})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      fctx.fillStyle = g;
      fctx.beginPath();
      fctx.arc(x, y, r, 0, Math.PI * 2);
      fctx.fill();
      const dx = x - px, dy = y - py;
      const len = Math.hypot(dx, dy);
      if (len > 0.5) {
        const nx = -dy / len, ny = dx / len;
        fctx.lineCap = "round";
        for (let k = 0; k < 5; k++) {
          const off = (rnd() * 2 - 1) * r * 1.0;
          fctx.lineWidth = (1 + rnd() * 3.2) * s;
          fctx.strokeStyle = `rgba(0,0,0,${0.22 + rnd() * 0.45})`;
          fctx.beginPath();
          fctx.moveTo(px + nx * off, py + ny * off);
          fctx.lineTo(x + nx * off, y + ny * off);
          fctx.stroke();
        }
      }
      fctx.globalCompositeOperation = "source-over";
    }

    function wipeTo(cx: number, cy: number, touch: boolean) {
      const r = (touch ? 46 : 54) * s;
      const x = cx * s, y = cy * s;
      if (!lastPt) { lastPt = { x, y }; stamp(x, y, x, y, r); return; }
      const dx = x - lastPt.x, dy = y - lastPt.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / (r * 0.4)));
      for (let i = 1; i <= steps; i++) {
        const px = lastPt.x + (dx * (i - 1)) / steps, py = lastPt.y + (dy * (i - 1)) / steps;
        stamp(lastPt.x + (dx * i) / steps, lastPt.y + (dy * i) / steps, px, py, r);
      }
      travel += dist;
      if (travel > 150 * s) {
        travel = 0;
        if (drops.length < 26 && rr() > 0.3) drops.push(newDrop(false, 0.4 + rr() * 0.8, { x: x + (rr() - 0.5) * r, y: y + r * 0.75 }));
      }
      lastPt = { x, y };
    }

    function palm(x: number) {
      lastWipe = performance.now();
      const rx = 128 * s;
      const ry = Fh * 0.64;
      const yc = Fh * (0.5 + 0.09 * Math.sin((x / Fw) * 5.4 + 0.8));
      fctx.globalCompositeOperation = "destination-out";
      fctx.save();
      fctx.translate(x, yc);
      fctx.scale(1, ry / rx);
      const g = fctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.78, "rgba(0,0,0,.98)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      fctx.fillStyle = g;
      fctx.beginPath();
      fctx.arc(0, 0, rx, 0, Math.PI * 2);
      fctx.fill();
      fctx.restore();
      fctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        const lx = x + rx * (0.15 + rnd() * 1.05);
        const ly = rnd() * Fh;
        const ll = Fh * (0.12 + rnd() * 0.5);
        fctx.lineWidth = (1.5 + rnd() * 5) * s;
        fctx.strokeStyle = `rgba(0,0,0,${0.3 + rnd() * 0.5})`;
        fctx.beginPath();
        fctx.moveTo(lx, ly);
        fctx.lineTo(lx + (rnd() - 0.5) * 8 * s, ly + ll);
        fctx.stroke();
      }
      fctx.globalCompositeOperation = "source-over";
    }

    /* ---------- スクロール ---------- */
    function applyProgress(p: number) {
      progress = p;
      const wp = ease(clamp((p - 0.07) / 0.45));
      const target = -0.15 + wp * 1.4;
      if (target > pwx + 0.0005) {
        for (let x = pwx * Fw; x < target * Fw; x += 11 * s) palm(x);
        palm(target * Fw);
      } else if (target < pwx - 0.0005) {
        const sx = Math.max(0, Math.floor(target * Fw));
        fctx.globalAlpha = 1;
        fctx.drawImage(tex, sx, 0, Fw - sx, Fh, sx, 0, Fw - sx, Fh);
        if (p <= 0.04) clearText();
      }
      pwx = target;
      stage.style.setProperty("--kf", String(1 - smooth(0.46, 0.64, p)));
      stage.style.setProperty("--kd", String(smooth(0.62, 0.84, p)));
      stage.style.setProperty("--kdim", String(0.14 + 0.5 * smooth(0.62, 0.86, p)));
      stage.style.setProperty("--kh", String(1 - smooth(0.0, 0.05, p)));
      const gone = target - 0.04;
      for (const e of entryEls) e.el.classList.toggle("is-gone", e.cx < gone);
    }

    function readScroll() {
      const y = window.scrollY;
      if (y === lastScrollY) return;
      lastScrollY = y;
      const r = track.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      applyProgress(span > 0 ? clamp(-r.top / span) : 0);
    }

    /* ---------- ループ ---------- */
    function loop(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
      lastT = now;
      frame++;
      readScroll();
      if (progress < 0.5) {
        if (frame % 12 === 0) {
          fctx.globalCompositeOperation = "source-over";
          fctx.globalAlpha = 0.055;
          fctx.drawImage(tex, 0, 0);
          fctx.globalAlpha = 1;
          if (progress <= 0.04) clearText();
        }
        // しばらく触れていないときは、残った薄い跡もならして、全体をむらなく曇り直す
        if (frame % 50 === 0 && now - lastWipe > 5000 && !press && !(hover && hoverT < 1.1)) {
          fctx.globalCompositeOperation = "source-over";
          fctx.globalAlpha = 0.22;
          fctx.drawImage(tex, 0, 0);
          fctx.globalAlpha = 1;
          if (progress <= 0.04) clearText();
        }
        if (hover && hoverT < 1.1) {
          hoverT += dt;
          hover.r += (hover.tr - hover.r) * Math.min(1, dt * 9);
          const r = hover.r;
          fctx.globalCompositeOperation = "destination-out";
          const g = fctx.createRadialGradient(hover.x, hover.y, r * 0.2, hover.x, hover.y, r);
          g.addColorStop(0, "rgba(0,0,0,.5)");
          g.addColorStop(0.7, "rgba(0,0,0,.36)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          fctx.fillStyle = g;
          fctx.beginPath();
          fctx.arc(hover.x, hover.y, r, 0, Math.PI * 2);
          fctx.fill();
          fctx.globalCompositeOperation = "source-over";
        }
        if (press) {
          press.r += (78 * s - press.r) * Math.min(1, dt * 7);
          fctx.globalCompositeOperation = "destination-out";
          const pg = fctx.createRadialGradient(press.x, press.y, press.r * 0.2, press.x, press.y, press.r);
          pg.addColorStop(0, "rgba(0,0,0,.5)");
          pg.addColorStop(0.82, "rgba(0,0,0,.4)");
          pg.addColorStop(1, "rgba(0,0,0,0)");
          fctx.fillStyle = pg;
          fctx.beginPath();
          fctx.arc(press.x, press.y, press.r, 0, Math.PI * 2);
          fctx.fill();
          fctx.globalCompositeOperation = "source-over";
        }
        if (intro) {
          const t = clamp((now - intro.t0) / 1500);
          const e = t * t * (3 - 2 * t);
          const x = (0.1 + 0.52 * e) * Fw;
          const y = (0.8 - 0.1 * e + 0.035 * Math.sin(e * 7)) * Fh;
          if (now >= intro.t0) {
            stamp(x, y, intro.px || x, intro.py || y, 64 * s);
            intro.px = x;
            intro.py = y;
            if (t >= 1) {
              drops.push(newDrop(false, 0.2, { x: x - 20 * s, y: y + 40 * s }));
              intro = null;
            }
          }
        }
        stepDrops(dt, now / 1000);
      } else if (frame % 10 === 0) dctx.clearRect(0, 0, Fw, Fh);
    }

    function start() {
      if (running || reduced || !ready || !visible || document.hidden) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    /* ---------- 大きさ ---------- */
    function layout() {
      const r = glass.getBoundingClientRect();
      W = r.width;
      H = r.height;
      crop = W < 700 ? { z: 1.12, ox: 0.3, oy: 0.5, px: 0.34, py: 0.55 } : { z: 1.55, ox: 0.04, oy: 0.5, px: 0.5, py: 0.55 };
      img.style.objectPosition = `${crop.px * 100}% ${crop.py * 100}%`;
      img.style.transformOrigin = `${crop.ox * 100}% ${crop.oy * 100}%`;
      img.style.transform = `scale(${crop.z})`;
      s = Math.min(2, window.devicePixelRatio || 1);
      bulbPts = Array.from(glass.querySelectorAll<HTMLElement>(".k-bulb"))
        .map((el) => el.getBoundingClientRect())
        .filter((b) => b.width > 0)
        .map((b) => ({ x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top }));
      Fw = Math.max(2, Math.round(W * s));
      Fh = Math.max(2, Math.round(H * s));
      fogC.width = dropC.width = Fw;
      fogC.height = dropC.height = Fh;
      buildTex();
      buildMask();
      pwx = -0.15;
      fctx.globalCompositeOperation = "source-over";
      fctx.globalAlpha = 1;
      fctx.drawImage(tex, 0, 0);
      entryEls = Array.from(stage.querySelectorAll<HTMLElement>(".k-entry")).map((el) => {
        const b = el.getBoundingClientRect();
        return { el, cx: (b.left + b.width / 2 - r.left) / W };
      });
      seedDrops();
      lastScrollY = -1;
      if (reduced) {
        // 止めた最初の画面：水滴の筋だけ描いておく
        for (const d of drops) {
          fctx.globalCompositeOperation = "destination-out";
          fctx.strokeStyle = "rgba(0,0,0,.9)";
          fctx.lineWidth = d.r * 1.3;
          fctx.lineCap = "round";
          fctx.beginPath();
          fctx.moveTo(d.x, d.y);
          fctx.lineTo(d.x, d.y + d.max * 0.6);
          fctx.stroke();
          fctx.globalCompositeOperation = "source-over";
        }
        clearText();
      } else {
        clearText();
        readScroll();
      }
    }

    /* ---------- 入力 ---------- */
    const toLocal = (e: PointerEvent) => {
      const r = glass.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      if (reduced || !ready || progress > 0.45) return;
      if (e.pointerType !== "mouse" && e.buttons === 0 && e.pointerType !== "touch" && e.pointerType !== "pen") return;
      const p = toLocal(e);
      wipeTo(p.x, p.y, e.pointerType !== "mouse");
      if (press) { press.x = p.x * s; press.y = p.y * s; }
    };
    const onLeave = () => { lastPt = null; };
    const onDown = (e: PointerEvent) => {
      if (reduced || !ready || progress > 0.45) return;
      lastPt = null;
      const p = toLocal(e);
      wipeTo(p.x, p.y, e.pointerType !== "mouse");
      if (e.pointerType !== "mouse") press = { x: p.x * s, y: p.y * s, r: 30 * s };
    };
    const onUp = () => { press = null; lastPt = null; };
    glass.addEventListener("pointermove", onMove);
    glass.addEventListener("pointerdown", onDown);
    glass.addEventListener("pointerleave", onLeave);
    glass.addEventListener("pointerup", onUp);
    glass.addEventListener("pointercancel", onUp);

    const enter = (ev: Event) => {
      if (reduced) return;
      const el = ev.currentTarget as HTMLElement;
      const gb = glass.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      hoverT = 0;
      hover = { x: (b.left + Math.min(b.width * 0.42, 150) - gb.left) * s, y: (b.top + b.height / 2 - gb.top) * s, r: 8 * s, tr: Math.min(b.height * 0.72, 54) * s };
    };
    const leave = () => { hover = null; };
    const links = Array.from(stage.querySelectorAll<HTMLElement>(".k-entry"));
    links.forEach((l) => {
      l.addEventListener("pointerenter", enter);
      l.addEventListener("focus", enter);
      l.addEventListener("pointerleave", leave);
      l.addEventListener("blur", leave);
    });

    const io = new IntersectionObserver((es) => {
      visible = es[0]?.isIntersecting ?? true;
      if (visible) start(); else stop();
    });
    io.observe(track);
    const onVis = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVis);
    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => ready && layout(), 150);
    };
    window.addEventListener("resize", onResize);

    let cancelled = false;
    const h1 = h1Ref.current;
    if (h1) fontFamily = getComputedStyle(h1).fontFamily || fontFamily;
    const fontReady = Promise.race([
      document.fonts.load(`400 120px ${fontFamily}`, "マチノワビューティー").catch(() => null),
      new Promise((res) => setTimeout(res, 2500)),
    ]);
    const imgReady = new Promise<void>((res) => {
      if (img.complete) res();
      else { img.addEventListener("load", () => res(), { once: true }); img.addEventListener("error", () => res(), { once: true }); setTimeout(res, 2500); }
    });
    Promise.all([fontReady, imgReady]).then(() => {
      if (cancelled) return;
      ready = true;
      layout();
      stage.classList.add("is-ready");
      if (!reduced && window.scrollY < 40) intro = { t0: performance.now() + 900, px: 0, py: 0 };
      start();
    });

    return () => {
      cancelled = true;
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      glass.removeEventListener("pointermove", onMove);
      glass.removeEventListener("pointerdown", onDown);
      glass.removeEventListener("pointerleave", onLeave);
      glass.removeEventListener("pointerup", onUp);
      glass.removeEventListener("pointercancel", onUp);
      links.forEach((l) => {
        l.removeEventListener("pointerenter", enter);
        l.removeEventListener("focus", enter);
        l.removeEventListener("pointerleave", leave);
        l.removeEventListener("blur", leave);
      });
    };
  }, []);

  const src = (w: number) => photoUrl(w);
  const nums = ["", "", "", "", "", ""];
  void nums;

  return (
    <div className="k-root">
      <div className="k-track" ref={trackRef}>
        <div className="k-stage" ref={stageRef}>
          <div className="k-glass" ref={glassRef}>
            <div className="k-room" aria-hidden="true">
              <div className="k-photo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                className="k-photo"
                src={src(2200)}
                srcSet={`${src(1100)} 1100w, ${src(2200)} 2200w`}
                sizes="100vw"
                alt={KUMORI_PHOTO.alt}
                decoding="async"
              />
              </div>
              <div className="k-warm" />
              {KUMORI_BOKEH.map((b, i) => (
                <i key={i} className="k-bokeh" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.r * 150}vmax`, height: `${b.r * 150}vmax`, opacity: b.a * 1.2 }} />
              ))}
            </div>
            <div className="k-dim" aria-hidden="true" />
            <div className="k-bulbs" aria-hidden="true">
              {Array.from({ length: 11 }).map((_, i) => (
                <i key={`t${i}`} className={`k-bulb${i % 2 ? " k-alt" : ""}`} style={{ left: `${6 + i * 8.8}%`, top: "var(--k-bulb-y)" }} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <i key={`l${i}`} className="k-bulb k-side" style={{ left: "var(--k-bulb-x)", top: `${18 + i * 14.5}%` }} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <i key={`r${i}`} className="k-bulb k-side" style={{ right: "var(--k-bulb-x)", top: `${18 + i * 14.5}%` }} />
              ))}
            </div>
            <canvas ref={fogRef} className="k-fog" aria-hidden="true" />
            <canvas ref={dropRef} className="k-drops" aria-hidden="true" />
            <div className="k-sheen" aria-hidden="true" />

            <header className="k-head">
              <Link href="/" className="k-logo">
                <span>マチノワ</span> <em>Beauty</em>
              </Link>
              <Link href="/find" className="k-find">
                さがす
              </Link>
            </header>

            <h1 className="k-h1" ref={h1Ref}>
              マチノワ ビューティー
            </h1>
            <p className="k-mark">
              <span className="k-eyebrow">MACHINOWA</span>
              <span className="k-soon">掲載準備中</span>
            </p>

            <nav className="k-menu" aria-label="種類">
              <ul>
                {entries.map((e, i) => (
                  <li key={e.slug} style={{ ["--i" as string]: i }}>
                    <Link href={e.href} className="k-entry">
                      <span className="k-num" aria-hidden="true">{e.num}</span>
                      <span className="k-name">{e.name}</span>
                      <span className="k-slug">{e.slug}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="k-hint" aria-hidden="true">
              <span>鏡を拭く</span>
              <i />
              <span className="k-hint-en">Scroll</span>
            </div>

            <div className="k-deep">
              <DeepCopy lead={lead} />
            </div>
            <p className="k-credit">Photo: Unsplash</p>
          </div>
          <div className="k-bevel" aria-hidden="true" />
        </div>
      </div>

      <section className="k-after" aria-label="掲載準備中">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="k-after-photo" src={src(1600)} alt="" loading="lazy" decoding="async" />
        <div className="k-after-in">
          <DeepCopy lead={lead} />
        </div>
      </section>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <filter id="k-wax">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
      </svg>
    </div>
  );
}
