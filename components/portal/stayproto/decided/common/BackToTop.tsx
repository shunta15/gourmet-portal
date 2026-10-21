"use client";

import { IconArrowUp } from "./Icons";

/** フッター右の細い枠の丸(上へ戻る)。reduced-motion のときは即移動 */
export default function BackToTop() {
  return (
    <button
      type="button"
      className="sy-totop"
      aria-label="ページの先頭へ戻る"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      <IconArrowUp />
    </button>
  );
}
