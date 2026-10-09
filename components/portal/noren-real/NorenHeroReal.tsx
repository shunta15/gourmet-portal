"use client";
import { useEffect, useRef, useState } from "react";
import { createClothReal, type ClothReal, type DyeKind } from "./clothReal";
import { DEFAULT_FONT, FONT_CLASSES, FONT_KEYS, fontVar, type FontKey } from "./fonts";

export type RealChapter = { key: string; kanji: string; ja: string; en: string };
type Props = { photo: string; count: number; areas: number; chapters: RealChapter[]; defaultDye?: DyeKind };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);

// スクリプトが動かない環境でも、5 つの行き先が見えて押せる（布は描かず、藍の面に字を出す）
const NOSCRIPT_CSS =
  ".vR-cover{display:none!important}.vR-scene{opacity:1!important}.vR-cloth{display:none}" +
  ".vR-door{background:#14264a;border-left:3px solid #07090d;display:grid;place-items:start center;padding-top:14vh}" +
  ".vR-door .vN-vh{position:static;width:auto;height:auto;clip:auto;clip-path:none;overflow:visible;font:800 clamp(44px,8vw,120px)/1.1 var(--f-min);color:#efe6d6;writing-mode:vertical-rl;white-space:normal}" +
  ".vR-door-tag{opacity:1;transform:translate(-50%,0)}";

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

/**
 * 暖簾のトップ（リアル版の試作）。1 枚の布（上は竿に乳で通してつながり、下に切れ目が入って 5 つの垂れ）を WebGL で描く。
 * - 5 つの垂れは、それぞれ、その種類の章（#ch-xxx）への行き先（<a>）。乗せると垂れが押されてたわみ、押すと垂れが上がって章へ移る。
 * - スクロールで、布が上がって奥（店の写真と、h1）へ入る。
 * - WebGL が使えない・スクリプトなしのときは、CSS の布（静止）で同じ行き先を出す。「動きを減らす」設定では静止した布。
 * 見た目の切り替え（試作の比較用）: ?dye=ai|kon|cha（布の色。本藍・濃紺・茶）、?wrinkle=0〜1（細かいしわの強さ。既定 0.2）、?font=syuku|mai|shippori|antique|tokumin|zenold（字の書体）、?dpr=2（描く細かさ）。
 */
export default function NorenHeroReal({ photo, count, areas, chapters, defaultDye = "ai" }: Props) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const doors = useRef<HTMLElement>(null);
  const hoverRef = useRef(-1);
  const selRef = useRef(-1);
  const selTimer = useRef(0);
  const [mode, setMode] = useState<"init" | "gl" | "css">("init");
  const [dye, setDye] = useState<DyeKind>(defaultDye);

  useEffect(() => {
    const w = wrap.current!;
    const st = stage.current!;
    const cv = canvas.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = w.closest(".vN") as HTMLElement;
    const qs = new URLSearchParams(location.search);
    const dq = qs.get("dye");
    const dyeQ: DyeKind = dq === "cha" || dq === "kon" || dq === "ai" ? dq : defaultDye;
    const wq = parseFloat(qs.get("wrinkle") ?? "");
    const wrinkleQ = Number.isFinite(wq) ? wq : 0.2;
    setDye(dyeQ);
    const fontQ = (FONT_KEYS as string[]).includes(qs.get("font") ?? "") ? (qs.get("font") as FontKey) : DEFAULT_FONT;
    const dprQ = parseFloat(qs.get("dpr") ?? "");

    let cloth: ClothReal | null = null;
    let raf = 0;
    let alive = true;
    let inView = true;
    let open = 0;
    let target = 0;
    let gust = 1;
    let mouse = 0;
    let mouseT = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let t0 = performance.now();
    let lastN = 0;
    let family = "serif";
    let dirty = true;
    let lastOpen = "";
    let lampAt = -9999;
    let lamp = 0.5;
    let hov = 0;
    let hovIdx = -1;
    let selAmt = 0;
    let px = -999;
    let py = -999;
    let lastDraw = 0;
    let quality = 1;
    let prevDraw = 0;
    const samples: number[] = [];
    let lay = { cssW: 0, cssH: 0, rodY: 80, hemY: 800, rodR: 9.5, bandH: 150 };

    const layout = () => {
      const cssW = st.clientWidth, cssH = st.clientHeight;
      const mobile = cssW < 640;
      const rodY = mobile ? 70 : 80;
      const hemY = cssH - (mobile ? 50 : 40);
      const rodR = mobile ? 8 : 11;
      const bandH = (hemY - rodY) * (mobile ? 0.17 : 0.19);
      lay = { cssW, cssH, rodY, hemY, rodR, bandH };
      const want = Number.isFinite(dprQ) && dprQ > 0 ? dprQ : Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.4e6 / Math.max(1, cssW * cssH)));
      const dpr = Math.max(0.5, want * quality);
      cloth?.resize({ cssW, cssH, dpr, rodY, hemY, rodR, bandH });
      st.style.setProperty("--yb", `${(rodY + bandH).toFixed(1)}px`);
      st.style.setProperty("--hem", `${hemY.toFixed(1)}px`);
      st.style.setProperty("--rod", `${rodY}px`);
      lastN = chapters.length;
      dirty = true;
      lastDraw = 0;
    };

    const progress = () => {
      const r = w.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, r.height - vh);
      return clamp(-r.top / span, 0, 1);
    };

    const apply = (p: number) => {
      const it = (performance.now() - t0) / 1000;
      // 読み込み直後に一度だけ、布が少し持ち上がって「上げられる」ことを示す
      const pulse = reduce || it > 3.6 || p > 0.01 ? 0 : 0.075 * Math.pow(Math.sin((Math.PI * Math.max(0, it - 0.5)) / 3.1), 2);
      target = ease(clamp((p - 0.035) / 0.66, 0, 1)) + pulse;
      w.style.setProperty("--prog", p.toFixed(4));
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
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
      gust = reduce ? 0.1 : 0.12 + 0.70 * Math.exp(-t / 2.2) + vel * 0.9 + Math.abs(open - prev) * 6;
      const os = open.toFixed(4);
      if (os !== lastOpen) {
        lastOpen = os;
        w.style.setProperty("--open", os);
        w.dataset.up = open > 0.3 ? "1" : "0";
        dirty = true;
      }
      if (now - lampAt > 1000) {
        lampAt = now;
        lamp = parseFloat(getComputedStyle(root).getPropertyValue("--lamp")) || 0.5;
        dirty = true;
      }
      const r = w.getBoundingClientRect();
      inView = r.bottom > -50 && r.top < window.innerHeight + 50;
      if (!inView || !cloth) return;
      // 触れている・押している・動いている間は毎コマ、それ以外は 40 コマ/秒
      const hv = hoverRef.current;
      if (hv >= 0) hovIdx = hv;
      hov += ((hv >= 0 ? 1 : 0) - hov) * 0.14;
      if (hv < 0 && hov < 0.002) {
        hov = 0;
        hovIdx = -1;
      }
      const st2 = selRef.current >= 0 ? 1 : 0;
      selAmt += (st2 - selAmt) * 0.11;
      if (st2 === 0 && selAmt < 0.002) selAmt = 0;
      const busy = hv >= 0 || selRef.current >= 0 || selAmt > 0 || Math.abs(open - prev) > 0.0004 || vel > 0.01 || hov > 0;
      if (reduce && !dirty && !busy) return;
      if (now - lastDraw < (busy ? 8 : 24)) return;
      if (prevDraw && !reduce) {
        samples.push(now - prevDraw);
        if (samples.length >= 24) {
          const med = [...samples].sort((a, b) => a - b)[12];
          samples.length = 0;
          if (med > 40 && quality > 0.5) {
            quality = Math.max(0.5, quality * 0.8);
            layout();
          }
        }
      }
      prevDraw = now;
      lastDraw = now;
      dirty = false;
      cloth.render({
        time: reduce ? 3.0 : t,
        open,
        gust: Math.min(1.3, gust),
        mouse: reduce ? 0 : mouse,
        lamp,
        px,
        py,
        hover: hovIdx,
        hoverAmt: hov,
        sel: selRef.current,
        selAmt,
      });
    };

    const onMove = (e: PointerEvent) => {
      mouseT = (e.clientX / window.innerWidth - 0.5) * 2;
      const r = st.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const onEnter = (e: Event) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (a) {
        hoverRef.current = Number(a.dataset.i);
        if (e.type === "focusin") {
          const r = a.getBoundingClientRect();
          const sr = st.getBoundingClientRect();
          px = r.left - sr.left + r.width / 2;
          py = r.top - sr.top + r.height * 0.55;
        }
      }
    };
    const onLeave = () => {
      hoverRef.current = -1;
    };
    const onResize = () => layout();
    const dEl = doors.current;
    const ro = new ResizeObserver(() => layout());
    ro.observe(st);

    (async () => {
      cloth = createClothReal(cv);
      if (!cloth) setMode("css");
      const fam = getComputedStyle(w).getPropertyValue(fontVar(fontQ)).trim();
      if (fam) family = fam;
      try {
        await document.fonts.load(`400 100px ${family}`, chapters.map((c) => c.kanji).join(""));
        await document.fonts.ready;
      } catch {}
      if (!alive) return;
      if (cloth) {
        cloth.setDye(dyeQ);
        cloth.setWrinkle(wrinkleQ);
        cloth.setGlyphs(chapters.map((c) => c.kanji), family);
      }
      layout();
      if (cloth) setMode("gl");
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    })();

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    dEl?.addEventListener("pointerover", onEnter);
    dEl?.addEventListener("focusin", onEnter);
    dEl?.addEventListener("pointerleave", onLeave);
    dEl?.addEventListener("focusout", onLeave);
    void lastN;

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearTimeout(selTimer.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      dEl?.removeEventListener("pointerover", onEnter);
      dEl?.removeEventListener("focusin", onEnter);
      dEl?.removeEventListener("pointerleave", onLeave);
      dEl?.removeEventListener("focusout", onLeave);
      cloth?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 押す: その垂れが上がってから、その章へ移る
  const go = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = document.getElementById(`ch-${chapters[i].key}`);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    selRef.current = i;
    window.clearTimeout(selTimer.current);
    selTimer.current = window.setTimeout(() => {
      selRef.current = -1;
    }, 1800);
    window.setTimeout(
      () => {
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        try {
          history.replaceState(null, "", `#${target.id}`);
        } catch {}
      },
      reduce || mode !== "gl" ? 0 : 380
    );
  };

  return (
    <section ref={wrap} className={`vR-hero ${FONT_CLASSES}`} id="top" data-mode={mode} data-dye={dye} aria-label="暖簾をくぐる">
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      <div ref={stage} className="vR-stage">
        <div className="vR-scene">
          <div className="vR-photo" style={{ backgroundImage: `url(${photo})` }} />
          <div className="vR-shade" />
          <div className="vR-glow" />
          <div className="vR-hlshade" aria-hidden="true" />
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

        {(
          <div className="vR-fb" aria-hidden="true">
            <i className="vR-fb-rod" />
            {chapters.map((c) => (
              <span key={c.key} className="vR-fb-p">
                <b>{c.kanji}</b>
              </span>
            ))}
          </div>
        )}
        <canvas ref={canvas} className="vR-cloth" aria-hidden="true" />
        <div className="vR-vig" aria-hidden="true" />

        <nav ref={doors} className="vR-doors" aria-label="グルメの種類（麺・鮨・肉・酒・蕎）" style={{ ["--n" as string]: chapters.length }}>
          {chapters.map((c, i) => (
            <a key={c.key} href={`#ch-${c.key}`} className="vR-door" data-i={i} data-cursor="ENTER" onClick={(e) => go(e, i)}>
              <span className="vN-vh">{c.kanji}　{c.ja}</span>
              <span className="vR-door-tag" aria-hidden="true">
                <b>{c.ja}</b>
                <i>{c.en}</i>
              </span>
            </a>
          ))}
        </nav>

        <div className="vR-cover" aria-hidden="true" />

        <div className="vN-cue" aria-hidden="true">
          <span className="vN-cue-t">暖簾を上げる</span>
          <i className="vN-cue-l" />
          <span className="vN-cue-e">Scroll</span>
        </div>
      </div>
    </section>
  );
}
