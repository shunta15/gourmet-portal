"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; label: string; spy?: boolean; flash?: string };

/**
 * 店舗詳細の追従タブ(見本の塗りつぶしの丸タブ)。
 * - クリックでその節へなめらかに移動、今の節に塗りが滑る(見た目は base.css の gr-tabs--pill)。
 * - 今の節は「見出しの上端がタブの下に来た節のうち、いちばん近い物」で決める(2 列の並びで順番が崩れるため、並び順には頼らない)。
 * - spy:false の札(ページに節が無いタブ)は、押すと近い場所(flash に指した所)へ飛んで短く光らせ、少し離れるまで印を保つ。
 */
export default function ShopTabs({ items, offset = 96 }: { items: Item[]; offset?: number }) {
  const nav = useRef<HTMLElement>(null);
  const pin = useRef<{ id: string; y: number; t: number } | null>(null);
  const [active, setActive] = useState(items[0].id);

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const p = pin.current;
      if (p) {
        if (Date.now() - p.t < 1300 || Math.abs(window.scrollY - p.y) < 90) {
          setActive(p.id);
          return;
        }
        pin.current = null;
      }
      let cur = items[0].id;
      let best = -Infinity;
      for (const it of items) {
        if (it.spy === false) continue;
        const el = document.getElementById(it.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= offset + 12 && top > best) {
          best = top;
          cur = it.id;
        }
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
      if (n.scrollWidth > n.clientWidth + 2) n.scrollTo({ left: b.offsetLeft - (n.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  const go = (it: Item) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = document.getElementById(it.spy === false && it.flash ? it.flash : it.id);
    if (!target) return;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const raw = it.id === items[0].id ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
    const y = Math.min(Math.max(0, raw), max); // ページが短くて届かないときは、押した札をそのまま保つ
    pin.current = { id: it.id, y, t: Date.now() };
    setActive(it.id);
    if (it.spy === false) {
      target.classList.remove("is-flash");
      void target.offsetWidth;
      target.classList.add("is-flash");
      window.setTimeout(() => target.classList.remove("is-flash"), 1800);
    }
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <nav ref={nav} className="gr-tabs gr-tabs--pill sh-tabs" aria-label="ページ内の節">
      <i className="gr-tabs-ind" aria-hidden="true" />
      {items.map((it) => (
        <button key={it.id} type="button" data-tab={it.id} className={`gr-tab ${active === it.id ? "is-on" : ""}`} aria-current={active === it.id ? "true" : undefined} onClick={() => go(it)}>
          {it.label}
        </button>
      ))}
    </nav>
  );
}
