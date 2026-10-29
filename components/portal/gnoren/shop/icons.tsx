import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** 和食(赤い重箱/丼) */
export function IconBowl(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
      <ellipse cx="12" cy="7" rx="8.4" ry="2.6" fill="#c0573a" />
      <path d="M3.6 7.6h16.8v3H3.6z" fill="#a8452a" />
      <path d="M4.2 11.2h15.6v3.2H4.2z" fill="#c0573a" />
      <path d="M4.8 14.8h14.4l-1 4.3a2 2 0 0 1-2 1.5H7.8a2 2 0 0 1-2-1.5z" fill="#a8452a" />
      <path d="M8 9.4h8M8 12.7h8" stroke="#f2d6c8" strokeWidth=".7" />
    </svg>
  );
}
/** カフェ(カップ) */
export function IconCup(p: P) {
  return (
    <svg viewBox="0 0 26 24" {...p} aria-hidden="true">
      <g fill="none" stroke="#6a5444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.2h13.6v4.4a6 6 0 0 1-6 6h-1.6a6 6 0 0 1-6-6z" />
        <path d="M17.6 10.4h1.5a2.7 2.7 0 0 1 0 5.4h-2" />
        <path d="M2 21.6h18" />
        <path d="M8 4.2c-.8 1 .8 1.6 0 2.8M12 4.2c-.8 1 .8 1.6 0 2.8" strokeWidth="1.2" stroke="#b08c60" />
      </g>
    </svg>
  );
}
/** 駅前エリア(ピン) */
export function IconPin(p: P) {
  return (
    <svg viewBox="0 0 20 24" {...p} aria-hidden="true">
      <path d="M10 22.5S2.6 15.4 2.6 9.6a7.4 7.4 0 0 1 14.8 0C17.4 15.4 10 22.5 10 22.5z" fill="#b0482b" />
      <circle cx="10" cy="9.6" r="2.9" fill="#f4e4da" />
    </svg>
  );
}

// 店舗情報の行アイコン
export function IconStore(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
      <path d="M4.5 9.2 5.8 4.4h12.4l1.3 4.8z" fill="#4b3a31" />
      <rect x="4.5" y="9.8" width="15" height="10.6" rx="1.2" fill="#4b3a31" />
      <rect x="9.4" y="13" width="5.2" height="7.4" fill="#faf7f2" opacity=".85" />
      <path d="M4.5 9.4c1 1.2 2.4 1.2 3.4 0 1 1.2 2.4 1.2 3.4 0 1 1.2 2.4 1.2 3.4 0 1 1.2 2.4 1.2 3.4 0" fill="none" stroke="#faf7f2" strokeWidth=".9" />
    </svg>
  );
}
export function IconClock(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2V12l3.2 2.2" />
    </svg>
  );
}
export function IconCalendar(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} {...p}>
      <rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2" />
      <path d="M3.6 10h16.8M8 3.2v4M16 3.2v4" />
      <path d="M8 13.4h1.4M11.3 13.4h1.4M14.6 13.4h1.4M8 16.8h1.4M11.3 16.8h1.4" strokeWidth="1.5" />
    </svg>
  );
}
export function IconPhone(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
      <path d="M6.2 3.6 9 3.2l1.7 4.1-1.9 1.4a11 11 0 0 0 5.6 5.6l1.4-1.9 4.1 1.7-.4 2.8a2.4 2.4 0 0 1-2.6 2.1C10.6 18.5 5.5 13.4 4.1 6.2a2.4 2.4 0 0 1 2.1-2.6z" fill="#4b3a31" />
    </svg>
  );
}
export function IconChair(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} {...p}>
      <path d="M7.4 4.2h9.2l.8 8.2H6.6z" fill="#4b3a31" fillOpacity=".12" />
      <path d="M5.4 12.4h13.2v3.6H5.4zM7 16v4.4M17 16v4.4M4 8.6v7.4" />
    </svg>
  );
}
export function IconNoSmoke(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} {...p}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M5.9 5.9l12.2 12.2" />
      <path d="M7.6 13.6h6.6M16 13.6h1.2M9.6 10.2c1 .6 1.4 1.4 1 2.2" strokeWidth="1.4" />
    </svg>
  );
}
export function IconTrain(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
      <rect x="5.4" y="2.8" width="13.2" height="15.2" rx="3" fill="#4b3a31" />
      <rect x="7.6" y="5.4" width="8.8" height="5" rx="1" fill="#faf7f2" opacity=".9" />
      <circle cx="9" cy="14.2" r="1.1" fill="#faf7f2" />
      <circle cx="15" cy="14.2" r="1.1" fill="#faf7f2" />
      <path d="M8.2 18 6.4 21.6M15.8 18l1.8 3.6" stroke="#4b3a31" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
export function ArrowR(p: P) {
  return (
    <svg viewBox="0 0 16 8" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M0.6 4h14M11.6 0.9 15 4l-3.4 3.1" />
    </svg>
  );
}
export const INFO_ICONS = { store: IconStore, clock: IconClock, calendar: IconCalendar, phone: IconPhone, chair: IconChair, nosmoke: IconNoSmoke, train: IconTrain };
export const TAG_ICONS = { bowl: IconBowl, cup: IconCup, pin: IconPin };
