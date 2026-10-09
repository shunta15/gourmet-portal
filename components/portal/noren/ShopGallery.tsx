"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { sized } from "@/lib/imageUrl";

/** 写真の並べ方。1 行 6 列に収まる組み合わせを順に使い、端数の行は穴が空かないように組み替える */
const CYCLE: number[][] = [[4, 2], [2, 2, 2], [3, 3], [2, 4], [6]];
function rowsFor(n: number): number[][] {
  const out: number[][] = [];
  let left = n;
  let c = 0;
  while (left > 0) {
    let pat = CYCLE[c % CYCLE.length];
    c++;
    if (pat.length > left) pat = left === 1 ? [6] : [3, 3];
    out.push(pat);
    left -= pat.length;
  }
  return out;
}

/** 「空間と、料理。」の写真。押すと大きく見られる（矢印キー・Esc に対応） */
export default function ShopGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const from = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const n = images.length;

  const close = useCallback(() => {
    setOpen(null);
    from.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  let k = 0;
  const grid = rowsFor(n).flatMap((row, ri) =>
    row.map((span) => {
      const i = k++;
      return { i, span, ri };
    })
  );

  return (
    <>
      <div className="vS-gal-g">
        {grid.map(({ i, span }) => (
          <button
            key={images[i] + i}
            type="button"
            className="vS-g vN-rv"
            style={{ gridColumn: `span ${span}`, ["--d" as string]: i % 3 }}
            onClick={(e) => {
              from.current = e.currentTarget;
              setOpen(i);
            }}
            aria-label={`${name} 写真 ${i + 1} を大きく見る`}
            data-cursor="ZOOM"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sized(images[i], span >= 4 ? 1200 : 800)} alt={`${name} ギャラリー画像 ${i + 1}`} loading="lazy" decoding="async" />
            <b aria-hidden="true">{String(i + 1).padStart(2, "0")}</b>
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="vS-lb" role="dialog" aria-modal="true" aria-label={`${name} の写真`} onClick={close}>
          <div className="vS-lb-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sized(images[open], 1600)} alt={`${name} ギャラリー画像 ${open + 1}`} onClick={(e) => e.stopPropagation()} />
          </div>
          <div className="vS-lb-bar" onClick={(e) => e.stopPropagation()}>
            <span>
              {String(open + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <div className="vS-lb-nav">
              <button type="button" onClick={() => step(-1)} aria-label="前の写真">←</button>
              <button type="button" onClick={() => step(1)} aria-label="次の写真">→</button>
              <button ref={closeBtn} type="button" onClick={close} aria-label="閉じる">閉じる</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
