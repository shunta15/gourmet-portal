"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { Paw } from "./Icons";

/**
 * ペット決定案の動き(全ページで共有)。見た目は base.css の pt-* / .io を参照。使い方の一覧はスクラッチの lib.md ではなくここに要点を書く。
 *
 * 画面全体の仕組み(Shell が 1 つだけ置く。ページ側では何もしなくてよい) = default の MotionFx:
 *  - .io           : 画面に入ると出る(.is-in が付く)。[data-io-group] の中の .io は順番に 70ms ずつずれる(--d)。
 *                    data-io="fade|left|right|zoom|pop|blur" で出方を変える。--d(ms)を自分で指定すれば順番より優先
 *  - .pt-popin / .pt-blurin / .pt-wipe : .io と同じく画面に入ると出る(スタガーも同じ)。オーバーシュートのポップイン / ぼけて現れる / 写真のワイプ(data-wipe="left|right|up|down")
 *  - [data-par="0.1"]  : スクロールに合わせて少しずれる(translate。値が大きいほど動く。負で逆向き)
 *  - [data-scrollp]    : 画面を通り抜ける進み具合を --p(0〜1)で渡す(地図が少し寄る等。CSS 側で scale: calc(1 + var(--p) * .08))
 *                        値で範囲が変わる: 空/pass = 下から入って上へ抜けるまで / fill = 画面の下 92% から 42% まで(見出しの色づき) / bg = 96% から 46% まで / paws = 自分の高さ+画面の 1/3 で
 *  - .pt-fillh / .pt-fill (見出しのカラーフィル)・.pt-bgshift (節の背景色)・.pt-scale-scroll (写真の拡大)・.pt-paws (足あと): 自動で --p をもらう(data-scrollp 不要)
 *  - .pt-tilt / .pt-magnet / .pt-flee / .pt-skew / .pt-marquee : マウス(hover できる画面)とスクロール速度に反応する(JS はここ。見た目は base.css)
 *  - .pt-live          : ずっと動き続ける物(.pt-kb / .pt-float / .pt-shimmer / .pt-shine / .pt-marquee)の入れ物に付けると、画面の外・非表示タブでは止まる
 *  - 上端の進み具合の線(.pt-progress)・ヘッダーの隠れる/現れる([data-pt-head] に is-hidden / is-scrolled)・今のヘッダーの下端 --pt-hy
 *  - --u(ページ幅 ÷ 948。スクロールバーを除いた幅。上限 1600px)
 *  prefers-reduced-motion では何も動かさず、すべて表示済み(最終状態)にする。スクロール・マウスの処理は requestAnimationFrame 1 本にまとめる(非表示タブでは何もしない)。
 *
 * 部品(import { Reveal, MaskLines, Write, CountUp, Stars, Heart, ScrollSpyTabs, Marquee, PawTrail, FillHeading, TiltCard, Flee } from "@/components/portal/petproto/decided/common/Motion"):
 *  - Reveal       : せり上がる入れ物(<Reveal variant="left" delay={120}>)。variant に pop(ポップイン)・blur(ブラーイン)も
 *  - MaskLines    : 大見出しが 1 行ずつマスクで下から現れる(スタガー)
 *  - Write        : 手書きの添え書きが左から書かれるように出る(className は pt-hand が既定)
 *  - CountUp      : 数字のカウンター(「1,248」)
 *  - Stars        : ★(スクロールで左から塗られる)
 *  - Heart        : ハート(押すと赤く弾む)
 *  - ScrollSpyTabs: 店舗詳細のタブ(about / Menu / …)。追従して今の節に下線(または塗り)が滑る
 *  - Marquee      : 流れる帯(無限ループ。ホバーで減速)
 *  - PawTrail     : スクロールに合わせて順に現れる肉球の足あと
 *  - FillHeading  : スクロールで文字が順に色づく見出し
 *  - TiltCard     : マウスに合わせて 3D に傾くカードの包み
 *  - Flee         : カーソルが近づくとふわっと逃げる飾り(葉・足あと)の包み
 */

export function usePrefersReducedMotion(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return r;
}

// ------------------------------------------------------------------ 画面全体
// 出現する物のセレクタ(.io と同じ is-in の仕組み。[data-io-group] のスタガーも共通)
const REV_SEL = ".io, .pt-popin, .pt-blurin, .pt-wipe, .pt-paws--auto";
// --p をもらう物(スクロール連動)
const SCROLL_SEL = "[data-par],[data-scrollp],.pt-fillh,.pt-fill,.pt-bgshift,.pt-scale-scroll,.pt-paws:not(.pt-paws--auto)";

type SpMode = "pass" | "fill" | "paws" | "bg";
const SP_MODES: string[] = ["pass", "fill", "paws", "bg"];
interface ScrollRec {
  el: HTMLElement;
  mode: SpMode | null;
  par: number;
  from: number; // fill / bg: 要素の上端が画面のどこ(高さの割合)に来たら 0 か
  to: number; // fill / bg: どこに来たら 1 か
  lastP: string;
  kids: HTMLElement[]; // paws: .pt-paw
  on: boolean[];
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 今の transform が要素を動かしている分(px)。getBoundingClientRect は動いている最中の位置なので、ここを引いて「本来の位置」を出す */
function curShift(el: HTMLElement): [number, number] {
  const cs = getComputedStyle(el);
  const t = cs.transform;
  if (!t || t === "none") return [0, 0];
  const m = new DOMMatrixReadOnly(t);
  const [ox, oy] = cs.transformOrigin.split(" ").map((v) => parseFloat(v) || 0);
  const q = m.transformPoint({ x: ox, y: oy });
  return [q.x - ox, q.y - oy];
}

export default function MotionFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pt-root");
    const shell = document.querySelector<HTMLElement>(".pt-shell");
    if (!root || !shell) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // マウスで反応する物(ティルト・マグネット・逃げる飾り・マーキーの減速)は、hover できる画面だけ
    const fine = !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
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

    // ---- 1 フレームにまとめる rAF(スクロール・マウス・慣性の戻り。何も動いていなければ止まる。非表示タブでは何もしない) ----
    let raf = 0;
    let frame: (now: number) => void = () => {};
    const schedule = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame((t) => frame(t));
    };

    // ---- 出現(.io ほか) ----
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

    // ---- スクロール連動(--p)・マウス反応の物の一覧 ----
    const recs: ScrollRec[] = [];
    const recSeen = new WeakSet<Element>();
    let magnets: HTMLElement[] = [];
    let flees: HTMLElement[] = [];
    let skews: HTMLElement[] = [];
    let marquees: HTMLElement[] = [];

    const addRecs = (): boolean => {
      let added = false;
      shell.querySelectorAll<HTMLElement>(SCROLL_SEL).forEach((el) => {
        if (recSeen.has(el)) return;
        recSeen.add(el);
        const cl = el.classList;
        const attr = el.getAttribute("data-scrollp");
        let mode: SpMode | null = null;
        if (attr !== null) mode = (SP_MODES.includes(attr) ? attr : "pass") as SpMode;
        else if (cl.contains("pt-fillh") || cl.contains("pt-fill")) mode = "fill";
        else if (cl.contains("pt-bgshift")) mode = "bg";
        else if (cl.contains("pt-paws")) mode = "paws";
        else if (cl.contains("pt-scale-scroll")) mode = "pass";
        const parAttr = el.getAttribute("data-par");
        const par = parAttr ? parseFloat(parAttr) || 0 : 0;
        if (!mode && !par) return;
        // カラーフィル: 見出し本来の色を「塗られた後の色」にする(指定が無ければ)
        if (cl.contains("pt-fillh") || cl.contains("pt-fill")) {
          if (!el.style.getPropertyValue("--fill-to")) {
            const src = cl.contains("pt-fillh") ? el : (el.parentElement ?? el);
            el.style.setProperty("--fill-to", getComputedStyle(src).color);
          }
        }
        const f = parseFloat(el.dataset.from ?? "");
        const t = parseFloat(el.dataset.to ?? "");
        const dFrom = mode === "bg" ? 0.96 : 0.92;
        const dTo = mode === "bg" ? 0.46 : 0.42;
        const kids = mode === "paws" ? Array.from(el.querySelectorAll<HTMLElement>(".pt-paw")) : [];
        recs.push({ el, mode, par, from: Number.isFinite(f) ? f : dFrom, to: Number.isFinite(t) ? t : dTo, lastP: "", kids, on: kids.map(() => false) });
        added = true;
      });
      for (let i = recs.length - 1; i >= 0; i--) if (!recs[i].el.isConnected) recs.splice(i, 1);
      return added;
    };

    const register = () => {
      shell.querySelectorAll<HTMLElement>(REV_SEL).forEach((el) => {
        if (el.classList.contains("is-in") || seen.has(el)) return;
        seen.add(el);
        const g = el.closest("[data-io-group]");
        if (g && !el.style.getPropertyValue("--d")) {
          const idx = Array.prototype.indexOf.call(g.querySelectorAll(REV_SEL), el);
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
      if (!reduce) {
        const added = addRecs();
        skews = Array.from(shell.querySelectorAll<HTMLElement>(".pt-skew"));
        if (fine) {
          magnets = Array.from(shell.querySelectorAll<HTMLElement>(".pt-magnet"));
          flees = Array.from(shell.querySelectorAll<HTMLElement>(".pt-flee"));
          marquees = Array.from(shell.querySelectorAll<HTMLElement>(".pt-marquee"));
        }
        if (added) schedule();
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
    const onVis = () => {
      root.toggleAttribute("data-pt-hidden", document.hidden);
      if (!document.hidden) schedule();
    };
    document.addEventListener("visibilitychange", onVis);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

    // ---- マウス反応の状態 ----
    let px = -1e4;
    let py = -1e4;
    let pdirty = false;
    let tiltEl: HTMLElement | null = null;
    let hotMq: Element | null = null;
    const magOff = new WeakMap<Element, [number, number]>();
    const fleeOff = new WeakMap<Element, [number, number]>();
    const mqAnim = new WeakMap<Element, Animation>();
    const mqRate = new WeakMap<Element, number>();
    const endTilt = (el: HTMLElement) => {
      el.classList.remove("is-tilting");
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };
    if (fine) {
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        px = e.clientX;
        py = e.clientY;
        pdirty = true;
        const t = e.target instanceof Element ? e.target : null;
        const tilt = (t?.closest(".pt-tilt") as HTMLElement | null) ?? null;
        if (tilt !== tiltEl) {
          if (tiltEl) endTilt(tiltEl);
          tiltEl = tilt;
          tilt?.classList.add("is-tilting");
        }
        hotMq = t?.closest(".pt-marquee") ?? null;
        schedule();
      };
      const onOut = (e: PointerEvent) => {
        if (e.relatedTarget) return; // 画面の外へ出たとき
        px = py = -1e4;
        pdirty = true;
        if (tiltEl) endTilt(tiltEl);
        tiltEl = null;
        hotMq = null;
        schedule();
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerout", onOut);
        if (tiltEl) endTilt(tiltEl);
        for (const el of magnets) {
          el.style.removeProperty("--mx");
          el.style.removeProperty("--my");
        }
        for (const el of flees) {
          el.style.removeProperty("--fx");
          el.style.removeProperty("--fy");
        }
      });
    }

    // ---- 1 フレームの処理(スクロール駆動+マウス+慣性) ----
    let lastY = window.scrollY;
    let lastT = performance.now();
    let sk = 0; // スクロール速度で傾く角度(deg。なめらかに追従して戻る)
    let hidden = false;
    const setHy = (h: boolean) => {
      if (h === hidden) return;
      hidden = h;
      head?.classList.toggle("is-hidden", h);
      shell.style.setProperty("--pt-hy", h ? "0px" : "var(--pt-hh)");
    };
    frame = (now: number) => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const dy = y - lastY;
      const dt = Math.min(64, Math.max(8, now - lastT));
      lastT = now;
      let again = false;

      // ---- 読む(レイアウトの読み取りはここでまとめる) ----
      const rects = reduce ? null : recs.map((r) => r.el.getBoundingClientRect());
      const doPtr = fine && pdirty;
      const tiltR = doPtr && tiltEl ? tiltEl.getBoundingClientRect() : null;
      const magR = doPtr ? magnets.map((el) => el.getBoundingClientRect()) : null;
      const magS = doPtr ? magnets.map(curShift) : null;
      const fleeR = doPtr ? flees.map((el) => el.getBoundingClientRect()) : null;
      const fleeS = doPtr ? flees.map(curShift) : null;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);

      // ---- 書く ----
      if (bar) bar.style.transform = `scaleX(${clamp(y / max).toFixed(4)})`;
      head?.classList.toggle("is-scrolled", y > 8);
      if (!reduce) {
        const menuOpen = !!head?.querySelector('.pt-drawer[data-open="1"]');
        if (y < 120 || menuOpen) setHy(false);
        else if (dy > 4) setHy(true);
        else if (dy < -4) setHy(false);
      }
      lastY = y;
      if (reduce || !rects) return;

      // スクロール連動(視差の translate と、--p)
      for (let i = 0; i < recs.length; i++) {
        const rec = recs[i];
        const r = rects[i];
        if (rec.par && r.bottom > -200 && r.top < vh + 200) {
          rec.el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * rec.par).toFixed(1)}px`;
        }
        if (!rec.mode) continue;
        let p: number;
        if (rec.mode === "fill" || rec.mode === "bg") p = clamp((rec.from * vh - r.top) / Math.max(0.05, (rec.from - rec.to) * vh));
        else if (rec.mode === "paws") p = clamp((0.86 * vh - r.top) / (r.height + 0.34 * vh));
        else p = clamp((vh - r.top) / (vh + r.height));
        const s = p.toFixed(3);
        if (s !== rec.lastP) {
          rec.lastP = s;
          rec.el.style.setProperty("--p", s);
        }
        if (rec.kids.length) {
          const n = rec.kids.length;
          for (let k = 0; k < n; k++) {
            const on = p * n > k;
            if (on !== rec.on[k]) {
              rec.on[k] = on;
              rec.kids[k].classList.toggle("is-on", on);
            }
          }
        }
      }

      // スクロール速度に応じた軽い傾き(速いと一瞬傾いて戻る)
      if (skews.length) {
        const target = clamp((dy / dt) * 2.2, -4, 4);
        sk += (target - sk) * (Math.abs(target) > Math.abs(sk) ? 0.28 : 0.1); // 傾くのは速く、戻るのはゆっくり
        if (Math.abs(sk) < 0.015 && Math.abs(target) < 0.015) sk = 0;
        else again = true;
        for (const el of skews) {
          const m = parseFloat(el.dataset.skew ?? "") || 1;
          const v = sk * m;
          if (Math.abs(v) < 0.02) {
            if (el.classList.contains("is-skewing")) {
              el.classList.remove("is-skewing");
              el.style.removeProperty("--sk");
            }
          } else {
            el.classList.add("is-skewing");
            el.style.setProperty("--sk", `${v.toFixed(3)}deg`);
          }
        }
      }

      // ティルト・マグネット・逃げる飾り
      if (doPtr) {
        pdirty = false;
        if (tiltEl && tiltR && tiltR.width > 0 && tiltR.height > 0) {
          const m = parseFloat(tiltEl.dataset.tilt ?? "") || 8;
          const nx = clamp((px - (tiltR.left + tiltR.width / 2)) / (tiltR.width / 2), -1, 1);
          const ny = clamp((py - (tiltR.top + tiltR.height / 2)) / (tiltR.height / 2), -1, 1);
          tiltEl.style.setProperty("--rx", `${(-ny * m).toFixed(2)}deg`);
          tiltEl.style.setProperty("--ry", `${(nx * m).toFixed(2)}deg`);
          tiltEl.style.setProperty("--gx", `${((nx + 1) * 50).toFixed(1)}%`);
          tiltEl.style.setProperty("--gy", `${((ny + 1) * 50).toFixed(1)}%`);
        }
        magnets.forEach((el, i) => {
          const r = magR![i];
          const o = magOff.get(el) ?? [0, 0];
          const cx = r.left + r.width / 2 - magS![i][0];
          const cy = r.top + r.height / 2 - magS![i][1];
          const rad = parseFloat(el.dataset.magnetR ?? "") || 46;
          const inside = r.width > 0 && px > r.left - rad && px < r.right + rad && py > r.top - rad && py < r.bottom + rad;
          let tx = 0;
          let ty = 0;
          if (inside) {
            const k = parseFloat(el.dataset.magnet ?? "") || 0.34;
            const lim = Math.max(6, Math.min(18, Math.min(r.width, r.height) * 0.42));
            tx = Math.round(clamp((px - cx) * k, -lim, lim) * 10) / 10;
            ty = Math.round(clamp((py - cy) * k, -lim, lim) * 10) / 10;
          }
          if (tx !== o[0] || ty !== o[1]) {
            magOff.set(el, [tx, ty]);
            el.style.setProperty("--mx", `${tx}px`);
            el.style.setProperty("--my", `${ty}px`);
          }
          el.classList.toggle("is-mag", inside);
        });
        flees.forEach((el, i) => {
          const r = fleeR![i];
          const o = fleeOff.get(el) ?? [0, 0];
          const cx = r.left + r.width / 2 - fleeS![i][0];
          const cy = r.top + r.height / 2 - fleeS![i][1];
          const R = parseFloat(el.dataset.fleeR ?? "") || 150;
          const S = parseFloat(el.dataset.flee ?? "") || 46;
          const dx = cx - px;
          const dyy = cy - py;
          const d = Math.hypot(dx, dyy);
          let tx = 0;
          let ty = 0;
          if (r.width > 0 && d < R) {
            const f = Math.pow(1 - d / R, 1.4) * S;
            if (d > 0.5) {
              tx = Math.round((dx / d) * f * 10) / 10;
              ty = Math.round((dyy / d) * f * 10) / 10;
            } else ty = -f;
          }
          if (tx !== o[0] || ty !== o[1]) {
            fleeOff.set(el, [tx, ty]);
            el.style.setProperty("--fx", `${tx}px`);
            el.style.setProperty("--fy", `${ty}px`);
          }
        });
      }

      // マーキー: ホバーでなめらかに減速(playbackRate を寄せていく)
      if (fine && marquees.length) {
        for (const mq of marquees) {
          let a = mqAnim.get(mq);
          if (!a) {
            const track = mq.querySelector<HTMLElement>(".pt-marquee-track");
            a = track?.getAnimations().find((x) => (x as CSSAnimation).animationName === "pt-marquee");
            if (a) mqAnim.set(mq, a);
          }
          if (!a) continue;
          const target = mq === hotMq ? 0.18 : 1;
          let rate = mqRate.get(mq) ?? 1;
          if (rate !== target) {
            rate += (target - rate) * 0.14;
            if (Math.abs(target - rate) < 0.01) rate = target;
            mqRate.set(mq, rate);
            a.playbackRate = rate;
            if (rate !== target) again = true;
          }
        }
      }

      if (again) schedule();
    };
    frame(performance.now());
    const onScroll = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame = () => {};
      for (const el of skews) {
        el.classList.remove("is-skewing");
        el.style.removeProperty("--sk");
      }
    });

    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}

// ------------------------------------------------------------------ 部品
type Variant = "up" | "fade" | "left" | "right" | "zoom" | "pop" | "blur";

/** 画面に入るとせり上がる。variant: up(既定)/fade/left/right/zoom/pop(オーバーシュートのポップイン)/blur(ぼけて現れる)。delay は ms。[data-io-group] の中なら自動で順番にずれる */
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


// ------------------------------------------------------------------ 動きの部品 2(ポップイン・ティルト・マグネット・カラーフィル・マーキー・足あと ほか)
// クラスだけで使う物(base.css): .pt-popin .pt-blurin .pt-wipe .pt-tilt .pt-magnet .pt-flee .pt-skew .pt-fill .pt-bgshift .pt-scale-scroll
// 部品(下): Marquee / PawTrail / FillHeading / TiltCard / Flee。as には "h2" などの文字列だけを渡す(コンポーネントは不可)。

/**
 * 流れる帯(マーキー)。items を 2 組並べて無限ループ(切れ目なし)。ホバーでなめらかに減速。画面の外・非表示タブでは止まる(pt-live)。
 * items : 流す物(文字・ロゴ・画像などの ReactNode)。sep : 物の間に置く飾り(例 <Paw/> や "・")。
 * repeat : 1 組の中で items を何回並べるか(1 組が画面幅より狭いと切れ目が見える。既定 2)。
 * duration : 1 周の秒数(長いほどゆっくり。既定 40)。reverse : 右向きに流す。fade : 両端を薄く消す。gap : 物の間隔(CSS の長さ。既定 3em)。
 * 文字の大きさ・字体・色は className(または親)で指定。高さは中身で決まる。
 */
export function Marquee({
  items,
  sep,
  repeat = 2,
  duration = 40,
  reverse = false,
  fade = false,
  gap,
  className = "",
  style,
}: {
  items: ReactNode[];
  sep?: ReactNode;
  repeat?: number;
  duration?: number;
  reverse?: boolean;
  fade?: boolean;
  gap?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const group = (dup: boolean) => (
    <div className="pt-marquee-grp" aria-hidden={dup ? true : undefined}>
      {Array.from({ length: Math.max(1, repeat) }, (_, rep) => (
        <span className="pt-marquee-rep" key={rep} aria-hidden={rep > 0 ? true : undefined}>
          {items.map((it, i) => (
            <Fragment key={i}>
              <span className="pt-marquee-it">{it}</span>
              {sep != null ? (
                <span className="pt-marquee-sep" aria-hidden="true">
                  {sep}
                </span>
              ) : null}
            </Fragment>
          ))}
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`pt-marquee pt-live ${reverse ? "pt-marquee--rev" : ""} ${className}`.trim()}
      data-fade={fade ? "" : undefined}
      style={{ ["--mq-dur" as string]: `${duration}s`, ...(gap ? { ["--mq-gap" as string]: gap } : null), ...style } as CSSProperties}
    >
      <div className="pt-marquee-track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

/**
 * 肉球の足あとの列。スクロールに合わせて 1 つずつ「ぺたっ」と現れる(戻ると消える)。mode="auto" なら画面に入ったとき時間差で順に現れる。
 * count : 足あとの数。direction : 進む向き right / left / down / up(足あとの向きもそれに合わせる)。左右(上下)交互にずれて歩いているように並ぶ。
 * size : 1 つの大きさ(px の数字、または CSS の長さ。既定は PC で 14×--u、スマホで 20px)。gap : 間隔(CSS の長さ)。color : 色(既定は明るい茶)。opacity : 濃さ。
 * 置き場は className(position: absolute など)で決める。列の幅・高さは足あとの数と大きさで決まる(交互のずれの分、上下左右に size の半分ほどはみ出す)。
 */
export function PawTrail({
  count = 6,
  direction = "right",
  size,
  gap,
  mode = "scroll",
  delay,
  color,
  opacity,
  className = "",
  style,
}: {
  count?: number;
  direction?: "right" | "left" | "down" | "up";
  size?: number | string;
  gap?: string;
  mode?: "scroll" | "auto";
  delay?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const base = { right: 90, down: 180, left: 270, up: 0 }[direction];
  const st: Record<string, string | number> = {};
  if (size != null) st["--paw"] = typeof size === "number" ? `${size}px` : size;
  if (gap) st["--paw-gap"] = gap;
  if (color) st["--paw-c"] = color;
  if (opacity != null) st["--paw-o"] = opacity;
  if (delay != null) st["--d"] = `${delay}ms`;
  return (
    <span className={`pt-paws pt-paws--${direction} ${mode === "auto" ? "pt-paws--auto" : ""} ${className}`.trim()} aria-hidden="true" style={{ ...st, ...style } as CSSProperties}>
      {Array.from({ length: Math.max(1, count) }, (_, i) => (
        <i key={i} className="pt-paw" style={{ ["--i" as string]: i, ["--alt" as string]: i % 2 ? 1 : -1, ["--rot" as string]: `${base + (i % 2 ? 9 : -9)}deg` } as CSSProperties}>
          <Paw className="pt-paw-i" />
        </i>
      ))}
    </span>
  );
}

/**
 * スクロールで文字が順に色づく見出し(カラーフィル)。画面の下から入って中ほどに来るまでに、左から右へ・行の順に、薄い色から本来の色へ塗られる。
 * 本来の色は見出しの color(className で指定した色)。from / to で変えられる。lines を渡すと行ごとに改行(<br>)。children でもよい(自然な折り返し)。
 * 文字の大きさ・字体・余白は className で(見出しと同じ指定をそのまま付ける)。レイアウトは変わらない。
 * data-from / data-to(画面の高さに対する要素の上端の位置。既定 0.92 → 0.42)で、塗り始め・塗り終わりを変えられる。
 */
export function FillHeading({
  as = "h2",
  lines,
  children,
  from,
  to,
  className = "",
  style,
  start,
  end,
}: {
  as?: ElementType;
  lines?: ReactNode[];
  children?: ReactNode;
  from?: string;
  to?: string;
  className?: string;
  style?: CSSProperties;
  start?: number;
  end?: number;
}) {
  const T = as;
  const st: Record<string, string> = {};
  if (to) st["--fill-to"] = to;
  if (from) st["--fill-from"] = from;
  return (
    <T className={`pt-fillh ${className}`.trim()} data-from={start} data-to={end} style={{ ...st, ...style } as CSSProperties}>
      <span className="pt-fill-t">
        {lines
          ? lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 ? <br /> : null}
                {l}
              </Fragment>
            ))
          : children}
      </span>
    </T>
  );
}

/**
 * マウスに合わせて 3D に傾くカードの包み(hover できる画面だけ。スマホでは動かない)。見た目はそのまま・傾くだけ。
 * max : 最大の傾き(deg。既定 8。大きいカードは小さめに)。glare : 光の反射を重ねる(カードが角丸なら border-radius を継承。親の位置指定は不要)。
 * 同じ要素に pt-lift を付けても両立する。中身のリンク・ボタンはそのまま押せる。
 */
export function TiltCard({
  as = "div",
  max,
  glare = false,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  max?: number;
  glare?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const T = as;
  return (
    <T className={`pt-tilt ${glare ? "pt-tilt--glare" : ""} ${className}`.trim()} data-tilt={max} style={style}>
      {children}
      {glare ? <i className="pt-tilt-glare" aria-hidden="true" /> : null}
    </T>
  );
}

/**
 * カーソルが近づくとふわっと逃げる飾り(葉・足あとなど)の包み。位置(position: absolute など)は className / style で指定し、飾り本体は中に入れる
 * (本体に付いている回転・浮遊のアニメと衝突しないよう、動くのはこの包みだけ)。hover できる画面だけで動く。
 * radius : 逃げ始める距離(px。既定 150)。strength : 逃げる最大の距離(px。既定 46)。
 */
export function Flee({
  as = "span",
  radius,
  strength,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  radius?: number;
  strength?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const T = as;
  return (
    <T className={`pt-flee ${className}`.trim()} data-flee={strength} data-flee-r={radius} style={style} aria-hidden="true">
      {children}
    </T>
  );
}
