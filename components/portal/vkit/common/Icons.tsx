import type { SVGProps } from "react";
import type { VkIconKey } from "../config";

/**
 * 共通アイコン(サーバーでも使える。currentColor。サイズは CSS か width/height で)。
 * 線のアイコンは stroke=currentColor・線幅 1.4(細い線。ステイの決定デザインのアイコンに合わせる)。
 * 種類のアイコンは <KindIcon icon="wave" />(名前は components/portal/vkit/config.ts の VkIconKey。知らない名前は何も出さない)。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IconSearch(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="10.6" cy="10.6" r="6.6" />
      <path d="m15.6 15.6 5.2 5.2" />
    </svg>
  );
}
export function IconHeart(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 20.4s-8.2-5-8.2-11.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.2 2.8c0 6.2-8.2 11.2-8.2 11.2z" />
    </svg>
  );
}
/** 三本線。メニューが開くと base.css が「×」に描き替える(.vk-menu-lines) */
export function IconMenu(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" className="vk-menu-lines" />
    </svg>
  );
}
/** 「詳細を見る →」の矢印(横長) */
export function IconArrow(p: P) {
  return (
    <svg viewBox="0 0 16 10" aria-hidden="true" {...line} strokeWidth={1.2} {...p}>
      <path d="M1 5h13.2M10.2 1.2 14.2 5l-4 3.8" />
    </svg>
  );
}
export function IconArrowLeft(p: P) {
  return (
    <svg viewBox="0 0 16 10" aria-hidden="true" {...line} strokeWidth={1.2} {...p}>
      <path d="M15 5H1.8M5.8 1.2 1.8 5l4 3.8" />
    </svg>
  );
}
/** 右向きの小さな山(「>」。パンくず・行の右端) */
export function IconChevron(p: P) {
  return (
    <svg viewBox="0 0 8 12" aria-hidden="true" {...line} strokeWidth={1.2} {...p}>
      <path d="m1.8 1.5 4.4 4.5-4.4 4.5" />
    </svg>
  );
}
export function IconChevronLeft(p: P) {
  return (
    <svg viewBox="0 0 8 12" aria-hidden="true" {...line} strokeWidth={1.2} {...p}>
      <path d="M6.2 1.5 1.8 6l4.4 4.5" />
    </svg>
  );
}
/** 下向きの山(絞り込みの開閉) */
export function IconChevronDown(p: P) {
  return (
    <svg viewBox="0 0 12 8" aria-hidden="true" {...line} strokeWidth={1.2} {...p}>
      <path d="m1.5 1.8 4.5 4.4 4.5-4.4" />
    </svg>
  );
}
export function IconPlus(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function IconMinus(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M5 12h14" />
    </svg>
  );
}
export function IconCheck(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="m5 12.6 4.6 4.6L19 7.6" />
    </svg>
  );
}
export function IconPin(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 21.2s-6.6-6-6.6-11.3a6.6 6.6 0 0 1 13.2 0C18.6 15.2 12 21.2 12 21.2z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </svg>
  );
}
export function IconBed(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3 19V6" />
      <path d="M3 15.5h18V19" />
      <path d="M21 15.5v-3a2.5 2.5 0 0 0-2.5-2.5H11v5.5" />
      <circle cx="7" cy="11.7" r="1.7" />
    </svg>
  );
}
/** 外部リンク(「公式サイトで空室・料金を確認」など、別のサイトへ出るリンクの印) */
export function IconExternal(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M13.5 4H20v6.5M20 4l-9 9M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5" />
    </svg>
  );
}
export function IconArrowUp(p: P) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...line} strokeWidth={1.3} {...p}>
      <path d="M8 13.6V2.8M3.4 7.2 8 2.6l4.6 4.6" />
    </svg>
  );
}

// ---- 種類のアイコン(業種ごとの設定 components/portal/vkit/config.ts の kinds[].icon) ----
const ICONS: Record<VkIconKey, (p: P) => React.ReactElement> = {
  wave: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="17" cy="6.6" r="2.4" />
      <path d="M2.5 13.4c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 7 .2" />
      <path d="M2.5 18.8c2-2.2 4-2.2 6 0s4 2.2 6 0 4-2.2 7 .2" />
    </svg>
  ),
  mountain: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M2.5 19.5 9 8l4 6.6 2.6-3.8 5.9 8.7z" />
      <path d="m7.4 11.2 1.6 2 1.7-1.4" />
      <circle cx="18" cy="5.6" r="1.7" />
    </svg>
  ),
  craft: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M9 3.8h6M10 3.8c0 2.2-3.2 3.7-3.2 7.9 0 3 1.4 5.8 2.5 7.2h5.4c1.1-1.4 2.5-4.2 2.5-7.2 0-4.2-3.2-5.7-3.2-7.9" />
      <path d="M8.2 20.6h7.6M7 11.6h10" />
    </svg>
  ),
  garden: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M4.5 8.8 12 4.6l7.5 4.2z" />
      <path d="M8 8.8h8M9.4 8.8v3.6h5.2V8.8M10.4 12.4v5h3.2v-5M7.6 17.4h8.8v2.8H7.6z" />
    </svg>
  ),
  dumbbell: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.4 9.6v4.8M6.6 7.4v9.2M17.4 7.4v9.2M20.6 9.6v4.8M6.6 12h10.8" />
    </svg>
  ),
  yoga: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="5.2" r="1.9" />
      <path d="M12 7.6v6.2M7 12.4l5-3.2 5 3.2" />
      <path d="M5.8 19c2.2-3.2 4.2-3.2 6.2-1.4 2-1.8 4-1.8 6.2 1.4" />
    </svg>
  ),
  martial: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3 8.6h18v4.2H3zM9.6 12.8 7.6 20M14.4 12.8l2 7.2M9.4 8.6v4.2M14.6 8.6v4.2" />
    </svg>
  ),
  dance: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="4.6" r="1.8" />
      <path d="M12 6.6v6M5.8 8.2l6.2 1.2 6.2-2M12 12.6 8 20M12 12.6l4.4 3.2-.8 4.6" />
    </svg>
  ),
  golf: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M8.4 3.2v14.2M8.4 3.8l7.4 3-7.4 3.2" />
      <path d="M3.5 20.6h17" />
      <circle cx="15.6" cy="18.6" r="1.4" />
    </svg>
  ),
  court: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 3.6v4M12 16.4v4M4.4 9.2l3.6 1.8M16 13l3.6 1.8M4.4 14.8 8 13M16 11l3.6-1.8M8 11l1.6 5M16 13l-1.6-5" />
    </svg>
  ),
  book: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 6.6c-2-1.4-5-1.8-8-1.5v13c3-.3 6 .1 8 1.5 2-1.4 5-1.8 8-1.5v-13c-3-.3-6 .1-8 1.5zM12 6.6v13" />
    </svg>
  ),
  torii: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3 6.4c3 1 6 1.5 9 1.5s6-.5 9-1.5M4.6 10.2h14.8M6.6 8.2v12.4M17.4 8.2v12.4M12 8v2.2" />
    </svg>
  ),
  hanger: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 7a2 2 0 1 1 2 2c-1.2.4-2 1-2 2.3M12 11.3 3.6 16.2a1.2 1.2 0 0 0 .6 2.3h15.6a1.2 1.2 0 0 0 .6-2.3z" />
    </svg>
  ),
  camera: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.5 8.4h3.2l1.5-2.4h7.6l1.5 2.4h3.2v11h-17z" />
      <circle cx="12" cy="13.6" r="3.6" />
    </svg>
  ),
  wrench: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M14.8 5.6a4.2 4.2 0 0 0-5.2 5.3l-6 6a1.8 1.8 0 0 0 2.6 2.6l6-6a4.2 4.2 0 0 0 5.3-5.2l-2.6 2.6-2.4-.6-.6-2.4z" />
    </svg>
  ),
  flower: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="9.4" r="1.7" />
      <path d="M12 7.7a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2zM13.7 9.4a2.6 2.6 0 1 1 5.2 0 2.6 2.6 0 0 1-5.2 0zM5.1 9.4a2.6 2.6 0 1 1 5.2 0 2.6 2.6 0 0 1-5.2 0zM12 11.1a2.6 2.6 0 1 1 0 5.2" />
      <path d="M12 14v7M12 18c-2.6 0-3.8-1.2-4.4-3M12 18.6c2.6 0 3.8-1.2 4.4-3" />
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="m12 3.4 2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 16.4l-5.2 2.9L8 13.5 3.6 9.5l5.9-.7z" />
    </svg>
  ),
};

/** 種類・場面のアイコン。知らない名前は null(「その他」の絵を作らない) */
export function KindIcon({ icon, ...p }: { icon: VkIconKey } & P) {
  const I = ICONS[icon];
  return I ? <I {...p} /> : null;
}

/**
 * ロゴの印(業種ごと。波と太陽 / 走路 / 芽ばえ)。線の太さは親の CSS(.vk-logo-mark)で。currentColor
 */
export function Mark({ kind, ...p }: { kind: "wave" | "track" | "leaf" } & P) {
  return (
    <svg viewBox="0 0 54 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>
      {kind === "wave" ? (
        <>
          <circle cx="40" cy="9" r="5" />
          <path d="M2 21c5-5 10-5 15 0s10 5 15 0 10-5 15 0 5 2.2 5.4 1.6" />
          <path d="M2 28.4c5-4.4 10-4.4 15 0s10 4.4 15 0 10-4.4 15 0 5 2 5.4 1.4" />
        </>
      ) : kind === "track" ? (
        <>
          <rect x="2" y="4.5" width="50" height="23" rx="11.5" />
          <rect x="9.5" y="11" width="35" height="10" rx="5" />
          <path d="M27 4.5v6.5M27 21v6.5" />
        </>
      ) : (
        <>
          <path d="M27 29V14.5" />
          <path d="M27 14.5c0-6.4-5.2-9.8-12.6-9.8 0 6.4 5.2 9.8 12.6 9.8z" />
          <path d="M27 20.4c0-5.2 4-8.4 10.6-8.4 0 5.2-4 8.4-10.6 8.4z" />
          <path d="M10 29.4h34" />
        </>
      )}
    </svg>
  );
}
