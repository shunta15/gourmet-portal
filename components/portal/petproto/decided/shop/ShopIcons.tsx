import type { SVGProps } from "react";

/** 店舗詳細ページの小さな線のアイコン(currentColor。サーバーで使える)。大きな絵のアイコン(設備・アクセス)は見本から線を取り出した画像マスク(ic-*.png)。 */
type P = SVGProps<SVGSVGElement>;
const ln = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IcCalendar(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.4" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M10.8 14.4 12 15.6l2-2.4" />
    </svg>
  );
}
export function IcMail(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.6 7 8.4 6.4L20.4 7" />
    </svg>
  );
}
export function IcClock(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 1.8" />
    </svg>
  );
}
export function IcPhone(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <path d="M5.2 4.2c.5-.5 1.3-.5 1.8.1l2 2.5c.4.5.4 1.200 0 1.700l-1.200 1.500c1 2.100 2.700 3.800 4.800 4.800l1.500-1.200c.5-.4 1.200-.4 1.700 0l2.500 2c.6.5.6 1.300.1 1.800l-1 1c-1 1-2.500 1.300-3.800.8-5.300-2-9.100-5.800-11.100-11.100-.5-1.300-.2-2.800.8-3.800z" />
    </svg>
  );
}
export function IcLink(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <path d="M10 14a3.600 3.600 0 0 0 5.100 0l3.400-3.400a3.600 3.600 0 0 0-5.100-5.100l-1 1" />
      <path d="M14 10a3.600 3.600 0 0 0-5.100 0l-3.400 3.400a3.600 3.600 0 0 0 5.100 5.100l1-1" />
    </svg>
  );
}
export function IcSns(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.4" />
      <path d="M12 16.400s-3.600-2.100-3.600-4.700a2 2 0 0 1 3.600-1.200 2 2 0 0 1 3.600 1.200c0 2.600-3.600 4.700-3.600 4.700z" />
    </svg>
  );
}
/** 写真の一覧(4 つの四角) */
export function IcGallery(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} strokeWidth={1.7} {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </svg>
  );
}
/** 別画面を開く(四角に矢印) */
export function IcExternal(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} strokeWidth={1.8} {...p}>
      <path d="M10 5H6.500A2.500 2.500 0 0 0 4 7.500v10A2.500 2.500 0 0 0 6.500 20h10a2.500 2.500 0 0 0 2.500-2.500V14" />
      <path d="M14 4h6v6M20 4l-8.500 8.500" />
    </svg>
  );
}
/** タグの小さな絵(四角の中に絵) */
export function IcTagSmall(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <rect x="3.200" y="3.200" width="17.600" height="17.600" rx="3.600" />
      <path d="M8 16.500V12c0-1.400 1-2.400 2.400-2.400h3.600l1.600-1.600v2.400c0 1.200-.8 1.800-1.800 1.800H11v3.400M8 16.500h1.800M12.400 16.500h1.800" />
    </svg>
  );
}
export function IcTagTerrace(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <path d="M3.200 11.500C4.200 6.800 8 4 12 4s7.800 2.800 8.800 7.500zM12 11.500v8.500M8.500 20h7" />
      <path d="M7.800 11.500c.4-3.300 2-5.700 4.200-7.500 2.200 1.800 3.800 4.200 4.200 7.500" />
    </svg>
  );
}
export function IcTagDog(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <path d="M4 13.500V8.800l3 .8 2.800-2.600H15l3 2.600 2-.9v4.800c0 3-2.200 5.500-5 5.500H9c-2.800 0-5-2.500-5-5.500z" />
      <path d="M9 12.300v.6M15 12.300v.6M10.800 15.500h2.400" />
    </svg>
  );
}
export function IcTagParking(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...ln} {...p}>
      <rect x="3.200" y="3.200" width="17.600" height="17.600" rx="3.600" />
      <path d="M9.800 17V7.500h3.300a2.700 2.700 0 0 1 0 5.400H9.800" />
    </svg>
  );
}
/** Instagram(見本の色つき) */
export function IcInstagramColor(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <defs>
        <linearGradient id="sp-ig" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#fdc468" />
          <stop offset="0.35" stopColor="#f0507a" />
          <stop offset="0.7" stopColor="#b02bb0" />
          <stop offset="1" stopColor="#5a4bd1" />
        </linearGradient>
      </defs>
      <rect x="1.500" y="1.500" width="21" height="21" rx="6" fill="url(#sp-ig)" />
      <rect x="6.200" y="6.200" width="11.600" height="11.600" rx="3.600" fill="none" stroke="#fff" strokeWidth="1.900" />
      <circle cx="12" cy="12" r="2.800" fill="none" stroke="#fff" strokeWidth="1.900" />
      <circle cx="16.600" cy="7.400" r="1.100" fill="#fff" />
    </svg>
  );
}
