"use client";
import { useEffect, useRef, useState } from "react";
import { createCloth, type Cloth } from "./cloth";

export type StreetItem = {
  /** 漢数字（一・二・三…） */
  num: string;
  /** 暖簾に染める名前（データの名前から、かっこの中などを落としたもの） */
  name: string;
  /** データの名前そのまま（読み上げ用） */
  full: string;
  /** その店の区切りへ（#spot-N） */
  href: string;
  /** 縦書きの長さの見積もりと列数（CSS の暖簾用） */
  em: number;
  cols: number;
};

type Props = {
  items: StreetItem[];
  /** 巻頭の写真（暖簾の奥・すき間から見える） */
  photo: string;
  /** 題・副題・日付などの手前の文字（サーバーで描く） */
  children: React.ReactNode;
};

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * 特集記事の巻頭。載っている店（スポット）の数だけ、暖簾が横一列に掛かる「横丁」。
 * 暖簾 1 枚に、漢数字と店名を染める。巻頭の写真は、暖簾の奥・すき間から見える。押す（Enter）と、その店の区切りへ移る。
 * 布は WebGL（ページで 1 つだけ。画面外では描かない）。枚数が多い・幅が狭いときは、布の幅を保ったまま横に送る（指・キーボード・矢印）。
 * 動きを減らす設定・WebGL が使えない環境・スクリプトなしでは、CSS の暖簾（静止）で同じ中身を出す。
 */
export default function FeatureHero({ items, photo, children }: Props) {
  const hero = useRef<HTMLElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  const hover = useRef(-1);
  const sel = useRef(-1);
  const selT = useRef(0);
  const [mode, setMode] = useState<"init" | "gl" | "css">("init");
  const [more, setMore] = useState({ left: false, right: false });

  useEffect(() => {
    const root = hero.current!;
    const z = zone.current!;
    const cv = canvas.current!;
    const ln = lane.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const page = root.closest(".vN") as HTMLElement;
    let alive = true;
    let raf = 0;
    let cloth: Cloth | null = null;
    let family = "serif";
    let inView = true;
    let t0 = performance.now();
    let hov = 0;
    let selAmt = 0;
    let lastDraw = 0;
    let lastScroll = 0;
    let lastScrollY = window.scrollY;
    let activeUntil = 0;
    let lamp = 0.5;
    let lampAt = -9999;
    let key = "";
    let lastAspect = 1;
    // 描画が重い環境（GPU が無い・古い端末）では、布を描く細かさを段階的に落とす（0.5 まで）。軽い環境では 1 のまま
    let quality = 1;
    let prevDraw = 0;
    const samples: number[] = [];
    const n = items.length;

    const layout = () => {
      const W = z.clientWidth;
      const H = z.clientHeight;
      const mobile = W < 640;
      const side = mobile ? 14 : Math.max(24, W * 0.04);
      const gap = mobile ? 6 : 16;
      const avail = W - side * 2;
      const pwMax = mobile ? 128 : 250;
      const pwMin = 104;
      const pw = clamp((avail - (n - 1) * gap) / n, pwMin, pwMax);
      const total = n * pw + (n - 1) * gap;
      const scrolls = total > avail + 1;
      const margin = scrolls ? side : Math.round((W - total) / 2);
      const rodY = 14;
      const hemY = H - 22;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
      cloth?.resize({ cssW: W, cssH: H, dpr, rodY, hemY, gap, margin, panelW: pw });
      const aspect = (hemY - rodY) / pw;
      const k = `${n}|${Math.round(pw)}`;
      if (k !== key || Math.abs(aspect / lastAspect - 1) > 0.06) {
        key = k;
        lastAspect = aspect;
        cloth?.setNames(items.map((it) => ({ num: it.num, name: it.name })), family, aspect);
      }
      z.style.setProperty("--pw", `${pw}px`);
      z.style.setProperty("--gap", `${gap}px`);
      z.style.setProperty("--ml", `${margin}px`);
      z.style.setProperty("--mr", `${scrolls ? side : margin}px`);
      z.style.setProperty("--rod", `${rodY}px`);
      z.style.setProperty("--hem", `${H - hemY}px`);
      updateMore();
      lastDraw = 0;
    };

    const updateMore = () => {
      const l = ln.scrollLeft > 4;
      const r = ln.scrollLeft + ln.clientWidth < ln.scrollWidth - 4;
      setMore((m) => (m.left === l && m.right === r ? m : { left: l, right: r }));
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!inView || document.hidden || !cloth) return;
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY) > 0.5 || Math.abs(ln.scrollLeft - lastScroll) > 0.5) activeUntil = now + 400;
      lastScrollY = y;
      lastScroll = ln.scrollLeft;
      const busy = now < activeUntil || hover.current >= 0 || sel.current >= 0;
      // 動きを減らす設定: 掛かった姿で静止（大きさが変わったときだけ描き直す）
      if (reduce && lastDraw !== 0) return;
      // 触れていないあいだは 40 コマ/秒、触れている・スクロール中は 60 コマ/秒
      if (now - lastDraw < (busy ? 12 : 24)) return;
      if (prevDraw && !reduce) {
        samples.push(now - prevDraw);
        if (samples.length >= 20) {
          const med = [...samples].sort((a, b) => a - b)[10];
          samples.length = 0;
          if (med > 42 && quality > 0.5) {
            quality = Math.max(0.5, quality * 0.75);
            layout();
          }
        }
      }
      prevDraw = now;
      lastDraw = now;
      const t = (now - t0) / 1000;
      const hv = hover.current;
      hov += ((hv >= 0 ? 1 : 0) - hov) * 0.18;
      const st = sel.current >= 0 ? 1 : 0;
      selAmt += (st - selAmt) * 0.12;
      if (st === 0 && selAmt < 0.002) selAmt = 0;
      if (now - lampAt > 1000) {
        lampAt = now;
        lamp = parseFloat(getComputedStyle(page).getPropertyValue("--lamp")) || 0.5;
      }
      const intro = reduce ? 1 : ease(clamp((t - 0.35) / 1.5, 0, 1));
      cloth.render({
        time: reduce ? 3 : t,
        open: 0,
        gust: reduce ? 0.1 : 0.16 + (now < activeUntil ? 0.3 : 0),
        mouse: 0,
        lamp,
        scroll: ln.scrollLeft,
        hover: hv >= 0 ? hv : hover.current,
        hoverAmt: hov,
        sel: sel.current,
        selAmt,
        intro,
      });
    };

    const onEnter = (e: Event) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (a) hover.current = Number(a.dataset.i);
    };
    const onLeave = () => {
      hover.current = -1;
    };
    const onResize = () => layout();
    const onLaneScroll = () => {
      updateMore();
      activeUntil = performance.now() + 400;
    };
    const io = new IntersectionObserver(
      (es) => {
        inView = es[0].isIntersecting;
        if (inView) lastDraw = 0;
        prevDraw = 0;
        samples.length = 0;
      },
      { rootMargin: "80px" }
    );
    io.observe(root);

    (async () => {
      cloth = createCloth(cv);
      family = getComputedStyle(page).getPropertyValue("--vN-brush").trim() || "serif";
      try {
        const glyphs = Array.from(new Set(items.map((it) => it.num + it.name).join("") + "輪")).join("");
        await document.fonts.load(`400 100px ${family}`, glyphs);
        await document.fonts.ready;
      } catch {}
      if (!alive) return;
      if (!cloth) {
        setMode("css");
        return;
      }
      layout();
      t0 = performance.now();
      setMode("gl");
      raf = requestAnimationFrame(frame);
    })();

    ln.addEventListener("pointerover", onEnter);
    ln.addEventListener("focusin", onEnter);
    ln.addEventListener("pointerleave", onLeave);
    ln.addEventListener("focusout", onLeave);
    ln.addEventListener("scroll", onLaneScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => layout());
    ro.observe(z);
    (root as HTMLElement & { _press?: (i: number) => void })._press = (i: number) => {
      sel.current = i;
      window.clearTimeout(selT.current);
      selT.current = window.setTimeout(() => {
        sel.current = -1;
      }, 1500);
    };
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(selT.current);
      ln.removeEventListener("pointerover", onEnter);
      ln.removeEventListener("focusin", onEnter);
      ln.removeEventListener("pointerleave", onLeave);
      ln.removeEventListener("focusout", onLeave);
      ln.removeEventListener("scroll", onLaneScroll);
      window.removeEventListener("resize", onResize);
      cloth?.destroy();
    };
  }, [items]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    const target = document.getElementById(items[i].href.replace(/^#/, ""));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (hero.current as (HTMLElement & { _press?: (i: number) => void }) | null)?._press?.(i);
    // 暖簾が持ち上がるのを見せてから、その店の区切りへ移る
    window.setTimeout(
      () => {
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        try {
          history.replaceState(null, "", `#${target.id}`);
        } catch {}
        target.focus({ preventScroll: true });
      },
      reduce || mode !== "gl" ? 0 : 320
    );
  };

  const nudge = (d: number) => {
    const ln = lane.current;
    if (ln) ln.scrollBy({ left: d * ln.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section ref={hero} className="vF-hero" data-mode={mode} aria-label="巻頭">
      <div className="vF-hero-img" style={photo ? { backgroundImage: `url("${photo}")` } : undefined} aria-hidden="true" />
      <div className="vF-hero-sh" aria-hidden="true" />
      <div className="vF-hero-head">{children}</div>

      <div ref={zone} className="vF-street" style={{ ["--n" as string]: items.length }}>
        <canvas ref={canvas} className="vF-cloth" aria-hidden="true" />
        <div className="vF-rodline" aria-hidden="true" />
        <nav className="vF-lane-w" aria-label="記事に載っている店・場所の暖簾">
          <div ref={lane} className="vF-lane" tabIndex={-1}>
            <ol>
              {items.map((it, i) => (
                <li key={it.href}>
                  <a
                    href={it.href}
                    data-i={i}
                    className="vF-nr"
                    aria-label={`${it.num}　${it.full}`}
                    data-cursor="ENTER"
                    onClick={(e) => go(e, i)}
                  >
                    <span className="vF-nr-fb" aria-hidden="true" style={{ ["--em" as string]: it.em, ["--cols" as string]: it.cols }}>
                      <i className="no">{it.num}</i>
                      <b className="nm">{it.name}</b>
                      <i className="vN-seal">輪</i>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
          {more.left && (
            <button type="button" className="vF-more l" onClick={() => nudge(-1)} aria-label="左の暖簾へ" data-cursor="PREV">
              ←
            </button>
          )}
          {more.right && (
            <button type="button" className="vF-more r" onClick={() => nudge(1)} aria-label="右の暖簾へ" data-cursor="NEXT">
              →
            </button>
          )}
        </nav>
      </div>

      <div className="vF-cue" aria-hidden="true">
        <i />
        <span>Scroll</span>
      </div>
    </section>
  );
}
