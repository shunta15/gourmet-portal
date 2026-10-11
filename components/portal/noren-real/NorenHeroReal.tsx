"use client";
import { useEffect, useRef, useState } from "react";
import { createClothReal, DYE_EVENT, parseDye, type ClothReal, type DyeKind } from "./clothReal";
import { createLanternReal, type LanternReal } from "./lanternReal";
import Lantern from "../noren/Lantern";
import Link from "next/link";
import { ENTRANCE_COPY_DEFAULT, parseEntranceCopy, type EntranceCopy } from "@/lib/portal/noren/entranceCopy";
import { BRIGHT_EVENT, BRIGHT_MUL, effBright, NOREN_REAL_BRIGHT, NOREN_REAL_SP_SHAPE, parseBright, parseSpShape, SP_HEM_FRAC, SP_MAX_WIDTH, type NorenRealSpShape } from "@/lib/portal/noren/realTop";
import { DEFAULT_FONT, FONT_CLASSES, FONT_KEYS, fontVar, type FontKey } from "./fonts";

export type RealChapter = { key: string; kanji: string; ja: string; en: string };
type Props = {
  photo: string;
  count: number;
  areas: number;
  chapters: RealChapter[];
  /** 布の色（本番では lib/portal/noren/realTop.ts の NOREN_REAL_DYE で固定） */
  defaultDye?: DyeKind;
  /** URL の ?dye= ?wrinkle= ?bright= ?font= ?dpr= と、色・明るさの切り替えイベントを受け付けるか。見本のルート（/proto-noren/real）だけ true。本番は false（既定） */
  allowUrlOverride?: boolean;
  /** スマホ幅（700px 未満）の暖簾の丈の案（既定は realTop.ts の NOREN_REAL_SP_SHAPE） */
  spShape?: NorenRealSpShape;
  /** URL の ?sp=long|half|short|mid でスマホ幅の丈の案を上書きできるか。サーバーで「本番（VERCEL_ENV が production）でないとき」だけ true にして渡す */
  allowSpUrl?: boolean;
  /** URL の ?copy=1〜5 で見出し・リードの候補に替えられるか（?sp= と同じ。本番でないときだけ true） */
  allowCopyUrl?: boolean;
  /** 業種の 7 つの大分類（短い丈の案 "short" で、暖簾のすぐ下に出す札。lib/portal/noren/openSearch.ts の cuisines） */
  genres?: { key: string; kanji: string; label: string; count: number }[];
};

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
 * 見た目の切り替え（試作の比較用）: ?dye=ai|kon|sumi|kakishibu|enji（布の色。藍・濃紺・墨・柿渋・臙脂。cha は柿渋の別名）。window に DYE_EVENT を送っても替わる、?wrinkle=0〜1（細かいしわの強さ。既定 0.2）、?bright=1〜5（明るさの段階。既定は realTop.ts の NOREN_REAL_BRIGHT。時刻は ?t=12:30 / ?t=21:30）、?font=syuku|mai|shippori|antique|tokumin|zenold（字の書体）、?dpr=2（描く細かさ）。
 */
export default function NorenHeroReal({ photo, count, areas, chapters, defaultDye = "ai", allowUrlOverride = false, spShape = NOREN_REAL_SP_SHAPE, allowSpUrl = false, allowCopyUrl = false, genres = [] }: Props) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lanCv = useRef<HTMLCanvasElement>(null);
  const doors = useRef<HTMLElement>(null);
  const hoverRef = useRef(-1);
  const selRef = useRef(-1);
  const selTimer = useRef(0);
  const [mode, setMode] = useState<"init" | "gl" | "css">("init");
  const [dye, setDye] = useState<DyeKind>(defaultDye);
  // スマホ幅（700px 未満）の丈の案。読み込み直後は既定、?sp= があれば（許されているときだけ）上書き
  const [sp, setSp] = useState<NorenRealSpShape>(spShape);
  // 見出し 2 行とリード（既定は lib/portal/noren/entranceCopy.ts。?copy=1〜5 は許されているときだけ）
  const [copy, setCopy] = useState<EntranceCopy>(ENTRANCE_COPY_DEFAULT);
  // 提灯: WebGL で描けないときは、本番の CSS の提灯を代わりに出す
  const [lanCss, setLanCss] = useState(false);

  useEffect(() => {
    const w = wrap.current!;
    const st = stage.current!;
    const cv = canvas.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = w.closest(".vN") as HTMLElement;
    const qs = new URLSearchParams(location.search);
    const allow = allowUrlOverride;
    const dyeQ: DyeKind = (allow ? parseDye(qs.get("dye")) : null) ?? defaultDye;
    const wq = allow ? parseFloat(qs.get("wrinkle") ?? "") : NaN;
    const wrinkleQ = Number.isFinite(wq) ? wq : 0.2;
    setDye(dyeQ);
    const spNow: NorenRealSpShape = (allowSpUrl ? parseSpShape(qs.get("sp")) : null) ?? spShape;
    setSp(spNow);
    const copyQ = allowCopyUrl ? parseEntranceCopy(qs.get("copy")) : null;
    if (copyQ) setCopy(copyQ);
    // 明るさ（布・竿はシェーダーへ、奥の写真は CSS の --real-bright へ。既定は realTop.ts の値。?bright= は見本だけ）
    let bmul = BRIGHT_MUL[(allow ? parseBright(qs.get("bright")) : null) ?? NOREN_REAL_BRIGHT];
    const fontQ = allow && (FONT_KEYS as string[]).includes(qs.get("font") ?? "") ? (qs.get("font") as FontKey) : DEFAULT_FONT;
    const dprQ = allow ? parseFloat(qs.get("dpr") ?? "") : NaN;

    let cloth: ClothReal | null = null;
    let lans: LanternReal | null = null;
    let lastLan = 0;
    let lanDirty = true;
    let lanShown = false;
    let lanLayout: { cssW: number; cssH: number; dpr: number; lans: { cx: number; top: number; F: number }[]; pivotY: number } | null = null;
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
    const applyBright = () => w.style.setProperty("--real-bright", effBright(bmul, lamp).toFixed(4));
    applyBright();
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
      // スマホ幅（700px 未満）だけ、丈の案で裾の位置を変える（"long" と PC は今までどおり）
      const shaped = cssW < SP_MAX_WIDTH && spNow !== "long";
      const rodY = mobile ? 70 : 80;
      const hemY = shaped ? Math.round(cssH * SP_HEM_FRAC[spNow as Exclude<NorenRealSpShape, "long">]) : cssH - (mobile ? 50 : 40);
      const rodR = mobile ? 8 : 11;
      const bandH = (hemY - rodY) * (mobile ? 0.17 : 0.19);
      lay = { cssW, cssH, rodY, hemY, rodR, bandH };
      const want = Number.isFinite(dprQ) && dprQ > 0 ? dprQ : Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.4e6 / Math.max(1, cssW * cssH)));
      const dpr = Math.max(0.5, want * quality);
      // 字の位置・大きさ（隣の字とくっつかないよう、どれも 1 より小さく）: half は布の中ほど、short は布に合わせて小さく、mid は少し上寄せで half より大きめ
      const gl2 = !shaped ? [0.4, 1] : spNow === "half" ? [0.5, 0.88] : spNow === "short" ? [0.5, 0.8] : [0.34, 0.96];
      cloth?.setGlyphLayout(gl2[0], gl2[1]);
      cloth?.resize({ cssW, cssH, dpr, rodY, hemY, rodR, bandH });
      // 提灯: 本番と同じ「奥の左右の上」（上から 76px・中心から 30vw）。紐は舞台の上から垂れ、竿の後ろを通る。
      const F = cssW <= 640 ? 12 : Math.min(22, Math.max(12, cssW * 0.0155));
      // 提灯: ふつうは竿の下（暖簾が上がると見える）。half の案では、裾の下に吊るして「店の中の灯り」として見せる
      const lanTop = shaped && spNow === "half" ? Math.round(hemY + 20) : Math.round(rodY + rodR + 16);
      lanShown = shaped && spNow === "half";
      const off = cssW * 0.30;
      const ldpr = Math.max(0.75, Math.min(want, 1.75) * quality);
      lanLayout = { cssW, cssH, dpr: ldpr, lans: [{ cx: cssW / 2 - off, top: lanTop, F }, { cx: cssW / 2 + off, top: lanTop, F }], pivotY: lanTop - Math.min(cssH * 0.4, 360) };
      lans?.resize(lanLayout);
      lanDirty = true;
      st.style.setProperty("--lan-top", `${lanTop}px`);
      st.style.setProperty("--lan-off", `${(off / cssW * 100).toFixed(1)}vw`);
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
      gust = reduce ? 0.1 : 0.18 + 0.95 * Math.exp(-t / 2.4) + vel * 0.9 + Math.abs(open - prev) * 6;
      const os = open.toFixed(4);
      if (os !== lastOpen) {
        lastOpen = os;
        w.style.setProperty("--open", os);
        w.dataset.up = open > 0.3 ? "1" : "0";
        dirty = true;
      }
      if (now - lampAt > 1000) {
        lampAt = now;
        const lv = parseFloat(getComputedStyle(root).getPropertyValue("--lamp")) || 0.5;
        if (Math.abs(lv - lamp) > 0.001) lanDirty = true;
        lamp = lv;
        applyBright();
        dirty = true;
      }
      const r = w.getBoundingClientRect();
      inView = r.bottom > -50 && r.top < window.innerHeight + 50;
      if (inView && lans && (open > 0.2 || lanShown) && (reduce ? lanDirty : now - lastLan > 30)) {
        lastLan = now;
        lanDirty = false;
        lans.render({ time: reduce ? 3.0 : t, lamp });
      }
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
        gust: Math.min(1.4, gust),
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
      const lcv = lanCv.current;
      lans = lcv ? createLanternReal(lcv) : null;
      if (!lans) setLanCss(true);
      const fam = getComputedStyle(w).getPropertyValue(fontVar(fontQ)).trim();
      if (fam) family = fam;
      const brush = getComputedStyle(root).getPropertyValue("--vN-brush").trim() || '"Yuji Boku", serif';
      try {
        await Promise.all([
          document.fonts.load(`400 100px ${family}`, chapters.map((c) => c.kanji).join("")),
          document.fonts.load(`400 100px ${brush}`, "灯酒"),
        ]);
        await document.fonts.ready;
      } catch {}
      if (!alive) return;
      if (cloth) {
        cloth.setDye(dyeQ);
        cloth.setWrinkle(wrinkleQ);
        cloth.setBright(bmul);
        // 垂れが 6 枚以上でスマホ幅のときは、字を少し小さくして、隣の字とのすき間を空ける
        cloth.setGlyphs(chapters.map((c) => c.kanji), family, chapters.length > 5 && window.innerWidth < 700 ? 0.84 : 1);
      }
      lans?.setGlyphs(["灯", "酒"], brush);
      layout();
      if (cloth) setMode("gl");
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    })();

    const onDye = (e: Event) => {
      const k = parseDye(String((e as CustomEvent).detail ?? ""));
      if (!k) return;
      cloth?.setDye(k);
      setDye(k);
      dirty = true;
      lastDraw = 0;
    };
    const onBright = (e: Event) => {
      const b = parseBright(String((e as CustomEvent).detail ?? ""));
      if (!b) return;
      bmul = BRIGHT_MUL[b];
      cloth?.setBright(bmul);
      applyBright();
      dirty = true;
      lastDraw = 0;
    };
    if (allow) window.addEventListener(DYE_EVENT, onDye);
    if (allow) window.addEventListener(BRIGHT_EVENT, onBright);
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
      window.removeEventListener(DYE_EVENT, onDye);
      window.removeEventListener(BRIGHT_EVENT, onBright);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      dEl?.removeEventListener("pointerover", onEnter);
      dEl?.removeEventListener("focusin", onEnter);
      dEl?.removeEventListener("pointerleave", onLeave);
      dEl?.removeEventListener("focusout", onLeave);
      cloth?.destroy();
      lans?.destroy();
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
    <section ref={wrap} className={`vR-hero ${FONT_CLASSES}`} id="top" data-mode={mode} data-dye={dye} data-sp={sp} aria-label="暖簾をくぐる">
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      <div ref={stage} className="vR-stage">
        <div className="vR-scene">
          <div className="vR-photo" style={{ backgroundImage: `url(${photo})` }} />
          <div className="vR-shade" />
          <div className="vR-glow" />
          {lanCss ? (
            <>
              <Lantern className="vN-hero-lan vN-hero-lan--l" />
              <Lantern className="vN-hero-lan vN-hero-lan--r" mark="酒" />
            </>
          ) : (
            <canvas ref={lanCv} className="vR-lan" aria-hidden="true" />
          )}
          <div className="vR-hlshade" aria-hidden="true" />
          <div className="vN-headline">
            <h1 className="vN-h1" aria-label={copy.lines.join("")}>
              <span className="vN-h1-col" aria-hidden="true">
                <Chars text={copy.lines[0]} />
              </span>
              <span className="vN-h1-col" aria-hidden="true">
                <Chars text={copy.lines[1]} base={Array.from(copy.lines[0]).length} />
              </span>
            </h1>
            <p className="vN-lead">{copy.lead}</p>
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

        <nav ref={doors} className="vR-doors" aria-label={`グルメの種類（${chapters.map((c) => c.kanji).join("・")}）`} style={{ ["--n" as string]: chapters.length }}>
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

        {/* スマホ幅（700px 未満）だけ、裾の下に出す（丈の案 half・short・mid。long と PC では出ない）。暖簾が上がると薄れる */}
        {sp === "short" ? (
          <div className="vR-sp-under vR-sp-under--short">
            <p className="vR-sp-h">
              店を、<em>さがす。</em>
            </p>
            <ul className="vOs-genre vR-sp-genre" aria-label="業種の分類">
              {genres.map((g) => (
                <li key={g.key}>
                  <Link href={`/search?cuisine=${encodeURIComponent(g.label)}`} className="vOs-g" data-cursor="GO">
                    <b className="vOs-g-k" aria-hidden="true">
                      {g.kanji}
                    </b>
                    <span className="vOs-g-t">
                      <span className="vOs-g-n">{g.label}</span>
                      <i className="vOs-g-c">
                        {g.count}
                        <small>軒</small>
                      </i>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : sp === "long" ? null : (
          <div className={`vR-sp-under vR-sp-under--${sp}`}>
            <p className="vR-sp-name">
              マチノワ グルメ<span lang="en">Machinowa Gourmet</span>
            </p>
            <p className="vR-sp-lead">{copy.lead}</p>
            {sp === "half" && (
              <a href="#open-search" className="vR-sp-go" data-cursor="GO">
                店をさがす <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>
        )}

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
