"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { HubItem } from "@/lib/portal/hub";
import type { Week } from "@/lib/portal/openNow";
import type { DishPhoto } from "@/lib/portal/hubs/nigiwai/photos";
import { HEAD, LEAD } from "./copy";

/**
 * 総合トップ 案「にぎわいの輪」— 朱の地に、料理の写真の輪（クライアント）。
 *
 * 輪は 16 枚の丸い写真（皿）を大きな円周に並べたもの。ゆっくり回り、つかんで回せる（円の中心まわりの角度で動かす。離すと慣性で、元の回転に戻る）。
 * 写真は輪が回っても、いつも上を向いたまま（回るのは位置だけ）。写真に置いた指・カーソルで、その 1 枚が少し大きくなる。
 * 6 つの丸いボタン（業種）を選ぶと、輪が変わる。グルメ＝写真の輪／ビューティー・ボディケア＝その業種の色の空の丸／ペット・おでかけ・ステイ＝線だけの空の丸。
 *   マウスは乗せた時点で選び、押すと入る。タッチは、1 回目で選び、選んでいるものをもう 1 回押すと入る。キーボードはフォーカスで選び、Enter で入る。
 *   ペット・おでかけ・ステイはリンクにしない（<button>）。
 * 描画は --rot（角度）だけを毎フレーム書く。React の state は書かない。動いていないとき（画面の外・タブが裏）はループを止める。
 * 動きを減らす設定（prefers-reduced-motion）では回さず、集まる演出もしない（CSS と、ここでエンジンを動かさないことで）。
 */

const AUTO = 2.4; // ふだんの回転（度/秒。1周 150 秒）
const TAU = 1.35; // 慣性が元の回転に戻る時定数（秒）
const SCALES = [1, 0.86, 1.06, 0.92, 1.1, 0.88, 1, 0.94, 1.08, 0.86, 1.02, 0.92, 1.1, 0.9, 1.04, 0.88];
const GAP = 0.075; // 隣どうしの隙間（写真の直径に対する比）
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** 写真の置き場所。大きさに比例した弧を割り当てて、隙間をそろえる（決まった値なのでサーバーとクライアントで同じ） */
function layout(n: number) {
  const s = Array.from({ length: n }, (_, i) => SCALES[i % SCALES.length]);
  const tot = s.reduce((a, b) => a + b + GAP, 0);
  let acc = 0;
  const dishes = s.map((v) => {
    const w = ((v + GAP) / tot) * 360;
    const a = acc + w / 2;
    acc += w;
    return { a: Number(a.toFixed(3)), s: v };
  });
  return { dishes, dk: Number(((2 * Math.PI) / tot).toFixed(4)) };
}

export default function Nigiwai({
  items,
  gourmetTotal,
  featureTotal,
  open,
  photos,
}: {
  items: HubItem[];
  gourmetTotal: number;
  featureTotal: number;
  open: { weeks: Week[]; n: number[] };
  photos: DishPhoto[];
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const lastType = useRef<string>("mouse");
  const suppressClick = useRef(false);
  const goRef = useRef<(i: number, from?: HTMLElement | null) => void>(() => {});

  const [sel, setSel] = useState(0);
  const [live, setLive] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [shake, setShake] = useState(0);
  const [openNow, setOpenNow] = useState<{ open: number; known: number } | null>(null);

  const { dishes, dk } = layout(photos.length || 16);
  const cur = items[sel];
  const kind = cur.live ? "live" : cur.enter ? "prep" : "off";

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
    const ring = ringRef.current;
    if (!root || !ring) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;
    let ang = 0;
    let vel = AUTO;
    let dragging = false;
    let raf = 0;
    let last = 0;
    let visible = true;
    const timers: number[] = [];

    const write = () => ring.style.setProperty("--rot", `${(ang % 360).toFixed(3)}deg`);
    const running = () => !reduce && visible && !document.hidden;

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!dragging) {
        vel += (AUTO - vel) * (1 - Math.exp(-dt / TAU));
        ang += vel * dt;
        write();
      }
      if (running()) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (raf || !running()) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    /* ── つかんで回す（円の中心まわりの角度。離すと慣性） ── */
    type Sample = { t: number; a: number };
    let drag: { id: number; cx: number; cy: number; a0: number; ang0: number; x0: number; y0: number; on: boolean; s: Sample[] } | null = null;
    const angleAt = (x: number, y: number, cx: number, cy: number) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    const onDown = (e: PointerEvent) => {
      lastType.current = e.pointerType;
      if (reduce) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as Element | null)?.closest("a, button, [data-nodrag]")) return;
      const r = ring.getBoundingClientRect();
      drag = { id: e.pointerId, cx: r.left, cy: r.top, a0: angleAt(e.clientX, e.clientY, r.left, r.top), ang0: ang, x0: e.clientX, y0: e.clientY, on: false, s: [] };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.on) {
        const dx = e.clientX - drag.x0;
        const dy = e.clientY - drag.y0;
        if (Math.hypot(dx, dy) < 6) return;
        if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.2) {
          drag = null; // 縦の動き（ページのスクロール）
          return;
        }
        drag.on = true;
        dragging = true;
        suppressClick.current = true;
        try {
          root.setPointerCapture(e.pointerId);
        } catch {
          /* 取れなくても動く */
        }
        root.classList.add("is-drag");
        drag.a0 = angleAt(e.clientX, e.clientY, drag.cx, drag.cy);
        drag.ang0 = ang;
        drag.s = [{ t: e.timeStamp, a: ang }];
        kick();
      }
      let d = angleAt(e.clientX, e.clientY, drag.cx, drag.cy) - drag.a0;
      d = ((((d + 180) % 360) + 360) % 360) - 180; // −180〜180 に折り返す
      // 折り返しをまたいでも連続になるように、前の値との差で積む
      const prev = drag.s[drag.s.length - 1];
      let step = drag.ang0 + d - prev.a;
      step = ((((step + 180) % 360) + 360) % 360) - 180;
      ang = prev.a + step;
      write();
      drag.s.push({ t: e.timeStamp, a: ang });
      while (drag.s.length > 2 && e.timeStamp - drag.s[0].t > 120) drag.s.shift();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.on) {
        const a = drag.s[0];
        const b = drag.s[drag.s.length - 1];
        const span = (b.t - a.t) / 1000;
        const fresh = e.timeStamp - b.t < 90;
        vel = fresh && span > 0.012 ? (b.a - a.a) / span : 0;
        vel = Math.max(-1100, Math.min(1100, vel));
        dragging = false;
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

    /* ── 画面の外・タブが裏のときは止める ── */
    const io = new IntersectionObserver(
      (es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible) kick();
      },
      { threshold: 0 },
    );
    io.observe(root);
    const onVis = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVis);

    const onReduce = () => {
      reduce = mq.matches;
      if (reduce) {
        cancelAnimationFrame(raf);
        raf = 0;
        ang = 0;
        write();
      } else kick();
    };
    mq.addEventListener("change", onReduce);

    /* ── 入る動きのあと、ブラウザの「戻る」で戻ってきたとき ── */
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setLeaving(false);
        root.classList.remove("is-leaving");
        kick();
      }
    };
    window.addEventListener("pageshow", onShow);

    // 写真（と書体）が読み込めてから、入る動きを始める。遅くても 1.8 秒で始める
    const imgs = Array.from(ring.querySelectorAll("img"));
    const loaded = imgs.map((im) => (im.complete ? Promise.resolve() : new Promise<void>((res) => {
      im.addEventListener("load", () => res(), { once: true });
      im.addEventListener("error", () => res(), { once: true });
    })));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      root.classList.add("is-go");
      timers.push(window.setTimeout(() => root.classList.add("is-ready"), 3100));
    };
    timers.push(window.setTimeout(start, 1800));
    void Promise.all([...loaded, fonts]).then(() => requestAnimationFrame(start));
    kick();

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onShow);
      mq.removeEventListener("change", onReduce);
    };
  }, []);

  /* ───────────── 入る（輪が広がり、朱が画面を満たす） ───────────── */
  const go = useCallback(
    (i: number, from?: HTMLElement | null) => {
      const it = items[i];
      if (!it.enter || leaving) return;
      const root = rootRef.current;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !root) {
        router.push(it.path);
        return;
      }
      const r = (from ?? root).getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      root.style.setProperty("--wx", `${(r.left + r.width / 2 - rr.left).toFixed(0)}px`);
      root.style.setProperty("--wy", `${(r.top + r.height / 2 - rr.top).toFixed(0)}px`);
      root.classList.add("is-leaving");
      setLeaving(true);
      window.setTimeout(() => router.push(it.path), 780);
    },
    [items, leaving, router],
  );
  goRef.current = go;

  // 選んでいる業種の入口を先に読んでおく
  useEffect(() => {
    if (cur.enter) router.prefetch(cur.path);
  }, [cur, router]);

  const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  const select = (i: number) => {
    if (i === sel) return;
    const it = items[i];
    setSel(i);
    setLive(`${it.name}。${it.live ? "掲載中" : it.enter ? "掲載準備中。ページへ入れます" : "掲載準備中"}`);
  };
  /** 丸いボタンを押したとき。マウス・キーボードはそのまま入る。タッチは、選んでいないものは選ぶだけ（もう 1 回押すと入る） */
  const onBtn = (i: number) => (e: MouseEvent<HTMLElement>) => {
    if (suppressClick.current) {
      e.preventDefault();
      return;
    }
    const it = items[i];
    const touch = lastType.current === "touch" || lastType.current === "pen";
    const keyboard = e.detail === 0;
    if (!it.enter) {
      e.preventDefault();
      select(i);
      if (sel === i) setShake((n) => n + 1);
      return;
    }
    if (!plain(e)) return;
    e.preventDefault();
    if (touch && !keyboard && sel !== i) {
      select(i);
      return;
    }
    goRef.current(i, e.currentTarget);
  };

  const rootStyle = { ["--dk" as string]: dk } as CSSProperties;

  return (
    <section
      ref={rootRef}
      className={`ng${leaving ? " is-leaving" : ""}`}
      style={rootStyle}
      data-kind={kind}
      data-sel={cur.key}
      aria-labelledby="ng-h1"
      onClickCapture={(e) => suppressClick.current && (e.preventDefault(), e.stopPropagation())}
    >
      <div className="ng-ripples" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {/* 料理の写真の輪（飾り。回る・つかめる） */}
      <div className="ng-ring" ref={ringRef} aria-hidden="true" style={{ ["--vc" as string]: cur.color } as CSSProperties}>
        {dishes.map((d, i) => {
          const p = photos[i];
          return (
            <span
              key={i}
              className="ng-dish"
              style={{ ["--a" as string]: `${d.a}deg`, ["--s" as string]: d.s, ["--i" as string]: i } as CSSProperties}
            >
              <span className="ng-photo">
                {p && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.src} srcSet={p.srcSet} sizes="(max-width: 760px) 40vw, 17vw" alt="" draggable={false} decoding="async" loading="eager" fetchPriority={i < 6 ? "high" : "auto"} />
                )}
              </span>
              <span className="ng-void" />
            </span>
          );
        })}
      </div>

      <header className="ng-bar" data-nodrag>
        <Link href="/" className="ng-logo" aria-label="マチノワ" aria-current="page">
          <b>マチノワ</b>
          <small>Machinowa</small>
        </Link>
        <Link href="/find" prefetch={false} className="ng-find">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" />
          </svg>
          <span>さがす</span>
        </Link>
      </header>

      <div className="ng-core">
        <div className="ng-copy">
          <h1 id="ng-h1" className="ng-h1">
            {HEAD.map((t, i) => (
              <span className="ln" key={i} style={{ ["--li" as string]: i } as CSSProperties}>
                <span className="tx">{t}</span>
              </span>
            ))}
          </h1>
          <p className="ng-lead">{LEAD}</p>
        </div>

        <div className="ng-sel" data-nodrag>
          <ul className="ng-btns" aria-label="業種の入口">
            {items.map((it, i) => {
              const on = i === sel;
              const k = it.live ? "live" : it.enter ? "prep" : "off";
              const face = (
                <>
                  {it.lines.map((ln, li) => (
                    <span className="l" key={li} aria-hidden="true">
                      {ln}
                    </span>
                  ))}
                </>
              );
              const common = {
                className: `ng-b ${k}${on ? " on" : ""}${on && shake && !it.enter ? ` shake s${shake % 2}` : ""}`,
                "data-i": i,
                onPointerEnter: (e: React.PointerEvent) => {
                  if (e.pointerType === "mouse") select(i);
                },
                onFocus: () => select(i),
                onPointerDown: (e: React.PointerEvent) => {
                  lastType.current = e.pointerType;
                },
                onClick: onBtn(i),
                style: { ["--i" as string]: i, ["--vc" as string]: it.color } as CSSProperties,
              };
              return (
                <li key={it.key}>
                  {it.enter ? (
                    <Link href={it.path} prefetch={false} aria-current={on ? "true" : undefined} aria-label={`${it.name}${it.live ? "に入る" : "（準備中）のページを見る"}`} {...common}>
                      {face}
                    </Link>
                  ) : (
                    <button type="button" aria-pressed={on} aria-label={`${it.name}（準備中）`} {...common}>
                      {face}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="ng-info" key={cur.key}>
            <p className="ng-state">
              <i aria-hidden="true" />
              {cur.live ? "掲載中" : "掲載準備中"}
            </p>
            {cur.key === "gourmet" && (
              <p className="ng-facts">
                <span>
                  <b>{fmt(gourmetTotal)}</b>店
                </span>
                <span>
                  特集<b>{fmt(featureTotal)}</b>本
                </span>
                <span className="ng-open" data-on={openNow ? "" : undefined}>
                  いま営業中<b>{openNow ? fmt(openNow.open) : "0"}</b>軒
                  <small>営業時間が確かな{openNow ? fmt(openNow.known) : "0"}店のうち</small>
                </span>
              </p>
            )}
            {cur.enter && (
              <Link
                href={cur.path}
                prefetch={false}
                className="ng-go"
                onClick={(e) => {
                  if (suppressClick.current || !plain(e)) return;
                  e.preventDefault();
                  goRef.current(sel, e.currentTarget);
                }}
              >
                {cur.live ? `${cur.name}に入る` : "ページを見る"}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <p className="ng-sr" role="status" aria-live="polite">
        {live}
      </p>
      <div className="ng-wipe" aria-hidden="true" />
    </section>
  );
}
