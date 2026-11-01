// 店舗情報カードの小さなアイコン(線画・currentColor)。見本の丸いピン/電話/時計/お店。
type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const PinIcon = ({ className }: P) => (
  <svg {...base} className={className} fill="currentColor" stroke="none">
    <path d="M12 2.2a7.2 7.2 0 0 0-7.2 7.2c0 5.2 7.2 12.4 7.2 12.4s7.2-7.2 7.2-12.4A7.2 7.2 0 0 0 12 2.2Zm0 9.9a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
  </svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6.6 3.5 9 3l1.6 4-1.8 1.4a11 11 0 0 0 5.8 5.8L16.2 12l4 1.6-.5 2.4a2.6 2.6 0 0 1-2.7 2.1C10.4 18.1 5.9 13.6 4.5 6.9a2.6 2.6 0 0 1 2.1-3.4Z" />
  </svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6.8V12l3.4 2" />
  </svg>
);
export const ShopIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 10.2 12 3.5l8 6.7V20H4Z" />
    <circle cx="12" cy="12.6" r="2.7" />
    <path d="M12 12.6v.1" />
  </svg>
);
export const ArrowIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 10" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M1 5h21M17.5 1l4.5 4-4.5 4" />
  </svg>
);
/** 丼 + 箸(赤茶・塗り) */
export const BowlIcon = ({ className }: P) => (
  <svg viewBox="0 0 56 44" className={className} aria-hidden="true">
    <path d="M10 1.8 46 0.6" stroke="#a24a2f" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6.4 48 5.2" stroke="#a24a2f" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 17.5h52c-.7 12.6-8.2 25-26 25S2.7 30.1 2 17.5Z" fill="#a24a2f" />
    <path d="M6 22.5c4 .8 10 1.2 22 1.2s18-.4 22-1.2" stroke="#d9a794" strokeWidth="1.1" fill="none" />
  </svg>
);
/** 葉の線画(おすすめ札の下) */
export const LeafLine = ({ className }: P) => (
  <svg viewBox="0 0 80 112" fill="none" stroke="#5d4c42" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M6 108C16 82 30 58 52 34" />
    <path d="M26 66C14 62 8 46 12 28c14 2 22 16 14 38Z" />
    <path d="M26 66C18 52 18 40 12 28" strokeWidth=".8" />
    <path d="M44 42c-2-16 4-30 20-38 6 16 2 30-20 38Z" />
    <path d="M44 42C50 30 56 18 64 4" strokeWidth=".8" />
    <path d="M34 56c14-2 28 4 38 18-16 6-30 2-38-18Z" />
    <path d="M34 56c10 6 22 12 38 18" strokeWidth=".8" />
  </svg>
);
