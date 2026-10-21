import type { SVGProps } from "react";

/**
 * 探すページ専用の線のアイコン(見本の条件の箱・検索の箱のもの)。stroke=currentColor・線幅 1.5。className="pt-draw" で触ると描き直される。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 犬の顔(犬のサイズ) */
export function IconDogFace(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M6.2 5.2C4.1 4.4 2.7 6.2 3 8.6c.2 1.3.9 2.2 1.9 2.6M17.8 5.2c2.1-.8 3.5 1 3.2 3.4-.2 1.3-.9 2.2-1.9 2.6" />
      <path d="M12 5.4c-4.9 0-8 3.2-8 7.5 0 4 3.3 6.7 8 6.7s8-2.7 8-6.7c0-4.3-3.1-7.5-8-7.5z" />
      <path d="M10.6 13.4l1.4 1.2 1.4-1.2M12 14.6v1.4M10.2 17.1c.6.5 1.2.7 1.8.7s1.2-.2 1.8-.7" />
      <path d="M8.6 11.2h.01M15.4 11.2h.01" strokeWidth={2} />
    </svg>
  );
}
/** 家(店内OK) */
export function IconHouse(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M2.8 11.6 12 3.4l9.2 8.2" />
      <path d="M4.6 10.2v10.2h14.8V10.2" />
      <path d="M9.6 20.4v-5a2.4 2.4 0 0 1 4.8 0v5" />
    </svg>
  );
}
/** テラス席の机(テラスOK) */
export function IconTerrace(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.4 4.6h17.2M5 7.4h14M6.4 7.4 4.8 20.4M17.6 7.4l1.6 13M9.4 7.4l-.8 6.2h6.8l-.8-6.2M8.6 13.6 7.4 20.4M15.4 13.6l1.2 6.8" />
    </svg>
  );
}
/** 車(駐車場あり) */
export function IconCar(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M5.2 10.4 6.8 6c.3-.9 1.1-1.4 2-1.4h6.4c.9 0 1.7.5 2 1.4l1.6 4.4" />
      <path d="M3.6 12.4c0-1.2.9-2 2-2h12.8c1.1 0 2 .8 2 2v5.4c0 .6-.5 1.1-1.1 1.1h-1.2c-.6 0-1.1-.5-1.1-1.1v-.6H7v.6c0 .6-.5 1.1-1.1 1.1H4.7c-.6 0-1.1-.5-1.1-1.1z" />
      <path d="M7.4 14.2h.01M16.6 14.2h.01" strokeWidth={2.2} />
    </svg>
  );
}
/** カレンダー(予約可) */
export function IconCalendar(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="3.4" y="5" width="17.2" height="15.6" rx="2.4" />
      <path d="M3.4 10h17.2M8 3v3.8M16 3v3.8" />
    </svg>
  );
}
/** 円(予算) */
export function IconYen(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M6.4 4 12 12.6 17.6 4M12 12.6V21M7.4 13.4h9.2M7.4 17h9.2" />
    </svg>
  );
}
/** カテゴリ(検索の箱の右。耳と頬のあるまるい形) */
export function IconCategory(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} strokeWidth={1.7} {...p}>
      <path d="M8.8 5.2C8.2 3.8 6.6 3.2 5.3 3.9 4 4.6 3.6 6.2 4.3 7.4 3.6 8.3 3.5 9.5 4 10.6c.5 1.2 1.3 1.9 1.4 3-.9.6-1.4 1.6-1.2 2.8.3 1.8 2.1 2.8 3.8 2.4 1.2-.3 2.2-1 4-1s2.8.7 4 1c1.7.4 3.5-.6 3.8-2.4.2-1.2-.3-2.2-1.2-2.8.1-1.1.9-1.8 1.4-3 .5-1.1.4-2.3-.3-3.2.7-1.2.3-2.8-1-3.5-1.3-.7-2.9-.1-3.5 1.3-1-.4-2.1-.5-3.2-.5s-2.2.1-3.2.5z" />
    </svg>
  );
}
/** 下向きの山(プルダウン) */
export function IconChevronDown(p: P) {
  return (
    <svg viewBox="0 0 12 8" aria-hidden="true" {...line} strokeWidth={1.6} {...p}>
      <path d="m1.4 1.6 4.6 4.6 4.6-4.6" />
    </svg>
  );
}
/** 左右の山(ページ送り) */
export function IconChevronLR({ dir = "right", ...p }: P & { dir?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 8 12" aria-hidden="true" {...line} strokeWidth={1.4} {...p}>
      <path d={dir === "right" ? "m1.8 1.4 4.4 4.6-4.4 4.6" : "m6.2 1.4-4.4 4.6 4.4 4.6"} />
    </svg>
  );
}
/** 地図のピン(茶のしずく+白い肉球) */
export function MapPin(p: P) {
  return (
    <svg viewBox="0 0 24 31" aria-hidden="true" {...p}>
      <defs>
        <linearGradient id="sr-pin-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6046" />
          <stop offset="1" stopColor="#6a4f39" />
        </linearGradient>
      </defs>
      <path d="M12 29.6C10.6 27.8 2 18.8 2 11.4A10 10 0 0 1 22 11.4c0 7.4-8.6 16.4-10 18.2z" fill="url(#sr-pin-g)" stroke="#fffaf3" strokeWidth="1.6" />
      <g fill="#fffaf3">
        <ellipse cx="8.6" cy="8.1" rx="1.5" ry="2" transform="rotate(-12 8.6 8.1)" />
        <ellipse cx="15.4" cy="8.1" rx="1.5" ry="2" transform="rotate(12 15.4 8.1)" />
        <ellipse cx="5.9" cy="12" rx="1.4" ry="1.8" transform="rotate(-26 5.9 12)" />
        <ellipse cx="18.1" cy="12" rx="1.4" ry="1.8" transform="rotate(26 18.1 12)" />
        <path d="M12 11.6c1.6 0 3.4 2.4 4.7 4.3.9 1.3.5 2.6-.9 2.9-1.2.2-2.2-.5-3.8-.5s-2.6.7-3.8.5c-1.4-.3-1.8-1.6-.9-2.9 1.3-1.9 3.1-4.3 4.7-4.3z" />
      </g>
    </svg>
  );
}
