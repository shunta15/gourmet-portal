"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevron, IconChevronLeft } from "../common/Icons";
import type { SPhoto } from "./data";

/**
 * 客室の写真の列(見本は 2 枚並びで、右下に「‹ 1/4 ›」)。横にスクロールして 1 枚ずつ送れる(スクロールの止まりは写真の左端)。
 * 矢印は、写真が 1 画面に入りきらないときだけ。写真の下の短い字は、写真の説明(あるときだけ)。
 */
export default function PhotoRail({ photos, name, label = "客室" }: { photos: SPhoto[]; name: string; label?: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [idx, setIdx] = useState(0);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const items = Array.from(el.children) as HTMLElement[];
      setOverflow(el.scrollWidth > el.clientWidth + 4);
      let cur = 0;
      for (let i = 0; i < items.length; i++) if (items[i].offsetLeft - el.offsetLeft <= el.scrollLeft + 8) cur = i;
      setIdx(cur);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    el.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      el.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [photos.length]);

  const go = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const next = Math.min(items.length - 1, Math.max(0, idx + dir));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: items[next].offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="sh-rail">
      <ul className="sh-rail-list" ref={rail} aria-label={`${name}の${label}の写真`}>
        {photos.map((p, i) => (
          <li key={p.src} className="sh-rail-i sy-hov">
            <div className="sh-rail-ph sy-zoom">
              <img src={p.src} width={p.w} height={p.h} alt={p.alt} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
            </div>
            {p.what ? <p className="sh-rail-cap">{p.what}</p> : null}
          </li>
        ))}
      </ul>
      {overflow ? (
        <div className="sh-rail-nav">
          <button type="button" className="sh-rail-b" aria-label="前の写真" onClick={() => go(-1)} disabled={idx <= 0}>
            <IconChevronLeft />
          </button>
          <span className="sh-rail-n" aria-live="polite">
            {idx + 1} / {photos.length}
          </span>
          <button type="button" className="sh-rail-b" aria-label="次の写真" onClick={() => go(1)} disabled={idx >= photos.length - 1}>
            <IconChevron />
          </button>
        </div>
      ) : null}
    </div>
  );
}
