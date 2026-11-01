import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement>;

// 営業情報の帯のアイコン(見本 3 を測って描き起こし。黒一色)
export function IconClock(p: P) {
  return (
    <svg viewBox="0 0 20 20" {...p} aria-hidden="true">
      <circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M10 5v5.4l3.4 2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconCalendar(p: P) {
  return (
    <svg viewBox="0 0 20 20" {...p} aria-hidden="true">
      <rect x="1.2" y="2.6" width="17.6" height="16.2" rx="2.4" fill="currentColor" />
      <rect x="3.6" y="7.4" width="12.8" height="9.2" rx="1" fill="#efe9de" />
      <rect x="4.6" y="0.6" width="2.2" height="4" rx="1" fill="currentColor" />
      <rect x="13.2" y="0.6" width="2.2" height="4" rx="1" fill="currentColor" />
      <path d="M6 10.2h1.6M9.2 10.2h1.6M12.4 10.2h1.6M6 13.4h1.6M9.2 13.4h1.6M12.4 13.4h1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
export function IconSeat(p: P) {
  return (
    <svg viewBox="0 0 22 18" {...p} aria-hidden="true">
      <circle cx="11" cy="4" r="3.3" fill="currentColor" />
      <path d="M5.2 12.2c0-3.4 2.4-5.2 5.8-5.2s5.8 1.8 5.8 5.2z" fill="currentColor" />
      <path d="M1 8.2h3.2v9.2H1zM17.8 8.2H21v9.2h-3.2zM4.2 13.6h13.6v3.8H4.2z" fill="currentColor" />
      <path d="M4.6 12.4h12.8" stroke="#efe9de" strokeWidth=".9" />
    </svg>
  );
}
export function IconYen(p: P) {
  return (
    <svg viewBox="0 0 20 20" {...p} aria-hidden="true">
      <circle cx="10" cy="10" r="9.6" fill="currentColor" />
      <path d="M6.4 5.2 10 10.2l3.6-5M10 10.2V15M7.2 10.4h5.6M7.2 12.6h5.6" fill="none" stroke="#efe9de" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconPin(p: P) {
  return (
    <svg viewBox="0 0 14 19" {...p} aria-hidden="true">
      <path d="M7 18.4S.6 11.6.6 6.8a6.4 6.4 0 0 1 12.8 0C13.4 11.6 7 18.4 7 18.4z" fill="currentColor" />
      <circle cx="7" cy="6.8" r="2.4" fill="#efe9de" />
    </svg>
  );
}
export function IconMap(p: P) {
  return (
    <svg viewBox="0 0 22 22" {...p} aria-hidden="true">
      <path d="M1.8 4.6 7.6 2.2l6.8 2.4 5.8-2.4v15.2l-5.8 2.4-6.8-2.4-5.8 2.4zM7.6 2.4v15.2M14.4 4.8v15.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
export const INFO_ICONS = { clock: IconClock, calendar: IconCalendar, seat: IconSeat, yen: IconYen, pin: IconPin } as const;

export function ArrowR(p: P) {
  return (
    <svg viewBox="0 0 24 10" {...p} aria-hidden="true">
      <path d="M1 5h21M17.4 1l4.6 4-4.6 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ArrowCircle({ dir, ...p }: P & { dir: "l" | "r" }) {
  return (
    <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
      <path d={dir === "l" ? "M20 12H4.5M10.4 5.6 4 12l6.4 6.4" : "M4 12h15.5M13.6 5.6 20 12l-6.4 6.4"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
