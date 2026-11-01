import type { SVGProps } from "react";

/** 料理から探す・暖簾の絵柄(見本から描き起こし。currentColor で色を変える。viewBox 40×34) */
type P = SVGProps<SVGSVGElement>;
const S = { viewBox: "0 0 40 34", "aria-hidden": true, focusable: false } as const;

export function IcWashoku(p: P) {
  return (
    <svg {...S} {...p}>
      <rect x="5" y="4" width="30" height="2.2" rx="1" fill="currentColor" />
      <path d="M6.5 8.4h27c0 9.6-5.4 15.6-13.5 15.6S6.5 18 6.5 8.4z" fill="currentColor" />
      <path d="M15 23.6h10v4.4a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1z" fill="currentColor" />
    </svg>
  );
}
export function IcYoshoku(p: P) {
  return (
    <svg {...S} {...p}>
      <g fill="currentColor">
        <rect x="9" y="3" width="1.8" height="8" rx=".6" />
        <rect x="12.4" y="3" width="1.8" height="8" rx=".6" />
        <rect x="15.8" y="3" width="1.8" height="8" rx=".6" />
        <path d="M9 10h8.6v2.2c0 2.2-1.6 3.2-3 3.4v14.6a1.4 1.4 0 0 1-2.6 0V15.6c-1.9-.3-3-1.3-3-3.4z" />
        <path d="M27.6 3c3 1.2 4.4 5 4.4 10.4 0 1.6-.6 2.4-1.6 2.6h-1.2v14.2a1.5 1.5 0 0 1-3 0V3.4c0-.4.4-.6.8-.4z" />
      </g>
    </svg>
  );
}
export function IcChuka(p: P) {
  return (
    <svg {...S} {...p}>
      <g fill="currentColor">
        <path d="M7 12.5C7 8.6 12.6 6 20 6s13 2.6 13 6.5z" />
        <circle cx="20" cy="5.4" r="2.2" />
        <rect x="5" y="13.6" width="30" height="13.6" rx="3.4" />
      </g>
      <rect x="5" y="19.2" width="30" height="1.6" fill="var(--gn-ic-cut, #a8503a)" />
    </svg>
  );
}
export function IcRamen(p: P) {
  return (
    <svg {...S} {...p}>
      <g fill="currentColor">
        <rect x="6" y="3.2" width="28" height="1.7" rx=".8" />
        <rect x="6" y="6.6" width="28" height="1.7" rx=".8" />
        <rect x="8" y="10" width="24" height="1.7" rx=".8" />
        <path d="M3.5 14h33c0 8.4-6.6 14.6-16.5 14.6S3.5 22.4 3.5 14z" />
      </g>
    </svg>
  );
}
export function IcYakiniku(p: P) {
  return (
    <svg {...S} {...p}>
      <g fill="currentColor" transform="rotate(38 20 17)">
        <rect x="19.1" y="1" width="1.8" height="32" rx=".9" />
        <rect x="15" y="5" width="10" height="6.4" rx="3" />
        <rect x="15" y="12.4" width="10" height="6.4" rx="3" />
        <rect x="15" y="19.8" width="10" height="6.4" rx="3" />
      </g>
    </svg>
  );
}
export function IcIzakaya(p: P) {
  return (
    <svg {...S} {...p}>
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
        <path d="M12.2 2.4h4.2v4.6c0 1.6 1.6 2.4 1.6 4.8V30a1.4 1.4 0 0 1-1.4 1.4h-5.2A1.4 1.4 0 0 1 10 30V11.8c0-2.4 2.2-3.2 2.2-4.8z" />
        <path d="M10.2 17h7.6" />
        <path d="M22.4 20.6h10.6c0 4.6-2.2 7.6-5.3 7.6s-5.3-3-5.3-7.6z" />
        <path d="M26 28.4h3.4" />
      </g>
    </svg>
  );
}
export function IcCafe(p: P) {
  return (
    <svg {...S} {...p}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M8.5 9h20.5v5.6c0 6-3.8 9.6-10.2 9.6S8.5 20.6 8.5 14.6z" />
        <path d="M29 11.2h2.2a3.4 3.4 0 0 1 0 6.8H28.6" />
        <path d="M4 27.4c2.6 1.6 7.4 2.2 14.6 2.2s12-.6 14.6-2.2" />
        <path d="M6.2 27.2h25" />
      </g>
    </svg>
  );
}

export const CAT_ICONS = [IcWashoku, IcYoshoku, IcChuka, IcRamen, IcYakiniku, IcIzakaya, IcCafe];

export function ChevronRight(p: P) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M3.4 1.6 6.8 5 3.4 8.4" />
    </svg>
  );
}
