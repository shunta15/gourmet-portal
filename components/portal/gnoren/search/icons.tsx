import type { SVGProps } from "react";
import type { TagIcon } from "./data";

type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** 暖簾の上の料理アイコン(40×36・currentColor) */
export function CuisineIcon({ kind, ...p }: { kind: string } & P) {
  const v = { viewBox: "0 0 40 36", "aria-hidden": true, ...p } as P;
  switch (kind) {
    case "bowl":
      return (
        <svg {...v}>
          <path d="M5 10h30" stroke="currentColor" strokeWidth="2" />
          <path d="M6.5 12.5h27c0 8-4.6 14.5-13.5 14.5S6.5 20.5 6.5 12.5z" fill="currentColor" />
          <path d="M14 30h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "fork":
      return (
        <svg {...v}>
          <path d="M11 4v9a4 4 0 0 0 3 3.9V32M17 4v9a4 4 0 0 1-3 3.9M14 4v10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M28 3c-3.2 2.2-4.2 8-3.6 13.8l3.4 .6V33" fill="currentColor" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );
    case "steamer":
      return (
        <svg {...v}>
          <ellipse cx="20" cy="13" rx="14" ry="4.4" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M6 14v10c0 3 6.2 5 14 5s14-2 14-5V14" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M15 12c1-4 3-5.6 5-6 2 .6 4 2.2 5 6z" fill="currentColor" />
          <circle cx="20" cy="22" r="1.4" fill="currentColor" />
        </svg>
      );
    case "ramen":
      return (
        <svg {...v}>
          <path d="M5 11h30M9 7.5h25M13 14h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M5 17h30c0 8-5 13-15 13S5 25 5 17z" fill="currentColor" />
          <path d="M14 32h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "skewer":
      return (
        <svg {...v}>
          <path d="M5 32 24 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="26" cy="9" r="3.4" fill="currentColor" />
          <circle cx="31" cy="14" r="3.4" fill="currentColor" />
          <circle cx="22.5" cy="14.5" r="3.4" fill="currentColor" />
          <circle cx="28" cy="19.5" r="3.4" fill="currentColor" />
        </svg>
      );
    case "bottle":
      return (
        <svg {...v}>
          <path d="M9 3h6v6c2.4 1.6 3.4 3.2 3.4 6V31a1.6 1.6 0 0 1-1.6 1.6H7.2A1.6 1.6 0 0 1 5.6 31V15C5.6 12 6.6 10.6 9 9z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5.6 19h12.8v8H5.6z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 20h11c0 5-2.4 7.4-5.5 7.4S24 25 24 20zM29.5 27.4V32M26 32h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...v}>
          <path d="M9 10h20c0 8-2.6 14-10 14S9 18 9 10z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M29 12c5.5-1 7.4 1.6 6.2 5-1 2.6-3.8 3.4-7.4 3.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M3 28h30M10 31.4h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

/** カードのタグの小さな線画アイコン(24×24) */
export function TagGlyph({ kind, ...p }: { kind: TagIcon } & P) {
  const v = { viewBox: "0 0 24 24", ...line, ...p } as P;
  switch (kind) {
    case "room":
      return (<svg {...v}><path d="M5 19V9a7 7 0 0 1 14 0v10" /><path d="M3 19h18M8 19v-6h8v6" /></svg>);
    case "bulb":
      return (<svg {...v}><path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.4 10.9c.6.5.9 1.2.9 2h5c0-.8.3-1.5.9-2A6 6 0 0 0 12 3.5z" /></svg>);
    case "counter":
      return (<svg {...v}><rect x="4" y="9" width="16" height="10" rx="1.6" /><path d="M7 9V6.5h10V9M4 13h16" /></svg>);
    case "heart":
      return (<svg {...v} fill="currentColor"><path d="M12 20.5s-8.2-5-8.2-11A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.2 2.9c0 6-8.2 11-8.2 11z" /></svg>);
    case "basket":
      return (<svg {...v}><path d="M4 10h16l-1.6 9.5H5.6z" /><path d="M8 10V8a4 4 0 0 1 8 0v2" /></svg>);
    case "clock":
      return (<svg {...v}><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></svg>);
    case "door":
      return (<svg {...v}><rect x="5" y="4" width="14" height="16" rx="1.6" /><path d="M5 11h14M9 4v7" /></svg>);
    case "glass":
      return (<svg {...v}><path d="M6.5 4h11l-1.4 7.2a4.2 4.2 0 0 1-8.2 0zM12 15.4V20M8.5 20h7" /></svg>);
    case "awning":
      return (<svg {...v}><path d="M4 9.5 6 4.5h12l2 5c0 1.6-1.4 2.6-2.6 2.6S15 11.100 14.800 9.800C14.600 11.100 13.400 12.100 12 12.100S9.400 11.100 9.200 9.800C9 11.100 7.800 12.100 6.600 12.100S4 11.100 4 9.500z" /><path d="M5.500 12.500V20h13v-7.500" /></svg>);
    case "thumb":
      return (<svg {...v}><path d="M8 11v8H4.500v-8zM8 11l3.500-6.500c1.600 0 2.500 1.200 2.200 2.800L13.200 10H18a2 2 0 0 1 2 2.400l-1.200 5.600a2 2 0 0 1-2 1.600H8" /></svg>);
    case "dome":
      return (<svg {...v}><path d="M3.500 17.500h17M5 17.500a7 7 0 0 1 14 0M12 8.500V6.500M10.500 6.500h3M3.500 20.500h17" /></svg>);
    default:
      return (<svg {...v}><rect x="5" y="7" width="14" height="13" rx="1.6" /><path d="M9 7V5.500h6V7M5 12h14" /></svg>);
  }
}

export function PinIcon(p: P) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 2.500a6.500 6.500 0 0 0-6.500 6.500c0 4.800 6.500 12.500 6.500 12.500S18.500 13.800 18.500 9A6.500 6.500 0 0 0 12 2.500zm0 8.800A2.300 2.300 0 1 1 12 6.700a2.300 2.300 0 0 1 0 4.600z" /></svg>);
}
export function CupIcon(p: P) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M3 8h14v4.200A6 6 0 0 1 11 18.200H9A6 6 0 0 1 3 12.200z" /><path d="M17 9.500h1.500a2.700 2.700 0 0 1 0 5.400H16.800" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" /><path d="M2 21h16" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" /></svg>);
}
/** 「料理から探す」の丸い器の印(門のような線画) */
export function DishMark(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.900" strokeLinecap="round" aria-hidden="true" {...p}>
      <circle cx="12" cy="12" r="9.500" />
      <path d="M12 2.500v19M5 8.500h5.200M5 15.500h5.200M13.800 8.500H19M13.800 15.500H19" />
    </svg>
  );
}
export function ChevronDown(p: P) {
  return (<svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="m1.500 1.500 4.500 4.500 4.500-4.500" /></svg>);
}
export function ChevronRight(p: P) {
  return (<svg viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="m1.500 1.500 4.500 4.500-4.500 4.500" /></svg>);
}
export function GridIcon(p: P) {
  return (<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" /><rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" /></svg>);
}
export function ListIcon(p: P) {
  return (<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><rect x="2" y="3" width="3" height="3" rx=".8" /><rect x="7" y="3.500" width="11" height="2" rx="1" /><rect x="2" y="8.500" width="3" height="3" rx=".8" /><rect x="7" y="9" width="11" height="2" rx="1" /><rect x="2" y="14" width="3" height="3" rx=".8" /><rect x="7" y="14.500" width="11" height="2" rx="1" /></svg>);
}
export function ArrowIcon(p: P) {
  return (<svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M1 6h19M15 1l5 5-5 5" /></svg>);
}
