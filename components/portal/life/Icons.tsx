/* くらし(マチノワライフ)の線画アイコン。currentColor・線 1.6。 */
type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
export const IcSearch = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
);
export const IcPin = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 2C8.1 2 5 5 5 8.9c0 5 7 13.1 7 13.1s7-8.1 7-13.1C19 5 15.9 2 12 2Zm0 9.6a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" /></svg>
);
export const IcPinLine = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 21s6.5-6.6 6.5-11.4a6.5 6.5 0 1 0-13 0C5.5 14.400 12 21 12 21Z" /><circle cx="12" cy="9.6" r="2.2" /></svg>
);
export const IcArrow = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M4 12h15M14 6.500l5.500 5.500L14 17.500" /></svg>
);
export const IcChev = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
);
export const IcChevL = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
);
export const IcExt = ({ className }: P) => (
  <svg {...base} className={className}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
);
export const IcLink = ({ className }: P) => (
  <svg {...base} className={className}><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3A4 4 0 0 0 11 18.700l1-1" /></svg>
);
export const IcTag = ({ className }: P) => (
  <svg {...base} className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h4" /></svg>
);
export const IcCheck = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7.500" /></svg>
);
export const IcUp = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
);
/* 種類のアイコン(ヘッダーの札・チップ) */
export const IcBowl = ({ className }: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true"><path d="M3 11h26c0 7-5 12.500-13 12.500S3 18 3 11Z" /><rect x="10" y="24" width="12" height="2.600" rx="1" /><path d="M9 7c0-2 2-2 2-4m5 4c0-2 2-2 2-4m5 4c0-2 2-2 2-4" stroke="currentColor" strokeWidth="1.400" fill="none" strokeLinecap="round" /></svg>
);
export const IcTorii = ({ className }: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true"><path d="M2 6c5 1.500 23 1.500 28 0v3.500H2Z" /><rect x="6" y="11" width="20" height="2.200" /><rect x="8" y="9.500" width="2.800" height="19" /><rect x="21.200" y="9.500" width="2.800" height="19" /><rect x="14.600" y="9.500" width="2.800" height="3.600" /></svg>
);
export const IcBag = ({ className }: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true"><path d="M5 11h22l1.500 17.500h-25Z" /><path d="M11 13V9a5 5 0 0 1 10 0v4" stroke="var(--lf-paper, #fff)" strokeWidth="1.800" fill="none" /></svg>
);
export const IcCamera = ({ className }: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true"><path d="M3 10.500h6l2-3.500h10l2 3.500h6V26H3Z" /><circle cx="16" cy="17.500" r="5.200" fill="var(--lf-paper, #fff)" /><circle cx="16" cy="17.500" r="3.200" /></svg>
);
export const IcTower = ({ className }: P) => (
  <svg viewBox="0 0 24 32" fill="currentColor" className={className} aria-hidden="true"><path d="M10 2h4l1 6h-6Zm-1.500 8h7l1.200 8h-9.400Zm-2.500 10h12l2 10h-16Z" /></svg>
);
export const IcBrand = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.500" className={className} aria-hidden="true"><path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9ZM12 12c2 3 2 6 0 9-2-3-2-6 0-9ZM3 12c3-2 6-2 9 0-3 2-6 2-9 0ZM12 12c3-2 6-2 9 0-3 2-6 2-9 0Z" /></svg>
);
/* 横線の矢印(細い) */
export const ArrowLong = ({ className }: P) => (
  <svg viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="1" className={className} aria-hidden="true" preserveAspectRatio="none"><path d="M0 5h38M33 1l5 4-5 4" vectorEffect="non-scaling-stroke" /></svg>
);
