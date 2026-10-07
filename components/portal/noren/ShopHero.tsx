"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createCloth, type Cloth } from "./cloth";
import { panelPlan } from "@/lib/portal/noren/shop";
import Lantern from "./Lantern";

export type Crumb = { label: string; href?: string };
type Props = {
  name: string;
  /** 縦書きの店名の列数と、1 列に入る字数（lib/portal/noren/shop.ts の nameLayout） */
  layout: { cols: number; per: number };
  images: { src: string; alt: string }[];
  /** 業種・最寄り駅などの短い添え書き（縦書き） */
  eyebrow: string[];
  crumbs: Crumb[];
};

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * 店ページの見せ場。その店の屋号を染めた暖簾（WebGL の布）が戸口に掛かっていて、読み込むと自然に上がり、
 * スクロールでも上がる。上がるにつれて戸口が画面いっぱいに広がり、店の写真が現れる。
 * 動きを減らす設定・WebGL が使えない環境では、最初から上がった状態（写真と店名）を出す。スクリプトが動かなくても店名は読める。
 */
export default function ShopHero({ name, layout: nl, images, eyebrow, crumbs }: Props) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"init" | "gl" | "css" | "still">("init");
  const [plan, setPlan] = useState<string[][]>([]);
  const [idx, setIdx] = useState(0);
  const [still, setStill] = useState(false);
  const shown = images.slice(0, 8);

  useEffect(() => {
    const w = wrap.current!;
    const st = stage.current!;
    const cv = canvas.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = w.closest(".vN") as HTMLElement;
    setStill(reduce);
    let alive = true;
    let raf = 0;
    let cloth: Cloth | null = null;
    let open = reduce ? 1 : 0;
    let gust = 1;
    let mouse = 0;
    let mouseT = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let t0 = performance.now();
    let family = "serif";
    let planKey = "";
    let lastAspect = 1;
    let lastOpen = "";
    let lampAt = -9999;
    let lamp = 0.5;
    let dirty = true;

    const setVars = (o: number) => {
      const ex = ease(clamp((o - 0.12) / 0.78, 0, 1));
      w.style.setProperty("--open", o.toFixed(4));
      w.style.setProperty("--ex", ex.toFixed(4));
    };
    if (reduce) {
      setVars(1);
      setMode("still");
      return;
    }
    setVars(0);

    const layout = () => {
      const cssW = st.clientWidth;
      const cssH = st.clientHeight;
      const mobile = cssW < 640;
      const p = panelPlan(name, mobile);
      const n = p.length;
      const gap = mobile ? 5 : 7;
      const rodY = mobile ? 60 : 78;
      const hemY = cssH - (mobile ? 46 : 38);
      let margin: number;
      if (mobile) margin = 12;
      else {
        const pwT = clamp(cssW * 0.17, 150, 250);
        const doorW = Math.min(cssW * 0.8, n * pwT + (n - 1) * gap);
        margin = Math.round((cssW - doorW) / 2);
      }
      const pw = (cssW - 2 * margin - (n - 1) * gap) / n;
      const aspect = (hemY - rodY) / pw;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cloth?.resize({ cssW, cssH, dpr, rodY, hemY, gap, margin });
      const key = p.map((x) => x.join("")).join("|");
      if (key !== planKey || Math.abs(aspect / lastAspect - 1) > 0.06) {
        if (key !== planKey) setPlan(p);
        planKey = key;
        lastAspect = aspect;
        cloth?.setPanels(p, family, aspect);
      }
      w.style.setProperty("--dt", `${rodY}px`);
      w.style.setProperty("--db", `${cssH - hemY}px`);
      w.style.setProperty("--dx", `${margin}px`);
      dirty = true;
    };

    const progress = () => {
      const r = w.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      return clamp(-r.top / span, 0, 1);
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const r = w.getBoundingClientRect();
      const vis = r.bottom > -50 && r.top < window.innerHeight + 50 && !document.hidden;
      const y = window.scrollY;
      vel = vel * 0.9 + Math.min(1, Math.abs(y - lastY) / 60) * 0.1;
      lastY = y;
      const p = progress();
      w.style.setProperty("--prog", p.toFixed(4));
      const t = (now - t0) / 1000;
      // 読み込み後しばらくして、自分で上がる。スクロールでも上がる（大きいほうを採る）
      const auto = ease(clamp((t - 0.8) / 2.8, 0, 1));
      const byScroll = ease(clamp((p - 0.02) / 0.5, 0, 1));
      const target = Math.max(auto, byScroll);
      const prev = open;
      open += (target - open) * 0.085;
      if (Math.abs(target - open) < 0.0005) open = target;
      mouse += (mouseT - mouse) * 0.05;
      gust = 0.12 + 0.95 * Math.exp(-t / 2.4) + vel * 0.9 + Math.abs(open - prev) * 6;
      const os = open.toFixed(4);
      if (os !== lastOpen) {
        lastOpen = os;
        setVars(open);
        dirty = true;
      }
      if (now - lampAt > 1000) {
        lampAt = now;
        lamp = parseFloat(getComputedStyle(root).getPropertyValue("--lamp")) || 0.5;
      }
      if (!vis || !cloth) return;
      cloth.render({ time: t, open, gust: Math.min(1.4, gust), mouse, lamp });
      dirty = false;
    };

    const onMove = (e: MouseEvent) => {
      mouseT = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    const onResize = () => layout();

    (async () => {
      cloth = createCloth(cv);
      family = getComputedStyle(root).getPropertyValue("--vN-brush").trim() || "serif";
      try {
        const glyphs = Array.from(new Set(panelPlan(name, false).flat().concat(panelPlan(name, true).flat()).join("") + "輪")).join("");
        await document.fonts.load(`400 100px ${family}`, glyphs);
        await document.fonts.ready;
      } catch {}
      if (!alive) return;
      layout();
      t0 = performance.now();
      setMode(cloth ? "gl" : "css");
      raf = requestAnimationFrame(frame);
    })();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      cloth?.destroy();
      void dirty;
    };
  }, [name]);

  // 写真をゆっくり入れ替える（動きを減らす設定のときは止める）
  useEffect(() => {
    if (shown.length < 2 || still) return;
    const t = window.setTimeout(() => {
      if (!document.hidden) setIdx((i) => (i + 1) % shown.length);
    }, 6200);
    return () => window.clearTimeout(t);
  }, [idx, shown.length, still]);

  return (
    <section ref={wrap} className="vS-hero" data-mode={mode} aria-label={`${name}の暖簾`}>
      <div ref={stage} className="vS-stage">
        <div className="vS-wall" aria-hidden="true" />
        <Lantern className="vS-lan vS-lan--l" mark="灯" />
        <Lantern className="vS-lan vS-lan--r" mark="宵" />

        <div className="vS-door">
          {shown.map((im, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={im.src}
              src={im.src}
              alt={i === idx ? im.alt : ""}
              aria-hidden={i === idx ? undefined : true}
              className="vS-photo"
              data-on={i === idx ? "1" : "0"}
              {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
              decoding="async"
            />
          ))}
          <div className="vS-shade" aria-hidden="true" />
          <div className="vS-glow" aria-hidden="true" />
        </div>

        {mode === "css" && (
          <div className="vS-fb" aria-hidden="true">
            {plan.map((toks, i) => {
              const mid = (plan.length - 1) / 2;
              const side = i === mid ? "c" : i < mid ? "l" : "r";
              return (
                <span key={i} className="vS-fb-p" data-side={side}>
                  {toks.map((t, j) => (
                    <b key={j}>{t}</b>
                  ))}
                </span>
              );
            })}
          </div>
        )}
        <canvas ref={canvas} className="vS-cloth" aria-hidden="true" />
        <div className="vS-cover" aria-hidden="true" />

        <div className="vS-headline">
          <h1 className="vS-name" style={{ ["--nc" as string]: nl.cols, ["--np" as string]: nl.per }}>
            {name}
          </h1>
          {eyebrow.length > 0 && (
            <p className="vS-eye">
              {eyebrow.map((e) => (
                <span key={e}>{e}</span>
              ))}
            </p>
          )}
        </div>

        <nav className="vS-crumbs" aria-label="パンくず">
          <ol>
            {crumbs.map((c, i) => (
              <li key={i}>
                {c.href ? (
                  <Link href={c.href} data-cursor="BACK">{c.label}</Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {shown.length > 1 && (
          <ol className="vS-frames" aria-label="店の写真">
            {shown.map((im, i) => (
              <li key={im.src}>
                <button type="button" onClick={() => setIdx(i)} aria-label={`写真 ${i + 1} を表示`} aria-current={i === idx ? "true" : undefined} data-cursor="VIEW">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="vS-cue" aria-hidden="true">
          <span className="vS-cue-t">暖簾を上げる</span>
          <i className="vS-cue-l" />
          <span className="vS-cue-e">Scroll</span>
        </div>
      </div>
    </section>
  );
}
