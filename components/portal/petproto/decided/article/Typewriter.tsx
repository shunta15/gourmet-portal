"use client";

import { useEffect, useRef } from "react";

/**
 * タイプライターの段落(画面に入ると 1 文字ずつ打たれる)。まだ打たれていない部分も透明な文字として場所を取るので、行の折り返し・高さは変わらない。
 * JS なし・動きを減らす設定では最初から全文。className は <p> に付く。
 */
export default function Typewriter({ text, className, speed = 42 }: { text: string; className?: string; speed?: number }) {
  const p = useRef<HTMLParagraphElement>(null);
  const done = useRef<HTMLSpanElement>(null);
  const rest = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const P = p.current;
    const D = done.current;
    const R = rest.current;
    if (!P || !D || !R) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const chars = Array.from(text);
    D.textContent = "";
    R.textContent = text;
    let raf = 0;
    let elapsed = 0;
    let last = 0;
    const put = (n: number) => {
      D.textContent = chars.slice(0, n).join("");
      R.textContent = chars.slice(n).join("");
    };
    const step = (t: number) => {
      const dt = last ? Math.min(t - last, 50) : 0;
      last = t;
      elapsed += dt;
      const n = Math.min(chars.length, Math.floor(elapsed / speed));
      put(n);
      if (n < chars.length) raf = requestAnimationFrame(step);
      else P.classList.remove("is-typing");
    };
    const io = new IntersectionObserver(
      (ents) => {
        if (ents.some((x) => x.isIntersecting)) {
          io.disconnect();
          P.classList.add("is-typing");
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.7 },
    );
    io.observe(P);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      P.classList.remove("is-typing");
      D.textContent = text;
      R.textContent = "";
    };
  }, [text, speed]);
  return (
    <p ref={p} className={className}>
      <span ref={done} className="ab-tw-done">
        {text}
      </span>
      <span ref={rest} className="ab-tw-rest" />
    </p>
  );
}
