type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const IcSearch = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...base}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
);
export const IcPin = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.4 7.5 12.5 7.5 12.5s7.5-7.1 7.5-12.5A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" /></svg>
);
export const IcArrow = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M3 12h17M14 6l6 6-6 6" /></svg>
);
export const IcChev = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="m9 5 7 7-7 7" /></svg>
);
export const IcDown = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 9h12l-6 7Z" /></svg>
);
export const IcRefresh = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M20 12a8 8 0 1 1-3-6.2M20 3v5h-5" /></svg>
);
export const IcCheck = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...base} strokeWidth={2.6}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
