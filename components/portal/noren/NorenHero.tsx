"use client";
import { useEffect, useRef, useState } from "react";
import { createCloth, type Cloth } from "./cloth";
import Lantern from "./Lantern";

type Props = { photo: string; count: number; areas: number };

const CHARS5 = ["麺", "鮨", "肉", "酒", "蕎"];
const CHARS3 = ["麺", "酒", "鮨"];

function Chars({ text, base = 0 }: { text: string; base?: number }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} className="vN-ch" style={{ ["--i" as string]: base + i }}>
          {c}
        </span>
      ))}
    </>
  );
}

export default function NorenHero({ photo, count, areas }: Props) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"init" | "gl" | "css">("init");
  const [nPanels, setNPanels] = useState(5);

  useEffect(() => {
    const w = wrap.current!;
    const st = stage.current!;
    const cv = canvas.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = w.closest(".vN") as HTMLElement;

    let cloth: Cloth | null = null;
    let raf = 0;
    let alive = true;
    let open = 0;
    let target = 0;
    let gust = 1;
    let mouse = 0;
    let mouseT = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let t0 = performance.now();
    let lastN = 0;
    let lastAspect = 1;
    let family = "serif";
    let dirty = true;
    let lastOpen = "";
    let lampAt = -9999;
    let lamp = 0.5;

    const layout = () => {
      const cssW = st.clientWidth, cssH = st.clientHeight;
      const mobile = cssW < 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cloth?.resize({ cssW, cssH, dpr, rodY: mobile ? 62 : 78, hemY: cssH - (mobile ? 46 : 38), gap: mobile ? 5 : 7 });
      const n = mobile ? 3 : 5;
      const gap = mobile ? 5 : 7;
      const aspect = (cssH - (mobile ? 46 : 38) - (mobile ? 62 : 78)) / ((cssW - (n - 1) * gap) / n);
      if (n !== lastN || Math.abs(aspect / lastAspect - 1) > 0.06) {
        if (n !== lastN) setNPanels(n);
        lastN = n;
        lastAspect = aspect;
        cloth?.setChars(n === 3 ? CHARS3 : CHARS5, family, aspect);
      }
      dirty = true;
    };

    const progress = () => {
      const r = w.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, r.height - vh);
      return Math.min(1, Math.max(0, -r.top / span));
    };
    const ease = (x: number) => x * x * (3 - 2 * x);

    const apply = (p: number) => {
      const it = (performance.now() - t0) / 1000;
      // 読み込み直後に一度だけ、布が少し持ち上がって「上げられる」ことを示す
      const pulse = reduce || it > 3.6 || p > 0.01 ? 0 : 0.075 * Math.pow(Math.sin((Math.PI * Math.max(0, it - 0.5)) / 3.1), 2);
      target = ease(Math.min(1, Math.max(0, (p - 0.035) / 0.66))) + pulse;
      w.style.setProperty("--prog", p.toFixed(4));
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const r = w.getBoundingClientRect();
      const vis = r.bottom > -50 && r.top < window.innerHeight + 50;
      const y = window.scrollY;
      vel = vel * 0.9 + Math.min(1, Math.abs(y - lastY) / 60) * 0.1;
      lastY = y;
      apply(progress());
      const k = reduce ? 1 : 0.085;
      const prev = open;
      open += (target - open) * k;
      if (Math.abs(target - open) < 0.0005) open = target;
      mouse += (mouseT - mouse) * 0.05;
      const t = (now - t0) / 1000;
      gust = reduce ? 0.1 : 0.12 + 0.95 * Math.exp(-t / 2.4) + vel * 0.9 + Math.abs(open - prev) * 6;
      const os = open.toFixed(4);
      if (os !== lastOpen) {
        lastOpen = os;
        w.style.setProperty("--open", os);
        dirty = true;
      }
      if (now - lampAt > 1000) {
        lampAt = now;
        lamp = parseFloat(getComputedStyle(root).getPropertyValue("--lamp")) || 0.5;
        dirty = true;
      }
      if (!vis || !cloth) return;
      if (reduce && !dirty) return;
      dirty = false;
      cloth.render({ time: reduce ? 3.0 : t, open, gust: Math.min(1.4, gust), mouse, lamp });
    };

    const onMove = (e: MouseEvent) => {
      mouseT = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    const onResize = () => layout();

    (async () => {
      cloth = createCloth(cv);
      if (!cloth) {
        setMode("css");
      }
      family = getComputedStyle(root).getPropertyValue("--vN-brush").trim() || "serif";
      try {
        await document.fonts.load(`400 100px ${family}`, "麺鮨肉酒蕎輪");
        await document.fonts.ready;
      } catch {}
      if (!alive) return;
      layout();
      if (cloth) setMode("gl");
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
      if (!cloth) {
        // CSS フォールバックでも --open は更新したいのでループは回す
      }
    })();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      cloth?.destroy();
    };
  }, []);

  const chars = nPanels === 3 ? CHARS3 : CHARS5;

  return (
    <section ref={wrap} className="vN-hero" id="top" data-mode={mode} aria-label="暖簾をくぐる">
      <div ref={stage} className="vN-stage">
        <div className="vN-scene">
          <div className="vN-photo" style={{ backgroundImage: `url(${photo})` }} />
          <div className="vN-scene-shade" />
          <div className="vN-scene-glow" />
          <Lantern className="vN-hero-lan vN-hero-lan--l" />
          <Lantern className="vN-hero-lan vN-hero-lan--r" mark="酒" />
          <div className="vN-headline">
            <h1 className="vN-h1" aria-label="暖簾を、くぐる。">
              <span className="vN-h1-col" aria-hidden="true">
                <Chars text="暖簾を、" />
              </span>
              <span className="vN-h1-col" aria-hidden="true">
                <Chars text="くぐる。" base={4} />
              </span>
            </h1>
            <p className="vN-lead">一日の終わりに寄る店を、駅と街から。</p>
          </div>
          <p className="vN-meta">
            <span>Machinowa Gourmet</span>
            <span>
              {count} tables · {areas} areas
            </span>
          </p>
        </div>

        {mode === "css" && (
          <div className="vN-fb" aria-hidden="true">
            {chars.map((c, i) => {
              const mid = (chars.length - 1) / 2;
              const side = i === mid ? "c" : i < mid ? "l" : "r";
              return (
                <span key={c} className="vN-fb-p" data-side={side} style={{ ["--k" as string]: Math.abs(i - mid) }}>
                  <b>{c}</b>
                </span>
              );
            })}
          </div>
        )}
        <canvas ref={canvas} className="vN-cloth" aria-hidden="true" />
        <div className="vN-cover" aria-hidden="true" />

        <div className="vN-cue" aria-hidden="true">
          <span className="vN-cue-t">暖簾を上げる</span>
          <i className="vN-cue-l" />
          <span className="vN-cue-e">Scroll</span>
        </div>
      </div>
    </section>
  );
}
