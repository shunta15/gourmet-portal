import type { SVGProps } from "react";
import { IconHeart } from "../common/Icons";

/**
 * 探す・宿の紹介のページが使う線のアイコン(common/Icons.tsx にないもの。currentColor・線幅 1.4・サーバーでも使える)。
 * 宿の種類・検索・ハート・ピン・矢印などは common/Icons.tsx のものを使う。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 湯けむり(温泉・露天風呂・サウナ) */
export function IconOnsen(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M8 3.6c-1.4 1.4 1.4 2.8 0 4.2M12 3.6c-1.4 1.4 1.4 2.8 0 4.2M16 3.6c-1.4 1.4 1.4 2.8 0 4.2" />
      <path d="M3.5 12.5h17c0 4.2-2.6 7-6.4 7H9.9c-3.8 0-6.4-2.8-6.4-7z" />
    </svg>
  );
}
/** 足あと(ペット同伴) */
export function IconPaw(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <ellipse cx="7" cy="10" rx="1.7" ry="2.2" />
      <ellipse cx="11" cy="6.6" rx="1.7" ry="2.2" />
      <ellipse cx="15.2" cy="6.8" rx="1.7" ry="2.2" />
      <ellipse cx="18.4" cy="10.6" rx="1.7" ry="2.2" />
      <path d="M8.2 17c0-2.6 2.2-4.6 4.4-4.6 2.4 0 4.2 2 4.2 4.2 0 2-1.6 2.6-3.4 2.4-1.2-.1-1.5-.5-2.3-.5-.9 0-1.4.5-2.4.4-.6-.1-.5-1-.5-1.9z" />
    </svg>
  );
}
/** 人(一人旅) */
export function IconPerson(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.5c.6-4 3.4-6.2 7.2-6.2s6.6 2.2 7.2 6.2" />
    </svg>
  );
}
/** メモ(素泊まり) */
export function IconMemo(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M17 4.6 19.4 7 11 15.4l-3.2.8.8-3.2z" />
      <path d="M18.5 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1h6" />
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
/** 「宿のタイプ」の見出しの印(ベルとテーブル) */
export function IconTypeHead(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M5.5 15.5a6.5 6.5 0 0 1 13 0" />
      <path d="M3.5 15.5h17v3H3.5zM12 6.6V9M10.2 6.6h3.6" />
    </svg>
  );
}
/** 「宿のこだわり条件」の見出しの印(屋根と箱) */
export function IconCondHead(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3 10.2 12 4l9 6.2" />
      <path d="M5 9.4V20h14V9.4" />
      <rect x="9.5" y="12.5" width="5" height="3.6" />
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
/** 写真なし(宿の写真が無いときの面に出す。山と空) */
export function IconNoPhoto(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <rect x="3.5" y="5" width="17" height="14" rx="1.6" />
      <path d="m4.5 17 4.6-5 3.4 3.4 2.4-2.4 4.6 4" />
      <circle cx="15.6" cy="9.4" r="1.3" />
    </svg>
  );
}

/** こだわり条件・タグの文字 → アイコン。当てはまる絵がなければ丸にチェック */
export function TagIcon({ label, ...p }: { label: string } & P) {
  if (/温泉|露天|風呂|浴場|サウナ|湯/.test(label)) return <IconOnsen {...p} />;
  if (/ペット|犬|猫/.test(label)) return <IconPaw {...p} />;
  if (/一人|ひとり|1人/.test(label)) return <IconPerson {...p} />;
  if (/記念日/.test(label)) return <IconHeart {...p} />;
  if (/素泊まり|素泊り/.test(label)) return <IconMemo {...p} />;
  if (/食事|料理|夕食|朝食|レストラン|ダイニング|BBQ|バーベキュー/.test(label)) return <IconDining {...p} />;
  if (/駐車|パーキング|車/.test(label)) return <IconCar {...p} />;
  if (/Wi-?Fi|ワイファイ|無線/i.test(label)) return <IconWifi {...p} />;
  return <IconCircleCheck {...p} />;
}
