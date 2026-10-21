import type { SVGProps } from "react";

/**
 * 決定案の共通アイコン(サーバーでも使える。currentColor。サイズは CSS か width/height で)。
 * import { IconSearch, IconHeart, IconMenu, IconArrow, IconChevron, IconPin, Paw, IconInstagram, IconFacebook, IconX, IconYoutube, IconArrowUp } from "@/components/portal/petproto/decided/common/Icons";
 * 線のアイコン(Search/Heart/Menu/Arrow/Chevron/Pin)は stroke=currentColor・線幅 1.5。className="pt-draw" を付けると触ったとき描き直される(base.css)。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IconSearch(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="10.6" cy="10.6" r="6.6" />
      <path d="m15.6 15.6 5.2 5.2" />
    </svg>
  );
}
export function IconHeart(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 20.4s-8.2-5-8.2-11.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.2 2.8c0 6.2-8.2 11.2-8.2 11.2z" />
    </svg>
  );
}
export function IconMenu(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" className="pt-menu-lines" />
    </svg>
  );
}
/** 「すべての〜を見る →」の矢印(横長) */
export function IconArrow(p: P) {
  return (
    <svg viewBox="0 0 16 10" aria-hidden="true" {...line} strokeWidth={1.4} {...p}>
      <path d="M1 5h13.2M10.2 1.2 14.2 5l-4 3.8" />
    </svg>
  );
}
/** 右向きの小さな山(「>」。記事の行の右端など) */
export function IconChevron(p: P) {
  return (
    <svg viewBox="0 0 8 12" aria-hidden="true" {...line} strokeWidth={1.3} {...p}>
      <path d="m1.8 1.5 4.4 4.5-4.4 4.5" />
    </svg>
  );
}
export function IconPin(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 21.2s-6.6-6-6.6-11.3a6.6 6.6 0 0 1 13.2 0C18.6 15.2 12 21.2 12 21.2z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </svg>
  );
}
export function IconArrowUp(p: P) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...line} strokeWidth={1.4} {...p}>
      <path d="M8 13.6V2.8M3.4 7.2 8 2.6l4.6 4.6" />
    </svg>
  );
}

/** 肉球(ロゴ。塗り。currentColor) */
export function Paw(p: P) {
  return (
    <svg viewBox="0 0 104 100" aria-hidden="true" fill="currentColor" {...p}>
      <ellipse cx="35.3" cy="18" rx="10.6" ry="16.6" transform="rotate(-10 35.3 18)" />
      <ellipse cx="70.2" cy="18" rx="10.6" ry="16.6" transform="rotate(10 70.2 18)" />
      <ellipse cx="13.6" cy="47.2" rx="12.2" ry="15.6" transform="rotate(-26 13.6 47.2)" />
      <ellipse cx="92.4" cy="47.2" rx="12.2" ry="15.6" transform="rotate(26 92.4 47.2)" />
      <path d="M52.5 40.5C60.6 40.5 72 54.5 84.6 71.5 93 83 91.6 95 79.5 97.2 70 98.8 62.2 92.2 52.5 92.2 42.8 92.2 35 98.8 25.5 97.2 13.4 95 12 83 20.4 71.5 33 54.5 44.4 40.5 52.5 40.5z" />
    </svg>
  );
}

// ---- フッターの SNS(塗り。見本の黒) ----
export function IconInstagram(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconFacebook(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...p}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
export function IconX(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
export function IconYoutube(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...p}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
