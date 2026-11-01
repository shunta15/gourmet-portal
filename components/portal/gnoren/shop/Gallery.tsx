"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gothic } from "../common/fonts";
import { GALLERY } from "./data";

const IMG = "/_portal/gnoren/shop";

/**
 * 店内の様子。写真を押すと簡単なライトボックス(Esc・閉じるボタン・背景クリック・←→ で閉じる/移動)。
 * ライトボックスは document.body へ createPortal で出す(祖先に transform=スクロールで出る動き / container-type があると
 * position:fixed がその祖先の中に閉じ込められるため)。そのため CSS は .gn-root / .gn-shop の外でも効くように書く(shop.css の .gn-shop-lb*)。
 */
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
    const prevHtml = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // ダイアログの外へフォーカスが出ないように、中のボタンだけで回す
        const btns = Array.from(document.querySelectorAll<HTMLButtonElement>(".gn-shop-lb button"));
        if (btns.length === 0) return;
        const i = btns.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.shiftKey ? (i <= 0 ? btns.length - 1 : i - 1) : i === btns.length - 1 ? 0 : i + 1;
        e.preventDefault();
        btns[next].focus();
      } else if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % GALLERY.length));
      else if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + GALLERY.length) % GALLERY.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = prevHtml;
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

      {open !== null &&
        createPortal(
        <div className={`gn-shop-lb ${gothic.variable}`} role="dialog" aria-modal="true" aria-label="店内の写真" onClick={close}>
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
            <div className="gn-shop-lb-ph" style={{ "--ar": GALLERY[open].w / GALLERY[open].h } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/${GALLERY[open].img}.webp`} alt={GALLERY[open].alt} width={GALLERY[open].w} height={GALLERY[open].h} />
            </div>
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
        </div>,
        document.body,
      )}
    </>
  );
}
