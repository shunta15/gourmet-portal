import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 2.1, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/* ───── 料理の暖簾 7 枚のアイコン(32×28。見本の絵を線画で描き直したもの) ───── */
export function GenreIcon({ k, ...p }: P & { k: string }) {
  switch (k) {
    case "washoku": // ふた付きのお椀(ごはん)
      return (
        <svg viewBox="0 0 32 28" {...line} {...p}>
          <path d="M4.5 13.5h23c0 6.2-4.6 10.2-11.5 10.2S4.5 19.7 4.5 13.5z" />
          <path d="M8.2 13.5c.4-3.6 3.7-6 7.8-6s7.4 2.4 7.8 6" />
          <path d="M16 7.5V5.6M11.5 26h9" />
          <path d="M11.5 10.6h.1M14.6 9.4h.1M17.6 9.4h.1M20.4 10.6h.1" strokeWidth="1.6" />
        </svg>
      );
    case "yoshoku": // フォークとナイフ
      return (
        <svg viewBox="0 0 32 28" fill="currentColor" aria-hidden="true" {...p}>
          <path d="M6 2.5h1.7v7h1.1v-7h1.8v7h1.1v-7h1.7v8.2a3.2 3.2 0 0 1-2.8 3.2V26H8.8V13.9A3.2 3.2 0 0 1 6 10.7z" />
          <path d="M22.4 2.5c-3.1 1.6-4.4 5-4.4 9.4v3.4h4.4V26h1.8V2.5z" />
        </svg>
      );
    case "chuka": // 湯気の立つ中華どんぶり
      return (
        <svg viewBox="0 0 32 28" {...line} {...p}>
          <path d="M3.5 13.2h25c0 6.6-5.2 10.6-12.5 10.6S3.5 19.8 3.5 13.2z" />
          <path d="M7.4 13.2c.5-3 4-5 8.6-5s8.1 2 8.6 5" />
          <path d="M16 8.2V5.2M12.5 24.4c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2" />
          <path d="M11.5 11.2h.1M15 10.2h.1M18.5 10.2h.1M21 11.2h.1" strokeWidth="1.6" />
        </svg>
      );
    case "ramen": // どんぶりとお箸
      return (
        <svg viewBox="0 0 32 28" aria-hidden="true" {...p}>
          <path d="M2.5 14.8h27c0 6.4-5.4 10.7-13.5 10.7S2.5 21.2 2.5 14.8z" fill="currentColor" />
          <path d="M2 5.2l17.5 3.4M2.6 8.6l17 3.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "yaki": // 焼肉(花のように盛った肉)
      return (
        <svg viewBox="0 0 32 28" {...line} strokeWidth={1.5} {...p}>
          <circle cx="16" cy="11" r="2.6" />
          <path d="M16 8.4C14 5.8 14.6 3.2 16 3c1.4.2 2 2.8 0 5.4zM18.4 9.6c3-1 5.2-.4 5.6 1 .1 1.4-2.2 2.4-5 1.4zM17.6 13.2c2.4 2 3.2 4.2 2.2 5.2-1.1.9-3.2-.2-4.1-3.1zM14.4 13.2c-.9 3-3 4-4.1 3.1-1-1-.2-3.2 2.2-5.2zM13.6 9.6c-2.8 1-5 0-5-1.4.4-1.4 2.6-2 5.6-1z" />
          <path d="M5 21c4 3.6 18 3.6 22 0M9 24.6c3.6 1.6 10.4 1.6 14 0" />
        </svg>
      );
    case "izakaya": // 酒瓶とグラス
      return (
        <svg viewBox="0 0 32 28" {...line} strokeWidth={1.5} {...p}>
          <path d="M9 2.2h4.2v5.4c2.2 1.4 3.4 3.4 3.4 6V26H5.6V13.6c0-2.6 1.2-4.6 3.4-6z" />
          <path d="M5.8 15.6h10.6" />
          <path d="M21 10.6h7.4l-.9 5.4c-.4 2.4-1.5 3.6-2.8 3.6s-2.4-1.2-2.8-3.6zM24.7 19.6V25M21.4 25.4h6.6" />
        </svg>
      );
    case "cafe": // コーヒーカップ
      return (
        <svg viewBox="0 0 32 28" aria-hidden="true" {...p}>
          <path d="M5 9.4h18.4v4.6c0 5-3.6 8.2-8.4 8.2h-1.6c-4.8 0-8.4-3.2-8.4-8.2z" fill="currentColor" />
          <path d="M23.2 11.4h2.2a3.2 3.2 0 0 1 0 6.4h-3.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" fill="none" />
          <path d="M2.8 25.2h26.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8.6 12.2h12" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}

/* ───── 統計のアイコン(白) ───── */
export function StoreIcon(p: P) {
  return (
    <svg viewBox="0 0 28 27" aria-hidden="true" {...p}>
      <path d="M2 1.2h24v3.6H2z" fill="currentColor" />
      <path d="M2 6.2h24l-1.2 5.2c-.4 1.7-1.9 2.6-3.5 2.4-1.4-.2-2.4-1-3-2-.6 1-1.7 1.9-3.3 2s-2.7-1-3.3-2c-.6 1-1.7 1.9-3.3 2s-3.3-.7-3.6-2.4z" fill="currentColor" />
      <path d="M4 15.2V26h20V15.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8 17.6h5.4V26H8z M15.6 17.6H20v4.6h-4.4z" fill="currentColor" />
    </svg>
  );
}
export function MapIcon(p: P) {
  return (
    <svg viewBox="0 0 28 24" aria-hidden="true" {...p}>
      <path d="M1.5 5 9 1.5v18L1.5 23zM10.6 1.5 17.4 4.6v18L10.6 19.5zM19 4.6 26.5 1v18.5L19 23z" fill="currentColor" opacity=".9" />
    </svg>
  );
}
export function BowlStatIcon(p: P) {
  return (
    <svg viewBox="0 0 34 30" aria-hidden="true" {...p}>
      <path d="M2 14.5h30c0 7.2-6.4 12.2-15 12.2S2 21.7 2 14.5z" fill="currentColor" />
      <path d="M6 14.5c.6-4 5.4-6.6 11-6.6s10.4 2.6 11 6.6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17 7.8V5.2M10 28.4h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M12 11.6h.1M15 10.4h.1M18 10.4h.1M21 11.6h.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ───── 絞り込み・検索・結果まわり ───── */
export function PinIcon(p: P) {
  return (
    <svg viewBox="0 0 20 26" aria-hidden="true" {...p}>
      <path d="M10 .8C5 .8 1.3 4.5 1.3 9.3c0 6 6.6 12.3 8.7 15.9 2.1-3.600 8.700-9.900 8.700-15.900C18.700 4.500 15 .8 10 .8z" fill="currentColor" />
      <circle cx="10" cy="9.4" r="3.1" fill="var(--gn3-search-pin-hole, #f8f4ee)" />
    </svg>
  );
}
export function PinSmall(p: P) {
  return (
    <svg viewBox="0 0 10 13" aria-hidden="true" {...p}>
      <path d="M5 .4C2.500.4.700 2.200.7 4.700c0 3.100 3.300 6.200 4.300 8 1.100-1.800 4.300-4.900 4.300-8C9.300 2.200 7.500.4 5 .4z" fill="currentColor" />
      <circle cx="5" cy="4.800" r="1.600" fill="var(--gn3-search-pin-hole, #f4f1eb)" />
    </svg>
  );
}
export function LidBowlIcon(p: P) {
  return (
    <svg viewBox="0 0 32 26" aria-hidden="true" {...p}>
      <path d="M2.600 13h26.800c0 6.800-5.800 11.500-13.400 11.500S2.600 19.800 2.600 13z" fill="currentColor" />
      <path d="M6 12c.8-3.800 5-6.200 10-6.200s9.200 2.400 10 6.200" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" />
      <path d="M16 5.800V3.200M8 25.400h16" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" fill="none" />
    </svg>
  );
}
export function PeopleIcon(p: P) {
  return (
    <svg viewBox="0 0 32 24" aria-hidden="true" {...p}>
      <circle cx="16" cy="6.400" r="4.600" fill="currentColor" />
      <path d="M7.800 22.400c0-5 3.700-8.600 8.200-8.600s8.200 3.600 8.200 8.600z" fill="currentColor" />
      <circle cx="5.600" cy="10.400" r="3.300" fill="currentColor" />
      <path d="M0 22c0-3.800 2.200-6.400 5.600-6.400 1 0 1.900.2 2.600.6-1.700 1.600-2.700 3.600-2.900 5.800z" fill="currentColor" />
      <circle cx="26.400" cy="10.400" r="3.300" fill="currentColor" />
      <path d="M32 22c0-3.800-2.200-6.400-5.600-6.400-1 0-1.900.2-2.600.6 1.700 1.600 2.700 3.600 2.900 5.800z" fill="currentColor" />
    </svg>
  );
}
export function RefreshIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth={2.200} {...p}>
      <path d="M20 11.500A8 8 0 0 0 6.100 7M4 12.500A8 8 0 0 0 17.900 17" />
      <path d="M6.500 2.800v4.600h4.600M17.500 21.200v-4.600h-4.600" />
    </svg>
  );
}
export function ChevronDown(p: P) {
  return (
    <svg viewBox="0 0 12 8" {...line} strokeWidth={2.100} {...p}>
      <path d="M1.500 1.500 6 6l4.500-4.500" />
    </svg>
  );
}
export function Tri(p: P) {
  return (
    <svg viewBox="0 0 8 6" aria-hidden="true" {...p}>
      <path d="M.6.8h6.800L4 5.400z" fill="currentColor" />
    </svg>
  );
}
export function SearchBold(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth={2.800} {...p}>
      <circle cx="10" cy="10" r="6.600" />
      <path d="M15 15l6 6" />
    </svg>
  );
}
export function HeartIcon({ filled, ...p }: P & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 22" aria-hidden="true" {...p}>
      <path d="M12 20.600C5.800 15.300 1.600 11.800 1.600 7.200 1.600 4 4 1.600 7 1.600c2 0 3.700 1 5 2.800 1.300-1.800 3-2.800 5-2.800 3 0 5.400 2.400 5.400 5.600 0 4.600-4.200 8.100-10.400 13.400z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.900" strokeLinejoin="round" />
    </svg>
  );
}
export function GridIcon(p: P) {
  return (
    <svg viewBox="0 0 22 22" aria-hidden="true" {...p}>
      <rect x="0" y="0" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="12" y="0" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="0" y="12" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="12" y="12" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}
export function ListIcon(p: P) {
  return (
    <svg viewBox="0 0 24 21" aria-hidden="true" {...p}>
      <rect x="0" y="0" width="5.500" height="5" rx="1.200" fill="currentColor" />
      <rect x="8" y="0" width="16" height="5" rx="1.200" fill="currentColor" />
      <rect x="0" y="8" width="5.500" height="5" rx="1.200" fill="currentColor" />
      <rect x="8" y="8" width="16" height="5" rx="1.200" fill="currentColor" />
      <rect x="0" y="16" width="5.500" height="5" rx="1.200" fill="currentColor" />
      <rect x="8" y="16" width="16" height="5" rx="1.200" fill="currentColor" />
    </svg>
  );
}
export function ArrowCircle(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth={1.300} {...p}>
      <circle cx="12" cy="12" r="10.700" />
      <path d="M6.800 12h9.600M12.800 8l4 4-4 4" />
    </svg>
  );
}
/** ロゴ(暖簾・提灯用。墨の円の中に、生地の色で抜いた三日月と器) */
export function InkMark({ paper = "#efe6d2", ...p }: P & { paper?: string }) {
  return (
    <svg viewBox="0 0 46 46" aria-hidden="true" {...p}>
      <circle cx="23" cy="23" r="23" fill="currentColor" />
      <path d="M3.200 27.500C4.400 16.200 12.600 8.800 23 8.800s18.600 7.400 19.800 18.700C37.600 21.200 30.800 18.200 23 18.200S8.400 21.200 3.200 27.500z" fill={paper} />
      <path d="M6 31c4.800-6 11-8.200 17-8.200S35.200 25 40 31" fill="none" stroke={paper} strokeWidth="1.700" strokeLinecap="round" />
    </svg>
  );
}
