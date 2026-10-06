"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import type { HubItem } from "@/lib/portal/hub";
import type { Week } from "@/lib/portal/openNow";

/**
 * 総合トップ「輪」— 回して選ぶ、1画面の入口（クライアント）。
 *
 * 輪は6つの業種を時計まわりに並べた大きな円で、下から半分ほど見える。回し方は ドラッグ・スワイプ（横）・ホイール（輪の上）・矢印キー・左右の矢印ボタン。
 * 位置 pos は「業種いくつぶん」の小数（1 = 60°）。指で動かしている間は指に付いてきて、離すと慣性＋バネでいちばん近い業種に止まる（わずかに行き過ぎて戻る）。
 * 描画は pos だけから決まり、毎フレーム CSS 変数と transform を直接書く（React は再描画しない）。動いていないときはループを止める。
 * 正面に来た業種を React の state（active）に反映するのは、正面が変わったときだけ。
 *
 * 動きを減らす設定（prefers-reduced-motion）では輪を回さず、業種の一覧として見せる（CSS が切り替え、ここではエンジンを動かさない）。
 * 準備中の業種（ペット・おでかけ・ステイ）は輪の上では薄く、正面に来ても「掲載準備中」と出すだけで、リンクにしない。
 */

const N = 6;
const mod = (n: number) => ((n % N) + N) % N;
/** i - pos を (-N/2, N/2] に折り返す（正面からの相対位置。+ は右） */
const rel = (d: number) => {
  const m = ((d % N) + N) % N;
  return m > N / 2 ? m - N : m;
};
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, (x - 0.12) / 0.76));
  return t * t * (3 - 2 * t);
};
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** バネ（1 = 1 業種）。ωn ≈ 9.7rad/s・ζ ≈ 0.76 で、1つぶんの移動で 3% ほど行き過ぎて戻る */
const SPRING_K = 94;
const SPRING_C = 14.8;

/* ───────────── 輪の飾り（静的 SVG。R = 1000 の座標。中心が (0,0)、上が 0°、時計まわり） ───────────── */

const P = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)] as const;
};
const f1 = (n: number) => n.toFixed(1);

function Decor({ svgRef, rotRef }: { svgRef: React.Ref<SVGSVGElement>; rotRef: React.Ref<HTMLDivElement> }) {
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i < 120; i++) {
    const deg = i * 3;
    const major = i % 10 === 0;
    const [x1, y1] = P(deg, major ? 920 : 956);
    const [x2, y2] = P(deg, 982);
    ticks.push(<line key={i} x1={f1(x1)} y1={f1(y1)} x2={f1(x2)} y2={f1(y2)} className={major ? "mj" : undefined} />);
  }
  const spokes: React.ReactNode[] = [];
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const [x1, y1] = P(i * 60, 600);
    const [x2, y2] = P(i * 60, 900);
    spokes.push(<line key={i} x1={f1(x1)} y1={f1(y1)} x2={f1(x2)} y2={f1(y2)} />);
    const [dx, dy] = P(i * 60, 740);
    dots.push(<circle key={i} cx={f1(dx)} cy={f1(dy)} r="20" />);
  }
  const phrase = "MACHINOWA ・ マチノワ ・ 街の輪 ・ ";
  const box = "-1000 -1000 2000 2000";
  return (
    <>
      {/* 回らない円（外側の点線・内側の細い円） */}
      <svg ref={svgRef} className="hub-decor" viewBox={box} aria-hidden="true" focusable="false">
        <circle r="1032" className="out" />
        <circle r="560" className="in" />
      </svg>
      {/* 回る層（目盛り・スポーク・文字の輪）。輪を回すたびに、この div の rotate だけを書く */}
      <div ref={rotRef} className="hub-decor hub-rot" aria-hidden="true">
        <svg viewBox={box} focusable="false">
          <g className="tk">{ticks}</g>
          <g className="sp">
            {spokes}
            {dots}
          </g>
        </svg>
        <svg viewBox={box} className="tx" focusable="false">
          <path id="hub-tp" d="M 0 -850 A 850 850 0 1 1 0 850 A 850 850 0 1 1 0 -850" fill="none" />
          <text>
            <textPath href="#hub-tp" textLength="5340" lengthAdjust="spacing">
              {phrase.repeat(8)}
            </textPath>
          </text>
        </svg>
      </div>
    </>
  );
}

function Chars({ text, base }: { text: string; base: number }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} className="ch" style={{ ["--ci" as string]: base + i } as CSSProperties}>
          {c}
        </span>
      ))}
    </>
  );
}

const Arrow = ({ dir }: { dir: 1 | -1 }) => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir > 0 ? "M7.5 4.5 13 10l-5.5 5.5" : "M12.5 4.5 7 10l5.5 5.5"} />
  </svg>
);

export default function HubStage({
  items,
  gourmetTotal,
  featureTotal,
  open,
}: {
  items: HubItem[];
  gourmetTotal: number;
  featureTotal: number;
  open: { weeks: Week[]; n: number[] };
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<SVGSVGElement>(null);
  const rotRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [live, setLive] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [openNow, setOpenNow] = useState<{ open: number; known: number } | null>(null);

  // エンジンの外から呼ぶための口（effect が埋める）
  const api = useRef({
    step: (_d: number) => {},
    goTo: (_i: number) => {},
    enter: (_i: number) => {},
    front: (): number => 0,
    nudge: () => {},
  });
  const downFront = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const enter = useCallback((i: number) => api.current.enter(i), []);

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

  /* ───────────── 輪のエンジン ───────────── */
  useEffect(() => {
    const root = rootRef.current;
    const decor = decorRef.current;
    const rotEl = rotRef.current;
    if (!root || !decor || !rotEl) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>(".hub-panel"));
    const seals = Array.from(root.querySelectorAll<HTMLElement>(".hub-seal"));
    const marks = Array.from(root.querySelectorAll<HTMLElement>(".mk"));
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;

    let pos = 0;
    let vel = 0;
    let target = 0;
    let dragging = false;
    let raf = 0;
    let last = 0;
    let R = 400;
    let stepPx = 300;
    let shiftPx = 360;
    let front = 0;
    let lastA = -1;
    let lastB = -1;
    let interacted = false;
    let leavingNow = false;
    const timers: number[] = [];

    const measure = () => {
      R = decor.getBoundingClientRect().width / 2 || 400;
      stepPx = Math.max(150, Math.min(R * (Math.PI / 3) * 0.64, 380));
      shiftPx = Math.min(window.innerWidth * 0.34, 480);
    };

    const render = () => {
      const base = Math.floor(pos);
      const frac = pos - base;
      const ia = mod(base);
      const ib = mod(base + 1);
      root.style.setProperty("--m", smooth(frac).toFixed(4));
      if (ia !== lastA || ib !== lastB) {
        lastA = ia;
        lastB = ib;
        root.style.setProperty("--a", items[ia].color);
        root.style.setProperty("--al", items[ia].light);
        root.style.setProperty("--b", items[ib].color);
        root.style.setProperty("--bl", items[ib].light);
      }
      const phi = -pos * 60;
      rotEl.style.transform = `rotate(${phi.toFixed(3)}deg)`;
      const sway = Math.max(-1, Math.min(1, vel / 3.2));
      seals.forEach((el, i) => {
        const t = rel(i - pos);
        const a = Math.abs(t);
        const fr = Math.max(0, 1 - a); // 正面らしさ 0〜1
        const e = fr * fr * (3 - 2 * fr);
        el.style.setProperty("--ang", `${(t * 60).toFixed(3)}deg`);
        el.style.setProperty("--k", (1 + 0.7 * e).toFixed(4));
        el.style.setProperty("--f", e.toFixed(3));
        el.style.setProperty("--tilt", `${(sway * 7 * (0.4 + e * 0.6)).toFixed(2)}deg`);
      });
      panels.forEach((el, i) => {
        const t = rel(i - pos);
        const a = Math.abs(t);
        // 少し揺れたくらいでは、名前を薄くしない（輪をほんの少し揺らして知らせるときに、名前は動いても読める）
        const o = a < 0.1 ? 1 : Math.max(0, 1 - (a - 0.1) * 2.5);
        if (a < 0.5) {
          el.setAttribute("data-vis", "");
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translate3d(${(t * shiftPx).toFixed(1)}px,0,0)`;
          el.style.setProperty("--sw", (sway * -10).toFixed(2));
          el.style.setProperty("--sk", (sway * -5).toFixed(2));
        } else {
          el.removeAttribute("data-vis");
          el.style.opacity = "0";
        }
      });
      marks.forEach((el, i) => {
        const t = rel(i - pos);
        const a = Math.abs(t);
        if (a < 0.7) {
          el.setAttribute("data-vis", "");
          el.style.opacity = Math.max(0, 1 - a * 1.5).toFixed(3);
          el.style.transform = `translate3d(calc(-50% + ${(t * 34).toFixed(2)}%), -50%, 0)`;
        } else {
          el.removeAttribute("data-vis");
          el.style.opacity = "0";
        }
      });
      const fi = mod(Math.round(pos));
      if (fi !== front) {
        front = fi;
        setActive(fi);
        const seal = seals[fi];
        if (seal && !reduce) {
          seal.classList.remove("pop");
          void seal.offsetWidth;
          seal.classList.add("pop");
        }
        try {
          if (interacted) navigator.vibrate?.(7);
        } catch {
          /* 振動に対応していない端末では何もしない */
        }
        if (interacted) setLive(`${items[fi].name}。${items[fi].enter ? (items[fi].live ? "掲載中" : "準備中。ページへ入れます") : "準備中"}`);
      }
      panels.forEach((el, i) => (i === fi ? el.setAttribute("data-on", "") : el.removeAttribute("data-on")));
    };

    let spinOff = 0;
    const spinning = (on: boolean) => {
      window.clearTimeout(spinOff);
      if (on) root.classList.add("is-spinning");
      else spinOff = window.setTimeout(() => root.classList.remove("is-spinning"), 160);
    };
    const settle = () => {
      // 位置が大きくなりすぎないように、整数の周回ぶんを戻す
      const w = Math.round(pos / N) * N;
      if (w !== 0) {
        pos -= w;
        target -= w;
        render();
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!dragging) {
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
      render();
      if (dragging || pos !== target || vel !== 0) raf = requestAnimationFrame(tick);
      else {
        settle();
        spinning(false);
      }
    };
    const kick = () => {
      if (raf || reduce) return;
      last = performance.now();
      spinning(true);
      raf = requestAnimationFrame(tick);
    };

    const step = (d: number) => {
      interacted = true;
      root.classList.add("is-touched");
      target = Math.round(target) + d;
      kick();
    };
    const goTo = (i: number) => {
      const base = Math.round(target);
      const diff = rel(i - base);
      if (diff === 0) return;
      target = base + diff;
      kick();
    };
    /** 離したときに止まる業種。いまの位置＋少し先（慣性）をいちばん近い業種に丸める。軽く弾いただけでも、つかんだときの業種から1つは動く */
    const chooseTarget = (from: number) => {
      const proj = pos + vel * 0.19;
      let tg = Math.round(proj);
      if (tg === from && Math.abs(vel) > 0.9) tg = from + Math.sign(vel);
      return Math.max(from - 4, Math.min(from + 4, tg));
    };

    const nudge = () => {
      const el = root.querySelector<HTMLElement>(".hub-panel[data-on] .hub-name");
      const seal = seals[mod(Math.round(target))];
      for (const x of [el, seal]) {
        if (!x) continue;
        x.classList.remove("nudge");
        void x.offsetWidth;
        x.classList.add("nudge");
      }
      const it = items[mod(Math.round(target))];
      setLive(`${it.name}は掲載準備中です`);
    };

    const enterVertical = (i: number) => {
      const it = items[i];
      if (!it.enter) {
        nudge();
        return;
      }
      if (leavingNow) return;
      leavingNow = true;
      if (reduce) {
        router.push(it.path);
        return;
      }
      const seal = seals[i];
      const r = (seal ?? root).getBoundingClientRect();
      root.style.setProperty("--wx", `${(r.left + r.width / 2).toFixed(0)}px`);
      root.style.setProperty("--wy", `${(r.top + r.height / 2).toFixed(0)}px`);
      setLeaving(true);
      timers.push(window.setTimeout(() => router.push(it.path), 640));
    };

    api.current = { step, goTo, enter: enterVertical, front: () => mod(Math.round(target)), nudge };

    /* ── ポインタ（ドラッグ・スワイプ） ── */
    type Sample = { t: number; p: number };
    let drag: { id: number; x0: number; y0: number; pos0: number; on: boolean; s: Sample[] } | null = null;
    const touch = () => {
      interacted = true;
      root.classList.add("is-touched");
    };
    const onDown = (e: PointerEvent) => {
      if (reduce || leavingNow) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as Element | null)?.closest("[data-nodrag]")) return;
      touch();
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: pos, on: false, s: [{ t: e.timeStamp, p: pos }] };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) < 7) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.1) {
          drag = null; // 縦の動き（スクロール）
          return;
        }
        drag.on = true;
        dragging = true;
        suppressClick.current = true;
        target = pos;
        vel = 0;
        try {
          root.setPointerCapture(e.pointerId);
        } catch {
          /* 取れなくても動く */
        }
        root.classList.add("is-drag");
        kick();
      }
      pos = drag.pos0 - dx / stepPx;
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
        vel = Math.max(-9, Math.min(9, vel));
        dragging = false;
        target = chooseTarget(Math.round(drag.pos0));
        root.classList.remove("is-drag");
        window.setTimeout(() => (suppressClick.current = false), 0);
        kick();
      }
      drag = null;
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    /* ── ホイール（輪の上だけ。ほかの場所ではページがスクロールする） ── */
    let wAcc = 0;
    let wLast = 0;
    let wLock = 0;
    const dial = dialRef.current;
    const onWheel = (e: WheelEvent) => {
      // ページが少しでもスクロールされているときは、輪の上でもページを動かす（名前のあたりでスクロールし始めて、輪が指の下に来たときに輪が回り出さないように）
      if (reduce || leavingNow || e.ctrlKey || window.scrollY > 8) return;
      e.preventDefault();
      const now = performance.now();
      if (now - wLast > 170) wAcc = 0;
      wLast = now;
      if (now < wLock) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wAcc += d;
      if (Math.abs(wAcc) >= 26) {
        step(wAcc > 0 ? 1 : -1);
        wAcc = 0;
        wLock = now + 440;
      }
    };
    dial?.addEventListener("wheel", onWheel, { passive: false });

    /* ── 矢印キー（輪にフォーカスが無くても。入力欄の中は除く） ── */
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (reduce || leavingNow || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const r = root.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.5 || r.top > window.innerHeight * 0.5) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);

    const onReduce = () => {
      reduce = mq.matches;
      if (reduce) {
        cancelAnimationFrame(raf);
        raf = 0;
        pos = target = Math.round(target);
        vel = 0;
        panels.forEach((el) => {
          el.style.opacity = "";
          el.style.transform = "";
          el.removeAttribute("data-vis");
        });
      } else {
        render();
      }
    };
    mq.addEventListener("change", onReduce);

    // 細かい視差（マウスのときだけ）。名前のブロックが、ポインタと逆向きにほんの少し動く
    const onHover = (e: PointerEvent) => {
      if (reduce || e.pointerType !== "mouse") return;
      const r = root.getBoundingClientRect();
      root.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      root.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    };
    root.addEventListener("pointermove", onHover);

    const ro = new ResizeObserver(() => measure());
    ro.observe(decor);
    measure();
    if (!reduce) render();

    // 登場の演出のあと、マスクを外す。しばらく触られなければ、輪を少しだけ揺らして回せることを知らせる
    timers.push(window.setTimeout(() => root.classList.add("is-ready"), 1900));
    timers.push(
      window.setTimeout(() => {
        if (!interacted && !reduce && !document.hidden) {
          vel = 1.1;
          kick();
        }
      }, 3600),
    );

    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        leavingNow = false;
        setLeaving(false);
      }
    };
    window.addEventListener("pageshow", onShow);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(spinOff);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointermove", onHover);
      dial?.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pageshow", onShow);
      mq.removeEventListener("change", onReduce);
      ro.disconnect();
    };
  }, [items, router]);

  // 正面の業種の入口を先に読んでおく
  useEffect(() => {
    const it = items[active];
    if (it?.enter) router.prefetch(it.path);
  }, [active, items, router]);

  /* ───────────── リンクの扱い（修飾キー付き・中クリックはブラウザに任せる） ───────────── */
  const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  const onGo = (i: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!plain(e)) return;
    e.preventDefault();
    enter(i);
  };
  const onIndexClick = (i: number) => (e: MouseEvent<HTMLElement>) => {
    const wasFront = downFront.current;
    downFront.current = null;
    if (!plain(e)) return;
    if (!items[i].enter) {
      e.preventDefault();
      if (wasFront === null || wasFront === i) api.current.nudge();
      else api.current.goTo(i);
      return;
    }
    e.preventDefault();
    // マウス・タッチ: 正面でない業種は、まず輪を回してそこへ。正面ならそのまま入る。キーボード（押していない）: そのまま入る
    if (wasFront !== null && wasFront !== i) api.current.goTo(i);
    else enter(i);
  };
  const onSliderKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") api.current.step(1);
    else if (k === "ArrowLeft" || k === "ArrowDown") api.current.step(-1);
    else if (k === "Home") api.current.goTo(0);
    else if (k === "End") api.current.goTo(N - 1);
    else if (k === "Enter" || k === " ") enter(api.current.front());
    else return;
    e.preventDefault();
  };

  const cur = items[active];
  const rootStyle = {
    ["--a" as string]: items[0].color,
    ["--al" as string]: items[0].light,
    ["--b" as string]: items[1].color,
    ["--bl" as string]: items[1].light,
    ["--m" as string]: 0,
  } as CSSProperties;

  return (
    <section ref={rootRef} className={`hub${leaving ? " is-leaving" : ""}`} style={rootStyle} aria-labelledby="hub-h1" onClickCapture={(e) => suppressClick.current && (e.preventDefault(), e.stopPropagation())}>
      <header className="hub-bar" data-nodrag>
        <Link href="/" className="mp-hd-logo" aria-label="マチノワ" aria-current="page" data-cursor="HOME">
          <span className="ja">マチノワ</span>
          <span className="en">Machinowa</span>
        </Link>
        <h1 id="hub-h1" className="hub-h1">
          街の店を、業種をまたいで探す。
        </h1>
        <Link href="/find" prefetch={false} className="hub-find" data-cursor="SEARCH">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" strokeLinecap="round" />
          </svg>
          <span>さがす</span>
          <small>駅・エリア・店名</small>
        </Link>
      </header>

      <div className="hub-main">
        <div className="hub-panels">
          {items.map((it, i) => (
            <article
              key={it.key}
              className="hub-panel"
              data-i={i}
              data-n={it.name.length}
              data-lines={it.lines.length}
              {...(i === 0 ? { "data-vis": "", "data-on": "" } : {})}
              style={{ ["--n" as string]: it.name.length, ["--ac" as string]: it.color } as CSSProperties}
            >
              <p className="hub-kick">
                <span className="no">
                  0{i + 1}
                  <i> / 06</i>
                </span>
                <em>{it.en}</em>
              </p>
              <h2
                className="hub-name"
                aria-label={it.name}
                data-cursor={it.enter ? "ENTER" : undefined}
                onClick={() => i === api.current.front() && enter(i)}
              >
                {it.lines.map((ln, li) => (
                  <span className="ln" key={li} aria-hidden="true">
                    <span className="chs">
                      <Chars text={ln} base={it.lines.slice(0, li).join("").length} />
                    </span>
                  </span>
                ))}
              </h2>
              <div className={`hub-meta${it.enter ? "" : " no-go"}`}>
                <p className={`mp-state${it.live ? " live" : ""}`}>
                  <i aria-hidden="true" />
                  {it.live ? "掲載中" : "掲載準備中"}
                </p>
                {it.key === "gourmet" ? (
                  <p className="hub-facts">
                    <span>
                      <b>{fmt(gourmetTotal)}</b>店
                    </span>
                    <span>
                      特集<b>{featureTotal}</b>本
                    </span>
                    <span className="hub-open" data-on={openNow ? "" : undefined}>
                      いま営業中<b>{openNow ? fmt(openNow.open) : "000"}</b>軒
                      <small>営業時間が確かな{openNow ? fmt(openNow.known) : "000"}店のうち</small>
                    </span>
                  </p>
                ) : (
                  <p className="hub-cats">
                    {it.cats.map((c, ci) => (
                      <span key={c}>
                        {c}
                        {ci < it.cats.length - 1 ? "・" : ""}
                      </span>
                    ))}
                  </p>
                )}
                {it.enter && (
                  <Link href={it.path} prefetch={false} className="hub-go" onClick={onGo(i)} data-cursor="ENTER">
                    {it.live ? `${it.name}に入る` : "ページを見る"}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hub-dial" ref={dialRef} data-cursor="DRAG">
        <div className="hub-wheel">
          <div className="hub-disc" aria-hidden="true">
            {items.map((it, i) => (
              <span key={it.key} className="mk" data-i={i} data-vis={i === 0 ? "" : undefined}>
                {it.glyph}
              </span>
            ))}
          </div>
          <Decor svgRef={decorRef} rotRef={rotRef} />
          {items.map((it, i) => (
            <span
              key={it.key}
              className={`hub-seal${it.live ? " live" : ""}${it.enter ? " enter" : ""}`}
              data-i={i}
              style={{ ["--ang" as string]: `${i * 60}deg`, ["--c" as string]: it.color, ["--k" as string]: i === 0 ? 1.7 : 1, ["--f" as string]: i === 0 ? 1 : 0 } as CSSProperties}
              data-cursor="SELECT"
              onClick={() => (i === api.current.front() ? enter(i) : api.current.goTo(i))}
              aria-hidden="true"
            >
              <span className="face">
                <b>{it.glyph}</b>
              </span>
              <span className="lab">{it.name}</span>
            </span>
          ))}
        </div>

        <button type="button" className="hub-nav prev" tabIndex={-1} aria-hidden="true" data-nodrag data-cursor="PREV" onClick={() => api.current.step(-1)}>
          <Arrow dir={-1} />
        </button>
        <button type="button" className="hub-nav next" tabIndex={-1} aria-hidden="true" data-nodrag data-cursor="NEXT" onClick={() => api.current.step(1)}>
          <Arrow dir={1} />
        </button>
        <div
          className="hub-front"
          role="slider"
          tabIndex={0}
          aria-label="業種を選ぶ輪（左右の矢印キーで回す、Enterで入る）"
          aria-valuemin={1}
          aria-valuemax={N}
          aria-valuenow={active + 1}
          aria-valuetext={`${cur.name}、${cur.live ? "掲載中" : "掲載準備中"}`}
          data-nodrag
          data-cursor={cur.enter ? "ENTER" : undefined}
          onKeyDown={onSliderKey}
          onClick={() => enter(api.current.front())}
        />
      </div>

      <nav className="hub-index" aria-label="業種の一覧" data-nodrag>
        <ul>
          {items.map((it, i) => {
            const on = i === active;
            const body = (
              <>
                <i aria-hidden="true" style={{ background: it.color }} />
                <span className="no" aria-hidden="true">0{i + 1}</span>
                <span className="nm">{it.name}</span>
                {!it.live && <small>準備中</small>}
              </>
            );
            return (
              <li key={it.key} data-on={on ? "" : undefined}>
                {it.enter ? (
                  <Link
                    href={it.path}
                    prefetch={false}
                    aria-current={on ? "true" : undefined}
                    onPointerDown={() => (downFront.current = api.current.front())}
                    onFocus={() => api.current.goTo(i)}
                    onClick={onIndexClick(i)}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    aria-label={`${it.name}（準備中）`}
                    onPointerDown={() => (downFront.current = api.current.front())}
                    onFocus={() => api.current.goTo(i)}
                    onClick={onIndexClick(i)}
                  >
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <a className="hub-cue" href="#mp-footer">
          <span>都道府県・駅から</span>
          <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3.5v13M4.5 11 10 16.5 15.5 11" />
          </svg>
        </a>
      </nav>

      <p className="hub-hint" aria-hidden="true">
        ドラッグ・ホイール・矢印キーで回す
      </p>
      <p className="mp-sr" role="status" aria-live="polite">
        {live}
      </p>
      <div className="hub-wipe" aria-hidden="true" />
    </section>
  );
}
