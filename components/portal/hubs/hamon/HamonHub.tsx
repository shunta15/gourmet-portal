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
 *
 * 描画: 外側の輪は Canvas 2D（rAF は画面に見えていて、タブが前のときだけ回す。React の state は店が替わるときと選んだときだけ書く）。
 *   写真・街の輪・見出しは CSS の transform / opacity / clip-path。
 *   動きを減らす設定・スクリプトなしでは、同じ輪を静的な SVG で見せる（店は 1 軒目のまま。業種の入口は同じところへ届く）。
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
/** 店が替わる間隔（ms） */
const INTERVAL = 5600;

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

type Api = {
  enter: (path: string, x: number, y: number) => void;
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
  const [leaving, setLeaving] = useState(false);
  const [live, setLive] = useState("");
  const [openNow, setOpenNow] = useState<{ open: number; known: number } | null>(null);

  const api = useRef<Api>({ enter: () => {} });
  const downSel = useRef<number | null>(null);
  const selRef = useRef(0);
  selRef.current = sel;

  const n = shops.length;

  /* ───────────── いま営業中の数（営業時間が確かな店だけ。現在時刻はブラウザで当てる） ───────────── */
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
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback;
    const h = ric ? ric(() => void calc()) : window.setTimeout(() => void calc(), 400);
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

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let R = 100;
    let raf = 0;
    let running = false;
    let inView = true;
    let paused = false;
    let pausedAt = 0;
    let leavingNow = false;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const timers: number[] = [];
    const clicks: { x: number; y: number; t: number }[] = [];

    const t0 = performance.now();
    let kickT = (t0 - 0) / 1000; // 最後に店が替わった時刻（秒）。最初は読み込み時
    let span = 4300; // 最初の入れ替えだけ少し早める
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
    };

    const advance = (now: number) => {
      const next = (curIdx + 1) % n;
      const prevIdx = curIdx;
      curIdx = next;
      kickT = now / 1000;
      cycleStart = now;
      span = INTERVAL;
      // 次の写真を先に読み込んでおく（替わる瞬間にコマを落とさない）
      const after = root.querySelectorAll<HTMLImageElement>(".hm-slide img")[(next + 1) % n];
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

      // 水のにじみ（中心から外へ、うすい青）
      const gr = ctx.createRadialGradient(cx, cy, R * BAND, cx, cy, R * 3.9);
      gr.addColorStop(0, `rgba(${COB},0.11)`);
      gr.addColorStop(1, `rgba(${COB},0)`);
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 3.9, 0, Math.PI * 2);
      ctx.fill();

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

      // 見出しのある左側は、輪をうすくして文字を読みやすくする（右へ行くほど、もとの濃さ）
      ctx.globalCompositeOperation = "destination-out";
      const mk = ctx.createLinearGradient(0, 0, Math.min(W * 0.66, cx), 0);
      mk.addColorStop(0, "rgba(0,0,0,0.62)");
      mk.addColorStop(0.62, "rgba(0,0,0,0.5)");
      mk.addColorStop(1, "rgba(0,0,0,0)");
      if (W >= 800) {
        ctx.fillStyle = mk;
        ctx.fillRect(0, 0, Math.min(W * 0.66, cx), H);
      }
      ctx.globalCompositeOperation = "source-over";

      // 押した所から広がる輪
      for (let i = clicks.length - 1; i >= 0; i--) {
        const c = clicks[i];
        const age = t - c.t;
        if (age > 2.1) {
          clicks.splice(i, 1);
          continue;
        }
        const max = Math.max(280, Math.min(Math.max(W, H) * 0.5, 620));
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

      // 次の店までの時間（街の輪の外を、細い線が 1 周する）
      {
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
      if (!paused && !leavingNow && now - cycleStart >= span) advance(now);
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
      sync();
    };
    mq.addEventListener("change", onReduce);

    const ro = new ResizeObserver(() => {
      measure();
      if (!running && !reduce) {
        /* 止まっているときは、次に動くときに測り直す */
      }
    });
    ro.observe(root);
    ro.observe(stage);

    // 押した所から輪が広がる
    const addClick = (x: number, y: number) => {
      if (reduce) return;
      const r = root.getBoundingClientRect();
      clicks.push({ x: x - r.left, y: y - r.top, t: performance.now() / 1000 });
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
      window.removeEventListener("pageshow", onShow);
    };
  }, [n, router]);

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
      if (selRef.current === i) return;
      setSel(i);
      const it = items[i];
      setLive(`${it.name}。${it.live ? "掲載中" : it.enter ? "掲載準備中。ページへ入れます" : "掲載準備中"}`);
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
      choose(i);
      return;
    }
    const [x, y] = centerOf(e.currentTarget);
    api.current.enter(items[i].path, x, y);
  };
  const onDoorHover = (i: number) => (e: RPointerEvent) => {
    if (e.pointerType === "mouse") choose(i);
  };

  const shop = shops[st.cur];
  const shopHref = shop ? `/restaurant/${shop.id}` : "/gourmet";
  const label = shop ? `${shop.pref}${shop.town}` : "";

  return (
    <section ref={rootRef} className={`hm${leaving ? " is-leaving" : ""}`} aria-labelledby="hm-h1" style={{ ["--n" as string]: n } as CSSProperties}>
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

      {/* ───── 主役: 店（写真）→ 街（青い輪）→ 輪（画面の外まで） ───── */}
      <div className="hm-stage" ref={stageRef}>
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
        {shop && (
          <Link href={shopHref} prefetch={false} className="hm-tag">
            <span className="hm-tag-in" key={st.cur}>
              <span className="k">掲載店から</span>
              <span className="nm">{shop.name}</span>
              <span className="go">
                店のページへ<i aria-hidden="true">→</i>
              </span>
            </span>
          </Link>
        )}
      </div>

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
                    <span className="op" data-on={openNow ? "" : undefined}>
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
                    <span className="dc" aria-hidden="true">
                      <em>{it.en}</em>
                    </span>
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

      <p className="mp-sr" role="status" aria-live="polite">
        {live}
      </p>
      <div className="hm-wipe" aria-hidden="true" />
    </section>
  );
}
