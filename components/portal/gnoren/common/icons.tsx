import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** ロゴの赤い暖簾(棒 + 3 枚の垂れ。上に切り込み) */
export function NorenMark(p: P) {
  return (
    <svg viewBox="0 0 33 31" {...p} aria-hidden="true">
      <rect x="0" y="0" width="33" height="2.6" fill="#8f3a22" />
      <path d="M2 3.6h8.6v26H2z M12.2 3.6h8.6v26h-8.6z M22.4 3.6H31v26h-8.6z" fill="#b5532f" />
      <path d="M4.6 3.6h1.8v3H4.6z M14.8 3.6h1.8v3h-1.8z M25 3.6h1.8v3H25z" fill="#f8f3ec" />
    </svg>
  );
}
export function SearchIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="10.5" cy="10.5" r="6.8" />
      <path d="M15.6 15.6 21 21" />
    </svg>
  );
}
export function HeartIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...p}>
      <path d="M12 20.5s-8.2-5-8.2-11A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.2 2.9c0 6-8.2 11-8.2 11z" />
    </svg>
  );
}
export function MenuIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
export function CloseIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...p}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}
/** 「→」の細い矢印(すべて見る・ボタン用) */
export function ArrowRight(p: P) {
  return (
    <svg viewBox="0 0 16 8" {...base} strokeWidth={1.1} {...p}>
      <path d="M0.6 4h14M11.6 0.9 15 4l-3.4 3.1" />
    </svg>
  );
}
