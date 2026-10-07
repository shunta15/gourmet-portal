"use client";
import { useEffect } from "react";

/**
 * 下のブロックの登場（クライアント。見た目は何も出さない）。
 * 画面に入った [data-rv] に .in を付ける。CSS は、スクリプトが動き、動きを減らす設定でないときだけ、.in の前を隠す。
 * 画面の外へ出たときに戻さない（一度出たら、そのまま）。
 */
export default function StatementMotion() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ng-st [data-rv]"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
