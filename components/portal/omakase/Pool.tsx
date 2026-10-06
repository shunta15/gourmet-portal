"use client";
/**
 * 掲載店ぜんぶを 1 軒 1 つの点で並べた「ふるい」（canvas）。点 1 つ = 掲載店 1 軒（並びは 地方→県の順で、読む向きに敷き詰める）。
 * 答えるたびに、いまの条件に当てはまる店だけが墨の点として残り、外れた店は細かい点に退く（点の数は実際の店数と同じ）。
 *  - preview: 選択肢にマウス・フォーカスを置いたとき、それを選ぶと残る店を朱で見せる（まだ決まってはいない）
 *  - picks: 結果に出した店は朱の点に輪をかけ、壱・弐・参の番号を添える
 * 動きは、点ごとに少しずつ遅れて（さざ波のように）半径と濃さが変わるだけ。動きを減らす設定では、すぐ切り替わる。
 * 飾りではなく店数の見える化なので、同じ内容を文字（店数）でも別に出している（この canvas は aria-hidden）。
 */
import { useEffect, useRef } from "react";

const INK: [number, number, number] = [21, 17, 14];
const SHU: [number, number, number] = [200, 79, 53];
const NUMERALS = ["壱", "弐", "参"];

export interface PoolProps {
  /** 全店の ID（並び＝点の置き場所） */
  order: readonly string[];
  /** いまの条件に当てはまる店 */
  alive: ReadonlySet<string>;
  /** 選択肢を指しているとき、それを選ぶと残る店 */
  preview: ReadonlySet<string> | null;
  /** 結果に出している店（先頭から 壱・弐・参） */
  picks: readonly string[];
}

interface Dots {
  n: number;
  x: Float32Array;
  y: Float32Array;
  r: Float32Array;
  rt: Float32Array;
  a: Float32Array;
  at: Float32Array;
  c: Float32Array;
  ct: Float32Array;
  ring: Float32Array;
  ringT: Float32Array;
  t0: Float64Array;
  kind: Uint8Array;
}

function hash01(i: number): number {
  let h = Math.imul(i + 1, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

export default function Pool({ order, alive, preview, picks }: PoolProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const props = useRef({ order, alive, preview, picks });
  const api = useRef<{ retarget: () => void } | null>(null);

  useEffect(() => {
    props.current = { order, alive, preview, picks };
    api.current?.retarget();
  }, [order, alive, preview, picks]);

  useEffect(() => {
    const el = wrap.current!;
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = props.current.order.length;
    const D: Dots = {
      n: N,
      x: new Float32Array(N),
      y: new Float32Array(N),
      r: new Float32Array(N),
      rt: new Float32Array(N),
      a: new Float32Array(N),
      at: new Float32Array(N),
      c: new Float32Array(N),
      ct: new Float32Array(N),
      ring: new Float32Array(N),
      ringT: new Float32Array(N),
      t0: new Float64Array(N),
      kind: new Uint8Array(N),
    };
    let W = 0;
    let H = 0;
    let cell = 8;
    let dpr = 1;
    let raf = 0;
    let alive = true;
    let first = true;
    let family = "serif";

    const layout = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      if (W < 4 || H < 4) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      const guess = Math.sqrt((W * H) / Math.max(1, N));
      const cols = Math.max(1, Math.floor(W / guess));
      const rows = Math.ceil(N / cols);
      const cw = W / cols;
      const ch = H / rows;
      cell = Math.min(cw, ch);
      for (let i = 0; i < N; i++) {
        D.x[i] = (i % cols) * cw + cw / 2;
        D.y[i] = Math.floor(i / cols) * ch + ch / 2;
      }
      family = getComputedStyle(el).getPropertyValue("--om-serif").trim() || "serif";
      draw();
    };

    const retarget = () => {
      const { order: ord, alive: al, preview: pv, picks: pk } = props.current;
      const now = performance.now();
      for (let i = 0; i < N; i++) {
        const id = ord[i];
        const isAlive = al.has(id);
        const pickIdx = pk.indexOf(id);
        let kind = 0; // 0 退いた点 1 残った点 2 残るが、指している選択肢では外れる 3 指している選択肢で残る 4 結果の店
        if (pickIdx >= 0) kind = 4;
        else if (isAlive && pv) kind = pv.has(id) ? 3 : 2;
        else if (isAlive) kind = 1;
        else if (pv && pv.has(id)) kind = 3; // 退いた店でも、選び直すと戻る店（質問を見直しているとき）
        const prevKind = D.kind[i];
        const statusChanged = (kind === 0) !== (prevKind === 0);
        D.kind[i] = kind;
        const base = cell;
        switch (kind) {
          case 0:
            D.rt[i] = base * 0.09;
            D.at[i] = 0.3;
            D.ct[i] = 0;
            D.ringT[i] = 0;
            break;
          case 1:
            D.rt[i] = base * 0.34;
            D.at[i] = 0.95;
            D.ct[i] = 0;
            D.ringT[i] = 0;
            break;
          case 2:
            D.rt[i] = base * 0.27;
            D.at[i] = 0.42;
            D.ct[i] = 0;
            D.ringT[i] = 0;
            break;
          case 3:
            D.rt[i] = base * 0.46;
            D.at[i] = 1;
            D.ct[i] = 1;
            D.ringT[i] = 0;
            break;
          default:
            D.rt[i] = base * 0.56;
            D.at[i] = 1;
            D.ct[i] = 1;
            D.ringT[i] = 1;
        }
        if (reduce) {
          D.r[i] = D.rt[i];
          D.a[i] = D.at[i];
          D.c[i] = D.ct[i];
          D.ring[i] = D.ringT[i];
        } else if (first) {
          // 最初の登場: 掲載店の点が、左から右へさざ波のように並ぶ
          D.r[i] = 0;
          D.a[i] = 0;
          D.c[i] = D.ct[i];
          D.ring[i] = D.ringT[i];
        }
        // 店が絞られる/戻るときは、点ごとに少しずつ遅れて動く（さざ波）。指している選択肢の予告は遅れなし
        D.t0[i] = reduce ? 0 : first ? now + 160 + (D.x[i] / Math.max(1, W)) * 700 + hash01(i) * 260 : now + (statusChanged && !pv ? hash01(i) * 320 : 0);
      }
      first = false;
      if (reduce) draw();
      else start();
    };

    const draw = () => {
      if (W < 4) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const r = D.r[i];
        if (r < 0.05) continue;
        const c = D.c[i];
        const rr = INK[0] + (SHU[0] - INK[0]) * c;
        const gg = INK[1] + (SHU[1] - INK[1]) * c;
        const bb = INK[2] + (SHU[2] - INK[2]) * c;
        ctx.fillStyle = `rgba(${rr | 0},${gg | 0},${bb | 0},${D.a[i].toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(D.x[i], D.y[i], r, 0, 6.2832);
        ctx.fill();
        const ring = D.ring[i];
        if (ring > 0.02) {
          ctx.strokeStyle = `rgba(${SHU[0]},${SHU[1]},${SHU[2]},${(ring * 0.9).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(D.x[i], D.y[i], r + 3 + 5 * ring, 0, 6.2832);
          ctx.stroke();
        }
      }
      // 結果の店の番号（点の上）
      const pk = props.current.picks;
      const ord = props.current.order;
      ctx.font = `600 ${Math.max(11, Math.min(15, cell * 1.5))}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const placed: { x: number; y: number }[] = [];
      for (let k = 0; k < pk.length && k < NUMERALS.length; k++) {
        const i = ord.indexOf(pk[k]);
        if (i < 0 || D.ring[i] < 0.5) continue;
        ctx.fillStyle = `rgba(${SHU[0]},${SHU[1]},${SHU[2]},${Math.min(1, D.ring[i]).toFixed(3)})`;
        const x = Math.min(W - 8, Math.max(8, D.x[i]));
        const up = D.y[i] - D.r[i] - 12;
        const down = D.y[i] + D.r[i] + 22;
        // 番号が重ならないように、上に置けなければ下に置く
        const clash = (y: number) => placed.some((q) => Math.abs(q.x - x) < 16 && Math.abs(q.y - y) < 14);
        let ty = up < 12 || clash(up) ? down : up;
        if (clash(ty)) ty = ty === up ? down : up;
        placed.push({ x, y: ty });
        ctx.fillText(NUMERALS[k], x, ty);
      }
    };

    const step = (now: number) => {
      raf = 0;
      if (!alive) return;
      let moving = false;
      const k = 0.14;
      for (let i = 0; i < N; i++) {
        if (now < D.t0[i]) {
          moving = true;
          continue;
        }
        const dr = D.rt[i] - D.r[i];
        const da = D.at[i] - D.a[i];
        const dc = D.ct[i] - D.c[i];
        const dg = D.ringT[i] - D.ring[i];
        if (Math.abs(dr) > 0.02 || Math.abs(da) > 0.004 || Math.abs(dc) > 0.004 || Math.abs(dg) > 0.004) {
          D.r[i] += dr * k;
          D.a[i] += da * k;
          D.c[i] += dc * k;
          D.ring[i] += dg * k;
          moving = true;
        } else {
          D.r[i] = D.rt[i];
          D.a[i] = D.at[i];
          D.c[i] = D.ct[i];
          D.ring[i] = D.ringT[i];
        }
      }
      draw();
      if (moving) raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    api.current = { retarget };
    layout();
    retarget();
    const ro = new ResizeObserver(() => {
      layout();
      retarget();
    });
    ro.observe(el);
    // 文字（番号）のフォントが読み込めたら描き直す
    document.fonts?.ready.then(() => alive && draw());
    return () => {
      alive = false;
      api.current = null;
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="om-pool" ref={wrap} aria-hidden="true">
      <canvas ref={cv} />
    </div>
  );
}
