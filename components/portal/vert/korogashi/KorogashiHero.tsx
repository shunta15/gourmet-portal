"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { KoroKind } from "@/lib/portal/vert/korogashi/data";
import { beginGrab, createWorld, endGrab, kickToy, pushToy, rollIn, rollOut, setGrabTarget, step, type Body, type World } from "@/lib/portal/vert/korogashi/physics";
import { camAt, makeCam, project, ray } from "@/lib/portal/vert/korogashi/camera";
import { createRenderer, N_OBJ, type KRenderer } from "./renderer";
import { LINE_P0, LINE_P1, linePoses } from "@/lib/portal/vert/korogashi/lineup";

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
const KOF = [0, 3, 5, 1, 4, 2];
const POLE_OF_KIND = KOF.map((_, k) => KOF.indexOf(k));
const PREROLL = 22;
const HALF_LEN = [2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 0, 0, 0, 0.7, 1.25];

/** 紙の帯の字を 1 枚の画像(R = 墨、G = 帯の色の刷り)に描く。2 列 × 3 行 */
function drawAtlas(kinds: KoroKind[], mincho: string, sans: string) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 2048;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 2048, 2048);
  const CH = 341;
  kinds.forEach((k, i) => {
    const ox = (i % 2) * 1024;
    const oy = (2 - Math.floor(i / 2)) * CH;
    g.save();
    g.beginPath();
    g.rect(ox, oy, 1024, CH);
    g.clip();
    g.textBaseline = "alphabetic";
    // 荷札(ラベル)の扱い: 帯の中ほどに、番号と種類名を小さめに刷った札。縁の枠・紐を通す穴・英字
    g.strokeStyle = "#ff0000";
    g.lineWidth = 3;
    g.strokeRect(ox + 150, oy + 56, 724, CH - 112);
    g.fillStyle = "#00ff00";
    g.fillRect(ox + 150, oy + 56, 724, 7);
    g.beginPath();
    g.arc(ox + 196, oy + 112, 15, 0, Math.PI * 2);
    g.lineWidth = 5;
    g.strokeStyle = "#00ff00";
    g.stroke();
    g.fillStyle = "#ff0000";
    g.font = `500 26px ${sans}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = "5px";
    g.fillText("No.", ox + 176, oy + 196);
    (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
    g.font = `500 84px ${mincho}`;
    g.fillText(String(k.n).padStart(2, "0"), ox + 170, oy + 262);
    g.fillStyle = "#00ff00";
    g.fillRect(ox + 322, oy + 100, 3, CH - 200);
    let fs = 116;
    g.font = `800 ${fs}px ${mincho}`;
    const maxW = 470;
    const w = g.measureText(k.name).width;
    if (w > maxW) {
      fs = Math.floor((fs * maxW) / w);
      g.font = `800 ${fs}px ${mincho}`;
    }
    g.fillStyle = "#ff0000";
    g.strokeStyle = "#ff0000";
    g.lineWidth = 2;
    g.lineJoin = "round";
    g.strokeText(k.name, ox + 352, oy + 196);
    g.fillText(k.name, ox + 352, oy + 196);
    g.fillStyle = "#00ff00";
    g.font = `500 28px ${sans}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = "10px";
    g.fillText(k.en.toUpperCase(), ox + 356, oy + 246);
    g.fillStyle = "#ff0000";
    g.font = `500 17px ${sans}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = "5px";
    g.textAlign = "right";
    g.fillText("MACHINOWA BODYCARE", ox + 850, oy + 94);
    g.textAlign = "left";
    (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
    g.restore();
    // 端の断面に貼った、丸い札(番号)。下半分に 512 角のコマ
    const cx = (i % 4) * 512 + 256;
    const cy = 1024 + Math.floor(i / 4) * 512 + 256;
    g.strokeStyle = "#00ff00";
    g.lineWidth = 16;
    g.beginPath();
    g.arc(cx, cy, 228, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#ff0000";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `800 230px ${mincho}`;
    g.fillText(String(k.n).padStart(2, "0"), cx, cy + 6);
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
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
    // 何もしないときの小さな出来事(玉が転がってくる・上のポールがごろりと動いて戻る・棒を押す)
    let lastPx = -1;
    let lastPy = -1;
    const cool = new Array<number>(12).fill(0);
    let evtAt = 0;
    let evtN = 0;
    let rock: { i: number; t0: number; T: number; A: number } | null = null;
    // 上の段のポールの「ごろり」: 目標の傾きを持ち続ける(描画が遅くても、コマの間で必ず違って見える)
    const rockT = [0, 0, 0, 0, 0, 0];
    const rockC = [0, 0, 0, 0, 0, 0];
    let devTilt = 0;
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
      const params = camAt(s, cssW / cssH, mobile, reduce ? { x: 0, y: 0 } : { x: Math.sin((performance.now() - t0) / 3600) * 1.0 + mxs * 1.1, y: Math.cos((performance.now() - t0) / 4700) * 0.9 + mys * 0.8 });
      if (mobile) params.sy -= Math.max(0, (440 - 0.48 * cssH) / (cssH / 2)) * 0.9;
      return { cam: makeCam(params, cssW / cssH), dist: params.dist };
    };

    const resetWorld = () => {
      world = createWorld();
      acc = 0;
      lineupSeen = false;
      viewOff.fill(0);
      rockT.fill(0);
      rockC.fill(0);
      for (let i = 0; i < PREROLL; i++) step(world, 1 / 60);
      t0 = performance.now();
    };

    // 描く姿勢: 物理の姿勢と、横一列の位置(スロット)を、スクロールで混ぜる。ポールは、手前の壁に近い順に 1 本ずつのスロットへ
    const computePoses = () => {
      blend = reduce ? 0 : clamp((p - LINE_P0) / (LINE_P1 - LINE_P0), 0, 1);
      const src = world.bodies.slice(0, 6).map((b) => ({ z: b.z, y: b.y, a: b.a, r: b.r }));
      const lined = blend > 0 ? linePoses(src, KOF, world.zMax, p) : null;
      world.bodies.forEach((b, i) => {
        if (i < 6) {
          if (lined) {
            poses[i].z = lined[i].z;
            poses[i].y = lined[i].y;
            poses[i].a = lined[i].a;
          } else {
            poses[i].z = b.z;
            poses[i].y = b.y;
            poses[i].a = b.a;
          }
          // 上の段のポールは、床がわずかに傾いたように、ゆっくり揺れる(ポインターの左右+ときどき、ごろりと動いて戻る)
          if (i >= 3 && blend < 0.01) {
            let ra = mxs * (i === 5 ? 0.26 : 0.18) + 0.05 * Math.sin(performance.now() / 1500 + i * 1.9) + rockC[i];
            if (rock && rock.i === i) {
              const u = (performance.now() - rock.t0) / rock.T;
              if (u < 1) ra += rock.A * Math.pow(Math.sin(Math.PI * u), 2);
              else rock = null;
            }
            poses[i].a += ra;
            poses[i].z -= ra * b.r * 0.3;
          }
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
      r.render({ time: now / 1000, cam, a: A, b: B, march: [Math.max(0, dist - 10.5), dist + 20], exposure: 1, box: [bz0, bz1, by1], focus: dist });
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
        const k = sm(0.3, 0.56, p);
        viewOff[i] = want * k;
        void b;
      });
    };

    const runEvent = (kk: number, now: number) => {
      const k = kk % 6;
      evtN = kk + 1;
      const sgn = evtN % 2 ? 1 : -1;
      // 玉: 手前の外にいる玉を転がし込む(山にぶつかって止まる)。いなければ、手前の玉を 1 つ転がし出す
      const ids = [8, 7, 6];
      const ball = () => ids.some((_, j) => rollIn(world, ids[(j + evtN) % 3], 3.7 + 0.4 * sgn)) || ids.some((_, j) => rollOut(world, ids[(j + evtN) % 3], 4.2));
      if (k === 0 || k === 2 || k === 5) ball();
      else if (k === 1) rockT[5] = rockT[5] > 0 ? -0.85 : 0.85;
      else if (k === 3) {
        if (!kickToy(world, 9, 2.8)) ball();
      } else {
        const j = 3 + (evtN % 2);
        rockT[j] = rockT[j] > 0 ? -0.7 : 0.7;
      }
      busyUntil = now + 2600;
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      // 実時間で進める(描画が遅い機械でも、物の動きは遅くならない)。1 コマで最大 1.2 秒ぶん
      const dtReal = Math.min(1.2, (now - last) / 1000);
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
      if (r.lost()) {
        w.dataset.mode = "css";
        if (root) root.dataset.mode = "css";
        return;
      }
      // 床の傾き: スクロールで手前へ傾き、並んだら戻る
      const tiltT = reduce ? 0 : 0.42 * sm(0.06, 0.2, p) * (1 - sm(0.46, 0.62, p)) + (p < 0.05 ? devTilt : 0);
      world.tilt += (tiltT - world.tilt) * 0.1;
      if (p > 0.7) lineupSeen = true;
      if (lineupSeen && p < 0.02 && !leaving) resetWorld();
      // 物理(固定刻み)
      // 開いた直後(山が降りて積み上がるまで)は、ふわりと見えるよう、ゆっくりめに進める
      acc += reduce ? 0 : dtReal * (world.time < 1.9 ? 0.42 : 1);
      let n = 0;
      while (acc >= 1 / 60 && n < 72) {
        step(world, 1 / 60);
        acc -= 1 / 60;
        n++;
      }
      if (n === 72) acc = 0;
      mxs += (mx - mxs) * 0.04;
      for (let i = 3; i < 6; i++) rockC[i] += (rockT[i] - rockC[i]) * (1 - Math.exp(-dtReal / 0.45));
      // 小さな道具だけに、ポインターの高さでごくわずかな床の傾き
      world.tiltSmall = reduce || p > 0.02 || grab ? 0 : Math.abs(mys) < 0.18 ? 0 : Math.sign(mys) * Math.min(0.1, (Math.abs(mys) - 0.18) * 0.16);
      // 数秒おきの小さな出来事
      if (!reduce && p < 0.02 && !grab && !leaving && world.restFor > 0.6) {
        if (evtAt === 0) evtAt = now + 1000;
        if (now > evtAt) {
          const k = evtN;
          runEvent(evtN, now);
          evtAt = now + 2000 + (k % 3) * 300;
        }
      } else if (p >= 0.02 || grab) evtAt = 0;
      mys += (my - mys) * 0.04;
      // ホバー(ポインターの下の物)
      const { cam } = getCam();
      if (px >= 0 && !grab) {
        const ry = ray(cam, px, py, cssW, cssH);
        const h = pickBody(world, poses, ry.o, ry.d);
        hoverBody = h ? h.i : -1;
        cv.style.cursor = h ? "grab" : "default";
      }
      // ポインターが近づくと、近くの玉がはじかれて転がり、上の段のポールがごろりと動く
      if (px >= 0 && !grab && p < 0.02 && !reduce) {
        const vx = px - lastPx;
        const vy = py - lastPy;
        lastPx = px;
        lastPy = py;
        if (Math.hypot(vx, vy) > 5) {
          for (const id of [6, 7, 8, 9]) {
            const b = world.bodies[id];
            if (b.gone || now < cool[id]) continue;
            const sc = project(cam, b.wx, poses[id].y, poses[id].z, cssW, cssH);
            if (Math.hypot(sc.x - px, sc.y - py) < sc.s * 0.75 + 46) {
              pushToy(world, id, (sc.y >= py ? 1 : -1) * (3.2 + Math.min(2, Math.hypot(vx, vy) * 0.05)));
              cool[id] = now + 700;
              busyUntil = now + 2200;
            }
          }
          if (hoverBody >= 3 && hoverBody <= 5 && now > cool[0] && !rock) {
            rock = { i: hoverBody, t0: now, T: 1500, A: 0.75 * (vx >= 0 ? 1 : -1) };
            cool[0] = now + 1400;
            busyUntil = now + 1700;
          }
        }
      } else {
        lastPx = px;
        lastPy = py;
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
          if (med > 60 && quality > 0.72) {
            quality = Math.max(0.72, quality * 0.88);
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
      // 最初のコマから、ローラーが宙に何本も見えている: 物理を先に少し進めておく
      if (!reduce) for (let i = 0; i < PREROLL; i++) step(world, 1 / 60);
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
    // 端末を前後に大きく傾けると、山が転がる(Android など、許可の要らない端末だけ。iOS は許可の操作が要るので使わない)
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
    const onOri = (e: DeviceOrientationEvent) => {
      if (e.beta == null) return;
      const dev = ((e.beta - 70) * Math.PI) / 180;
      const dz = 0.22;
      devTilt = Math.abs(dev) < dz ? 0 : Math.sign(dev) * Math.min(0.4, Math.abs(dev) - dz);
      if (devTilt !== 0) busyUntil = performance.now() + 1500;
    };
    if (!reduce && DOE && typeof DOE.requestPermission !== "function" && window.matchMedia("(pointer: coarse)").matches) window.addEventListener("deviceorientation", onOri);
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
        fire: (k: number) => runEvent(k, performance.now()),
        snap: () => {
          render(performance.now());
          return cv.toDataURL("image/png");
        },
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
      window.removeEventListener("deviceorientation", onOri);
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
      <noscript>
        <style>{".kz-fb{opacity:1!important;visibility:visible!important}"}</style>
      </noscript>
      <div ref={stage} className="kz-stage">
        <picture className="kz-fb" aria-hidden="true">
          <source media="(max-width: 699px)" srcSet="/_portal/hub/bodycare/korogashi-still-m.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/_portal/hub/bodycare/korogashi-still-pc.webp" alt="" width={1920} height={1200} decoding="async" fetchPriority="high" />
        </picture>
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
          <span className="kz-cue-a">
            <b className="kz-fine">さわる</b>
            <b className="kz-coarse">よこになぞる</b>
          </span>
          <i className="kz-cue-l" />
          <span className="kz-cue-b">Scroll</span>
        </div>
      </div>
    </section>
  );
}
