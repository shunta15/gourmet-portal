import type { ReactNode } from "react";

type P = { className?: string };
const S = ({ children, className, vb = "0 0 48 48" }: { children: ReactNode; className?: string; vb?: string }) => (
  <svg className={className} viewBox={vb} fill="none" aria-hidden="true" focusable="false">{children}</svg>
);

export const Dumbbell = ({ className }: P) => (
  <S className={className} vb="0 0 56 40">
    <g fill="currentColor"><rect x="1" y="12" width="9" height="16" rx="3" /><rect x="12" y="4" width="10" height="32" rx="4" /><rect x="22" y="17" width="12" height="6" /><rect x="34" y="4" width="10" height="32" rx="4" /><rect x="46" y="12" width="9" height="16" rx="3" /></g>
  </S>
);
export const Woman = ({ className }: P) => (
  <S className={className} vb="0 0 40 64">
    <g fill="currentColor"><circle cx="20" cy="7" r="6" /><path d="M13 16h14l9 22-6 1-4-11 2 16h-6v18h-4V44h-4v18h-4V44h-6l2-16-4 11-6-1z" transform="translate(0 0) scale(.95 .95)" /></g>
  </S>
);
export const Clock = ({ className }: P) => (
  <S className={className}>
    <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="4.5" />
    <path d="M24 12v13l8 5" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);
export const Wrench = ({ className }: P) => (
  <S className={className}>
    <path d="M33 5a11 11 0 0 0-10 15L6 37a4.5 4.5 0 0 0 6.5 6.5L29 27a11 11 0 0 0 15-10l-7 6-6-2-2-6 6-7z" fill="currentColor" />
  </S>
);
export const Ring = ({ className }: P) => (
  <S className={className}>
    <rect x="6" y="9" width="36" height="30" rx="2" stroke="currentColor" strokeWidth="4" />
    <path d="M6 19h36M6 29h36" stroke="currentColor" strokeWidth="3" />
  </S>
);
export const Pin = ({ className }: P) => (
  <S className={className} vb="0 0 24 32">
    <path d="M12 1C6 1 1.5 5.5 1.5 11.2 1.5 19 12 31 12 31s10.5-12 10.5-19.8C22.5 5.5 18 1 12 1z" fill="currentColor" />
    <circle cx="12" cy="11" r="4" fill="#fff" />
  </S>
);
export const Search = ({ className }: P) => (
  <S className={className} vb="0 0 24 24">
    <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2.4" />
    <path d="M15 15l6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </S>
);
export const Chevron = ({ className }: P) => (
  <S className={className} vb="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);
export const ChevronLeft = ({ className }: P) => (
  <S className={className} vb="0 0 24 24">
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);
export const External = ({ className }: P) => (
  <S className={className} vb="0 0 24 24">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);
export const Menu = ({ className }: P) => (
  <S className={className} vb="0 0 24 24">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </S>
);
export type IconKey = "dumbbell" | "woman" | "clock" | "wrench" | "ring";
export const IconByKey = ({ k, className }: { k: IconKey; className?: string }) => {
  switch (k) {
    case "dumbbell": return <Dumbbell className={className} />;
    case "woman": return <Woman className={className} />;
    case "clock": return <Clock className={className} />;
    case "wrench": return <Wrench className={className} />;
    case "ring": return <Ring className={className} />;
  }
};

/** 小さな矢印(短い線 + 矢じり。細い線のまま矢じりが潰れないよう、幅 26 の viewBox で描く) */
export const ArrowShort = ({ className }: P) => (
  <svg className={className} viewBox="0 0 26 9" fill="none" aria-hidden="true" focusable="false">
    <path d="M0 4.5h24M20.5 1l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
