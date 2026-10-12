"use client";
/**
 * 案 4「くっつく」: ジェルのしずくが、重さをもって転がり、くっつき、ちぎれる。
 *  - しずく(blob)は上から落ちてきて床にたまる。床は少しずつ揺れていて、ときどき自分でぴょんと跳ねる(開いた瞬間から動き続ける)
 *  - ふれる/なぞる: ポインタが近づくと押しのけられる。押さえるとつかめて(指でつかんだ間は画面がスクロールしない)、離すと弾んで戻る。何もない所を触ると、新しいしずくが生まれる
 *  - 傾ける: 端末を傾けると、傾けた側へ転がる(iOS は最初に触った時に許可を聞く)
 *  - スクロール: 床が下へ逃げて、しずくが下の画面へこぼれ落ちる。スクロールの勢いで、ぷるんと揺れる
 * 描くのは低解像度の「場」(各しずくの影響を足し合わせた値)を、しきい値で面にして ImageData に書く方式(metaball)。
 * canvas は CSS で拡大するだけ。rAF は、画面に見えている間だけ。重いと自分で解像度を落とす。「動きを減らす」設定のときは何もしない。
 */
import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
type RGB = [number, number, number];

const PINK: RGB = [251, 155, 220];
const SKY: RGB = [79, 169, 238];
const HOT: RGB = [248, 2, 87];
const INK: RGB = [17, 17, 17];
const ICE: RGB = [194, 229, 251];
const WHITE: RGB = [255, 255, 255];
const PAL: RGB[] = [PINK, SKY, HOT, INK, ICE, WHITE, PINK, SKY, HOT, ICE, INK, PINK];
// 大きさ(画面の短い辺に対する割合)と、落ちてくる横位置(画面の幅に対する割合)
const RAD = [0.12, 0.095, 0.105, 0.07, 0.085, 0.055, 0.078, 0.08, 0.066, 0.06, 0.05, 0.062];
const XS = [0.8, 0.66, 0.9, 0.72, 0.97, 0.6, 0.86, 0.7, 0.78, 0.62, 0.93, 0.68];

type Blob = {
  x: number; y: number; vx: number; vy: number; r: number;
  ex: number; ey: number; evx: number; evy: number;
  hx: number; c: RGB; delay: number; held: boolean; k: number; age: number; life: number;
};
type Box = { l: number; t: number; r: number; b: number };

const K = 1.55; // 場の届く範囲 / 見える半径
const T = 0.2; // 面になるしきい値
const LX = -0.5, LY = -0.65, LZ = 0.58;
const LL = Math.hypot(LX, LY, LZ);
const L0 = LX / LL, L1 = LY / LL, L2 = LZ / LL;
const HX0 = L0, HY0 = L1, HZ0 = L2 + 1;
const HL = Math.hypot(HX0, HY0, HZ0);
const H0 = HX0 / HL, H1 = HY0 / HL, H2 = HZ0 / HL;

export default function HeroGel() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const hero = cv?.closest<HTMLElement>(".cp-hero");
    const ctx = cv?.getContext("2d");
    if (!cv || !hero || !ctx) return;
    const heroEl: HTMLElement = hero;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let on = false;
    let raf = 0;
    let visible = true;
    let W = 1, H = 1, vmin = 1;
    let cs = 4; // 1 マスの大きさ(px)
    let csSet = false;
    let csBase = 4; // 軽いときの 1 マスの大きさ
    let gw = 1, gh = 1;
    let F = new Float32Array(1), CW = new Float32Array(1), CR = new Float32Array(1), CG = new Float32Array(1), CB = new Float32Array(1);
    let img: ImageData | null = null;
    let blobs: Blob[] = [];
    let ko: Box[] = [];
    let t0 = 0, last = 0, tNow = 0;
    let ema = 6, frames = 0, lastAdapt = 0;
    let px = 0, py = 0, pin = false, pdown = false, ptype = "mouse";
    let pvx = 0, pvy = 0, pLastT = 0, pLastX = 0, pLastY = 0;
    let grab: Blob | null = null, gdx = 0, gdy = 0;
    let tilt = 0, tiltT = 0;
    let lastScrollY = 0;
    let o = 0;
    let nextHop = 0;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let oriOn = false;
    let tMeasure = 0;
    let live = false;

    const mk = (i: number): Blob => ({
      x: W * (0.52 + XS[i % XS.length] * 0.44), y: -vmin * 0.2 - i * vmin * 0.09, vx: 0, vy: 260, r: RAD[i % RAD.length] * vmin,
      ex: 1, ey: 1, evx: 0, evy: 0, hx: W * (0.52 + XS[i % XS.length] * 0.44), c: PAL[i % PAL.length], delay: 0.04 + i * 0.06, held: false, k: 1, age: 0, life: 0,
    });

    const alloc = () => {
      gw = Math.max(8, Math.ceil(W / cs));
      gh = Math.max(8, Math.ceil(H / cs));
      const n = gw * gh;
      F = new Float32Array(n); CW = new Float32Array(n); CR = new Float32Array(n); CG = new Float32Array(n); CB = new Float32Array(n);
      cv.width = gw;
      cv.height = gh;
      img = ctx.createImageData(gw, gh);
    };

    const measure = () => {
      const hr = hero.getBoundingClientRect();
      const oldW = W;
      W = Math.max(1, hero.clientWidth);
      H = Math.max(1, hero.clientHeight);
      vmin = Math.min(W, H);
      if (oldW > 1 && blobs.length && Math.abs(oldW - W) > 2) {
        const f = W / oldW;
        for (const b of blobs) { b.x *= f; b.r *= f; b.hx *= f; }
      }
      if (!csSet) { csBase = W < 700 ? 3 : 4; cs = csBase; csSet = true; }
      alloc();
      ko = [];
      const add = (r: DOMRect, pad: number) => {
        if (r.width < 2 || r.height < 2) return;
        ko.push({ l: r.left - hr.left - pad, t: r.top - hr.top - pad, r: r.right - hr.left + pad, b: r.bottom - hr.top + pad });
      };
      const rg = document.createRange();
      hero.querySelectorAll<HTMLElement>(".cp-line, .cp-hero-sub").forEach((el) => {
        rg.selectNodeContents(el);
        add(rg.getBoundingClientRect(), 6);
      });
    };

    const spawn = (x: number, y: number) => {
      const small = blobs.filter((b) => b.life > 0);
      if (small.length >= 7) {
        const o0 = small[0];
        blobs.splice(blobs.indexOf(o0), 1);
      }
      const c = PAL[Math.floor(Math.random() * PAL.length)];
      const r = (0.04 + Math.random() * 0.03) * vmin;
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const sp = vmin * (0.9 + Math.random() * 0.7);
      blobs.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, ex: 1.25, ey: 0.75, evx: 0, evy: 0, hx: x, c, delay: 0, held: false, k: 0.1, age: 0, life: 6 });
    };

    const kick = () => {
      if (on && visible && !raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const push = (b: Blob, bx: Box, rr: number, dt: number, k: number) => {
      const cx = b.x < bx.l ? bx.l : b.x > bx.r ? bx.r : b.x;
      const cy = b.y < bx.t ? bx.t : b.y > bx.b ? bx.b : b.y;
      let dx = b.x - cx;
      let dy = b.y - cy;
      let d = Math.hypot(dx, dy);
      if (d < 0.001) {
        // 中に入った: 近い辺へ出す
        const dl = b.x - bx.l, dr = bx.r - b.x, dtp = b.y - bx.t, db = bx.b - b.y;
        const m = Math.min(dl, dr, dtp, db);
        dx = m === dl ? -1 : m === dr ? 1 : 0;
        dy = m === dtp ? -1 : m === db ? 1 : 0;
        if (m === dl || m === dr) dy = 0; else dx = 0;
        b.vx += dx * k * 1.6 * dt; b.vy += dy * k * 1.6 * dt;
        if (m === dtp) b.vx += (b.x >= (bx.l + bx.r) / 2 ? 1 : -1) * k * 0.9 * dt;
        return;
      }
      if (d < rr) {
        const f = (rr - d) / rr;
        if (dx === 0 && dy < 0) {
          // 札の真上に乗ったら、止まらずに横へ滑り落ちる
          b.vx += (b.x >= (bx.l + bx.r) / 2 ? 1 : -1) * f * k * 0.9 * dt;
          b.vy -= f * k * 0.3 * dt;
        } else {
          b.vx += (dx / d) * f * k * dt;
          b.vy += (dy / d) * f * k * dt;
        }
      }
    };

    const step = (dt: number) => {
      const G = vmin * 3.0;
      const amb = tNow - tiltT < 1500 ? 0 : 0.14 * Math.sin(tNow * 0.55) + 0.07 * Math.sin(tNow * 1.37 + 1);
      const gx = (tNow - tiltT < 1500 ? tilt : amb) * 0.9;
      const floor = H - 72 + o * H * 0.9; // 丸いボタンの台(下の 64px に重なる)の上に床がある。スクロールすると床が下へ逃げる
      for (const b of blobs) {
        if (tNow < b.delay) continue;
        b.age += dt;
        if (b.life > 0) {
          const rem = b.life - b.age;
          b.k = clamp(b.age / 0.2) * (rem < 1.2 ? clamp(rem / 1.2) : 1);
        }
      }
      blobs = blobs.filter((b) => b.life <= 0 || b.age < b.life);
      const n = blobs.length;
      for (let i = 0; i < n; i++) {
        const b = blobs[i];
        if (tNow < b.delay) continue;
        const rx = b.r * b.ex * b.k;
        const ry = b.r * b.ey * b.k;
        if (b.held) {
          const tx = px - gdx, ty = py - gdy;
          const nx = b.x + (tx - b.x) * Math.min(1, dt * 26);
          const ny = b.y + (ty - b.y) * Math.min(1, dt * 26);
          b.vx = (nx - b.x) / dt * 0.6 + b.vx * 0.4;
          b.vy = (ny - b.y) / dt * 0.6 + b.vy * 0.4;
          b.x = nx; b.y = ny;
        } else {
          b.vy += G * dt;
          b.vx += gx * G * dt;
          if (b.life === 0) b.vx += (b.hx - b.x) * 1.5 * dt;
          if (b.y > ry * 0.5) for (let j = 0; j < ko.length; j++) push(b, ko[j], rx * 0.8 + 8, dt, vmin * 7);
          // ポインタ(マウスは触れているだけで、指は押している間)に押しのけられる
          if (pin && !grab && (ptype === "mouse" || pdown)) {
            const dx = b.x - px, dy = b.y - py;
            const d = Math.hypot(dx, dy) || 1;
            const R = Math.max(rx, ry) * 1.1 + vmin * 0.085;
            if (d < R) {
              const f = 1 - d / R;
              const s = (0.35 + Math.min(Math.hypot(pvx, pvy) / (vmin * 3), 1.2)) * f * f * vmin * 40;
              b.vx += (dx / d) * s * dt;
              b.vy += (dy / d) * s * dt;
            }
          }
          const dr = Math.exp(-dt * 0.5);
          b.vx *= dr; b.vy *= dr;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
        }
        // 床と壁
        const fy = floor - ry * 0.84;
        if (b.y > fy && b.y > 0) {
          if (b.vy > 0) {
            const imp = b.vy;
            b.evy -= imp * 0.003; b.evx += imp * 0.0016;
            b.vy = imp > vmin * 0.4 ? -imp * 0.3 : 0;
            if (b.vy === 0 && imp > 0) b.vy = 0;
          }
          b.y = fy;
          b.vx *= Math.exp(-dt * 2.2);
        }
        if (b.x - rx * 0.84 < 0) { b.x = rx * 0.84; if (b.vx < 0) b.vx *= -0.35; }
        if (b.x + rx * 0.84 > W) { b.x = W - rx * 0.84; if (b.vx > 0) b.vx *= -0.35; }
        // 天井: 一度画面に入ったら、ヘッダーより上へは行かない
        const ceil = (window.innerWidth <= 900 ? 56 : 72) + ry * 0.84;
        if (b.y < ceil && b.age > 0.9 && b.vy < 0) { b.y = ceil; b.vy *= -0.3; }
        // ぷるん(ばね): 速さに応じて伸び縮みし、着地でつぶれて揺り戻す
        const sx = clamp(Math.abs(b.vx) / (vmin * 2.2)), sy = clamp(Math.abs(b.vy) / (vmin * 2.2));
        const tx2 = 1 + sx * 0.3 - sy * 0.14, ty2 = 1 + sy * 0.32 - sx * 0.14;
        b.evx += (-130 * (b.ex - tx2) - 7.5 * b.evx) * dt;
        b.evy += (-130 * (b.ey - ty2) - 7.5 * b.evy) * dt;
        b.ex = clamp(b.ex + b.evx * dt, 0.6, 1.55);
        b.ey = clamp(b.ey + b.evy * dt, 0.6, 1.55);
      }
      // しずく同士: 重ならないように押し合い、近いと引き合ってくっつく
      for (let i = 0; i < n; i++) {
        const a = blobs[i];
        if (tNow < a.delay) continue;
        for (let j = i + 1; j < n; j++) {
          const c = blobs[j];
          if (tNow < c.delay) continue;
          const dx = c.x - a.x, dy = c.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const ra = a.r * a.k, rc = c.r * c.k;
          const sum = ra + rc;
          const nx = dx / d, ny = dy / d;
          const ma = ra * ra, mc = rc * rc, mt = ma + mc;
          let f = 0;
          if (d < sum * 0.94) f = (sum * 0.94 - d) * 140; // 押し返す
          else if (d < sum * 1.5) f = -(1 - (d - sum * 0.94) / (sum * 0.56)) * vmin * 2.2; // 引き合う
          if (f !== 0) {
            if (!a.held) { a.vx -= nx * f * dt * (mc / mt); a.vy -= ny * f * dt * (mc / mt); }
            if (!c.held) { c.vx += nx * f * dt * (ma / mt); c.vy += ny * f * dt * (ma / mt); }
          }
        }
      }
      // ときどき自分で跳ねる
      if (tNow > nextHop && tNow > 1.6) {
        nextHop = tNow + 1.7 + Math.random() * 2.2;
        const rest = blobs.filter((b) => !b.held && b.life === 0 && Math.abs(b.vy) < 30 && b.y > H * 0.45);
        if (rest.length) {
          const b = rest[Math.floor(Math.random() * rest.length)];
          b.vy = -vmin * (0.85 + Math.random() * 0.45);
          b.vx += (Math.random() - 0.5) * vmin * 0.5;
          b.evy += 3;
        }
      }
    };

    const render = () => {
      if (!img) return;
      F.fill(0); CW.fill(0); CR.fill(0); CG.fill(0); CB.fill(0);
      for (const b of blobs) {
        if (tNow < b.delay || b.k <= 0.01) continue;
        const rx = b.r * b.ex * b.k * K, ry = b.r * b.ey * b.k * K;
        if (b.y + ry < 0 || b.y - ry > H) continue;
        const x0 = Math.max(0, Math.floor((b.x - rx) / cs)), x1 = Math.min(gw - 1, Math.ceil((b.x + rx) / cs));
        const y0 = Math.max(0, Math.floor((b.y - ry) / cs)), y1 = Math.min(gh - 1, Math.ceil((b.y + ry) / cs));
        const ix = 1 / rx, iy = 1 / ry;
        const cr = b.c[0], cg = b.c[1], cb = b.c[2];
        for (let y = y0; y <= y1; y++) {
          const dy = ((y + 0.5) * cs - b.y) * iy;
          const dy2 = dy * dy;
          if (dy2 >= 1) continue;
          const row = y * gw;
          for (let x = x0; x <= x1; x++) {
            const dx = ((x + 0.5) * cs - b.x) * ix;
            const d2 = dx * dx + dy2;
            if (d2 >= 1) continue;
            const u = 1 - d2;
            const f = u * u * u;
            const id = row + x;
            F[id] += f;
            const w = f * f;
            CW[id] += w; CR[id] += w * cr; CG[id] += w * cg; CB[id] += w * cb;
          }
        }
      }
      const data = img.data;
      const sc = 12 * (cs / 4);
      for (let y = 0; y < gh; y++) {
        const row = y * gw;
        for (let x = 0; x < gw; x++) {
          const id = row + x;
          const f = F[id];
          const p = id << 2;
          if (f < T - 0.1) { data[p + 3] = 0; continue; }
          const fxm = x > 0 ? F[id - 1] : f, fxp = x < gw - 1 ? F[id + 1] : f;
          const fym = y > 0 ? F[id - gw] : f, fyp = y < gh - 1 ? F[id + gw] : f;
          const gx = (fxp - fxm) * 0.5, gy = (fyp - fym) * 0.5;
          const g = Math.sqrt(gx * gx + gy * gy);
          const e = Math.max(0.02, g * 0.5);
          let a = (f - (T - e)) / (2 * e);
          if (a <= 0.003) { data[p + 3] = 0; continue; }
          if (a > 1) a = 1;
          a = a * a * (3 - 2 * a);
          const nxx = -gx * sc, nyy = -gy * sc;
          const inv = 1 / Math.sqrt(nxx * nxx + nyy * nyy + 1);
          const dif = (nxx * L0 + nyy * L1 + L2) * inv;
          const hh = (nxx * H0 + nyy * H1 + H2) * inv;
          let s = hh > 0 ? hh : 0;
          s *= s; s *= s; s *= s; s *= s * s * s; // ^24 ぐらい
          const shade = 0.74 + 0.5 * dif;
          const iw = CW[id] > 0 ? 1 / CW[id] : 0;
          const hi = 255 * s * 0.6;
          const r = CR[id] * iw * shade + hi, gg = CG[id] * iw * shade + hi, bb = CB[id] * iw * shade + hi;
          data[p] = r > 255 ? 255 : r;
          data[p + 1] = gg > 255 ? 255 : gg;
          data[p + 2] = bb > 255 ? 255 : bb;
          data[p + 3] = (a * 255) | 0;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    function frame(now: number) {
      const hero = heroEl;
      raf = 0;
      if (!on || !visible || document.hidden) return;
      const c0 = performance.now();
      if (!t0) t0 = now;
      tNow = (now - t0) / 1000;
      const dt = Math.min(0.06, last ? (now - last) / 1000 : 0.016);
      last = now;
      const r = hero.getBoundingClientRect();
      o = clamp(-r.top / Math.max(r.height, 1));
      // スクロールの勢い: しずくは画面に残ろうとするので、紙面に対して下へ(上へ戻ると上へ)ぷるんと動く
      const sy = window.scrollY;
      const dS = clamp(sy - lastScrollY, -120, 120);
      lastScrollY = sy;
      if (dS !== 0) for (const b of blobs) if (!b.held) b.vy += dS * 5;
      pvx *= Math.exp(-dt * 6); pvy *= Math.exp(-dt * 6);
      const sub = dt > 0.034 ? 4 : 2;
      for (let k = 0; k < sub; k++) step(dt / sub);
      render();
      if (!live) { live = true; hero.dataset.live = "1"; }
      // 重いときは解像度を落とす
      const ms = performance.now() - c0;
      ema += (ms - ema) * 0.1;
      frames++;
      if (frames > 24 && ema > 11 && cs < 9 && now - lastAdapt > 600) {
        lastAdapt = now;
        cs++;
        alloc();
      } else if (frames > 60 && ema < 4.5 && cs > csBase && now - lastAdapt > 2500) {
        // 軽くなったら、細かさを戻す
        lastAdapt = now;
        cs--;
        alloc();
      }
      if (tMeasure && now > tMeasure) { tMeasure = 0; measure(); }
      raf = requestAnimationFrame(frame);
    }

    const local = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const onMove = (e: PointerEvent) => {
      local(e);
      ptype = e.pointerType;
      pin = true;
      const t = performance.now();
      if (pLastT) {
        const dtp = Math.max(8, t - pLastT);
        pvx = pvx * 0.4 + ((px - pLastX) / dtp) * 1000 * 0.6;
        pvy = pvy * 0.4 + ((py - pLastY) / dtp) * 1000 * 0.6;
      }
      pLastT = t; pLastX = px; pLastY = py;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      local(e);
      ptype = e.pointerType;
      pin = true; pdown = true;
      pLastT = performance.now(); pLastX = px; pLastY = py; pvx = pvy = 0;
      let hit: Blob | null = null;
      let best = 1e9;
      for (const b of blobs) {
        if (tNow < b.delay || b.k < 0.5) continue;
        const d = Math.hypot((b.x - px) / b.ex, (b.y - py) / b.ey);
        const lim = b.r * b.k * 1.05;
        if (d < lim && d < best) { best = d; hit = b; }
      }
      if (hit) {
        grab = hit; hit.held = true; gdx = px - hit.x; gdy = py - hit.y;
        hit.evy += 2.5; hit.evx -= 1.5;
      } else {
        spawn(px, py);
      }
      if (e.pointerType === "touch") askOrientation();
      kick();
    };
    const release = (e?: PointerEvent) => {
      pdown = false;
      if (grab) {
        grab.held = false;
        grab.vx = clamp(pvx, -vmin * 4, vmin * 4);
        grab.vy = clamp(pvy, -vmin * 4, vmin * 4);
        grab = null;
      }
      if (e && e.pointerType !== "mouse") pin = false;
    };
    const onLeave = () => { pin = false; };
    // しずくをつかんだ指は、画面のスクロールにならない(つかんでいない指は、いつもどおりスクロールできる)
    const onTouchStart = (e: TouchEvent) => { if (grab && e.cancelable) e.preventDefault(); };
    const onOri = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      tilt = clamp(e.gamma / 28, -1, 1);
      tiltT = tNow;
    };
    const addOri = () => {
      if (oriOn) return;
      oriOn = true;
      window.addEventListener("deviceorientation", onOri, { passive: true });
    };
    const askOrientation = () => {
      const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
      if (D && typeof D.requestPermission === "function" && !oriOn) D.requestPermission().then((s) => s === "granted" && addOri()).catch(() => {});
    };
    const onScroll = () => kick();
    const onVis = () => (document.hidden ? undefined : kick());

    const start = () => {
      if (on) return;
      on = true;
      t0 = 0; last = 0;
      lastScrollY = window.scrollY;
      measure();
      blobs = Array.from({ length: W < 700 ? 8 : 12 }, (_, i) => mk(i));
      // 読み込み直後に CSS で落ちていたしずくの、いまの位置・大きさ・色を引き継ぐ
      const hr = hero.getBoundingClientRect();
      hero.querySelectorAll<HTMLElement>(".hg-pre i").forEach((el, i) => {
        const b = blobs[i];
        const r = el.getBoundingClientRect();
        if (!b || r.width < 4) return;
        const c = (el.dataset.c || "").split(",").map(Number);
        if (c.length === 3) b.c = [c[0], c[1], c[2]];
        b.r = el.offsetWidth / 2;
        b.x = r.left + r.width / 2 - hr.left;
        b.y = r.top + r.height / 2 - hr.top;
        b.hx = b.x;
        b.vy = 300;
        b.delay = 0;
      });
      nextHop = 2.2;
      hero.addEventListener("pointermove", onMove, { passive: true });
      hero.addEventListener("pointerdown", onDown, { passive: true });
      hero.addEventListener("pointerup", release, { passive: true });
      hero.addEventListener("pointercancel", release, { passive: true });
      hero.addEventListener("pointerleave", onLeave, { passive: true });
      hero.addEventListener("touchstart", onTouchStart, { passive: false });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVis);
      const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
      if (D && typeof D.requestPermission !== "function") addOri();
      ro = new ResizeObserver(() => measure());
      ro.observe(hero);
      io = new IntersectionObserver((es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) kick();
      });
      io.observe(hero);
      document.fonts?.ready.then(() => on && measure());
      tMeasure = performance.now() + 1700;
      kick();
    };
    const stop = () => {
      if (!on) return;
      on = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", release);
      hero.removeEventListener("pointercancel", release);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("deviceorientation", onOri);
      oriOn = false;
      document.removeEventListener("visibilitychange", onVis);
      ro?.disconnect();
      io?.disconnect();
      ro = null; io = null;
      blobs = []; grab = null;
      live = false;
      delete hero.dataset.live;
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
    const onMq = () => (mq.matches ? stop() : start());

    if (!mq.matches) start();
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return <canvas className="hg-gel" ref={ref} aria-hidden="true" />;
}
