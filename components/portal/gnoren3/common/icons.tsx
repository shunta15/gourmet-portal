import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** ロゴのまるい器(見本のヘッダー左。上に三日月の三本線・下にレンズ形の白)。実寸 27×25u */
export function BowlMark(p: P) {
  return (
    <svg viewBox="0 0 28 26" {...p} aria-hidden="true">
      <path d="M0.6 17.3C0.6 7 6 0.4 14 0.4S27.8 6 27.8 14.7C24 8 19 6.6 13.4 6.6 8 6.6 3 10 0.6 17.3Z" fill="#ecebe6" />
      <path d="M3.6 15.2C6 10.6 10 8.6 14 8.6s8.2 1.9 10.2 5.6C20 12.2 8 12.2 3.6 15.2Z" fill="#7d7a74" />
      <path d="M6 12.6C9.5 10.6 18.5 10.6 22 12.6M5 14.2C9 12.6 19 12.6 23 14.2" fill="none" stroke="#cfcdc7" strokeWidth=".7" />
      <path d="M2.8 19.2C7 10.8 21 10.8 26 19.2 21 27.6 7 27.6 2.8 19.2Z" fill="#f1f0ec" />
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
