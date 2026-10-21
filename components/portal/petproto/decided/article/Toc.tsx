"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Paw } from "../common/Icons";

/** 本文の脇に追従する目次。今読んでいる節に印(茶の線+肉球)が弾みながら滑って移る。項目は順に寄ってくる。クリックでその節へなめらかに移動 */
export default function Toc({ items }: { items: Array<{ id: string; no: string; label: string }> }) {
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.32;
      let cur = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) cur = it.id;
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
  }, [items]);

  useEffect(() => {
    const n = nav.current;
    if (!n) return;
    const place = () => {
      const b = n.querySelector<HTMLElement>(`[data-toc="${active}"]`);
      if (!b) return;
      n.style.setProperty("--ty", `${b.offsetTop}px`);
      n.style.setProperty("--th", `${b.offsetHeight}px`);
    };
    place();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(n);
    return () => ro?.disconnect();
  }, [active]);

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hh = parseFloat(getComputedStyle(document.querySelector(".pt-shell") as Element).getPropertyValue("--pt-hh")) || 56;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hh - 16, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <nav ref={nav} className="ab-toc pt-blurin" aria-label="この記事の目次">
      <p className="ab-toc-h pt-en">Contents</p>
      <ol className="ab-toc-list">
        <i className="ab-toc-ind" aria-hidden="true">
          <span className="ab-toc-paw" key={active}>
            <Paw />
          </span>
        </i>
        {items.map((it, i) => (
          <li key={it.id} data-toc={it.id} className={active === it.id ? "is-on" : ""} style={{ ["--i" as string]: i } as CSSProperties}>
            <a href={`#${it.id}`} onClick={(e) => go(e, it.id)} aria-current={active === it.id ? "true" : undefined}>
              {it.no ? <span className="ab-toc-no pt-en">{it.no}</span> : null}
              <span className="ab-toc-t">{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
