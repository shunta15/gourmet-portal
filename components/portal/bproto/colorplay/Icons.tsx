// 画面の部品に使う小さな線のアイコン(絵ではなく記号)
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
type S = { size?: number; className?: string };
const Svg = ({ size = 24, className, children }: S & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" {...P}>
    {children}
  </svg>
);
export const IconSearch = (p: S) => (<Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Svg>);
export const IconPin = (p: S) => (<Svg {...p}><path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0113 0c0 4.9-6.5 11-6.5 11z" fill="currentColor" stroke="none" /><circle cx="12" cy="10" r="2.3" fill="#fff" stroke="none" /></Svg>);
export const IconSparkle = (p: S) => (<Svg {...p}><path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" fill="currentColor" stroke="none" /><path d="M19 3v4M17 5h4" /></Svg>);
export const IconHeart = ({ filled, ...p }: S & { filled?: boolean }) => (
  <Svg {...p}><path d="M12 20.5s-8-4.9-8-10.6A4.6 4.6 0 0112 7a4.6 4.6 0 018 2.9c0 5.7-8 10.6-8 10.6z" fill={filled ? "currentColor" : "none"} /></Svg>
);
export const IconMenu = (p: S) => (<Svg {...p}><path d="M5 8h14M5 12h14M5 16h14" /></Svg>);
export const IconClose = (p: S) => (<Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>);
export const IconArrow = (p: S) => (<Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>);
export const IconChevron = (p: S) => (<Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>);
export const IconScissors = (p: S) => (<Svg {...p}><circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8 7.6L20 18M8 16.4L20 6" /></Svg>);
export const IconNail = (p: S) => (<Svg {...p}><path d="M8 21v-9a4 4 0 018 0v9z" /><path d="M10 7V4h4v3" /></Svg>);
export const IconLash = (p: S) => (<Svg {...p}><path d="M3 12c3.5 4 14.5 4 18 0" /><path d="M4 9l2 2M8.5 7.5l1 2.5M12 7v3M15.5 7.5l-1 2.5M20 9l-2 2" /></Svg>);
export const IconLotus = (p: S) => (<Svg {...p}><path d="M12 20c-4 0-7-3-7-7 3 0 5.5 1.2 7 3.5C13.5 14.200 16 13 19 13c0 4-3 7-7 7z" /><path d="M12 16.500C10 14 10 9 12 4c2 5 2 10 0 12.500z" /></Svg>);
export const IconSmooth = (p: S) => (<Svg {...p}><path d="M12 3c3 4 5 6.500 5 9.500a5 5 0 01-10 0C7 9.500 9 7 12 3z" /></Svg>);
export const IconAll = (p: S) => (<Svg {...p}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></Svg>);
export const IconFilter = (p: S) => (<Svg {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></Svg>);
export const KIND_ICON: Record<string, (p: S) => React.JSX.Element> = {
  all: IconAll,
  hair: IconScissors,
  nail: IconNail,
  eyelash: IconLash,
  esthetic: IconLotus,
  "hair-removal": IconSmooth,
};
