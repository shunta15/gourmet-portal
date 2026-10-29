"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY } from "./data";

const IMG = "/_portal/gnoren/shop";

/** 店内の様子。写真を押すと簡単なライトボックス(Esc・閉じるボタン・背景クリック・←→ で閉じる/移動)。 */
export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const lastBtn = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastBtn.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % GALLERY.length));
      else if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + GALLERY.length) % GALLERY.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <>
      <ul className="gn-shop-gal">
        {GALLERY.map((g, i) => (
          <li key={g.img} className={`gn-shop-gal-i gn-shop-gal-${i + 1}`}>
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
              <img src={`${IMG}/${g.img}.webp`} alt={g.alt} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div className="gn-shop-lb" role="dialog" aria-modal="true" aria-label="店内の写真" onClick={close}>
          <button ref={closeRef} type="button" className="gn-shop-lb-close" aria-label="閉じる" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
          <button
            type="button"
            className="gn-shop-lb-nav gn-shop-lb-prev"
            aria-label="前の写真"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open - 1 + GALLERY.length) % GALLERY.length);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <figure className="gn-shop-lb-fig" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/${GALLERY[open].img}.webp`} alt={GALLERY[open].alt} />
            <figcaption>
              {GALLERY[open].alt}({open + 1} / {GALLERY.length})
            </figcaption>
          </figure>
          <button
            type="button"
            className="gn-shop-lb-nav gn-shop-lb-next"
            aria-label="次の写真"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open + 1) % GALLERY.length);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
