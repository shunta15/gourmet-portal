"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent as RPointerEvent } from "react";
import type { HubItem } from "@/lib/portal/hub";
import type { Week } from "@/lib/portal/openNow";
import type { HamonShop } from "@/lib/portal/hubs/hamon/shops";
import { HAMON_H1, HAMON_LEAD } from "./copy";

/**
 * 総合トップ案「波紋 HAMON」（コンセプト 4）— 1 軒の店から、青い輪が広がる。
 *
 * 画面の主役は、真ん中の 1 軒の店（丸く切った料理の写真）と、そこから外へ広がる波紋。3 段でできている。
 *   店 : 丸い写真と、その店の名前
 *   街 : 写真を囲む青い輪。その店の街（都道府県と市区町村）の名前が、輪に沿ってゆっくりまわる
 *   輪 : さらに外へ、太さと濃さに差のある青い輪が、画面の外へ出ていく（外へ行くほど間隔は広く、線は細く薄く）
 * 数秒ごとに真ん中の店が替わり、しずくが落ちたように輪が外へ広がる。画面のどこを押しても、そこから輪が広がる。
 * 入るときは、押した所から輪が広がって、青が画面を満たす。
 * 店は、前・次・止めるのボタン、左右の矢印キー、横のスワイプでも替えられる。
 *
 * 描画: 外側の輪は Canvas 2D（rAF は画面に見えていて、タブが前のときだけ回す。React の state は店が替わるときと選んだときだけ書く）。
 *   写真・街の輪・見出しは CSS の transform / opacity / clip-path。
 *   動きを減らす設定・スクリプトなしでは、同じ輪を静的な SVG で見せる（店は自動では替わらない。前・次のボタンでは替えられる）。
 */

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 輪（写真の半径 R を 1 とした半径・線の太さ px・濃さ）。外へ行くほど間隔は広く、線は細く薄く */
const RK = [1.78, 2.24, 2.84, 3.58, 4.5, 5.7, 7.2, 9.1, 11.6];
const RW = [5.2, 4, 3, 2.2, 1.7, 1.3, 1.05, 0.9, 0.8];
const RA = [0.95, 0.84, 0.68, 0.52, 0.39, 0.29, 0.21, 0.15, 0.1];
/** 街の輪（青い帯）の外の縁（R 比）。写真の縁は 1、白い隙間は 1.06 まで */
const BAND = 1.42;
const COB = "31,69,230";
/** 店が替わる間隔（ms）。店名と街を読み切れる長さ */
const INTERVAL = 7200;
/** 最初の入れ替えまで */
const FIRST = 5600;

/* ───────────── 街の輪の文字（輪に沿って、街の名前をくり返す） ───────────── */
function TownText({ label, out }: { label: string; out?: boolean }) {
  const mid = 873; // 帯の真ん中（viewBox の単位。帯は 746〜1000）
  const fs = 118;
  const circ = 2 * Math.PI * mid;
  const unit = Array.from(label).length + 3;
  const k = Math.max(2, Math.round(circ / (unit * fs)));
  const sep = "　・　";
  const id = `hm-tp-${out ? "o" : "i"}`;
  return (
    <svg className={`hm-tt${out ? " out" : ""}`} viewBox="-1000 -1000 2000 2000" aria-hidden="true" focusable="false">
      <path id={id} d={`M 0 ${-mid} A ${mid} ${mid} 0 1 1 0 ${mid} A ${mid} ${mid} 0 1 1 0 ${-mid}`} fill="none" />
      <text fontSize={fs} dominantBaseline="central">
        <textPath href={`#${id}`} textLength={circ.toFixed(1)} lengthAdjust="spacing">
          {(label + sep).repeat(k)}
        </textPath>
      </text>
    </svg>
  );
}

/** 静的な輪（スクリプトなし・動きを減らす設定のとき。Canvas が動き出したら隠す） */
function StaticRings() {
  return (
    <svg className="hm-static" viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">
      {RK.map((k, i) => (
        <circle key={i} r={k} fill="none" stroke={`rgba(${COB},${RA[i]})`} strokeWidth={RW[i]} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

const Chev = ({ dir }: { dir: 1 | -1 }) => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir > 0 ? "M7.5 4.5 13 10l-5.5 5.5" : "M12.5 4.5 7 10l5.5 5.5"} />
  </svg>
);

type Api = {
  enter: (path: string, x: number, y: number) => void;
  step: (d: number) => void;
  toggle: () => void;
  pulse: (x: number, y: number) => void;
};

export default function HamonHub({
  shops,
  items,
  gourmetTotal,
  featureTotal,
  open,
}: {
  shops: HamonShop[];
  items: HubItem[];
  gourmetTotal: number;
  featureTotal: number;
  open: { weeks: Week[]; n: number[] };
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [st, setSt] = useState<{ cur: number; prev: number }>({ cur: 0, prev: -1 });
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [live, setLive] = useState("");
  const [openNow, setOpenNow] = useState<{ open: number; known: number } | null>(null);

  const api = useRef<Api>({ enter: () => {}, step: () => {}, toggle: () => {}, pulse: () => {} });
  const downSel = useRef<number | null>(null);
  const selRef = useRef(0);
  selRef.current = sel;

  const n = shops.length;

  /* ───────────── いま営業中の数（営業時間が確かな店だけ。現在時刻はブラウザで当てる。数え終わるまで、その項目は隠す） ───────────── */
  useEffect(() => {
    let stop = false;
    const calc = async () => {
      const m = await import("@/lib/portal/openNow");
      const now = Date.now();
      let o = 0;
      let k = 0;
      open.weeks.forEach((w, i) => {
        k += open.n[i];
        if (m.isOpenState(m.getOpenStatus(w, now).state)) o += open.n[i];
      });
      if (!stop) setOpenNow({ open: o, known: k });
    };
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const h = ric ? ric(() => void calc(), { timeout: 600 }) : window.setTimeout(() => void calc(), 400);
    const iv = window.setInterval(() => void calc(), 60_000);
    return () => {
      stop = true;
      window.clearInterval(iv);
      if (!ric) window.clearTimeout(h);
    };
  }, [open]);

  /* ───────────── 波紋のエンジン ───────────── */
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const cv = canvasRef.current;
    if (!root || !stage || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;
    if (reduce) setPlaying(false);

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let R = 100;
    let headBottom = 0;
    let raf = 0;
    let running = false;
    let inView = true;
    let paused = false; // 店の写真・名前に触れている間
    let pausedAt = 0;
    let userPaused = reduce; // ボタンで止めた（動きを減らす設定では、最初から自動では替えない）
    let leavingNow = false;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const timers: number[] = [];
    const clicks: { x: number; y: number; t: number; m: number }[] = [];
    const trails: { x: number; y: number; t: number }[] = [];
    let lastTrail = { x: -999, y: -999, t: 0 };

    const t0 = performance.now();
    let kickT = t0 / 1000; // 最後に店が替わった時刻（秒）。最初は読み込み時
    let span = FIRST - 700; // 最初の入れ替えだけ少し早める
    let cycleStart = t0 + 700; // 登場の演出が落ち着いてから数え始める
    let curIdx = 0;

    const measure = () => {
      const r = root.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const s = stage.getBoundingClientRect();
      cx = s.left - r.left + s.width / 2;
      cy = s.top - r.top + s.height / 2;
      R = s.width / 2 / BAND;
      const h1 = root.querySelector<HTMLElement>(".hm-h1");
      headBottom = h1 ? h1.getBoundingClientRect().bottom - r.top : 0;
      // スマホでは、見出しの上の輪をうすくする（CSS の mask が読む）
      root.style.setProperty("--hb", `${headBottom.toFixed(0)}px`);
    };

    const advance = (now: number, dir: number) => {
      const next = (curIdx + dir + n) % n;
      const prevIdx = curIdx;
      curIdx = next;
      kickT = now / 1000;
      cycleStart = now;
      span = INTERVAL;
      // 次の写真を先に読み込んでおく（替わる瞬間にコマを落とさない）
      const imgs = root.querySelectorAll<HTMLImageElement>(".hm-slide img");
      const after = imgs[(next + dir + n) % n];
      if (after && !after.complete) after.loading = "eager";
      setSt({ cur: next, prev: prevIdx });
    };

    const ease4 = (p: number) => 1 - Math.pow(1 - p, 4);

    const draw = (now: number) => {
      const t = now / 1000;
      const ti = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;

      const rings: { r: number; w: number; a: number; ox: number; oy: number }[] = [];
      for (let i = 0; i < RK.length; i++) {
        const delay = 0.45 + i * 0.13;
        const p = clamp01((ti - delay) / 1.8);
        const e = ease4(p);
        let r = RK[i] * R * (0.4 + 0.6 * e) * (1 + 0.0045 * Math.sin(t * 0.9 - i * 0.55));
        let w = RW[i];
        let a = RA[i] * clamp01(p * 2.4);
        // 店が替わると、輪が内側から順に、外へ押される
        const x = (t - kickT - 0.1 * i) / 0.95;
        if (x > 0 && x < 1 && ti > 1.2) {
          const b = Math.pow(Math.sin(Math.PI * x), 2) * (1 - 0.35 * x);
          r += b * (0.07 * R + 0.02 * R * i);
          w += b * 2;
          a = Math.min(1, a + b * 0.28);
        }
        const d = 2 + i * 1.7;
        rings.push({ r, w, a, ox: px * d, oy: py * d });
      }

      // いちばん内側の 2 本のあいだを、うすく塗る（水の厚み）
      {
        const a = rings[0];
        const b = rings[1];
        const ro = Math.max(a.r, b.r);
        const ri = Math.min(a.r, b.r);
        ctx.fillStyle = `rgba(${COB},${0.05 * Math.min(a.a, b.a)})`;
        ctx.beginPath();
        ctx.arc(cx + a.ox, cy + a.oy, ro, 0, Math.PI * 2);
        ctx.arc(cx + a.ox, cy + a.oy, ri, 0, Math.PI * 2, true);
        ctx.fill();
      }

      for (let i = 0; i < rings.length; i++) {
        const q = rings[i];
        if (q.a <= 0.003) continue;
        ctx.strokeStyle = `rgba(${COB},${q.a.toFixed(3)})`;
        ctx.lineWidth = q.w;
        ctx.beginPath();
        ctx.arc(cx + q.ox, cy + q.oy, q.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // しずくの波（街の輪の縁から、画面の外まで）
      {
        const p = (t - kickT) / 2.8;
        if (p > 0 && p < 1 && ti > 1.2) {
          const e = 1 - Math.pow(1 - p, 3);
          ctx.strokeStyle = `rgba(${COB},${(0.55 * Math.pow(1 - p, 1.5)).toFixed(3)})`;
          ctx.lineWidth = 0.7 + 4.2 * (1 - p);
          ctx.beginPath();
          ctx.arc(cx, cy, R * (BAND + 0.05 + 9.9 * e), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 押した所から広がる輪
      for (let i = clicks.length - 1; i >= 0; i--) {
        const c = clicks[i];
        const age = t - c.t;
        if (age > 2.1) {
          clicks.splice(i, 1);
          continue;
        }
        const max = Math.max(280, Math.min(Math.max(W, H) * 0.5, 620)) * c.m;
        for (let k = 0; k < 3; k++) {
          const p = clamp01((age - k * 0.13) / 1.7);
          if (p <= 0) continue;
          const e = 1 - Math.pow(1 - p, 3);
          ctx.strokeStyle = `rgba(${COB},${(0.62 * Math.pow(1 - p, 1.4) * (1 - k * 0.22)).toFixed(3)})`;
          ctx.lineWidth = 0.6 + (3.4 - k * 0.8) * (1 - p);
          ctx.beginPath();
          ctx.arc(c.x, c.y, 6 + max * e * (1 - k * 0.1), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // マウスの通った跡に、小さな輪（指で水に触れたように）
      for (let i = trails.length - 1; i >= 0; i--) {
        const c = trails[i];
        const p = (t - c.t) / 1.4;
        if (p >= 1) {
          trails.splice(i, 1);
          continue;
        }
        const e = 1 - Math.pow(1 - p, 3);
        ctx.strokeStyle = `rgba(${COB},${(0.3 * Math.pow(1 - p, 1.6)).toFixed(3)})`;
        ctx.lineWidth = 0.6 + 1.4 * (1 - p);
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4 + 110 * e, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 次の店までの時間（街の輪の外を、細い線が 1 周する。ボタンで止めたら出さない）
      if (!userPaused) {
        const ar = R * BAND + 9;
        const p = clamp01(((paused ? pausedAt : now) - cycleStart) / span);
        ctx.strokeStyle = `rgba(${COB},0.14)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, ar, 0, Math.PI * 2);
        ctx.stroke();
        if (p > 0.004) {
          ctx.strokeStyle = `rgba(${COB},0.9)`;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, ar, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
          ctx.stroke();
          ctx.lineCap = "butt";
        }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!running) return;
      if (!userPaused && !paused && !leavingNow && now - cycleStart >= span) advance(now, 1);
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce || !inView || document.hidden) return;
      running = true;
      measure();
      root.setAttribute("data-canvas", "1");
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (reduce) {
        stop();
        root.removeAttribute("data-canvas");
      } else if (inView && !document.hidden) {
        if (!running) {
          const now = performance.now();
          cycleStart = Math.max(cycleStart, now - span * 0.5);
          start();
        }
      } else {
        stop();
      }
    };

    const io = new IntersectionObserver(
      (es) => {
        inView = es[es.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(root);
    const onVis = () => sync();
    document.addEventListener("visibilitychange", onVis);
    const onReduce = () => {
      reduce = mq.matches;
      if (reduce) {
        userPaused = true;
        setPlaying(false);
      }
      sync();
    };
    mq.addEventListener("change", onReduce);

    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    ro.observe(stage);

    // 押した所から輪が広がる
    const addClick = (x: number, y: number, m = 1) => {
      if (reduce) return;
      const r = root.getBoundingClientRect();
      clicks.push({ x: x - r.left, y: y - r.top, t: performance.now() / 1000, m });
      if (clicks.length > 6) clicks.shift();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      addClick(e.clientX, e.clientY);
    };
    root.addEventListener("pointerdown", onDown);
    const onMove = (e: PointerEvent) => {
      if (reduce || e.pointerType !== "mouse") return;
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      const now = performance.now();
      if (now - lastTrail.t > 120 && Math.hypot(e.clientX - lastTrail.x, e.clientY - lastTrail.y) > 64 && !(e.target as Element | null)?.closest?.("a, button")) {
        lastTrail = { x: e.clientX, y: e.clientY, t: now };
        trails.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: now / 1000 });
        if (trails.length > 9) trails.shift();
      }
    };
    root.addEventListener("pointermove", onMove);

    // 店の写真・名前に触れている間は、店を替えない
    const hold = (on: boolean) => {
      if (on === paused) return;
      const now = performance.now();
      if (on) {
        paused = true;
        pausedAt = now;
      } else {
        paused = false;
        cycleStart += now - pausedAt;
        pausedAt = 0;
      }
    };
    const onEnter = () => hold(true);
    const onLeave = () => {
      if (!stage.matches(":focus-within")) hold(false);
    };
    const onFocusIn = () => hold(true);
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (!stage.matches(":hover") && !stage.matches(":focus-within")) hold(false);
      }, 0);
    };
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("focusout", onFocusOut);

    // 店を前へ・次へ。矢印キーと、横のスワイプ（指・ペン）でも
    const step = (d: number) => {
      if (leavingNow) return;
      advance(performance.now(), d);
      const s = shops[curIdx];
      if (s) setLive(`${s.name}、${s.pref}${s.town}`);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    stage.addEventListener("keydown", onKey);
    let sw: { x: number; y: number; id: number } | null = null;
    let swallow = false;
    const onSwDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      sw = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const onSwUp = (e: PointerEvent) => {
      if (!sw || e.pointerId !== sw.id) return;
      const dx = e.clientX - sw.x;
      const dy = e.clientY - sw.y;
      sw = null;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        swallow = true;
        window.setTimeout(() => (swallow = false), 0);
        step(dx < 0 ? 1 : -1);
      }
    };
    const onSwClick = (e: Event) => {
      if (swallow) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    stage.addEventListener("pointerdown", onSwDown);
    stage.addEventListener("pointerup", onSwUp);
    stage.addEventListener("click", onSwClick, true);

    const toggle = () => {
      userPaused = !userPaused;
      if (!userPaused) {
        cycleStart = performance.now();
        span = INTERVAL;
      }
      setPlaying(!userPaused);
    };

    // 入る: 押した所から輪が広がって、青が画面を満たす
    api.current = {
      enter: (path, x, y) => {
        if (leavingNow) return;
        leavingNow = true;
        if (reduce) {
          router.push(path);
          return;
        }
        addClick(x, y);
        root.style.setProperty("--wx", `${x.toFixed(0)}px`);
        root.style.setProperty("--wy", `${y.toFixed(0)}px`);
        setLeaving(true);
        timers.push(window.setTimeout(() => router.push(path), 700));
      },
      step,
      toggle,
      pulse: (x, y) => addClick(x, y, 0.3),
    };

    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        leavingNow = false;
        setLeaving(false);
      }
    };
    window.addEventListener("pageshow", onShow);

    measure();
    sync();
    // 登場の演出が終わったら、見出しの切り抜き（下からせり上がる枠）を外す（「。」の輪が枠の外へ広がれるように）
    timers.push(window.setTimeout(() => root.setAttribute("data-ready", "1"), 2200));

    return () => {
      stop();
      timers.forEach((x) => window.clearTimeout(x));
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onReduce);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("focusout", onFocusOut);
      stage.removeEventListener("keydown", onKey);
      stage.removeEventListener("pointerdown", onSwDown);
      stage.removeEventListener("pointerup", onSwUp);
      stage.removeEventListener("click", onSwClick, true);
      window.removeEventListener("pageshow", onShow);
    };
  }, [n, router, shops]);

  // 選んでいる業種の入口を先に読んでおく
  useEffect(() => {
    const it = items[sel];
    if (it?.enter) router.prefetch(it.path);
  }, [sel, items, router]);

  /* ───────────── 操作 ───────────── */
  const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  const centerOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2] as const;
  };
  const choose = useCallback(
    (i: number) => {
      if (selRef.current === i) return false;
      setSel(i);
      const it = items[i];
      setLive(`${it.name}。${it.live ? "掲載中" : it.enter ? "掲載準備中。ページへ入れます" : "掲載準備中"}`);
      return true;
    },
    [items],
  );
  const onGo = (path: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!plain(e)) return;
    e.preventDefault();
    const [x, y] = centerOf(e.currentTarget);
    api.current.enter(path, x, y);
  };
  const onDoorClick = (i: number) => (e: MouseEvent<HTMLElement>) => {
    const was = downSel.current;
    downSel.current = null;
    if (!plain(e)) return;
    e.preventDefault();
    if (!items[i].enter) {
      choose(i);
      return;
    }
    // マウス・タッチ: 選んでいない業種は、まず選ぶ（状態と数字が出る）。選んでいたら入る。キーボード: そのまま入る
    if (was !== null && was !== i) {
      if (choose(i)) {
        const [x, y] = centerOf(e.currentTarget.querySelector(".dc") ?? e.currentTarget);
        api.current.pulse(x, y);
      }
      return;
    }
    const [x, y] = centerOf(e.currentTarget);
    api.current.enter(items[i].path, x, y);
  };
  const onDoorHover = (i: number) => (e: RPointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && choose(i)) {
      const [x, y] = centerOf(e.currentTarget.querySelector(".dc") ?? e.currentTarget);
      api.current.pulse(x, y);
    }
  };

  const shop = shops[st.cur];
  const shopHref = shop ? `/restaurant/${shop.id}` : "/gourmet";
  const label = shop ? `${shop.pref}${shop.town}` : "";

  return (
    <section ref={rootRef} className={`hm${leaving ? " is-leaving" : ""}`} aria-labelledby="hm-h1">
      <canvas ref={canvasRef} className="hm-cv" aria-hidden="true" />
      <noscript>
        <style>{".hm-static{opacity:1!important}"}</style>
      </noscript>

      <header className="hm-bar">
        <Link href="/" className="hm-logo" aria-label="マチノワ" aria-current="page">
          <span className="ja">マチノワ</span>
          <span className="en">Machinowa</span>
        </Link>
        <Link href="/find" prefetch={false} className="hm-find">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" strokeLinecap="round" />
          </svg>
          <span>さがす</span>
        </Link>
      </header>

      {/* ───── 左: 見出し・リード・業種の入口 ───── */}
      <div className="hm-left">
        <div className="hm-head">
          <h1 id="hm-h1" className="hm-h1">
            {HAMON_H1.map((ln, i) => {
              const body = ln.slice(0, -1);
              return (
                <span key={ln} className={`ln l${i + 1}`} style={{ ["--i" as string]: i } as CSSProperties}>
                  <span className="tx">
                    {body}
                    <span className="mk" key={st.cur}>
                      {ln.slice(-1)}
                    </span>
                  </span>
                </span>
              );
            })}
          </h1>
          <p className="hm-lead">{HAMON_LEAD}</p>
        </div>

        <div className="hm-ent">
          <div className="hm-dets" data-sel={sel}>
            {items.map((it, i) => (
              <div key={it.key} className="hm-det" data-on={i === sel ? "" : undefined} data-s={it.live ? "live" : it.enter ? "go" : "soon"}>
                <p className="st">
                  <i aria-hidden="true" />
                  {it.live ? "掲載中" : "掲載準備中"}
                </p>
                {it.key === "gourmet" ? (
                  <p className="facts">
                    <span>
                      <b>{fmt(gourmetTotal)}</b>店
                    </span>
                    <span>
                      特集<b>{featureTotal}</b>本
                    </span>
                    <span className="op" data-on={openNow ? "" : undefined} aria-hidden={openNow ? undefined : true}>
                      いま営業中<b>{openNow ? fmt(openNow.open) : "000"}</b>軒<small>営業時間が確かな{openNow ? fmt(openNow.known) : "000"}店のうち</small>
                    </span>
                  </p>
                ) : null}
                {it.enter && (
                  <Link href={it.path} prefetch={false} className="go" onClick={onGo(it.path)} tabIndex={i === sel ? 0 : -1}>
                    {it.live ? `${it.name}に入る` : "ページを見る"}
                    <i aria-hidden="true">→</i>
                  </Link>
                )}
              </div>
            ))}
          </div>

          <nav className="hm-doors" aria-label="業種の入口">
            <ul>
              {items.map((it, i) => {
                const on = i === sel;
                const kind = it.live ? "live" : it.enter ? "go" : "soon";
                const body = (
                  <>
                    <span className="dc" aria-hidden="true" />
                    <span className="nm">
                      {it.lines.map((ln, li) => (
                        <span key={li}>{ln}</span>
                      ))}
                    </span>
                  </>
                );
                const aria = `${it.name}（${it.live ? "掲載中" : it.enter ? "掲載準備中・ページへ入れます" : "掲載準備中"}）`;
                return (
                  <li key={it.key} data-on={on ? "" : undefined} data-s={kind}>
                    {it.enter ? (
                      <Link
                        href={it.path}
                        prefetch={false}
                        aria-label={aria}
                        aria-current={on ? "true" : undefined}
                        onPointerDown={() => (downSel.current = selRef.current)}
                        onPointerEnter={onDoorHover(i)}
                        onFocus={() => choose(i)}
                        onClick={onDoorClick(i)}
                      >
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        aria-label={aria}
                        aria-current={on ? "true" : undefined}
                        onPointerDown={() => (downSel.current = selRef.current)}
                        onPointerEnter={onDoorHover(i)}
                        onFocus={() => choose(i)}
                        onClick={onDoorClick(i)}
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* ───── 主役: 店（写真）→ 街（青い輪）→ 輪（画面の外まで） ───── */}
      <div className="hm-stage" ref={stageRef} role="group" aria-roledescription="スライド" aria-label="掲載店">
        <div className="hm-glow" aria-hidden="true" />
        <StaticRings />
        <div className="hm-band" aria-hidden="true" />
        <div className="hm-spin" aria-hidden="true">
          {st.prev >= 0 && shops[st.prev] && <TownText key={`o${st.prev}`} label={`${shops[st.prev].pref}${shops[st.prev].town}`} out />}
          {shop && <TownText key={`i${st.cur}`} label={label} />}
        </div>
        <div className="hm-gap" aria-hidden="true" />
        <div className="hm-photo">
          {shops.map((s, i) => (
            <span key={s.id} className={`hm-slide${i === st.cur ? " cur" : i === st.prev ? " prev" : ""}`} aria-hidden={i === st.cur ? undefined : true}>
              <img
                src={s.src}
                srcSet={s.srcSet}
                sizes="(min-width: 800px) 430px, 78vw"
                alt={i === st.cur ? `${s.name}（${s.pref}${s.town}）` : ""}
                width={800}
                height={800}
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                draggable={false}
                style={{ ["--z" as string]: s.z, objectPosition: `${s.x}% ${s.y}%` } as CSSProperties}
              />
            </span>
          ))}
          <Link href={shopHref} prefetch={false} className="hm-photolink" tabIndex={-1} aria-hidden="true" />
        </div>
        <div className="hm-side">
          {shop && (
            <Link href={shopHref} prefetch={false} className="hm-tag" aria-label={`${shop.name}（${shop.pref}${shop.town}）の店のページへ`}>
              <span className="hm-tag-in" key={st.cur}>
                <span className="k">掲載店から</span>
                <span className="nm">{shop.name}</span>
                <span className="go">
                  店のページへ<i aria-hidden="true">→</i>
                </span>
              </span>
            </Link>
          )}
          <div className="hm-ctl">
            <button type="button" className="pv" title="前の店" aria-label="前の店" onClick={() => api.current.step(-1)}>
              <Chev dir={-1} />
            </button>
            <button type="button" className="tg" title={playing ? "自動で替わるのを止める" : "自動で替える"} aria-label={playing ? "自動で替わるのを止める" : "自動で替える"} aria-pressed={!playing} onClick={() => api.current.toggle()}>
              {playing ? (
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="currentColor">
                  <rect x="4.5" y="3.5" width="3.8" height="13" rx="1.2" />
                  <rect x="11.7" y="3.5" width="3.8" height="13" rx="1.2" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="currentColor">
                  <path d="M6 3.6v12.8a.8.8 0 0 0 1.2.7l10-6.4a.8.8 0 0 0 0-1.4l-10-6.4A.8.8 0 0 0 6 3.6Z" />
                </svg>
              )}
            </button>
            <button type="button" className="nx" title="次の店" aria-label="次の店" onClick={() => api.current.step(1)}>
              <Chev dir={1} />
            </button>
          </div>
        </div>
      </div>

      <a className="hm-cue" href="#hm-statement" aria-label="下の本文へ">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3.5v13M4.5 11 10 16.5 15.5 11" />
        </svg>
      </a>
      <p className="mp-sr" role="status" aria-live="polite">
        {live}
      </p>
      <div className="hm-wipe" aria-hidden="true" />
    </section>
  );
}
