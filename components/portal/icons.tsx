/**
 * ボタン用の自作アイコン（20×20 の線画）。各 SNS の公式ロゴは使わず、意味が伝わる簡単な図形だけ。
 * 文字ラベルと一緒に出す前提なので、アイコン自体は読み上げない（aria-hidden）。
 */
import type { ReactNode } from "react";

const common = {
  viewBox: "0 0 20 20",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: false as const,
};

const PATHS: Record<string, ReactNode> = {
  // 受話器
  phone: <path d="M5.2 3h2.3l1.3 3.4-1.7 1.2a9.3 9.3 0 0 0 4.3 4.3l1.2-1.7 3.4 1.3v2.3A1.8 1.8 0 0 1 14.2 15 11.8 11.8 0 0 1 3 3.8 1.8 1.8 0 0 1 5.2 3Z" />,
  // ピン
  map: (
    <>
      <path d="M10 17.5s5.5-4.9 5.5-9.3a5.5 5.5 0 0 0-11 0c0 4.4 5.5 9.3 5.5 9.3Z" />
      <circle cx="10" cy="8.2" r="1.9" />
    </>
  ),
  // カレンダー
  reserve: (
    <>
      <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" />
      <path d="M3 8.5h14M7 2.8v3M13 2.8v3" />
    </>
  ),
  // 地球
  website: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7Z" />
    </>
  ),
  // カメラ
  instagram: (
    <>
      <rect x="2.5" y="6" width="15" height="10.5" rx="1.8" />
      <path d="M7 6l1.2-2h3.6L13 6" />
      <circle cx="10" cy="11.2" r="3" />
    </>
  ),
  // 音符
  tiktok: (
    <>
      <path d="M8 14.8V4.5l7-1.5v10.3" />
      <circle cx="6" cy="14.8" r="2" />
      <circle cx="13" cy="13.3" r="2" />
    </>
  ),
  // ひと言の吹き出し
  x: (
    <>
      <path d="M3.5 4h13a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1H9l-3.5 3v-3H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M6 7.5h8M6 10.2h5" />
    </>
  ),
  // 人
  facebook: (
    <>
      <circle cx="7.5" cy="7" r="2.6" />
      <path d="M2.8 16c.4-2.8 2.3-4.4 4.7-4.4s4.3 1.6 4.7 4.4" />
      <circle cx="14" cy="7.8" r="2" />
      <path d="M13.6 11.8c2 .1 3.3 1.4 3.7 3.7" />
    </>
  ),
  // 丸い吹き出し
  line: (
    <>
      <path d="M10 3C5.9 3 2.8 5.6 2.8 8.9c0 2 1.1 3.7 2.9 4.8L5.4 16.8l3.3-2c.4.1.8.1 1.3.1 4.1 0 7.2-2.6 7.2-5.9S14.1 3 10 3Z" />
      <path d="M7 9h.01M10 9h.01M13 9h.01" strokeWidth="2" />
    </>
  ),
  // 共有（箱から出る矢印）
  share: (
    <>
      <path d="M10 12.5V3.5M6.8 6.6 10 3.4l3.2 3.2" />
      <path d="M4.5 10v5.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10" />
    </>
  ),
  // リンク
  copy: (
    <>
      <path d="M8.3 11.7a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9" />
      <path d="M11.7 8.3a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9" />
    </>
  ),
  // 外へ（外部リンクの矢印）
  out: <path d="M7 4.5H4.5v11h11V13M10.5 4.5h5v5M15.5 4.5 9 11" />,
  check: <path d="m4.5 10.5 3.4 3.4 7.6-7.8" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size }: { name: IconName; size?: number }) {
  return (
    <svg {...common} {...(size ? { width: size, height: size } : {})}>
      {PATHS[name]}
    </svg>
  );
}
