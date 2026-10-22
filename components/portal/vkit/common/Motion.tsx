"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * 新業種(体験・スポーツ・くらし)の動き(全ページで共有)。ステイの決定デザインの動きと同じ(ペットの common/Motion.tsx から、静かなものだけを移した)。
 * 派手な動き(ティルト・マグネット・逃げる飾り・マーキー・足あと・星・数字のカウント・スクロール速度の傾き・上端の進み具合の線)は入れない。
 * 見た目は base.css の .io / vk-* を参照。
 *
 * 画面全体の仕組み(Shell が 1 つだけ置く。ページ側では何もしなくてよい) = default の MotionFx:
 *  - .io               : 画面に入るとふわっと出る(.is-in が付く)。[data-io-group] の中の .io は順番に 90ms ずつずれる(--d)。
 *                        data-io="fade|left|right" で出方を変える。--d(ms)を自分で指定すれば順番より優先
 *  - .vk-scroll-zoom   : 写真がスクロールでゆっくり寄る。画面を通り抜ける進み具合を --p(0〜1)で受け取り、CSS が scale を決める
 *                        (入れ物に overflow: hidden。--ss で寄る量、既定 0.06)
 *  - .vk-live          : ずっと動き続ける物(.vk-kb)の入れ物に付けると、画面の外・非表示タブでは止まる
 *  - ヘッダーの隠れる/現れる([data-vk-head] に is-hidden / is-scrolled)・今のヘッダーの下端 --vk-hy
 *  - --u(ページ幅 ÷ 見本の幅。見本の幅は Shell が --vk-ref で渡す。スクロールバーを除いた幅。上限 1600px)
 *  prefers-reduced-motion では何も動かさず、すべて表示済み(最終状態)にする。スクロールの処理は requestAnimationFrame 1 本(非表示タブでは何もしない)。
 *
 * 部品(import { Reveal, MaskLines, ScrollSpyTabs, Heart } from "@/components/portal/vkit/common/Motion"):
 *  - Reveal        : ふわっと出る入れ物(<Reveal variant="left" delay={120}>)
 *  - MaskLines     : 大見出しが 1 行ずつ、下から現れる(見出しのワイプ)
 *  - ScrollSpyTabs : 店の紹介のタブ(トップ / 記事の節 / …)。追従して今の節に下線が滑る
 *  - Heart         : ハート(お気に入り。見た目だけの切り替え)
 */

export function usePrefersReducedMotion(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return r;
}

// ------------------------------------------------------------------ 画面全体
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

interface ZoomRec {
  el: HTMLElement;
  lastP: string;
}

export default function MotionFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".vk-root");
    const shell = document.querySelector<HTMLElement>(".vk-shell");
    if (!root || !shell) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const head = shell.querySelector<HTMLElement>("[data-vk-head]");
    const cleanups: Array<() => void> = [];

    // ---- --u(スクロールバーを除いた幅 ÷ 見本の幅。CSS の既定は 100vw 基準) ----
    const ref = parseFloat(shell.style.getPropertyValue("--vk-ref")) || 1024;
    const applyU = () => {
      const w = Math.min(document.documentElement.clientWidth, 1600);
      shell.style.setProperty("--u", `${(w / ref).toFixed(5)}px`);
    };
    applyU();
    window.addEventListener("resize", applyU);
    cleanups.push(() => window.removeEventListener("resize", applyU));

    // ---- 1 フレームにまとめる rAF(スクロール。何も動いていなければ止まる。非表示タブでは何もしない) ----
    let raf = 0;
    let frame: () => void = () => {};
    const schedule = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(() => frame());
    };

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
    // ---- ずっと動く物(.vk-live): 画面の外では止める ----
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

    // ---- スクロール連動(.vk-scroll-zoom の --p) ----
    const zooms: ZoomRec[] = [];
    const zoomSeen = new WeakSet<Element>();
    const addZooms = (): boolean => {
      let added = false;
      shell.querySelectorAll<HTMLElement>(".vk-scroll-zoom").forEach((el) => {
        if (zoomSeen.has(el)) return;
        zoomSeen.add(el);
        zooms.push({ el, lastP: "" });
        added = true;
      });
      for (let i = zooms.length - 1; i >= 0; i--) if (!zooms[i].el.isConnected) zooms.splice(i, 1);
      return added;
    };

    const register = () => {
      shell.querySelectorAll<HTMLElement>(".io").forEach((el) => {
        if (el.classList.contains("is-in") || seen.has(el)) return;
        seen.add(el);
        const g = el.closest("[data-io-group]");
        if (g && !el.style.getPropertyValue("--d")) {
          const idx = Array.prototype.indexOf.call(g.querySelectorAll(".io"), el);
          el.style.setProperty("--d", `${Math.min(Math.max(idx, 0), 10) * 90}ms`);
        }
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
      if (liveIo) {
        shell.querySelectorAll<HTMLElement>(".vk-live").forEach((el) => {
          if (liveSeen.has(el)) return;
          liveSeen.add(el);
          liveIo.observe(el);
        });
      }
      if (!reduce && addZooms()) schedule();
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
    const onVis = () => {
      root.toggleAttribute("data-vk-hidden", document.hidden);
      if (!document.hidden) schedule();
    };
    document.addEventListener("visibilitychange", onVis);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

    // ---- 1 フレームの処理(スクロール駆動) ----
    let lastY = window.scrollY;
    let hidden = false;
    const setHy = (h: boolean) => {
      if (h === hidden) return;
      hidden = h;
      head?.classList.toggle("is-hidden", h);
      shell.style.setProperty("--vk-hy", h ? "0px" : "var(--vk-hh)");
    };
    frame = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const dy = y - lastY;

      // ---- 読む ----
      const rects = reduce ? null : zooms.map((z) => z.el.getBoundingClientRect());

      // ---- 書く ----
      head?.classList.toggle("is-scrolled", y > 8);
      if (!reduce) {
        const menuOpen = !!head?.querySelector('.vk-drawer[data-open="1"]');
        if (y < 120 || menuOpen) setHy(false);
        else if (dy > 4) setHy(true);
        else if (dy < -4) setHy(false);
      }
      lastY = y;
      if (reduce || !rects) return;
      for (let i = 0; i < zooms.length; i++) {
        const r = rects[i];
        const p = clamp((vh - r.top) / (vh + r.height));
        const s = p.toFixed(3);
        if (s !== zooms[i].lastP) {
          zooms[i].lastP = s;
          zooms[i].el.style.setProperty("--p", s);
        }
      }
    };
    frame();
    const onScroll = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame = () => {};
    });

    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}

// ------------------------------------------------------------------ 部品
type Variant = "up" | "fade" | "left" | "right";

/** 画面に入るとふわっと出る。variant: up(既定)/fade/left/right。delay は ms。[data-io-group] の中なら自動で順番にずれる */
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

/** 大見出しが 1 行ずつ、マスクの下から現れる(見出しのワイプ)。lines は行ごとの文字。as は h1/h2 など。step は行の間隔(ms) */
export function MaskLines({
  lines,
  as = "span",
  className = "",
  step = 140,
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
    <T className={`vk-mask io io-self ${className}`.trim()} style={{ ["--d" as string]: `${delay}ms`, ["--step" as string]: `${step}ms` } as CSSProperties}>
      {lines.map((l, i) => (
        <span className="vk-ml" key={i}>
          <span className="vk-ml-i" style={{ ["--i" as string]: i } as CSSProperties}>
            {l}
          </span>
        </span>
      ))}
    </T>
  );
}

/**
 * 追従するタブ(店の紹介の「トップ / 記事の節 / 設備・サービス / アクセス」)。今の節に下線が滑る。
 * 各節に id を付けておく(items の id と同じ)。クリックでその節へなめらかに移動。
 * 追従(sticky)の位置は今のヘッダーの下端(--vk-hy。ヘッダーが隠れると 0)に合わせて動く。親に overflow を付けないこと。
 * offset = 節の上端をどこに合わせるか(px)。既定はヘッダー高さ+タブ高さのおよそ。
 */
export function ScrollSpyTabs({
  items,
  className = "",
  offset = 96,
}: {
  items: Array<{ id: string; label: string; sub?: string }>;
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
    <nav ref={nav} className={`vk-tabs ${className}`.trim()} aria-label="ページ内の節">
      <i className="vk-tabs-ind" aria-hidden="true" />
      {items.map((it) => (
        <button key={it.id} type="button" data-tab={it.id} className={`vk-tab ${active === it.id ? "is-on" : ""}`} aria-current={active === it.id ? "true" : undefined} onClick={() => go(it.id)}>
          {it.label}
          {it.sub ? <span className="vk-tab-sub">{it.sub}</span> : null}
        </button>
      ))}
    </nav>
  );
}

/** ハートのボタン(お気に入り)。押すと塗られる(見た目だけの切り替え。保存はしない)。className で位置(写真の右上など)を指定。tone="ink" で白抜きでなく濃い線(明るい地の上) */
export function Heart({ className = "", label = "お気に入りに追加", size = 18, tone = "light" }: { className?: string; label?: string; size?: number; tone?: "light" | "ink" }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className={`vk-heart ${tone === "ink" ? "vk-heart--ink" : ""} ${on ? "is-on" : ""} ${className}`.trim()}
      aria-pressed={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOn((v) => !v);
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path d="M12 20.4s-8.2-5-8.2-11.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.2 2.8c0 6.2-8.2 11.2-8.2 11.2z" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
