import type { SVGProps } from "react";
import { IconHeart } from "../common/Icons";

/**
 * 探す・店の紹介・記事の一覧のページが使う線のアイコン(common/Icons.tsx にないもの。currentColor・線幅 1.4・サーバーでも使える)。
 * 種類・検索・ハート・ピン・矢印などは common/Icons.tsx のものを使う。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 人(一人旅) */
export function IconPerson(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.5c.6-4 3.4-6.2 7.2-6.2s6.6 2.2 7.2 6.2" />
    </svg>
  );
}

/** カレンダー(チェックイン・チェックアウト) */
export function IconCalendar(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="1.6" />
      <path d="M4 10h16M8.5 3.6v3.6M15.5 3.6v3.6" />
      <path d="M8.2 14.2 10.6 16.6 15.8 12.4" />
    </svg>
  );
}

/** 電車(最寄り駅) */
export function IconTrain(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="5.5" y="3.5" width="13" height="13.5" rx="3" />
      <path d="M5.5 11h13M9.5 20.5l1.4-3.5M14.5 20.5l-1.4-3.5" />
      <circle cx="9" cy="14" r=".6" fill="currentColor" />
      <circle cx="15" cy="14" r=".6" fill="currentColor" />
    </svg>
  );
}

/** 車(駐車場・車での行き方) */
export function IconCar(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M4 15.5v-3.2l1.8-4.6A2 2 0 0 1 7.7 6.5h8.6a2 2 0 0 1 1.9 1.2l1.8 4.6v3.2" />
      <path d="M3.5 15.5h17v2.7a.8.8 0 0 1-.8.8h-1.6a.8.8 0 0 1-.8-.8v-1.2H6.7v1.2a.8.8 0 0 1-.8.8H4.3a.8.8 0 0 1-.8-.8z" />
      <path d="M5.5 12h13" />
    </svg>
  );
}

/** 無線 LAN */
export function IconWifi(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3 9.4a13 13 0 0 1 18 0M6 12.8a8.6 8.6 0 0 1 12 0M9 16.2a4.2 4.2 0 0 1 6 0" />
      <circle cx="12" cy="19.2" r=".7" fill="currentColor" />
    </svg>
  );
}

/** 食事(ナイフとフォーク) */
export function IconDining(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M7 3.5v6.2M4.8 3.5v4.4A2.2 2.2 0 0 0 7 10.1a2.2 2.2 0 0 0 2.2-2.2V3.5M7 10.1V20.5" />
      <path d="M16.5 20.5V3.5c-2.4 1.4-3.4 4-3.4 7h3.4" />
    </svg>
  );
}

/** 施設・サービスの札(当てはまる絵がないときの印。丸にチェック) */
export function IconCircleCheck(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="m8.4 12.4 2.6 2.6 4.8-5.2" />
    </svg>
  );
}

/** 「エリアから探す」の見出しの印(ひらいた地図とピン) */
export function IconAreaHead(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  );
}

/** 「種類」の見出しの印(四つの面) */
export function IconTypeHead(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="4" y="4" width="6.6" height="6.6" rx="1" />
      <rect x="13.4" y="4" width="6.6" height="6.6" rx="1" />
      <rect x="4" y="13.4" width="6.6" height="6.6" rx="1" />
      <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1" />
    </svg>
  );
}

/** 「こだわり条件」の見出しの印(つまみのある 3 本の線) */
export function IconCondHead(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="var(--vk-paper)" />
      <circle cx="15.5" cy="12" r="2" fill="var(--vk-paper)" />
      <circle cx="8" cy="17" r="2" fill="var(--vk-paper)" />
    </svg>
  );
}

/** シェア */
export function IconShare(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="6.5" cy="12" r="2.3" />
      <circle cx="17.5" cy="6" r="2.3" />
      <circle cx="17.5" cy="18" r="2.3" />
      <path d="m8.5 10.9 7-3.8M8.5 13.1l7 3.8" />
    </svg>
  );
}

/** 写真なし(店の写真が無いときの面に出す。山と空) */
export function IconNoPhoto(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="3.5" y="5" width="17" height="14" rx="1.6" />
      <path d="m4.5 17 4.6-5 3.4 3.4 2.4-2.4 4.6 4" />
      <circle cx="15.6" cy="9.4" r="1.3" />
    </svg>
  );
}

/** 家族(子連れ・子ども向け) */
export function IconFamily(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="8" cy="7.4" r="2.5" />
      <circle cx="17" cy="10" r="1.9" />
      <path d="M3.4 19.6c.4-3.6 2.4-5.6 4.6-5.6s4.2 2 4.6 5.6M14 19.6c.3-2.6 1.6-4 3-4s2.7 1.4 3 4" />
    </svg>
  );
}
/** 芽(初心者歓迎) */
export function IconSprout(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M12 20.5v-9" />
      <path d="M12 11.5c0-4-2.8-6.2-7-6.2 0 4 2.8 6.2 7 6.2zM12 14.5c0-3.4 2.4-5.4 6.4-5.4 0 3.4-2.4 5.4-6.4 5.4z" />
      <path d="M7.5 20.5h9" />
    </svg>
  );
}
/** 手さげ(手ぶらでOK) */
export function IconBagHand(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M5.4 8.2h13.2l1 12H4.4z" />
      <path d="M9 8.2V6.4a3 3 0 0 1 6 0v1.8" />
    </svg>
  );
}
/** 傘(雨の日) */
export function IconUmbrella(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.4 12.2a8.6 8.6 0 0 1 17.2 0z" />
      <path d="M12 12.2v6.2a2 2 0 0 1-4 0M12 3.6v-1" />
    </svg>
  );
}
/** 時計(24時間営業・営業時間) */
export function IconClock(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2V12l3.2 2" />
    </svg>
  );
}
/** 体験(切符。体験あり) */
export function IconTicket(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.5 8.4h17v2.6a1.6 1.6 0 0 0 0 3.2v2.6h-17v-2.6a1.6 1.6 0 0 0 0-3.2z" />
      <path d="M14 8.4v1.6M14 11.2v1.6M14 14.4v1.6" />
    </svg>
  );
}

/** こだわり条件・タグの文字 → アイコン。当てはまる絵がなければ丸にチェック */
export function TagIcon({ label, ...p }: { label: string } & P) {
  if (/子連れ|子ども|キッズ|親子|ファミリー/.test(label)) return <IconFamily {...p} />;
  if (/初心者|はじめて|入門/.test(label)) return <IconSprout {...p} />;
  if (/手ぶら|手ブラ/.test(label)) return <IconBagHand {...p} />;
  if (/雨/.test(label)) return <IconUmbrella {...p} />;
  if (/駐車|パーキング|車/.test(label)) return <IconCar {...p} />;
  if (/体験|見学|トライアル/.test(label)) return <IconTicket {...p} />;
  if (/24時間|営業時間|時間/.test(label)) return <IconClock {...p} />;
  if (/女性|レディース/.test(label)) return <IconPerson {...p} />;
  if (/駅/.test(label)) return <IconTrain {...p} />;
  if (/予約/.test(label)) return <IconCalendar {...p} />;
  if (/記念日|ハート/.test(label)) return <IconHeart {...p} />;
  if (/食事|料理|カフェ|ランチ/.test(label)) return <IconDining {...p} />;
  if (/Wi-?Fi|ワイファイ|無線/i.test(label)) return <IconWifi {...p} />;
  return <IconCircleCheck {...p} />;
}
