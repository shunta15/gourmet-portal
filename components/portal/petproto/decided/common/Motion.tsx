"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * ペット決定案の動き(全ページで共有)。見た目は base.css の pt-* / .io を参照。
 *
 * 画面全体の仕組み(Shell が 1 つだけ置く。ページ側では何もしなくてよい) = default の MotionFx:
 *  - .io           : 画面に入ると出る(.is-in が付く)。[data-io-group] の中の .io は順番に 70ms ずつずれる(--d)。
 *                    data-io="fade|left|right|zoom" で出方を変える。--d(ms)を自分で指定すれば順番より優先
 *  - [data-par="0.1"]  : スクロールに合わせて少しずれる(translate。値が大きいほど動く。負で逆向き)
 *  - [data-scrollp]    : 画面を通り抜ける進み具合を --p(0〜1)で渡す(地図が少し寄る等。CSS 側で scale: calc(1 + var(--p) * .08))
 *  - .pt-live          : ずっと動き続ける物(.pt-kb / .pt-float / .pt-shimmer / .pt-shine)の入れ物に付けると、画面の外・非表示タブでは止まる
 *  - 上端の進み具合の線(.pt-progress)・ヘッダーの隠れる/現れる([data-pt-head] に is-hidden / is-scrolled)・今のヘッダーの下端 --pt-hy
 *  - --u(ページ幅 ÷ 948。スクロールバーを除いた幅。上限 1600px)
 *  prefers-reduced-motion では何も動かさず、すべて表示済みにする。rAF は使わない(スクロール駆動のみ。非表示タブでは何もしない)。
 *
 * 部品(import { Reveal, MaskLines, Write, CountUp, Stars, Heart, ScrollSpyTabs } from "@/components/portal/petproto/decided/common/Motion"):
 *  - Reveal       : せり上がる入れ物(<Reveal variant="left" delay={120}>)
 *  - MaskLines    : 大見出しが 1 行ずつマスクで下から現れる(スタガー)
 *  - Write        : 手書きの添え書きが左から書かれるように出る(className は pt-hand が既定)
 *  - CountUp      : 数字のカウンター(「1,248」)
 *  - Stars        : ★(スクロールで左から塗られる)
 *  - Heart        : ハート(押すと赤く弾む)
 *  - ScrollSpyTabs: 店舗詳細のタブ(about / Menu / …)。追従して今の節に下線(または塗り)が滑る
 */

export function usePrefersReducedMotion(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return r;
}

// ------------------------------------------------------------------ 画面全体
export default function MotionFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pt-root");
    const shell = document.querySelector<HTMLElement>(".pt-shell");
    if (!root || !shell) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const head = shell.querySelector<HTMLElement>("[data-pt-head]");
    const bar = shell.querySelector<HTMLElement>(".pt-progress");
    const cleanups: Array<() => void> = [];

    // ---- --u(スクロールバーを除いた幅 ÷ 948。CSS の既定は 100vw 基準) ----
    const applyU = () => {
      const w = Math.min(document.documentElement.clientWidth, 1600);
      root.style.setProperty("--u", `${(w / 948).toFixed(5)}px`);
    };
    applyU();
    window.addEventListener("resize", applyU);
    cleanups.push(() => window.removeEventListener("resize", applyU));

    // ---- 出現(.io) ----
    const seen = new WeakSet<Element>();
    const io =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (ents) => {
              for (const en of ents) {
                if (en.isIntersecting) {
                  en.target.classList.add("is-in");
                  io?.unobserve(en.target);
                }
              }
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
          )
        : null;
    // ---- ずっと動く物(.pt-live): 画面の外では止める ----
    const liveIo =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (ents) => {
              for (const en of ents) en.target.classList.toggle("is-off", !en.isIntersecting);
            },
            { rootMargin: "80px 0px 80px 0px" },
          )
        : null;
    const liveSeen = new WeakSet<Element>();
    const register = () => {
      shell.querySelectorAll<HTMLElement>(".io:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const g = el.closest("[data-io-group]");
        if (g && !el.style.getPropertyValue("--d")) {
          const idx = Array.prototype.indexOf.call(g.querySelectorAll(".io"), el);
          el.style.setProperty("--d", `${Math.min(Math.max(idx, 0), 10) * 70}ms`);
        }
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
      if (liveIo) {
        shell.querySelectorAll<HTMLElement>(".pt-live").forEach((el) => {
          if (liveSeen.has(el)) return;
          liveSeen.add(el);
          liveIo.observe(el);
        });
      }
    };
    register();
    let mraf = 0;
    const mo = new MutationObserver(() => {
      if (mraf) return;
      mraf = window.setTimeout(() => {
        mraf = 0;
        register();
      }, 60);
    });
    mo.observe(shell, { childList: true, subtree: true });
    cleanups.push(() => {
      mo.disconnect();
      if (mraf) window.clearTimeout(mraf);
      io?.disconnect();
      liveIo?.disconnect();
    });

    // ---- 非表示タブでは続く動きを止める ----
    const onVis = () => root.toggleAttribute("data-pt-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

    // ---- スクロール駆動(rAF はスクロールのたびに 1 回だけ。非表示タブでは何もしない) ----
    let raf = 0;
    let lastY = window.scrollY;
    let hidden = false;
    const setHy = (h: boolean) => {
      if (h === hidden) return;
      hidden = h;
      head?.classList.toggle("is-hidden", h);
      shell.style.setProperty("--pt-hy", h ? "0px" : "var(--pt-hh)");
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max)).toFixed(4)})`;
      head?.classList.toggle("is-scrolled", y > 8);
      const dy = y - lastY;
      if (!reduce) {
        const menuOpen = !!head?.querySelector('.pt-drawer[data-open="1"]');
        if (y < 120 || menuOpen) setHy(false);
        else if (dy > 4) setHy(true);
        else if (dy < -4) setHy(false);
      }
      lastY = y;
      if (reduce) return;
      const vh = window.innerHeight;
      shell.querySelectorAll<HTMLElement>("[data-par],[data-scrollp]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const par = el.getAttribute("data-par");
        if (par) el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(par)).toFixed(1)}px`;
        if (el.hasAttribute("data-scrollp")) {
          const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
          el.style.setProperty("--p", p.toFixed(3));
        }
      });
    };
    const onScroll = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    });

    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}

// ------------------------------------------------------------------ 部品
type Variant = "up" | "fade" | "left" | "right" | "zoom";

/** 画面に入るとせり上がる。variant: up(既定)/fade/left/right/zoom。delay は ms。[data-io-group] の中なら自動で順番にずれる */
export function Reveal({
  as = "div",
  variant = "up",
  delay,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const T = as;
  const st = delay != null ? ({ ...style, ["--d" as string]: `${delay}ms` } as CSSProperties) : style;
  return (
    <T className={`io ${className}`.trim()} data-io={variant === "up" ? undefined : variant} style={st}>
      {children}
    </T>
  );
}

/** 大見出しが 1 行ずつマスクで下から現れる(スタガー)。lines は行ごとの文字。as は h1/h2 など。step は行の間隔(ms) */
export function MaskLines({
  lines,
  as = "span",
  className = "",
  step = 110,
  delay = 0,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  step?: number;
  delay?: number;
}) {
  const T = as;
  return (
    <T className={`pt-mask io io-self ${className}`.trim()} style={{ ["--d" as string]: `${delay}ms`, ["--step" as string]: `${step}ms` } as CSSProperties}>
      {lines.map((l, i) => (
        <span className="pt-ml" key={i}>
          <span className="pt-ml-i" style={{ ["--i" as string]: i } as CSSProperties}>
            {l}
          </span>
        </span>
      ))}
    </T>
  );
}

/** 手書きの添え書きが書かれるように出る(左から拭く)。lines を渡すと行ごとに順に書く。字体は className="pt-hand"(既定)で */
export function Write({
  lines,
  children,
  as = "span",
  className = "pt-hand",
  delay = 0,
  step = 650,
}: {
  lines?: ReactNode[];
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const T = as;
  return (
    <T className={`pt-write io io-self ${className}`.trim()} style={{ ["--d" as string]: `${delay}ms`, ["--step" as string]: `${step}ms` } as CSSProperties}>
      {lines ? (
        lines.map((l, i) => (
          <span className="pt-wl" key={i} style={{ ["--i" as string]: i } as CSSProperties}>
            <span className="pt-wl-i">{l}</span>
          </span>
        ))
      ) : (
        <span className="pt-wl" style={{ ["--i" as string]: 0 } as CSSProperties}>
          <span className="pt-wl-i">{children}</span>
        </span>
      )}
    </T>
  );
}

/** 数字がカウントアップ(画面に入ったとき)。to=最終の値。decimals=小数の桁。表示は最終値で出して、入ったら 0 から数える */
export function CountUp({ to, duration = 1400, decimals = 0, className }: { to: number; duration?: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => (decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("ja-JP"));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    el.textContent = fmt(0);
    let raf = 0;
    let elapsed = 0;
    let last = 0;
    const step = (t: number) => {
      const dt = last ? Math.min(t - last, 50) : 0; // 非表示タブで止まっていた時間は数えない
      last = t;
      elapsed += dt;
      const p = Math.min(1, elapsed / duration);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else el.textContent = fmt(to);
    };
    const io = new IntersectionObserver(
      (ents) => {
        if (ents.some((x) => x.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.textContent = fmt(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration, decimals]);
  return (
    <span ref={ref} className={className}>
      {fmt(to)}
    </span>
  );
}

/** 星(見本の 5.0・4.5 などの見た目)。画面に入ると左から塗られる。value は 0〜5。size は px(省略すると親の字の大きさ) */
export function Stars({ value, size, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`pt-stars io io-self ${className}`.trim()} style={{ ["--v" as string]: value, ...(size ? { fontSize: size } : null) } as CSSProperties} role="img" aria-label={`星 ${value}`}>
      <span className="pt-stars-b">★★★★★</span>
      <span className="pt-stars-f">★★★★★</span>
    </span>
  );
}

/** ハートのボタン。押すと赤く弾む。className で位置(写真の右上など)を指定。tone="ink" で白抜きでなく灰色の線(白い地の上) */
export function Heart({ className = "", label = "お気に入りに追加", size = 18, tone = "light" }: { className?: string; label?: string; size?: number; tone?: "light" | "ink" }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className={`pt-heart ${tone === "ink" ? "pt-heart--ink" : ""} ${on ? "is-on" : ""} ${className}`.trim()}
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOn((v) => !v);
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path d="M12 20.4s-8.2-5-8.2-11.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.2 2.8c0 6.2-8.2 11.2-8.2 11.2z" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * 追従するタブ(店舗詳細の about / Menu / Facility / …)。今の節に下線(variant="line")または塗り(variant="pill")が滑る。
 * 各節に id を付けておく(items の id と同じ)。クリックでその節へなめらかに移動。
 * 追従(sticky)の位置は今のヘッダーの下端(--pt-hy。ヘッダーが隠れると 0)に合わせて動く。親に overflow を付けないこと。
 * offset = 節の上端をどこに合わせるか(px)。既定はヘッダー高さ+タブ高さのおよそ。
 */
export function ScrollSpyTabs({
  items,
  variant = "line",
  className = "",
  offset = 96,
}: {
  items: Array<{ id: string; label: string; sub?: string }>;
  variant?: "pill" | "line";
  className?: string;
  offset?: number;
}) {
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      let cur = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= offset + 8) cur = it.id;
      }
      setActive(cur);
    };
    const on = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items, offset]);

  useEffect(() => {
    const n = nav.current;
    if (!n) return;
    const place = () => {
      const b = n.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (!b) return;
      n.style.setProperty("--ix", `${b.offsetLeft}px`);
      n.style.setProperty("--iw", `${b.offsetWidth}px`);
      n.style.setProperty("--ih", `${b.offsetHeight}px`);
      n.style.setProperty("--iy", `${b.offsetTop}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <nav ref={nav} className={`pt-tabs pt-tabs--${variant} ${className}`.trim()} aria-label="ページ内の節">
      <i className="pt-tabs-ind" aria-hidden="true" />
      {items.map((it) => (
        <button key={it.id} type="button" data-tab={it.id} className={`pt-tab ${active === it.id ? "is-on" : ""}`} aria-current={active === it.id ? "true" : undefined} onClick={() => go(it.id)}>
          {it.sub ? <span className="pt-tab-en">{it.label}</span> : it.label}
          {it.sub ? <span className="pt-tab-jp">{it.sub}</span> : null}
        </button>
      ))}
    </nav>
  );
}
