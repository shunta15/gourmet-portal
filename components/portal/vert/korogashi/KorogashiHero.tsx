"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { KoroKind } from "@/lib/portal/vert/korogashi/data";
import { beginGrab, createWorld, endGrab, setGrabTarget, step, type Body, type World } from "@/lib/portal/vert/korogashi/physics";
import { camAt, makeCam, project, ray } from "@/lib/portal/vert/korogashi/camera";
import { createRenderer, N_OBJ, type KRenderer } from "./renderer";

type Props = { kinds: KoroKind[]; lead: string };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const sm = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  const lin = (v: number) => Math.pow(v / 255, 2.2);
  return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)];
};
/** ポール(物体の番号)→ 種類の番号。落ち着いたあとの横一列で、上から 1〜6 の順に並ぶよう、実測の並びから決めた */
const KOF = [0, 2, 5, 1, 4, 3];
const POLE_OF_KIND = KOF.map((_, k) => KOF.indexOf(k));
const HALF_LEN = [2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 0, 0, 0, 0.7, 1.25];

/** 紙の帯の字を 1 枚の画像(R = 墨、G = 帯の色の刷り)に描く。2 列 × 3 行 */
function drawAtlas(kinds: KoroKind[], mincho: string, sans: string) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 2048, 1024);
  const CH = 341;
  kinds.forEach((k, i) => {
    const ox = (i % 2) * 1024;
    const oy = (2 - Math.floor(i / 2)) * CH;
    g.save();
    g.beginPath();
    g.rect(ox, oy, 1024, CH);
    g.clip();
    g.textBaseline = "alphabetic";
    // 帯の上下の罫(帯の色の刷り)
    g.fillStyle = "#00ff00";
    g.fillRect(ox + 28, oy + 26, 968, 4);
    g.fillRect(ox + 28, oy + CH - 30, 968, 4);
    g.fillRect(ox + 236, oy + 62, 3, CH - 124);
    // 番号
    g.fillStyle = "#ff0000";
    g.font = `500 30px ${sans}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = "6px";
    g.fillText("No.", ox + 46, oy + 108);
    (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
    g.font = `500 112px ${mincho}`;
    g.fillText(String(k.n).padStart(2, "0"), ox + 40, oy + 232);
    // 種類名(幅に合わせて大きさを決める)
    let fs = 168;
    g.font = `800 ${fs}px ${mincho}`;
    const maxW = 690;
    const w = g.measureText(k.name).width;
    if (w > maxW) {
      fs = Math.floor((fs * maxW) / w);
      g.font = `800 ${fs}px ${mincho}`;
    }
    g.fillStyle = "#ff0000";
    g.strokeStyle = "#ff0000";
    g.lineWidth = 3;
    g.lineJoin = "round";
    g.strokeText(k.name, ox + 280, oy + 200);
    g.fillText(k.name, ox + 280, oy + 200);
    // 英字(帯の色の刷り)と、小さな社名
    g.fillStyle = "#00ff00";
    g.font = `500 34px ${sans}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = "12px";
    g.fillText(k.en.toUpperCase(), ox + 284, oy + 262);
    g.fillStyle = "#ff0000";
    g.font = `500 22px ${sans}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = "7px";
    g.textAlign = "right";
    g.fillText("MACHINOWA BODYCARE", ox + 992, oy + 78);
    g.textAlign = "left";
    (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
    g.restore();
  });
  return c;
}

type Hit = { t: number; i: number; x: number };
type Pose = { z: number; y: number; a: number };

/** 視線と、物体(円柱・玉・棒・竹)の当たり */
function pickBody(world: World, poses: Pose[], o: number[], d: number[]): Hit | null {
  let best: Hit | null = null;
  world.bodies.forEach((b, i) => {
    let t = -1;
    if (b.gone) return;
    const pz = poses[i].z;
    const py = poses[i].y;
    if (b.kind === "ball") {
      const cx = o[0] - b.wx;
      const cy = o[1] - py;
      const cz = o[2] - pz;
      const bb = cx * d[0] + cy * d[1] + cz * d[2];
      const cc = cx * cx + cy * cy + cz * cz - b.r * b.r;
      const disc = bb * bb - cc;
      if (disc >= 0) t = -bb - Math.sqrt(disc);
    } else {
      const oz = o[2] - pz;
      const oy = o[1] - py;
      const A = d[2] * d[2] + d[1] * d[1];
      if (A > 1e-9) {
        const B = oz * d[2] + oy * d[1];
        const C = oz * oz + oy * oy - b.r * b.r;
        const disc = B * B - A * C;
        if (disc >= 0) {
          const s = Math.sqrt(disc);
          for (const tt of [(-B - s) / A, (-B + s) / A]) {
            if (tt <= 0) continue;
            const hx = o[0] + tt * d[0] - b.wx;
            const hy = o[1] + tt * d[1];
            if (Math.abs(hx) <= HALF_LEN[i] && (b.kind !== "bamboo" || hy >= py)) {
              t = tt;
              break;
            }
          }
        }
      }
    }
    if (t > 0 && (!best || t < best.t)) best = { t, i, x: o[0] + t * d[0] };
  });
  return best;
}

export default function KorogashiHero({ kinds, lead }: Props) {
  const router = useRouter();
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const hoverList = useRef(-1);
  const goRef = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const w = wrap.current!;
    const st = stage.current!;
    const cv = canvas.current!;
    const root = w.closest(".kz") as HTMLElement | null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const qs = new URLSearchParams(location.search);
    const debug = qs.get("debug") === "1";
    const qParam = parseFloat(qs.get("q") ?? "");
    let alive = true;
    let raf = 0;
    let inView = true;
    let r: KRenderer | null = null;
    let world = createWorld();
    let acc = 0;
    let last = performance.now();
    let t0 = last;
    let p = 0;
    let lastP = 0;
    let scrollVel = 0;
    let lineupSeen = false;
    let leaving = false;
    let quality = Number.isFinite(qParam) && qParam > 0 ? qParam : 1;
    let cssW = 1;
    let cssH = 1;
    let mobile = false;
    let mx = 0;
    let my = 0;
    let mxs = 0;
    let mys = 0;
    let px = -1;
    let py = -1;
    let hoverBody = -1;
    const hov = new Float32Array(N_OBJ);
    const viewOff = new Float32Array(N_OBJ);
    const poses: Pose[] = Array.from({ length: N_OBJ }, () => ({ z: 0, y: 0, a: 0 }));
    let blend = 0;
    let pOverride: number | null = null;
    const A = new Float32Array(N_OBJ * 4);
    const B = new Float32Array(N_OBJ * 4);
    let grab: { id: number; x: number; sx: number; sy: number; t: number; moved: boolean; pid: number; lz: number; ly: number; lt: number } | null = null;
    let pending: { i: number; x: number; y: number; t: number } | null = null;
    let busyUntil = 0;
    let frameN = 0;
    const samples: number[] = [];
    let prevDraw = 0;

    const family = (cls: string) => {
      const el = document.createElement("span");
      el.className = cls;
      el.style.cssText = "position:absolute;visibility:hidden";
      st.appendChild(el);
      const f = getComputedStyle(el).fontFamily;
      el.remove();
      return f;
    };

    const layout = () => {
      cssW = st.clientWidth;
      cssH = st.clientHeight;
      mobile = cssW < 700;
      if (!r) return;
      const want = Math.min(window.devicePixelRatio || 1, 1.5);
      const dpr = Math.max(0.4, Math.min(want, Math.sqrt(1.25e6 / Math.max(1, cssW * cssH))) * quality);
      r.resize(cssW, cssH, dpr);
    };

    const progress = () => {
      const rc = w.getBoundingClientRect();
      const span = Math.max(1, rc.height - window.innerHeight);
      return clamp(-rc.top / span, 0, 1);
    };

    const getCam = () => {
      const s = clamp((p - 0.04) / 0.74, 0, 1);
      const params = camAt(s, cssW / cssH, mobile, { x: Math.sin((performance.now() - t0) / 3600) * 1.0 + mxs * 1.1, y: Math.cos((performance.now() - t0) / 4700) * 0.9 + mys * 0.8 });
      return { cam: makeCam(params, cssW / cssH), dist: params.dist };
    };

    const resetWorld = () => {
      world = createWorld();
      acc = 0;
      lineupSeen = false;
      viewOff.fill(0);
      t0 = performance.now();
    };

    // 描く姿勢: 物理の姿勢と、横一列の位置(スロット)を、スクロールで混ぜる。ポールは、手前の壁に近い順に 1 本ずつのスロットへ
    const computePoses = () => {
      blend = reduce ? 0 : sm(0.5, 0.76, p);
      // 先に横(手前〜奥)へ寄り、そのあと床へ降りる。ポールどうしが重ならないよう、同じ高さでは並び順を保つ
      const zb = reduce ? 0 : sm(0.5, 0.68, p);
      const yb = reduce ? 0 : sm(0.64, 0.78, p);
      const ps = world.bodies.slice(0, 6).map((b, i) => ({ b, i })).sort((u, v) => (Math.abs(v.b.z - u.b.z) < 0.02 ? u.b.y - v.b.y : v.b.z - u.b.z));
      const sortedRank = new Array<number>(6);
      ps.forEach((u, k) => {
        sortedRank[u.i] = k;
      });
      // 横一列の位置は、種類の番号順(上から 1〜6)。並びが入れ替わるポールは、隣を転がり越えるように、すこし持ち上がる
      const slot = new Array<number>(6);
      const lift = new Array<number>(6).fill(0);
      for (let i = 0; i < 6; i++) {
        const front = 5 - KOF[i];
        slot[i] = world.zMax - 0.5 - 0.015 - front * 1.03;
        if (sortedRank[i] !== front) lift[i] = 1.1 * Math.sin(Math.PI * clamp((zb - 0.0) / 1, 0, 1));
      }
      world.bodies.forEach((b, i) => {
        if (i < 6) {
          const z = b.z + (slot[i] - b.z) * zb;
          const y = b.y + (0.5 - b.y) * yb + lift[i];
          poses[i].z = z;
          poses[i].y = y;
          poses[i].a = b.a - (z - b.z) / b.r;
        } else {
          poses[i].z = b.gone ? 99 : b.z;
          poses[i].y = b.gone ? -9 : b.y;
          poses[i].a = b.a;
        }
      });
    };

    const render = (now: number) => {
      if (!r) return;
      const { cam, dist } = getCam();
      computePoses();
      world.bodies.forEach((b, i) => {
        A[i * 4] = poses[i].z;
        A[i * 4 + 1] = poses[i].y;
        A[i * 4 + 2] = poses[i].a + viewOff[i];
        A[i * 4 + 3] = b.r;
        B[i * 4] = b.wx;
        B[i * 4 + 1] = HALF_LEN[i];
        B[i * 4 + 2] = hov[i];
        B[i * 4 + 3] = b.hit;
      });
      let bz0 = 99;
      let bz1 = -99;
      let by1 = 1;
      world.bodies.forEach((b, i) => {
        if (b.gone) return;
        bz0 = Math.min(bz0, poses[i].z - b.r);
        bz1 = Math.max(bz1, poses[i].z + b.r);
        by1 = Math.max(by1, poses[i].y + b.r);
      });
      const intro = clamp((now - t0) / 500, 0, 1);
      r.render({ time: now / 1000, cam, a: A, b: B, march: [Math.max(0, dist - 10.5), dist + 20], exposure: 0.25 + 0.75 * intro, box: [bz0, bz1, by1] });
      if (frameN === 0) {
        w.dataset.mode = "gl";
        if (root) root.dataset.mode = "gl";
      }
      frameN++;
      // 紙の帯の標識(ラインアップの場面の、ポール脇の札)
      if (p > 0.6) {
        const lp = sm(0.8, 0.94, p);
        world.bodies.slice(0, 6).forEach((b, i) => {
          const el = labels.current[i];
          if (!el) return;
          const sc = project(cam, 2.3, poses[i].y + 0.05, poses[i].z, cssW, cssH);
          el.style.transform = `translate(${sc.x.toFixed(1)}px, ${(sc.y - 16).toFixed(1)}px)`;
          el.style.opacity = String(lp);
        });
      }
    };

    // 正面を向く角度(ラインアップで、帯の字が正面を向く)
    const faceTargets = (cam: ReturnType<typeof makeCam>) => {
      world.bodies.slice(0, 6).forEach((b, i) => {
        const phi = Math.atan2(cam.pos[1] - poses[i].y, cam.pos[2] - poses[i].z);
        let want = phi - Math.PI / 2 - poses[i].a;
        want = ((((want + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
        const k = sm(0.72, 0.9, p);
        viewOff[i] = want * k;
        void b;
      });
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const rc = w.getBoundingClientRect();
      inView = rc.bottom > -50 && rc.top < window.innerHeight + 50;
      p = reduce ? 0 : pOverride ?? progress();
      scrollVel = scrollVel * 0.85 + Math.abs(p - lastP) * 40;
      lastP = p;
      w.style.setProperty("--p", p.toFixed(4));
      w.style.setProperty("--copy", String(1 - sm(0.03, 0.2, p)));
      w.style.setProperty("--kh", String(sm(0.8, 0.94, p)));
      if (!inView || !r) return;
      // 床の傾き: スクロールで手前へ傾き、並んだら戻る
      const tiltT = reduce ? 0 : 0.42 * sm(0.06, 0.2, p) * (1 - sm(0.46, 0.62, p));
      world.tilt += (tiltT - world.tilt) * 0.1;
      if (p > 0.7) lineupSeen = true;
      if (lineupSeen && p < 0.02 && !leaving) resetWorld();
      // 物理(固定刻み)
      acc += reduce ? 0 : dtReal;
      let n = 0;
      while (acc >= 1 / 60 && n < 3) {
        step(world, 1 / 60);
        acc -= 1 / 60;
        n++;
      }
      if (n === 3) acc = 0;
      mxs += (mx - mxs) * 0.04;
      mys += (my - mys) * 0.04;
      // ホバー(ポインターの下の物)
      const { cam } = getCam();
      if (px >= 0 && !grab) {
        const ry = ray(cam, px, py, cssW, cssH);
        const h = pickBody(world, poses, ry.o, ry.d);
        hoverBody = h ? h.i : -1;
        cv.style.cursor = h ? "grab" : "default";
      }
      for (let i = 0; i < N_OBJ; i++) {
        const want = i === hoverBody && i < 6 ? 1 : i === hoverList.current ? 1 : 0; // hoverList は物体の番号
        hov[i] += (want - hov[i]) * 0.14;
      }
      faceTargets(cam);
      // 動いているあいだは毎コマ、落ち着いたら 30 コマ/秒
      const busy = world.restFor < 1.2 || !!grab || scrollVel > 0.02 || now < busyUntil || p > 0.02;
      if (!busy && (frameN & 1) === 1 && !reduce) {
        frameN++;
        return;
      }
      // 重い機械では、内部の解像度を下げる
      if (prevDraw && !reduce && !debug) {
        samples.push(now - prevDraw);
        if (samples.length >= 20) {
          const med = [...samples].sort((a, b) => a - b)[10];
          samples.length = 0;
          if (med > 38 && quality > 0.45) {
            quality = Math.max(0.45, quality * 0.8);
            layout();
          }
        }
      }
      prevDraw = now;
      render(now);
    };

    // 画面 → 世界(つかんだ点を通る、軸に垂直な面 x = const の上)
    const worldPoint = (cx: number, cy: number, xPlane: number) => {
      const { cam } = getCam();
      const ry = ray(cam, cx, cy, cssW, cssH);
      if (Math.abs(ry.d[0]) < 0.05) return null;
      const t = (xPlane - ry.o[0]) / ry.d[0];
      return { z: ry.o[2] + t * ry.d[2], y: ry.o[1] + t * ry.d[1] };
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || leaving) return;
      const rc = st.getBoundingClientRect();
      const cx = e.clientX - rc.left;
      const cy = e.clientY - rc.top;
      px = cx;
      py = cy;
      const { cam } = getCam();
      const ry = ray(cam, cx, cy, cssW, cssH);
      const h = pickBody(world, poses, ry.o, ry.d);
      if (!h) return;
      if (blend > 0.3) {
        // 横一列の場面: 物理はつかまない。短く押したら、その種類へ
        if (h.i < 6) pending = { i: h.i, x: cx, y: cy, t: performance.now() };
        return;
      }
      const b = world.bodies[h.i];
      const wp = worldPoint(cx, cy, h.x);
      if (!wp) return;
      beginGrab(world, b, wp.z, wp.y);
      grab = { id: h.i, x: h.x, sx: cx, sy: cy, t: performance.now(), moved: false, pid: e.pointerId, lz: wp.z, ly: wp.y, lt: performance.now() };
      try {
        cv.setPointerCapture(e.pointerId);
      } catch {}
      cv.style.cursor = "grabbing";
      busyUntil = performance.now() + 600;
    };
    const onMove = (e: PointerEvent) => {
      const rc = st.getBoundingClientRect();
      const cx = e.clientX - rc.left;
      const cy = e.clientY - rc.top;
      px = cx;
      py = cy;
      mx = (cx / rc.width - 0.5) * 2;
      my = (cy / rc.height - 0.5) * 2;
      if (!grab) return;
      if (Math.hypot(cx - grab.sx, cy - grab.sy) > 7) grab.moved = true;
      const wp = worldPoint(cx, cy, grab.x);
      if (wp) {
        setGrabTarget(world, wp.z, wp.y);
        grab.lz = wp.z;
        grab.ly = wp.y;
        grab.lt = performance.now();
      }
      busyUntil = performance.now() + 600;
    };
    const onUp = (e: PointerEvent) => {
      if (pending) {
        const pd = pending;
        pending = null;
        const rc = st.getBoundingClientRect();
        if (Math.hypot(e.clientX - rc.left - pd.x, e.clientY - rc.top - pd.y) < 8 && performance.now() - pd.t < 600) goRef.current(pd.i);
        return;
      }
      if (!grab) return;
      const g = grab;
      grab = null;
      try {
        cv.releasePointerCapture(g.pid);
      } catch {}
      const b: Body = world.bodies[g.id];
      const dt = performance.now() - g.t;
      if (!g.moved && dt < 420 && g.id < 6) {
        endGrab(world, 0, 0);
        goRef.current(g.id);
        return;
      }
      endGrab(world, 0, 0);
      void b;
      void e;
      busyUntil = performance.now() + 2500;
    };
    const onCancel = () => {
      if (!grab) return;
      endGrab(world, 0, 0);
      grab = null;
    };
    const onLeave = () => {
      px = -1;
      hoverBody = -1;
    };

    goRef.current = (i: number) => {
      if (leaving) return;
      const href = kinds[KOF[i]].href;
      leaving = true;
      w.classList.add("kz-leaving");
      const b = world.bodies[i];
      b.vz += 10;
      b.vy += 3;
      busyUntil = performance.now() + 2000;
      window.setTimeout(() => router.push(href), reduce || !r ? 0 : 650);
    };

    // 起動
    (async () => {
      r = createRenderer(cv);
      if (!r) {
        w.dataset.mode = "css";
        if (root) root.dataset.mode = "css";
        return;
      }
      const mf = family("kz-f-min");
      const sf = family("kz-f-sans");
      try {
        const chars = kinds.map((k) => k.name).join("") + "No.0123456789MACHINOWABODYCARE";
        await Promise.all([document.fonts.load(`800 100px ${mf}`, chars), document.fonts.load(`500 100px ${mf}`, chars), document.fonts.load(`500 30px ${sf}`, chars)]);
        await document.fonts.ready;
      } catch {}
      if (!alive) return;
      const pk = KOF.map((k) => kinds[k]);
      r.setAtlas(drawAtlas(pk, mf, sf));
      r.setColors(pk.map((k) => hex(k.color)));
      layout();
      if (reduce) {
        // 動きを止めた完成形: 山を落ち着くまで先に進める
        for (let i = 0; i < 60 * 6; i++) step(world, 1 / 60);
        world.bodies.forEach((b) => {
          b.vz = 0;
          b.vy = 0;
          b.w = 0;
        });
        render(performance.now());
      }
      t0 = performance.now();
      last = t0;
      raf = requestAnimationFrame(frame);
    })();

    const ro = new ResizeObserver(() => {
      layout();
      if (reduce) render(performance.now());
    });
    ro.observe(st);
    cv.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    cv.addEventListener("pointerleave", onLeave);
    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);
    if (debug) {
      (window as unknown as { __kz: unknown }).__kz = {
        advance: (sec: number) => {
          const n = Math.round(sec * 60);
          for (let i = 0; i < n; i++) step(world, 1 / 60);
        },
        world: () => world,
        reset: resetWorld,
        setP: (v: number | null) => {
          pOverride = v;
        },
        tilt: (v: number) => {
          world.tilt = v;
        },
        quality: (q: number) => {
          quality = q;
          layout();
        },
      };
    }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      cv.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      r?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRowClick = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (wrap.current?.dataset.mode !== "gl") return;
    e.preventDefault();
    goRef.current(POLE_OF_KIND[i]);
  };

  return (
    <section ref={wrap} className="kz-hero" id="top" data-mode="init" aria-label="ストレッチポールの山">
      <div ref={stage} className="kz-stage">
        <div className="kz-fb" aria-hidden="true">
          <i className="kz-fb-wall" />
          <i className="kz-fb-floor" />
          <span className="kz-fb-pile">
            {kinds.map((k, i) => (
              <b key={k.slug} style={{ background: `linear-gradient(180deg, rgba(255,255,255,.28), rgba(0,0,0,0) 38%, rgba(0,0,0,.30) 100%), ${k.color}`, ["--i" as string]: i }} />
            ))}
          </span>
        </div>
        <canvas ref={canvas} className="kz-cv" aria-hidden="true" />
        <div className="kz-vig" aria-hidden="true" />

        <header className="kz-head">
          <Link href="/" className="kz-logo">
            マチノワ <span>Bodycare</span>
          </Link>
          <Link href="/find" className="kz-find">
            さがす
          </Link>
        </header>

        <div className="kz-copy">
          <p className="kz-eyebrow">Body Care in Town</p>
          <h1 className="kz-h1">
            <span className="kz-h1a">マチノワ</span> <span className="kz-h1b">ボディケア</span>
          </h1>
          <p className="kz-lead">{lead}</p>
        </div>

        <nav className="kz-list" aria-label="種類からさがす" onPointerLeave={() => (hoverList.current = -1)}>
          <p className="kz-list-h" aria-hidden="true">
            種類からさがす
          </p>
          <ol>
            {kinds.map((k, i) => (
              <li key={k.slug}>
                <Link
                  href={k.href}
                  className="kz-row"
                  style={{ ["--c" as string]: k.color }}
                  onClick={(e) => onRowClick(e, i)}
                  onPointerEnter={() => (hoverList.current = POLE_OF_KIND[i])}
                  onFocus={() => (hoverList.current = POLE_OF_KIND[i])}
                  onBlur={() => (hoverList.current = -1)}
                >
                  <i className="kz-row-no">{String(k.n).padStart(2, "0")}</i>
                  <span className="kz-row-n">{k.name}</span>
                  <em className="kz-row-en">{k.en}</em>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="kz-labels" aria-hidden="true">
          {KOF.map((ki, i) => (
            <span key={kinds[ki].slug} className="kz-rl" ref={(el) => { labels.current[i] = el; }}>
              {kinds[ki].name} <i>→</i>
            </span>
          ))}
        </div>
        <p className="kz-kh" aria-hidden="true">
          種類からさがす
        </p>

        <div className="kz-cue" aria-hidden="true">
          <span className="kz-cue-a">さわる</span>
          <i className="kz-cue-l" />
          <span className="kz-cue-b">Scroll</span>
        </div>
      </div>
    </section>
  );
}
