"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gothic } from "../../common/fonts";

type Img = { src: string; srcSet?: string; sizes?: string };
export type GalleryItem = { thumb: Img; full: string; alt: string };

/**
 * 店の写真(最大 5 枚)。写真を押すと簡単なライトボックス(Esc・閉じるボタン・背景クリック・←→)。
 * 試作の Gallery.tsx と同じ作り(CSS は shop.css の .gn-shop-lb*)だが、写真は props で受ける(試作は data.ts の仮の写真を直接読むため別に作った)。
 * 並びは枚数ごとに real.css の .gn-shop-gal-n{1..5} が決める。
 */
export default function GalleryReal({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const lastBtn = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const n = items.length;

  const close = useCallback(() => {
    setOpen(null);
    lastBtn.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevHtml = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const btns = Array.from(document.querySelectorAll<HTMLButtonElement>(".gn-shop-lb button"));
        if (btns.length === 0) return;
        const i = btns.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.shiftKey ? (i <= 0 ? btns.length - 1 : i - 1) : i === btns.length - 1 ? 0 : i + 1;
        e.preventDefault();
        btns[next].focus();
      } else if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % n));
      else if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + n) % n));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open, close, n]);

  if (n === 0) return null;
  return (
    <>
      <ul className={`gn-shop-gal gn-shop-gal-n${n}`} data-mo-group="80">
        {items.map((g, i) => (
          <li key={g.full} data-mo="up" className={`gn-shop-gal-i gn-shop-gal-${i + 1}`}>
            <button
              type="button"
              className="gn-shop-gal-btn"
              aria-label={`${g.alt}を拡大して見る`}
              onClick={(e) => {
                lastBtn.current = e.currentTarget;
                setOpen(i);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...g.thumb} alt={g.alt} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      {open !== null &&
        createPortal(
          <div className={`gn-shop-lb ${gothic.variable}`} role="dialog" aria-modal="true" aria-label="お店の写真" onClick={close}>
            <button ref={closeRef} type="button" className="gn-shop-lb-close" aria-label="閉じる" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5l14 14M19 5 5 19" />
              </svg>
            </button>
            {n > 1 && (
              <button
                type="button"
                className="gn-shop-lb-nav gn-shop-lb-prev"
                aria-label="前の写真"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open - 1 + n) % n);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <figure className="gn-shop-lb-fig" onClick={(e) => e.stopPropagation()}>
              <div className="gn-shop-lb-ph gn-shop-r-lb-ph">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={items[open].full} alt={items[open].alt} />
              </div>
              <figcaption>
                {items[open].alt}({open + 1} / {n})
              </figcaption>
            </figure>
            {n > 1 && (
              <button
                type="button"
                className="gn-shop-lb-nav gn-shop-lb-next"
                aria-label="次の写真"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open + 1) % n);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
