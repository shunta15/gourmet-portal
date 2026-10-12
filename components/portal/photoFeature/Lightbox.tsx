"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 写真を押すと、その場で大きく見られる（暗い幕 + 写真。もう一度押すか Esc で閉じる。左右で前後の写真へ。スマホは横にはらう）。
 * 大きさは、元の幅の 1.3 倍まで（--nw = 元の幅）。写真の一覧は、開いたときにページの写真（img.pf-img）を DOM の順に集める。
 * JS が動いたときだけ、写真に tabindex=0・role=button を付ける（キーボードでも開ける）。後始末で戻す。
 */
type Shot = { src: string; alt: string; nw: number; ar: number };

export default function Lightbox() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Shot[]>([]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<"" | "next" | "prev">("");
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const box = useRef<HTMLDivElement | null>(null);

  const collect = useCallback((): { shots: Shot[]; imgs: HTMLImageElement[] } => {
    const root = document.querySelector<HTMLElement>(".pf-root");
    const imgs = root ? Array.from(root.querySelectorAll<HTMLImageElement>("img.pf-img")) : [];
    return { imgs, shots: imgs.map((im) => ({ src: im.currentSrc || im.src, alt: im.alt, nw: im.naturalWidth || 900, ar: im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 4 / 3 })) };
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pf-root");
    if (!root) return;
    const figs = Array.from(root.querySelectorAll<HTMLElement>(".pf-ph"));
    figs.forEach((f) => {
      f.setAttribute("tabindex", "0");
      f.setAttribute("role", "button");
      f.setAttribute("aria-label", `${f.querySelector("img")?.getAttribute("alt") ?? "写真"}を大きく見る`);
    });
    const openAt = (fig: HTMLElement) => {
      const { shots, imgs } = collect();
      const img = fig.querySelector<HTMLImageElement>("img.pf-img");
      const idx = img ? imgs.indexOf(img) : 0;
      if (idx < 0) return;
      lastFocus.current = fig;
      setList(shots);
      setDir("");
      setI(idx);
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const fig = t?.closest<HTMLElement>(".pf-ph");
      if (!fig || t?.closest("a, button, summary")) return;
      openAt(fig);
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if ((e.key === "Enter" || e.key === " ") && t?.classList.contains("pf-ph")) {
        e.preventDefault();
        openAt(t);
      }
    };
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      figs.forEach((f) => ["tabindex", "role", "aria-label"].forEach((a) => f.removeAttribute(a)));
    };
  }, [collect]);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.({ preventScroll: true });
  }, []);
  const nRef = useRef(0);
  const go = useCallback((d: 1 | -1) => {
    const n = Math.max(1, nRef.current);
    setI((x) => (x + d + n) % n);
    setDir(d === 1 ? "next" : "prev");
  }, []);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const bs = Array.from(box.current?.querySelectorAll<HTMLElement>("button") ?? []);
        if (!bs.length) return;
        const idx = bs.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        bs[(idx + (e.shiftKey ? -1 : 1) + bs.length) % bs.length].focus();
      }
    };
    const onWheel = (e: WheelEvent) => e.preventDefault();
    document.addEventListener("keydown", onKey);
    const el = box.current;
    el?.addEventListener("wheel", onWheel, { passive: false });
    let sx = 0;
    const ts = (e: TouchEvent) => {
      sx = e.touches[0]?.clientX ?? 0;
    };
    const te = (e: TouchEvent) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - sx;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    };
    el?.addEventListener("touchstart", ts, { passive: true });
    el?.addEventListener("touchend", te, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      el?.removeEventListener("wheel", onWheel);
      el?.removeEventListener("touchstart", ts);
      el?.removeEventListener("touchend", te);
    };
  }, [open, close, go]);

  nRef.current = list.length;
  const cur = list[i];
  return (
    <div ref={box} className={`pf-lb${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="写真を大きく見る" aria-hidden={!open} onClick={close}>
      {cur && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${i}-${dir}`} className={`pf-lb__img${dir ? ` is-${dir}` : ""}`} src={cur.src} alt={cur.alt} style={{ ["--nw" as string]: cur.nw, ["--ar" as string]: cur.ar }} />
      )}
      <button ref={closeBtn} type="button" className="pf-lb__x" aria-label="閉じる" onClick={(e) => { e.stopPropagation(); close(); }} tabIndex={open ? 0 : -1}>
        ×
      </button>
      {list.length > 1 && (
        <>
          <button type="button" className="pf-lb__p" aria-label="前の写真" onClick={(e) => { e.stopPropagation(); go(-1); }} tabIndex={open ? 0 : -1}>
            ‹
          </button>
          <button type="button" className="pf-lb__n" aria-label="次の写真" onClick={(e) => { e.stopPropagation(); go(1); }} tabIndex={open ? 0 : -1}>
            ›
          </button>
          <p className="pf-lb__c" aria-hidden="true">{i + 1} / {list.length}</p>
        </>
      )}
    </div>
  );
}
