"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { HubItem } from "@/lib/portal/hub";
import type { Week } from "@/lib/portal/openNow";
import { glowRgb } from "@/lib/portal/hubs/hikariwa/colors";
import { createRingEngine, type Engine, type EngineItem } from "./ringEngine";

/* ───────────── オーナーの言葉（コンセプト 1。一字一句そのまま。COPY.md） ───────────── */
/** 見出し。画面では 3 行に分けて組むが、つなぐと原文と同じ */
const HEADLINE_LINES = ["街とお店、人と人。", "つながる輪を、", "マチノワから。"];
const HEADLINE = "街とお店、人と人。つながる輪を、マチノワから。";
/** リード（本文の第 1 段落） */
const LEAD = "マチノワは、街にある魅力的なお店と人をつなぎ、そこから新しい出会いや交流を生み出していく地域ポータルサイトです。";

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * 総合トップ案「光の輪 HIKARIWA」— 最初の画面（クライアント）。
 * 夜の地に、6 つの弧の光の輪。弧は業種の色で光り、掲載中は太く強く、準備中は細く静かに、ページがない業種はごく淡い点線。
 * 輪を指やカーソルで回す・傾ける。選んだ弧が正面に回り、輪の中に名前・状態・数字・押す所が出る。
 * 動きを減らす設定・スクリプトなしでは、CSS で描いた静かな光の輪と、業種の一覧。
 */
export default function HikariwaStage({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const labsRef = useRef<HTMLUListElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const downFront = useRef<number | null>(null);
  const leavingRef = useRef(false);

  const [active, setActive] = useState(0);
  const [motion, setMotion] = useState<"pending" | "live" | "static">("pending");
  const [leaving, setLeaving] = useState(false);
  const [status, setStatus] = useState("");
  const [openNow, setOpenNow] = useState<{ open: number; known: number } | null>(null);

  const glows = items.map((it) => glowRgb(it.color));
  const rgbStr = (i: number) => glows[i].join(",");

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
    // 輪を描いているあいだは空き時間が少ないので、待ちすぎないように timeout を付ける
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const h = ric ? ric(() => void calc(), { timeout: 1200 }) : window.setTimeout(() => void calc(), 400);
    const iv = window.setInterval(() => void calc(), 60_000);
    return () => {
      stop = true;
      window.clearInterval(iv);
      if (!ric) window.clearTimeout(h);
    };
  }, [open]);

  /* ───────────── 輪のエンジン（動きを減らす設定のときは動かさない） ───────────── */
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ul = labsRef.current;
    const [g0, g1, g2] = glowRefs.current;
    if (!root || !canvas || !stage || !ul || !g0 || !g1 || !g2) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const engItems: EngineItem[] = items.map((it, i) => ({ rgb: glowRgb(it.color), kind: it.live ? "live" : it.enter ? "quiet" : "faint" }));
    const start = () => {
      if (engineRef.current) return;
      if (mq.matches) {
        setMotion("static");
        return;
      }
      try {
        engineRef.current = createRingEngine({
          root,
          canvas,
          glow: [g0, g1, g2],
          stage,
          items: engItems,
          labels: Array.from(ul.children) as HTMLElement[],
          onFront: (i, byUser) => {
            setActive(i);
            if (byUser) {
              const it = items[i];
              setStatus(`${it.name}。${it.live ? "掲載中" : "掲載準備中"}`);
            }
          },
        });
        setMotion("live");
      } catch {
        setMotion("static");
      }
    };
    const stop = () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      setMotion("static");
    };
    start();
    const onChange = () => (mq.matches ? stop() : start());
    mq.addEventListener("change", onChange);

    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        leavingRef.current = false;
        setLeaving(false);
        engineRef.current?.thaw();
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("pageshow", onShow);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [items]);

  // 正面の業種の入口を先に読んでおく
  useEffect(() => {
    const it = items[active];
    if (it?.enter) router.prefetch(it.path);
  }, [active, items, router]);

  /* ───────────── 入る ───────────── */
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const enter = useCallback(
    (i: number) => {
      const it = items[i];
      if (!it.enter) {
        engineRef.current?.nudge();
        setStatus(`${it.name}は掲載準備中です`);
        return;
      }
      if (leavingRef.current) return;
      leavingRef.current = true;
      const eng = engineRef.current;
      const root = rootRef.current;
      if (!eng || !root) {
        router.push(it.path);
        return;
      }
      const a = eng.anchor();
      root.style.setProperty("--wx", `${a.x.toFixed(0)}px`);
      root.style.setProperty("--wy", `${a.y.toFixed(0)}px`);
      eng.freeze();
      eng.flare();
      setLeaving(true);
      timer.current = window.setTimeout(() => router.push(it.path), 900);
    },
    [items, router],
  );

  const onGo = (i: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!plain(e)) return;
    e.preventDefault();
    enter(i);
  };

  /** 名前（輪のまわり／下の一覧）を押したとき。正面でなければ輪を回してそこへ。正面ならそのまま入る */
  const onLabel = (i: number) => (e: MouseEvent<HTMLElement>) => {
    const wasFront = downFront.current;
    downFront.current = null;
    const eng = engineRef.current;
    const it = items[i];
    if (!plain(e)) return;
    if (!eng) {
      // 輪を動かさないとき: 入れる所はそのままリンクで入る。入れない所は、その業種の状態を出す
      if (!it.enter) {
        e.preventDefault();
        setActive(i);
      }
      return;
    }
    e.preventDefault();
    if (wasFront !== null && wasFront !== i) {
      eng.goTo(i);
      if (!it.enter) setStatus(`${it.name}。掲載準備中`);
    } else if (eng.front() === i) enter(i);
    else eng.goTo(i);
  };
  const onLabelFocus = (i: number) => () => {
    if (downFront.current !== null) return; // ポインタで触ったときは、クリックのほうで回す
    engineRef.current?.goTo(i);
  };

  const cur = items[active];
  const rootStyle = {
    ["--hk-rgb" as string]: rgbStr(0),
    ...Object.fromEntries(glows.map((g, i) => [`--c${i}`, g.join(",")])),
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      className={`hk${leaving ? " is-leaving" : ""}`}
      style={rootStyle}
      data-motion={motion}
      aria-labelledby="hk-h1"
      onClickCapture={(e) => {
        if (engineRef.current?.dragged()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className="hk-bg" aria-hidden="true" />
      <div className="hk-fx" aria-hidden="true">
        <canvas ref={canvasRef} className="hk-cv" />
        {[0, 1, 2].map((k) => (
          <canvas key={k} ref={(el) => void (glowRefs.current[k] = el)} className="hk-g" data-k={k} />
        ))}
      </div>

      <header className="hk-bar" data-nodrag>
        <Link href="/" className="hk-logo" aria-label="マチノワ" aria-current="page">
          <span className="ja">マチノワ</span>
          <span className="en">Machinowa</span>
        </Link>
        <Link href="/find" prefetch={false} className="hk-find">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4.5 4.5" strokeLinecap="round" />
          </svg>
          <span>さがす</span>
        </Link>
      </header>

      <div className="hk-copy">
        <h1 id="hk-h1" className="hk-h1" aria-label={HEADLINE} data-excl>
          {HEADLINE_LINES.map((ln, i) => (
            <span className="ln" key={i} aria-hidden="true">
              <span className="in" style={{ ["--d" as string]: `${0.5 + i * 0.16}s` } as CSSProperties}>
                {ln.includes("輪") ? (
                  <>
                    {ln.slice(0, ln.indexOf("輪"))}
                    <span className="wa">輪</span>
                    {ln.slice(ln.indexOf("輪") + 1)}
                  </>
                ) : (
                  ln
                )}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className="hk-stage" ref={stageRef}>
        {/* CSS で描いた静かな光の輪（スクリプトなし・動きを減らす設定のとき。エンジンが動いているあいだは消える） */}
        <div className="hk-cring" aria-hidden="true">
          <div className="tilt">
            <i className="halo" />
            <i className="thin" />
            <i className="bold" />
          </div>
        </div>

        <div className="hk-panels">
          {items.map((it, i) => (
            <article
              key={it.key}
              className="hk-panel"
              data-i={i}
              data-live={it.live ? "" : undefined}
              {...(i === active ? { "data-on": "" } : {})}
              style={{ ["--c" as string]: rgbStr(i) } as CSSProperties}
            >
              <div className="head">
                <p className="kick">
                  <i aria-hidden="true" />
                  <em>{it.en}</em>
                </p>
                <h2 className="name">{it.name}</h2>
                <p className="state">
                  <i aria-hidden="true" />
                  {it.live ? "掲載中" : "掲載準備中"}
                </p>
              </div>
              <div className="meta">
                {it.key === "gourmet" && (
                  <p className="facts">
                    <span>
                      <b>{fmt(gourmetTotal)}</b>
                      <u>店</u>
                    </span>
                    <span>
                      <small>特集</small>
                      <b>{featureTotal}</b>
                      <u>本</u>
                    </span>
                    <span className="now" data-on={openNow ? "" : undefined}>
                      <small>いま営業中</small>
                      <b>{openNow ? fmt(openNow.open) : "000"}</b>
                      <u>軒</u>
                      <em>営業時間が確かな{openNow ? fmt(openNow.known) : "000"}店のうち</em>
                    </span>
                  </p>
                )}
                {it.enter && (
                  <Link href={it.path} prefetch={false} className="go" onClick={onGo(i)}>
                    <span>{it.name}に入る</span>
                    <svg viewBox="0 0 24 12" width="24" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 6h21M17 1.5 22 6l-5 4.5" />
                    </svg>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hk-foot">
      <p className="hk-lead" data-excl>{LEAD}</p>

      <nav className="hk-labs" aria-label="業種の入口" data-nodrag>
        <ul ref={labsRef}>
          {items.map((it, i) => {
            const body = (
              <>
                <i className="dot" aria-hidden="true" />
                <span className="nm">{it.name}</span>
                <span className="en">{it.en}</span>
                {!it.live && <small className="st">準備中</small>}
              </>
            );
            return (
              <li
                key={it.key}
                className="hk-lab"
                data-i={i}
                data-live={it.live ? "" : undefined}
                data-enter={it.enter ? "" : undefined}
                data-on={i === active ? "" : undefined}
                style={{ ["--c" as string]: rgbStr(i) } as CSSProperties}
              >
                {it.enter ? (
                  <Link
                    href={it.path}
                    prefetch={false}
                    aria-label={it.live ? it.name : `${it.name}（掲載準備中）`}
                    aria-current={i === active ? "true" : undefined}
                    onPointerDown={() => (downFront.current = engineRef.current?.front() ?? null)}
                    onFocus={onLabelFocus(i)}
                    onClick={onLabel(i)}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label={`${it.name}（掲載準備中）`}
                    aria-current={i === active ? "true" : undefined}
                    onPointerDown={() => (downFront.current = engineRef.current?.front() ?? null)}
                    onFocus={onLabelFocus(i)}
                    onClick={onLabel(i)}
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

      <p className="mp-sr" role="status" aria-live="polite">
        {status}
      </p>
      <div className="hk-wipe" aria-hidden="true" data-name={cur.key} />
    </section>
  );
}
