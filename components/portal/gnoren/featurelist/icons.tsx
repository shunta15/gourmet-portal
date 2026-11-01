import type { SVGProps } from "react";

// 特集一覧の暖簾・カード見出し用アイコン(currentColor)。線画は stroke、塗りは fill。
type P = SVGProps<SVGSVGElement>;
const S = { fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IcBowl(p: P) {
  return (
    <svg viewBox="0 0 36 32" aria-hidden="true" {...p}>
      <path d="M1.5 12 Q1.5 28 18 28 Q34.5 28 34.5 12 Z" fill="currentColor" />
      <ellipse cx="18" cy="12" rx="16.5" ry="5" fill="currentColor" />
      <ellipse cx="18" cy="12" rx="13.4" ry="3.3" fill="none" stroke="#f6ede2" strokeWidth="1.1" opacity=".85" />
      <path d="M11 11 Q14 3.5 19 5 Q22 3.2 25 11 Z" fill="currentColor" />
      <rect x="10.5" y="27.5" width="15" height="3.6" rx="1.2" fill="currentColor" />
    </svg>
  );
}
export function IcCup(p: P) {
  return (
    <svg viewBox="0 0 40 28" aria-hidden="true" {...p}>
      <path {...S} d="M6 3 H27 V12.5 Q27 20.5 16.5 20.5 Q6 20.5 6 12.5 Z" />
      <path {...S} d="M27 6 H30.5 Q35 6 35 10 Q35 14.5 28.5 14.5" />
      <path {...S} d="M2.2 24.2 Q16.5 28 31 24.2 Q33 23.2 31 22.4 H6 Q1 22.8 2.2 24.2 Z" />
    </svg>
  );
}
export function IcTreeHouse(p: P) {
  return (
    <svg viewBox="0 0 42 32" aria-hidden="true" {...p}>
      <path d="M10 1 L16.5 10 H13.5 L19.5 19.5 H15.5 L21 28 H11.5 V32 H8.5 V28 H-1 L4.5 19.5 H0.5 L6.5 10 H3.5 Z" fill="currentColor" />
      <path fillRule="evenodd" d="M22 18.5 L31 10 L40 18.5 V31 H22 Z M29 31 V24 H33 V31 Z" fill="currentColor" />
      <rect x="34.6" y="7.5" width="3.2" height="6" fill="currentColor" />
    </svg>
  );
}
export function IcWine(p: P) {
  return (
    <svg viewBox="0 0 36 34" aria-hidden="true" {...p}>
      <path {...S} strokeWidth={2.4} d="M3.5 2 H15 Q16.4 14 9.3 17.4 Q2.2 14 3.5 2 Z M9.3 17.4 V30.5 M4.6 31.2 H14" />
      <path fill="currentColor" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" strokeLinecap="round" d="M20 2 H32.5 Q34 14.5 26.2 18 Q18.4 14.5 20 2 Z M26.2 18 V30.5 M21.4 31.2 H31" />
    </svg>
  );
}
export function IcBook(p: P) {
  return (
    <svg viewBox="0 0 38 30" aria-hidden="true" {...p}>
      <path {...S} strokeWidth={2.4} d="M1.6 4 Q10 1.6 19 6 Q28 1.6 36.4 4 V25.4 Q28 23 19 27.6 Q10 23 1.6 25.4 Z M19 6 V27.6" />
      <path {...S} strokeWidth={1.2} opacity=".7" d="M5 7.6 Q10 6.6 15 9 M23 9 Q28 6.6 33 7.6" />
    </svg>
  );
}
export function IcGroup(p: P) {
  return (
    <svg viewBox="0 0 40 30" aria-hidden="true" {...p}>
      <circle cx="20" cy="7" r="5.6" fill="currentColor" />
      <path d="M10.5 29 Q10.5 14.6 20 14.6 Q29.5 14.6 29.5 29 Z" fill="currentColor" />
      <circle cx="7.4" cy="12.6" r="4" fill="currentColor" />
      <path d="M0.6 29 Q0.6 19.6 7.4 19 Q12.4 19.4 13.6 23.6 L12.6 29 Z" fill="currentColor" />
      <circle cx="32.6" cy="12.6" r="4" fill="currentColor" />
      <path d="M39.4 29 Q39.4 19.6 32.6 19 Q27.6 19.4 26.4 23.6 L27.4 29 Z" fill="currentColor" />
    </svg>
  );
}
export function IcPin(p: P) {
  return (
    <svg viewBox="0 0 24 34" aria-hidden="true" {...p}>
      <path fillRule="evenodd" fill="currentColor" d="M12 1 C5.4 1 1 6 1 12 C1 20 12 33 12 33 C12 33 23 20 23 12 C23 6 18.6 1 12 1 Z M12 7.8 a4.2 4.2 0 1 0 .01 0 Z" />
    </svg>
  );
}
export const ICONS = { lunch: IcBowl, cafe: IcCup, walk: IcTreeHouse, date: IcWine, solo: IcBook, family: IcGroup, area: IcPin } as const;
export type ThemeKey = keyof typeof ICONS;
