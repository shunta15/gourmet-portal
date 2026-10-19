"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * 動きの小さな部品(グリーン案の全ページで共有)。見た目は base.css の gr-* を参照。
 * import { Reveal, MaskLines, Write, CountUp, Stars, Heart, ScrollSpyTabs } from "@/components/portal/bcproto/green/common/Motion";
 * 出現(.is-in を付ける)は layout の GreenFx が全部まとめてやるので、ここの部品は data-rv を付けるだけ。
 */

export function usePrefersReducedMotion(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return r;
}

type Variant = "up" | "fade" | "left" | "right" | "zoom";

/** 画面に入るとせり上がる。variant: up(既定)/fade/left/right/zoom。delay は ms。[data-rv-group] の中なら自動で順番にずれる */
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
    <T className={className || undefined} data-rv={variant === "up" ? "" : variant} style={st}>
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
    <T className={`gr-mask ${className}`.trim()} data-rv="mask" style={{ ["--d" as string]: `${delay}ms`, ["--step" as string]: `${step}ms` } as CSSProperties}>
      {lines.map((l, i) => (
        <span className="gr-ml" key={i}>
          <span className="gr-ml-i" style={{ ["--i" as string]: i } as CSSProperties}>
            {l}
          </span>
        </span>
      ))}
    </T>
  );
}

/** 手書きの添え書きが書かれるように出る(左から拭く)。lines を渡すと行ごとに順に書く。字体は className="gr-hand" で */
export function Write({
  lines,
  children,
  as = "span",
  className = "gr-hand",
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
    <T className={`gr-write ${className}`.trim()} data-rv="write" style={{ ["--d" as string]: `${delay}ms`, ["--step" as string]: `${step}ms` } as CSSProperties}>
      {lines ? (
        lines.map((l, i) => (
          <span className="gr-wl" key={i} style={{ ["--i" as string]: i } as CSSProperties}>
            <span className="gr-wl-i">{l}</span>
          </span>
        ))
      ) : (
        <span className="gr-wl" style={{ ["--i" as string]: 0 } as CSSProperties}>
          <span className="gr-wl-i">{children}</span>
        </span>
      )}
    </T>
  );
}

/** 数字がカウントアップ(画面に入ったとき)。to=最終の値。decimals=小数の桁。表示は最終値で出して、入ったら 0 から数える */
export function CountUp({
  to,
  duration = 1400,
  decimals = 0,
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
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

/** 星(見本の 4.8 などの見た目)。画面に入ると左から塗られる。value は 0〜5。size は px */
export function Stars({ value, size = 13, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`gr-stars ${className}`.trim()} data-rv="stars" style={{ ["--v" as string]: value, fontSize: size } as CSSProperties} role="img" aria-label={`星 ${value}`}>
      <span className="gr-stars-b">★★★★★</span>
      <span className="gr-stars-f">★★★★★</span>
    </span>
  );
}

/** ハートのボタン。押すと赤く弾む。className で位置(写真の右上など)を指定 */
export function Heart({ className = "", label = "お気に入りに追加", size = 18 }: { className?: string; label?: string; size?: number }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className={`gr-heart ${on ? "is-on" : ""} ${className}`.trim()}
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOn((v) => !v);
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11z" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * 追従するタブ。今の節に印が滑る(variant: "pill"=見本の店舗詳細の塗りつぶし / "line"=下線)。
 * 各節に id を付けておく(items の id と同じ)。クリックでその節へなめらかに移動。
 * 追従(sticky)の位置はヘッダーが隠れているかで変わる(--gr-hy)ので、親に overflow を付けないこと。
 */
export function ScrollSpyTabs({
  items,
  variant = "pill",
  className = "",
  offset = 70,
}: {
  items: Array<{ id: string; label: string }>;
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
    <nav ref={nav} className={`gr-tabs gr-tabs--${variant} ${className}`.trim()} aria-label="ページ内の節">
      <i className="gr-tabs-ind" aria-hidden="true" />
      {items.map((it) => (
        <button key={it.id} type="button" data-tab={it.id} className={`gr-tab ${active === it.id ? "is-on" : ""}`} aria-current={active === it.id ? "true" : undefined} onClick={() => go(it.id)}>
          {it.label}
        </button>
      ))}
    </nav>
  );
}
