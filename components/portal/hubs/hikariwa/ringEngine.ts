/**
 * 光の輪（HIKARIWA）の描画エンジン（クライアント専用・React 非依存）。
 *
 * 輪は 6 つの弧がつながった、1 つの大きな光の輪。弧ごとに業種の色で光り、強さ（太さ・明るさ）に差を付ける。
 * 輪の面の上には、街の灯（小さな点）が散らばっていて、輪の上で出会いが起きるたびに、面を波が広がり、通りすぎた灯がともる。
 * 輪の中（名前・数字・押す所を置く所）には、線も灯も出ない（CSS のマスクで抜く）。
 *
 * 描き方は Canvas 2D（加算合成）。にじみは、小さな解像度に描いたものを、別の canvas として CSS で拡大して足す
 * （1/4・1/8・1/16 の三段。大きな canvas に何度も重ね描きしない）。
 * 毎フレーム React の state は書かない。位置は CSS 変数・transform・opacity だけに書く。
 *
 * 位置 pos は「弧いくつぶん」の小数（1 = 60°）。指で動かしている間は指に付き、離すと慣性＋バネで近い弧に止まる。
 * 画面に出ていないとき・タブが裏のときは、ループを止める。
 */
import type { RGB } from "@/lib/portal/hubs/hikariwa/colors";
import { WHITE, makeBlob, makeSprite, mix, rgba, rng } from "./glowKit";

export type ArcKind = "live" | "quiet" | "faint";

export interface EngineItem {
  rgb: RGB;
  kind: ArcKind;
}

export interface EngineOpts {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  /** にじみの層（小さい解像度。CSS で拡大して加算する）。1/4・1/8・1/16 の順 */
  glow: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement];
  /** 輪の置き場（この箱の中に、輪と名前が収まる）。CSS が決める */
  stage: HTMLElement;
  items: EngineItem[];
  /** 輪のまわりに置く名前（li）。ring モードのときだけ位置を書く */
  labels: HTMLElement[];
  onFront: (i: number, byUser: boolean) => void;
  onReady?: () => void;
}

export interface Engine {
  destroy: () => void;
  step: (d: number) => void;
  goTo: (i: number) => void;
  front: () => number;
  nudge: () => void;
  /** いま指で動かした直後か（クリックを打ち消すため） */
  dragged: () => boolean;
  freeze: () => void;
  thaw: () => void;
  /** 入る光の出どころ（輪の正面の点の、画面上の位置） */
  anchor: () => { x: number; y: number };
  /** 入るとき: 正面の弧から、波と光を強く出す */
  flare: () => void;
}

const N = 6;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
/** 弧の半分の角度。弧と弧のあいだは 4°（つながった輪に見えるように、すき間は小さく） */
const ARC_HALF = 28 * DEG;
const SEG = 36;
const CH = 3; // 1 チャンク = 3 区間
/** 輪を起こす角度（面と画面のなす角。90° で真正面）。楕円ではなく輪に見える角度 */
const TILT0 = 67;
const DCAM = 3.6;
const mod = (n: number) => ((n % N) + N) % N;
const rel = (d: number) => {
  const m = mod(d);
  return m > N / 2 ? m - N : m;
};
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp(t), 4);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 角度の差（0〜π） */
const angDist = (a: number) => {
  let d = a % TAU;
  if (d > Math.PI) d -= TAU;
  else if (d < -Math.PI) d += TAU;
  return Math.abs(d);
};

/** バネ（1 = 1 弧）。1 つぶんの移動で、ほんの少し行き過ぎて戻る */
const SPRING_K = 94;
const SPRING_C = 14.8;

interface Ripple {
  x: number;
  z: number;
  age: number;
  T: number;
  max: number;
  a: number;
  c: number; // 色（items の番号）
}

export function createRingEngine(o: EngineOpts): Engine {
  const { root, canvas, stage, items, labels } = o;
  const ctx = canvas.getContext("2d")!;
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mqWide = window.matchMedia("(min-width: 900px)");
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ── にじみの層（小さい解像度） ── */
  const [g1c, g2c, g3c] = o.glow;
  const g1 = g1c.getContext("2d")!;
  const g2 = g2c.getContext("2d")!;
  const g3 = g3c.getContext("2d")!;

  const sprites = items.map((it) => makeSprite(it.rgb));
  const blobs = items.map((it) => makeBlob(it.rgb));
  const spriteWarm = makeSprite([255, 226, 190]);
  const cores = items.map((it) => mix(it.rgb, WHITE, 0.62));

  /* ── 画面の寸法 ── */
  let W = 800;
  let H = 600;
  let dpr = 1;
  let cx = 0; // 輪の中心（面の原点）の画面位置
  let cy = 0;
  let R = 300;
  let uS = 1; // 輪の大きさに合わせた、線と光の太さの倍率
  let qScale = 1;
  let dotFrac = 1;
  /** 線と灯を出さない所（見出し・リード）。root からの位置 */
  let excl: [number, number, number, number][] = [];
  const inExcl = (X: number, Y: number) => {
    for (let k = 0; k < excl.length; k++) {
      const e = excl[k];
      if (X > e[0] && X < e[2] && Y > e[1] && Y < e[3]) return true;
    }
    return false;
  };
  const labW: number[] = labels.map(() => 120);
  const labH: number[] = labels.map(() => 50);
  // 輪の上端・下端（R を 1 とした、面の原点からの距離）
  const sT0 = Math.sin(TILT0 * DEG);
  const cT0 = Math.cos(TILT0 * DEG);
  const yFront = (sT0 * DCAM) / (DCAM - cT0);
  const yBack = (sT0 * DCAM) / (DCAM + cT0);

  const measure = () => {
    labels.forEach((el, i) => {
      if (el.offsetWidth) {
        labW[i] = el.offsetWidth;
        labH[i] = el.offsetHeight;
      }
    });
    const rr = root.getBoundingClientRect();
    excl = Array.from(root.querySelectorAll<HTMLElement>("[data-excl]")).map((el) => {
      const b = el.getBoundingClientRect();
      return [b.left - rr.left - 14, b.top - rr.top - 10, b.right - rr.left + 14, b.bottom - rr.top + 10] as [number, number, number, number];
    });
    const sr = stage.getBoundingClientRect();
    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.getPropertyValue("--hk-padx")) || 0;
    const padT = parseFloat(cs.getPropertyValue("--hk-padt")) || 0;
    W = Math.max(1, rr.width);
    H = Math.max(1, rr.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.4e6 / (W * H))) * qScale;
    dpr = Math.max(1, dpr);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    g1c.width = Math.ceil(W / 4);
    g1c.height = Math.ceil(H / 4);
    g2c.width = Math.ceil(W / 8);
    g2c.height = Math.ceil(H / 8);
    g3c.width = Math.ceil(W / 16);
    g3c.height = Math.ceil(H / 16);
    // 輪（と、そのまわりの名前）が、置き場の中に収まる大きさ
    R = Math.min((sr.width / 2 - padX) / 0.99, (sr.height - padT) / (yFront + yBack));
    if (W < 700) R *= 0.95;
    uS = clamp(R / 380, 0.55, 1.15);
    const scx = sr.left - rr.left + sr.width / 2;
    const scy = sr.top - rr.top + sr.height / 2 + padT / 2;
    cx = scx;
    cy = scy - ((yFront - yBack) / 2) * R;
    // 輪の中（文字を置く所）から、線と灯を抜く
    const wide = W >= 700;
    root.style.setProperty("--hk-mx", `${scx.toFixed(0)}px`);
    root.style.setProperty("--hk-my", `${scy.toFixed(0)}px`);
    root.style.setProperty("--hk-hx", `${(R * (wide ? 1.02 : 0.92)).toFixed(0)}px`);
    root.style.setProperty("--hk-hy", `${(R * (wide ? 0.74 : 0.5)).toFixed(0)}px`);
  };

  /* ── 状態 ── */
  let pos = 0;
  let vel = 0;
  let target = 0;
  let dragging = false;
  let frozen = false;
  let interacted = false;
  let wasDragged = false;
  let front = 0;
  let tsec = 0;
  let introOn = true;
  let raf = 0;
  let last = 0;
  let visible = true;
  let destroyed = false;
  let ringMode = mqWide.matches;
  let lastAmb = "";
  let flareT = -1;

  // ポインタ（視差）
  let tpx = 0;
  let tpy = 0;
  let px = 0;
  let py = 0;
  let pvx = 0;
  let pvy = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let mouseOn = 0; // 0〜1

  /* ── 街の灯 ── */
  const r1 = rng(20261007);
  const NDOT = coarse || window.innerWidth < 700 ? 300 : 560;
  const dX = new Float32Array(NDOT);
  const dZ = new Float32Array(NDOT);
  const dSize = new Float32Array(NDOT);
  const dBase = new Float32Array(NDOT);
  const dSpd = new Float32Array(NDOT);
  const dPh = new Float32Array(NDOT);
  const dRev = new Float32Array(NDOT);
  const dTone = new Uint8Array(NDOT);
  for (let k = 0; k < NDOT; k++) {
    // 輪の外の面にだけ散らす（輪の中は静かに）
    const rr = 1.04 + 1.0 * Math.sqrt(r1());
    const th = r1() * TAU;
    dX[k] = rr * Math.cos(th); // R を 1 とした単位
    dZ[k] = rr * Math.sin(th);
    dSize[k] = 0.9 + r1() * 1.6;
    dBase[k] = 0.08 + Math.pow(r1(), 1.8) * 0.34;
    dSpd[k] = 0.4 + r1() * 1.6;
    dPh[k] = r1() * TAU;
    dRev[k] = 0.6 + (rr - 1) * 0.9 + r1() * 0.5;
    dTone[k] = r1() < 0.8 ? 0 : 1;
  }

  /* ── 輪の上を流れる光の点（グルメの弧）。3 つと 3 つが反対向き ── */
  interface Mote {
    a: number; // 弧の中での角度（ラジアン、-ARC_HALF〜+ARC_HALF）
    dir: number;
    v: number; // rad/s
  }
  const r2 = rng(77);
  const motes: Mote[] = [];
  for (let k = 0; k < 6; k++) {
    motes.push({
      a: -ARC_HALF + ((k + 0.5) / 6) * 2 * ARC_HALF + (r2() - 0.5) * 0.1,
      dir: k % 2 === 0 ? 1 : -1,
      v: (7 + r2() * 7) * DEG,
    });
  }
  const pts = new Float32Array((SEG + 1) * 4); // 弧の点: x,y,s,d
  const pl = new Float32Array((SEG + 1) * 2); // 弧の点（輪の面）: x,z
  const prevD = new Float32Array(9).fill(NaN); // 反対向きの 2 つの点の、角度の差（前のコマ）
  const ripples: Ripple[] = [];
  const flashes: { x: number; z: number; age: number }[] = [];
  let ripCool = 0;

  const spawnRipple = (x: number, z: number, max = 0.95, T = 4.2, a = 1, c = 0) => {
    if (ripples.length >= 4) ripples.shift();
    ripples.push({ x, z, age: 0, T, max, a, c });
    flashes.push({ x, z, age: 0 });
    if (flashes.length > 6) flashes.shift();
  };

  /* ── 射影 ── */
  let sT = 0;
  let cT = 0;
  let sB = 0;
  let cB = 0;
  let sRo = 0;
  let cRo = 1;
  let zoom = 1;
  const P = { x: 0, y: 0, s: 1, d: 0 };
  /** 輪の面の点（R を 1 とした単位）→ 画面 */
  const proj = (x: number, z: number) => {
    const x1 = x * cB + z * sB;
    const z1 = -x * sB + z * cB;
    const dep = z1 * cT;
    const s = DCAM / (DCAM - dep);
    const X = x1 * s * R;
    const Y = z1 * sT * s * R;
    P.x = cx + (X * cRo - Y * sRo) * zoom;
    P.y = cy + (X * sRo + Y * cRo) * zoom;
    P.s = s * zoom;
    P.d = dep;
  };

  const swayDeg = () => (mqReduce.matches ? 0 : Math.sin(tsec * 0.33) * 2);
  const rippleLight = (x: number, z: number) => {
    let lit = 0;
    for (let r = 0; r < ripples.length; r++) {
      const rp = ripples[r];
      const u = rp.age / rp.T;
      const rho = rp.max * (1 - Math.pow(1 - u, 2.2));
      const w = 0.07 + 0.06 * rho;
      const dd = Math.hypot(x - rp.x, z - rp.z);
      const q = (dd - rho) / w;
      if (q > -3 && q < 3) lit += Math.exp(-q * q) * rp.a * Math.pow(1 - u, 1.4);
    }
    return lit;
  };
  const depthF = (d: number) => 0.62 + 0.38 * clamp(0.5 + d * 0.9, 0, 1);

  /* ── 1 コマ ── */
  const draw = () => {
    const reduce = mqReduce.matches;
    const ip = introOn ? clamp(tsec / 2.7) : 1;
    const ie = easeOutQuart(ip);
    const ign = sstep(0.05, 1.7, tsec);
    const tiltBase = lerp(80, TILT0, easeOutCubic(ip));
    const sway = swayDeg();
    const tiltDeg = tiltBase - py * 4 + (reduce ? 0 : Math.sin(tsec * 0.21 + 1) * 1);
    const yawDeg = px * 8 + (reduce ? 0 : Math.sin(tsec * 0.27) * 3) + clamp(vel / 3, -1, 1) * 5;
    const fl = flareT >= 0 ? easeOutCubic(flareT / 0.7) : 0;
    // 入るときは、輪が手前へひろがって、その中をくぐる
    zoom = lerp(1.12, 1, ie) * (1 + fl * 0.7);
    const tr = tiltDeg * DEG;
    const yw = yawDeg * DEG;
    const ro = -2.5 * DEG + px * 0.8 * DEG;
    sT = Math.sin(tr);
    cT = Math.cos(tr);
    sB = Math.sin(yw);
    cB = Math.cos(yw);
    sRo = Math.sin(ro);
    cRo = Math.cos(ro);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    g1.setTransform(1, 0, 0, 1, 0, 0);
    g1.clearRect(0, 0, g1c.width, g1c.height);
    g1.setTransform(0.25, 0, 0, 0.25, 0, 0);
    g1.globalCompositeOperation = "lighter";
    ctx.lineJoin = "round";
    g1.lineJoin = "round";
    ctx.lineCap = "butt";

    /* 街の灯（輪の外の面） */
    {
      const nd = Math.floor(NDOT * dotFrac);
      for (let k = 0; k < nd; k++) {
        const x = dX[k];
        const z = dZ[k];
        proj(x, z);
        const X = P.x;
        const Y = P.y;
        if (X < -30 || X > W + 30 || Y < -30 || Y > H + 30) continue;
        if (excl.length && inExcl(X, Y)) continue;
        const u = clamp((tsec - dRev[k]) / 1.1);
        if (u <= 0) continue;
        const tw = 0.72 + 0.28 * Math.sin(tsec * dSpd[k] + dPh[k]);
        let a = dBase[k] * 1.7 * tw * u * depthF(P.d);
        const lit = ripples.length ? rippleLight(x, z) : 0;
        let near = 0;
        if (mouseOn > 0.01) {
          const dd = Math.hypot(X - mouseX, Y - mouseY);
          if (dd < 160) near = (1 - dd / 160) * (1 - dd / 160) * mouseOn;
        }
        const sz = dSize[k] * P.s * uS * (1 + lit * 2.4 + near * 1.2);
        a = Math.min(1, a + near * 0.45);
        ctx.globalAlpha = a;
        ctx.drawImage(spriteWarm, X - sz * 2.2, Y - sz * 2.2, sz * 4.4, sz * 4.4);
        if (lit > 0.04) {
          const sz2 = (2.8 + lit * 4.6) * P.s * uS;
          ctx.globalAlpha = Math.min(1, lit * 0.9) * u;
          ctx.drawImage(sprites[0], X - sz2, Y - sz2, sz2 * 2, sz2 * 2);
        }
      }
      ctx.globalAlpha = 1;
    }

    /* 輪をひとつに見せる、ごく細い円（弧のすき間もつなぐ） */
    {
      const M = 120;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(206,220,255,${(0.2 * ign).toFixed(3)})`;
      ctx.beginPath();
      for (let k = 0; k <= M; k++) {
        const ph = (k / M) * TAU;
        proj(Math.sin(ph), -Math.cos(ph));
        if (k === 0) ctx.moveTo(P.x, P.y);
        else ctx.lineTo(P.x, P.y);
      }
      ctx.stroke();
    }

    /* 弧 */
    const step = (2 * ARC_HALF) / SEG;
    const glintPh = tsec * 0.3; // 輪をひと回りする光の筋（輪全体がひとつであることを見せる）
    for (let i = 0; i < N; i++) {
      const it = items[i];
      const rf = rel(i - pos);
      const w = sstep(0, 1, 1 - Math.abs(rf));
      const phc = Math.PI + (i - pos) * (Math.PI / 3) + sway * DEG;
      for (let k = 0; k <= SEG; k++) {
        const ph = phc - ARC_HALF + k * step;
        const xx = Math.sin(ph);
        const zz = -Math.cos(ph);
        proj(xx, zz);
        pts[k * 4] = P.x;
        pts[k * 4 + 1] = P.y;
        pts[k * 4 + 2] = P.s;
        pts[k * 4 + 3] = P.d;
        pl[k * 2] = xx;
        pl[k * 2 + 1] = zz;
      }
      const rgb = it.rgb;
      const core = cores[i];
      const kind = it.kind;
      const live = kind === "live";
      const baseW = live ? 5.2 : kind === "quiet" ? 3.3 : 2.4;
      const kindA = live ? 0.95 + 0.2 * w : kind === "quiet" ? 0.9 + 0.35 * w : 0.7 + 0.4 * w;
      const nCh = SEG / CH;
      for (let c = 0; c < nCh; c++) {
        const k0 = c * CH;
        const k1 = k0 + CH;
        const km = k0 + CH / 2;
        const dm = (pts[k0 * 4 + 3] + pts[k1 * 4 + 3]) * 0.5;
        const sm = (pts[k0 * 4 + 2] + pts[k1 * 4 + 2]) * 0.5;
        const df = depthF(dm);
        const fr = (c + 0.5) / nCh;
        const taper = live ? 0.8 + 0.2 * Math.sin(fr * Math.PI) : 0.55 + 0.45 * Math.pow(Math.sin(fr * Math.PI), 0.7);
        const lit = ripples.length ? rippleLight(pl[Math.round(km) * 2], pl[Math.round(km) * 2 + 1]) : 0;
        // ひと回りする光の筋
        const phm = phc - ARC_HALF + km * step;
        let dg = angDist(phm - glintPh);
        let gl = Math.exp(-(dg / 0.2) * (dg / 0.2));
        dg = angDist(phm - glintPh - Math.PI);
        gl += 0.5 * Math.exp(-(dg / 0.16) * (dg / 0.16));
        if (live) gl *= 0.35;
        const breathe = live ? 1 : 0.9 + 0.1 * Math.sin(tsec * 0.9 + i * 1.7 + fr * 3);
        // カーソルが近づくと、その弧がこたえて明るくなる
        let nearA = 0;
        if (mouseOn > 0.01) {
          const dxm = (pts[k0 * 4] + pts[k1 * 4]) * 0.5 - mouseX;
          const dym = (pts[k0 * 4 + 1] + pts[k1 * 4 + 1]) * 0.5 - mouseY;
          const dd = Math.hypot(dxm, dym);
          if (dd < 150) nearA = (1 - dd / 150) * (1 - dd / 150) * mouseOn;
        }
        const A = clamp(kindA * df * taper * breathe * ign + lit * 0.4 + gl * 0.5 + nearA * 0.4, 0, 1.3);
        const wm = (1 + 0.4 * w) * (0.55 + 0.45 * ign) * (1 + lit * 0.15 + gl * 0.3 + nearA * 0.3) * (1 + fl * 0.5);
        const bw = baseW * sm * wm * uS;
        const x0 = pts[k0 * 4];
        const y0 = pts[k0 * 4 + 1];
        if (kind !== "faint") {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          for (let k = k0 + 1; k <= k1; k++) ctx.lineTo(pts[k * 4], pts[k * 4 + 1]);
          ctx.lineWidth = bw * 1.9;
          ctx.strokeStyle = rgba(rgb, Math.min(1, A * 0.55));
          ctx.stroke();
          ctx.lineWidth = bw * 0.66;
          ctx.strokeStyle = rgba(core, Math.min(1, A * 0.97));
          ctx.stroke();
        } else {
          // ごく淡い点線: 細い線と、並んだ光の点
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          for (let k = k0 + 1; k <= k1; k++) ctx.lineTo(pts[k * 4], pts[k * 4 + 1]);
          ctx.lineWidth = Math.max(1.2, bw * 0.55);
          ctx.strokeStyle = rgba(rgb, Math.min(1, A * 0.5));
          ctx.stroke();
          const kk = k0 + 1;
          const sz = (4.2 + 1.5 * w + gl * 1.6) * pts[kk * 4 + 2] * uS * (1 + fl * 0.4);
          ctx.globalAlpha = Math.min(1, A * 0.95);
          ctx.drawImage(sprites[i], pts[kk * 4] - sz, pts[kk * 4 + 1] - sz, sz * 2, sz * 2);
          ctx.globalAlpha = 1;
        }
        // にじみ（やわらかい光を、弧に沿って並べる）
        // 輪の内側の縁を、弧の色でほんのり照らす
        {
          const ph2 = phc - ARC_HALF + km * step;
          proj(Math.sin(ph2) * 0.9, -Math.cos(ph2) * 0.9);
          const rr2 = (kind === "live" ? 0.26 : 0.2) * R * P.s;
          g1.globalAlpha = Math.min(1, A * (kind === "live" ? 0.15 : kind === "quiet" ? 0.15 : 0.1));
          g1.drawImage(blobs[i], P.x - rr2, P.y - rr2, rr2 * 2, rr2 * 2);
        }
        const stamp = kind === "live" ? 0.1 : kind === "quiet" ? 0.062 : 0.045;
        for (let k = k0; k < k1; k++) {
          const sr = stamp * R * pts[k * 4 + 2] * wm;
          g1.globalAlpha = Math.min(1, A * (kind === "live" ? 0.19 : kind === "quiet" ? 0.24 : 0.17));
          g1.drawImage(blobs[i], pts[k * 4] - sr, pts[k * 4 + 1] - sr, sr * 2, sr * 2);
        }
      }
      g1.globalAlpha = 1;
      // 弧の両端
      for (const k of [0, SEG]) {
        const s = pts[k * 4 + 2];
        const sz = (live ? 8 : kind === "quiet" ? 5 : 3.4) * s * uS * (1 + 0.3 * w);
        ctx.globalAlpha = Math.min(1, (live ? 0.9 : kind === "quiet" ? 0.7 : 0.5) * depthF(pts[k * 4 + 3]) * ign * (0.7 + 0.3 * w));
        ctx.drawImage(sprites[i], pts[k * 4] - sz, pts[k * 4 + 1] - sz, sz * 2, sz * 2);
      }
      ctx.globalAlpha = 1;
    }

    /* 輪の光が、街の面を照らす（グルメの弧の下の、やわらかい光だまり） */
    {
      const ph = Math.PI + (0 - pos) * (Math.PI / 3) + swayDeg() * DEG;
      const w0 = sstep(0, 1, 1 - Math.abs(rel(0 - pos)));
      proj(Math.sin(ph) * 1.05, -Math.cos(ph) * 1.05);
      const sr = 0.62 * R * P.s;
      g1.globalAlpha = (0.15 + 0.15 * w0 + fl * 0.3) * ign;
      g1.drawImage(blobs[0], P.x - sr, P.y - sr * 0.62, sr * 2, sr * 1.24);
      g1.globalAlpha = 1;
    }

    /* 出会いの光（グルメの弧を流れる点） */
    {
      const phc = Math.PI + (0 - pos) * (Math.PI / 3) + sway * DEG;
      const arcOn = ign > 0.5;
      for (let m = 0; m < motes.length; m++) {
        const mo = motes[m];
        const al = arcOn ? sstep(0, 0.1, 1 - Math.abs(mo.a) / ARC_HALF) : 0;
        for (let tl = 6; tl >= 0; tl--) {
          const a2 = mo.a - mo.dir * tl * 0.02;
          const ph = phc + a2;
          proj(Math.sin(ph), -Math.cos(ph));
          const f = 1 - tl / 7;
          const sz = (2 + 4 * f * f * f) * P.s * uS;
          ctx.globalAlpha = al * f * f * 0.62;
          ctx.drawImage(sprites[0], P.x - sz, P.y - sz, sz * 2, sz * 2);
          if (tl === 0) {
            g1.globalAlpha = al * 0.5;
            g1.drawImage(sprites[0], P.x - sz * 3.2, P.y - sz * 3.2, sz * 6.4, sz * 6.4);
          }
        }
      }
      ctx.globalAlpha = 1;
      g1.globalAlpha = 1;
    }

    /* ひろがる輪（出会いから生まれる。主役の輪を邪魔しない細さと濃さ） */
    for (let r = 0; r < ripples.length; r++) {
      const rp = ripples[r];
      const u = rp.age / rp.T;
      const rho = rp.max * (1 - Math.pow(1 - u, 2.2));
      const al = Math.pow(1 - u, 1.6) * clamp(u / 0.05) * 0.85 * rp.a;
      const M = 72;
      const rgb = items[rp.c].rgb;
      const lw = 1.3 * Math.max(0.85, uS);
      let sSum = 0;
      let nS = 0;
      let pen = false;
      ctx.beginPath();
      g1.beginPath();
      for (let k = 0; k <= M; k++) {
        const ph = (k / M) * TAU;
        proj(rp.x + Math.cos(ph) * rho, rp.z + Math.sin(ph) * rho);
        if (excl.length && inExcl(P.x, P.y)) {
          pen = false;
          continue;
        }
        sSum += P.s;
        nS++;
        if (!pen) {
          ctx.moveTo(P.x, P.y);
          g1.moveTo(P.x, P.y);
          pen = true;
        } else {
          ctx.lineTo(P.x, P.y);
          g1.lineTo(P.x, P.y);
        }
      }
      const sa = nS ? sSum / nS : 1;
      g1.lineWidth = 12 * sa * uS;
      g1.strokeStyle = rgba(rgb, al * 0.32);
      g1.stroke();
      ctx.lineWidth = lw * sa;
      ctx.strokeStyle = rgba(mix(rgb, WHITE, 0.5), al * 0.6);
      ctx.stroke();
    }
    for (let f = 0; f < flashes.length; f++) {
      const fl2 = flashes[f];
      const u = fl2.age / 0.7;
      if (u >= 1) continue;
      proj(fl2.x, fl2.z);
      if (excl.length && inExcl(P.x, P.y)) continue;
      const sz = (6 + 20 * easeOutCubic(u)) * P.s * uS;
      ctx.globalAlpha = (1 - u) * (1 - u) * 0.7;
      ctx.drawImage(sprites[0], P.x - sz, P.y - sz, sz * 2, sz * 2);
      g1.globalAlpha = (1 - u) * 0.5;
      g1.drawImage(sprites[0], P.x - sz * 2, P.y - sz * 2, sz * 4, sz * 4);
    }
    ctx.globalAlpha = 1;
    g1.globalAlpha = 1;

    /* ポインタの光 */
    if (mouseOn > 0.01 && !reduce) {
      const sz = 140;
      ctx.globalAlpha = 0.09 * mouseOn;
      ctx.drawImage(spriteWarm, mouseX - sz, mouseY - sz, sz * 2, sz * 2);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";

    /* にじみ（小さい層を重ねる。拡大して足すのは CSS） */
    g2.setTransform(1, 0, 0, 1, 0, 0);
    g2.globalCompositeOperation = "copy";
    g2.drawImage(g1c, 0, 0, g2c.width, g2c.height);
    g3.setTransform(1, 0, 0, 1, 0, 0);
    g3.globalCompositeOperation = "copy";
    g3.drawImage(g2c, 0, 0, g3c.width, g3c.height);
    const bloom = 1 + fl * 1.2;
    root.style.setProperty("--hk-bloom", bloom.toFixed(3));
  };

  /* ── 名前・光の色を DOM に書く（毎コマ。transform / opacity / CSS 変数のみ） ── */
  const labIn = () => (introOn ? sstep(1.7, 2.6, tsec) : 1);
  const writeDom = () => {
    // 地の光の色（いまの弧と次の弧を混ぜる）
    const base = Math.floor(pos);
    const frac = pos - base;
    const ca = items[mod(base)].rgb;
    const cb = items[mod(base + 1)].rgb;
    const m = sstep(0.1, 0.9, frac);
    const amb = `${lerp(ca[0], cb[0], m) | 0},${lerp(ca[1], cb[1], m) | 0},${lerp(ca[2], cb[2], m) | 0}`;
    if (amb !== lastAmb) {
      lastAmb = amb;
      root.style.setProperty("--hk-rgb", amb);
    }
    if (ringMode) {
      const sway = swayDeg();
      for (let i = 0; i < N; i++) {
        const el = labels[i];
        if (!el) continue;
        const rf = rel(i - pos);
        const ph = Math.PI + rf * (Math.PI / 3) + sway * DEG;
        const zc = -Math.cos(ph);
        // どの名前も、弧のすぐ外側（同じ決まり）。正面の弧の名前は、輪の中に大きく出るので隠す
        const rad = 1.13;
        proj(Math.sin(ph) * rad, zc * rad);
        const kx = clamp((P.x - cx) / (R * 0.5), -1, 1);
        const ky = clamp((P.y - cy) / (R * 0.4), -1, 1);
        const dep = clamp(0.5 + P.d * 0.9, 0, 1);
        const lw = labW[i] * 0.98;
        const lx0 = P.x + (-0.5 + 0.5 * kx) * lw;
        let X = P.x;
        if (lx0 + lw > W - 14) X -= lx0 + lw - (W - 14);
        else if (lx0 < 14) X += 14 - lx0;
        let Y = P.y;
        const ly0 = Y + (-0.5 + 0.5 * ky) * labH[i];
        if (ly0 + labH[i] > H - 10) Y -= ly0 + labH[i] - (H - 10);
        const vis = sstep(0.12, 0.8, Math.abs(rf));
        el.style.opacity = (vis * labIn() * (0.88 + 0.12 * dep)).toFixed(3);
        el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) translate(${(-50 + 50 * kx).toFixed(1)}%,${(-50 + 50 * ky).toFixed(1)}%)`;
        el.style.zIndex = String(10 + Math.round(dep * 10));
        el.dataset.vis = vis > 0.3 ? "1" : "0";
        const side = kx < -0.28 ? "l" : kx > 0.28 ? "r" : "c";
        if (el.dataset.side !== side) el.dataset.side = side;
      }
    }
    const fi = mod(Math.round(pos));
    if (fi !== front && (!introOn || interacted)) {
      front = fi;
      // 正面に来た弧から、小さな輪が広がる
      spawnRipple(0, 1, 0.8, 3, 0.9, fi);
      o.onFront(fi, interacted);
    }
  };

  /* ── ループ ── */
  const chooseTarget = (from: number) => {
    const proj2 = pos + vel * 0.19;
    let tg = Math.round(proj2);
    if (tg === from && Math.abs(vel) > 0.9) tg = from + Math.sign(vel);
    return Math.max(from - 4, Math.min(from + 4, tg));
  };

  let introPulse = false;
  let nudged = false;
  let readyFired = false;
  /* ── 重い端末では、描く量を減らす（フレーム間隔が長いままのとき） ── */
  const perf = ((window as unknown as { __hkPerf?: { js: number; dt: number; q: number; frames: number } }).__hkPerf = { js: 0, dt: 16, q: 0, frames: 0 });
  let slow = 0;
  const adapt = (dt: number) => {
    if (tsec < 3.2 || (window as unknown as { __hkNoAdapt?: boolean }).__hkNoAdapt) return;
    slow = dt > 0.03 ? slow + 1 : Math.max(0, slow - 2);
    if (slow > 50 && perf.q < 2) {
      perf.q++;
      slow = 0;
      dotFrac = perf.q === 1 ? 0.55 : 0.3;
      if (perf.q === 2) {
        qScale = 0.75;
        measure();
      }
    }
  };

  const tick = (now: number) => {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    tsec += dt;
    perf.frames++;
    const ign = sstep(0.05, 1.7, tsec);
    if (flareT >= 0) flareT += dt;
    // しばらく触られなければ、輪を少しだけ揺らして、回せることを知らせる
    if (!nudged && tsec > 5 && !interacted && !introOn) {
      nudged = true;
      vel = 1.15;
    }
    // 入りの回転
    if (introOn) {
      if (interacted || tsec > 2.7) {
        introOn = false;
        if (!interacted) {
          pos = target = 0;
          vel = 0;
        }
      } else {
        const t0 = easeOutQuart(tsec / 2.7);
        pos = -3.2 * (1 - t0);
        target = 0;
        if (tsec > 2.25 && !introPulse) {
          introPulse = true;
          spawnRipple(0, 1, 1.1, 4.6, 1, 0);
        }
      }
    } else if (!dragging) {
      let rem = dt;
      while (rem > 0) {
        const h = Math.min(rem, 1 / 120);
        const acc = -SPRING_K * (pos - target) - SPRING_C * vel;
        vel += acc * h;
        pos += vel * h;
        rem -= h;
      }
      if (Math.abs(pos - target) < 0.0006 && Math.abs(vel) < 0.012) {
        pos = target;
        vel = 0;
      }
    }

    // ポインタ（臨界減衰）
    {
      const w = 5.2;
      const ax = -w * w * (px - tpx) - 2 * w * pvx;
      const ay = -w * w * (py - tpy) - 2 * w * pvy;
      pvx += ax * dt;
      pvy += ay * dt;
      px += pvx * dt;
      py += pvy * dt;
    }
    mouseOn += ((mouseX > -999 ? 1 : 0) - mouseOn) * Math.min(1, dt * 4);

    // 動き
    ripCool -= dt;
    for (let m = 0; m < motes.length; m++) {
      const mo = motes[m];
      mo.a += mo.dir * mo.v * dt;
      let wrapped = false;
      if (mo.a > ARC_HALF) {
        mo.a = -ARC_HALF;
        wrapped = true;
      } else if (mo.a < -ARC_HALF) {
        mo.a = ARC_HALF;
        wrapped = true;
      }
      if (wrapped) {
        mo.v = (7 + Math.random() * 7) * DEG;
        for (let k = 0; k < 3; k++) prevD[m % 2 === 0 ? (m >> 1) * 3 + k : k * 3 + (m >> 1)] = NaN;
      }
    }
    // 出会い: 反対向きの 2 つの点がすれ違った所に、輪が生まれる（間をあけて、少なく）
    if (ign > 0.5 || !introOn) {
      const phc = Math.PI + (0 - pos) * (Math.PI / 3) + swayDeg() * DEG;
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          const A = motes[a * 2];
          const B = motes[b * 2 + 1];
          const diff = A.a - B.a;
          const p = prevD[a * 3 + b];
          if (p < 0 && diff >= 0 && ripCool <= 0 && Math.abs(A.a) < ARC_HALF * 0.8 && Math.abs(B.a) < ARC_HALF * 0.8) {
            const ph = phc + (A.a + B.a) / 2;
            spawnRipple(Math.sin(ph), -Math.cos(ph));
            ripCool = 1.25;
          }
          prevD[a * 3 + b] = diff;
        }
      }
    }
    for (const rp of ripples) rp.age += dt;
    for (let k = ripples.length - 1; k >= 0; k--) if (ripples[k].age >= ripples[k].T) ripples.splice(k, 1);
    for (const f of flashes) f.age += dt;

    const j0 = performance.now();
    draw();
    writeDom();
    const j1 = performance.now();
    perf.js += (j1 - j0 - perf.js) * 0.08;
    perf.dt += (dt * 1000 - perf.dt) * 0.08;
    adapt(dt);
    if (!readyFired && tsec > 0.05) {
      readyFired = true;
      o.onReady?.();
    }
    schedule();
  };

  const active = () => visible && !document.hidden && !destroyed;
  const schedule = () => {
    if (raf || !active()) return;
    raf = requestAnimationFrame(tick);
  };
  const resume = () => {
    if (raf) return;
    last = performance.now();
    schedule();
  };

  /* ── 入力 ── */
  const touch = () => {
    interacted = true;
    root.classList.add("is-touched");
  };
  const step2 = (d: number) => {
    if (frozen) return;
    touch();
    target = Math.round(target) + d;
    resume();
  };
  const goTo = (i: number) => {
    if (frozen) return;
    touch();
    const base = Math.round(target);
    const diff = rel(i - base);
    if (diff === 0) return;
    target = base + diff;
    resume();
  };
  const nudge = () => {
    vel += 1.4;
    resume();
  };

  type Sample = { t: number; p: number };
  let drag: { id: number; x0: number; y0: number; pos0: number; on: boolean; s: Sample[] } | null = null;
  const stepPx = () => Math.max(120, R * 0.8);
  const onDown = (e: PointerEvent) => {
    if (frozen) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as Element | null)?.closest("[data-nodrag], a, button")) return;
    touch();
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: pos, on: false, s: [{ t: e.timeStamp, p: pos }] };
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      const rr = root.getBoundingClientRect();
      tpx = clamp(((e.clientX - rr.left) / rr.width) * 2 - 1, -1, 1);
      tpy = clamp(((e.clientY - rr.top) / rr.height) * 2 - 1, -1, 1);
      mouseX = e.clientX - rr.left;
      mouseY = e.clientY - rr.top;
      resume();
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.on) {
      if (Math.abs(dx) < 7) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.1) {
        drag = null;
        return;
      }
      drag.on = true;
      dragging = true;
      wasDragged = true;
      target = pos;
      vel = 0;
      try {
        root.setPointerCapture(e.pointerId);
      } catch {
        /* 取れなくても動く */
      }
      root.classList.add("is-drag");
      resume();
    }
    pos = drag.pos0 + dx / stepPx();
    drag.s.push({ t: e.timeStamp, p: pos });
    while (drag.s.length > 2 && e.timeStamp - drag.s[0].t > 110) drag.s.shift();
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.on) {
      const s = drag.s;
      const a = s[0];
      const b = s[s.length - 1];
      const span = (b.t - a.t) / 1000;
      const fresh = e.timeStamp - b.t < 90;
      vel = fresh && span > 0.012 ? (b.p - a.p) / span : 0;
      vel = clamp(vel, -9, 9);
      dragging = false;
      target = chooseTarget(Math.round(drag.pos0));
      root.classList.remove("is-drag");
      window.setTimeout(() => (wasDragged = false), 0);
      resume();
    }
    drag = null;
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    tpx = 0;
    tpy = 0;
    mouseX = -9999;
    mouseY = -9999;
  };
  const onKey = (e: KeyboardEvent) => {
    if (frozen || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < window.innerHeight * 0.5 || r.top > window.innerHeight * 0.5) return;
    e.preventDefault();
    step2(e.key === "ArrowRight" ? 1 : -1);
  };
  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
  root.addEventListener("pointerleave", onLeave);
  window.addEventListener("keydown", onKey);

  const onVis = () => (document.hidden ? undefined : resume());
  document.addEventListener("visibilitychange", onVis);
  const io = new IntersectionObserver((es) => {
    visible = es[0]?.isIntersecting ?? true;
    if (visible) resume();
  });
  io.observe(root);
  const ro = new ResizeObserver(() => {
    measure();
    resume();
  });
  ro.observe(root);
  ro.observe(stage);
  const resetLabels = () => labels.forEach((el) => {
    el.style.opacity = "";
    el.style.transform = "";
    el.style.zIndex = "";
  });
  const onWide = () => {
    ringMode = mqWide.matches;
    root.dataset.ring = ringMode ? "1" : "0";
    if (!ringMode) resetLabels();
    measure();
  };
  mqWide.addEventListener("change", onWide);
  root.dataset.ring = ringMode ? "1" : "0";

  measure();
  resume();

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      mqWide.removeEventListener("change", onWide);
      io.disconnect();
      ro.disconnect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      [g1, g2, g3].forEach((g) => g.clearRect(0, 0, 4096, 4096));
      resetLabels();
    },
    step: step2,
    goTo,
    front: () => mod(Math.round(target)),
    nudge,
    dragged: () => wasDragged,
    freeze: () => {
      frozen = true;
    },
    thaw: () => {
      frozen = false;
      flareT = -1;
      resume();
    },
    anchor: () => {
      proj(0, 1);
      return { x: P.x, y: P.y };
    },
    flare: () => {
      flareT = 0;
      const ph = Math.PI + (front - pos) * (Math.PI / 3);
      spawnRipple(Math.sin(ph), -Math.cos(ph), 1.2, 1.4, 1, front);
      resume();
    },
  };
}
