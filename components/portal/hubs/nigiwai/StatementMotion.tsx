"use client";
import { useEffect } from "react";

/**
 * 下のブロックの登場（クライアント。見た目は何も出さない）。
 *  - 画面に入った [data-rv] に .in を付ける。CSS は、スクリプトが動き、動きを減らす設定でないときだけ、.in の前を隠す。
 *    画面の外へ出たときに戻さない（一度出たら、そのまま）。
 *  - [data-live]（回り続ける輪の場面）は、画面の外にいるあいだ data-vis="0" にして、動き（CSS animation）を止める。
 */
export default function StatementMotion() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ng-st [data-rv]"));
    const live = Array.from(document.querySelectorAll<HTMLElement>(".ng-st [data-live]"));
    if (!els.length && !live.length) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const vis = new IntersectionObserver(
      (es) => {
        for (const e of es) (e.target as HTMLElement).dataset.vis = e.isIntersecting ? "1" : "0";
      },
      { threshold: 0 },
    );
    live.forEach((el) => vis.observe(el));
    return () => {
      io.disconnect();
      vis.disconnect();
    };
  }, []);
  return null;
}
