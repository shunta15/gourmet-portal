import type { SVGProps } from "react";

/**
 * ステイ決定案の共通アイコン(サーバーでも使える。currentColor。サイズは CSS か width/height で)。
 * import { IconSearch, IconHeart, IconMenu, IconArrow, IconArrowLeft, IconChevron, IconChevronLeft, IconChevronDown, IconPlus, IconMinus,
 *          IconCheck, IconPin, IconBed, IconExternal, IconArrowUp, StayTypeIcon, Mark, IconInstagram, IconX, IconYoutube } from "@/components/portal/stayproto/decided/common/Icons";
 * 線のアイコンは stroke=currentColor・線幅 1.4(細い線。見本のアイコンに合わせる)。
 * 宿の種類のアイコンは <StayTypeIcon slug="hotel" />(slug = lib/verticals/stay.ts の categories: hotel / ryokan / pension / glamping / rental。知らない slug は何も出さない)。
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
/** 三本線。メニューが開くと base.css が「×」に描き替える(.sy-menu-lines) */
export function IconMenu(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" className="sy-menu-lines" />
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

// ---- 宿の種類(ホテル・旅館・民宿・ペンション・ゲストハウス・グランピング・キャンプ・一棟貸し・貸別荘 の 5 枠) ----
export function IconHotel(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="5" y="3.5" width="14" height="17.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 21v-4h3v4" />
    </svg>
  );
}
export function IconRyokan(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M2.5 10 12 4l9.5 6" />
      <path d="M5 10v10.5h14V10" />
      <path d="M9.5 20.5v-5h5v5M4 13.2h16" />
    </svg>
  );
}
export function IconPension(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.5 12 12 5l8.5 7" />
      <path d="M6 11v9.5h12V11" />
      <path d="M16.5 7.4V4.5h2v4.6" />
      <rect x="10" y="14" width="4" height="6.5" />
    </svg>
  );
}
export function IconGlamping(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M2.5 20.5 12 4l9.5 16.5" />
      <path d="M12 20.5 8.5 13M12 20.5l3.5-7.5M6 20.5h12" />
    </svg>
  );
}
/** 一棟貸し・貸別荘(1 軒の家と庭の木。敷地の線が横に伸びる = 一棟まるごと) */
export function IconRental(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M2.5 20.5h19" />
      <path d="M3.4 11.8 9.4 6l6 5.8" />
      <path d="M5 10.4v10.1h8.8V10.4" />
      <rect x="8" y="14.4" width="2.8" height="6.1" />
      <path d="M19 20.5v-4.6M19 15.9c-2.1 0-3.2-1.5-3.2-3.3 0-1.7 1.5-3 3.2-4.3 1.7 1.3 3.2 2.6 3.2 4.3 0 1.8-1.1 3.3-3.2 3.3z" />
    </svg>
  );
}
/** 宿の種類のスラッグ → アイコン。知らないスラッグは null(「その他」を作らない) */
export function StayTypeIcon({ slug, ...p }: { slug: string } & P) {
  switch (slug) {
    case "hotel":
      return <IconHotel {...p} />;
    case "ryokan":
      return <IconRyokan {...p} />;
    case "pension":
      return <IconPension {...p} />;
    case "glamping":
      return <IconGlamping {...p} />;
    case "rental":
      return <IconRental {...p} />;
    default:
      return null;
  }
}

/** ロゴの印(二つの山が重なる線。屋根にも見える)。線の太さは親の CSS(.sy-logo-mark)で。currentColor */
export function Mark(p: P) {
  return (
    <svg viewBox="0 0 54 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3.5 27.5 19 9.5l10 11" />
      <path d="M15.5 21.5 33 3.5l17.5 24" />
      <path d="M2 28.4c13-2.2 33-2.2 50 0" />
    </svg>
  );
}

// ---- フッターの SNS(試作の見本だけ。本番 live は公式アカウントが無いので出さない) ----
export function IconInstagram(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconX(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
export function IconYoutube(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...p}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
