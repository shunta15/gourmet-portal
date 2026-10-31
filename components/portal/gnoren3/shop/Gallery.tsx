"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import { gothic } from "../common/fonts";
import { ArrowCircle } from "./icons";
import { GALLERY } from "./data";

const IMG = "/_portal/gnoren3/shop";
// スロット(見本の座標)。写真の幅は不揃い。矢印で写真を 1 つずつ送ると、各スロットに次の写真が入る(object-fit: cover)
const SLOTS = [
  { l: 234, w: 176 },
  { l: 415, w: 133 },
  { l: 552, w: 166 },
  { l: 723, w: 174 },
  { l: 902, w: 140 },
] as const;

/**
 * ギャラリー(見本 3 の「店の風景」)。写真を押すと全画面で拡大(Esc・閉じるボタン・背景クリック・←→)。
 * 暖簾 2 の Gallery の方式を写した。ライトボックスは document.body へ createPortal(祖先の container-type に position:fixed が
 * 閉じ込められるため)。CSS は .gn3-root の外でも効くよう .gn3-shop-lb* で書く(shop.css)。
 */
export default function Gallery() {
  const [shift, setShift] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const lastBtn = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const n = GALLERY.length;

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
        const btns = Array.from(document.querySelectorAll<HTMLButtonElement>(".gn3-shop-lb button"));
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

  return (
    <>
      <button type="button" className="gn3-shop-arrow gn3-shop-arrow-l gn3-shop-a" style={{ "--l": 18, "--t": 94.5, "--w": 28, "--h": 28 } as CSSProperties} aria-label="前の写真へ送る" onClick={() => setShift((s) => (s - 1 + n) % n)}>
        <ArrowCircle dir="l" />
      </button>
      <ul className="gn3-shop-gal-list">
        {SLOTS.map((s, i) => {
          const gi = (i + shift) % n;
          const g = GALLERY[gi];
          return (
            <li key={i} className="gn3-shop-gal-i gn3-shop-a" style={{ "--l": s.l, "--t": 26, "--w": s.w, "--h": 153 } as CSSProperties}>
              <button
                type="button"
                className="gn3-shop-gal-btn"
                aria-label={`${g.alt}を拡大して見る`}
                onClick={(e) => {
                  lastBtn.current = e.currentTarget;
                  setOpen(gi);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/${g.img}.webp`} alt={g.alt} loading="lazy" decoding="async" />
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="gn3-shop-arrow gn3-shop-arrow-r gn3-shop-a" style={{ "--l": 1040, "--t": 94.5, "--w": 28, "--h": 28 } as CSSProperties} aria-label="次の写真へ送る" onClick={() => setShift((s) => (s + 1) % n)}>
        <ArrowCircle dir="r" />
      </button>

      {open !== null &&
        createPortal(
          <div className={`gn3-shop-lb ${gothic.variable}`} role="dialog" aria-modal="true" aria-label="店の風景の写真" onClick={close}>
            <button ref={closeRef} type="button" className="gn3-shop-lb-close" aria-label="閉じる" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5l14 14M19 5 5 19" />
              </svg>
            </button>
            <button
              type="button"
              className="gn3-shop-lb-nav gn3-shop-lb-prev"
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
            <figure className="gn3-shop-lb-fig" onClick={(e) => e.stopPropagation()}>
              <div className="gn3-shop-lb-ph" style={{ "--ar": GALLERY[open].w / GALLERY[open].h } as CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/${GALLERY[open].img}.webp`} alt={GALLERY[open].alt} width={GALLERY[open].w * 2} height={GALLERY[open].h * 2} />
              </div>
              <figcaption>
                {GALLERY[open].alt}({open + 1} / {n})
              </figcaption>
            </figure>
            <button
              type="button"
              className="gn3-shop-lb-nav gn3-shop-lb-next"
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
          </div>,
          document.body,
        )}
    </>
  );
}
