import type { ReactNode } from "react";

/**
 * こだわりの丸札のアイコン(線の絵。見本の「お悩み」の絵は症状を表すので使わない)。名前はデータの tags と同じ。
 * 絵が無い名前(今後ふえたとき)は、丸の中にチェックの絵を出す。
 */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, ReactNode> = {
  駅近: (
    <>
      <rect x="9" y="6" width="22" height="22" rx="5" {...P} />
      <path d="M9 18h22" {...P} />
      <path d="M14 24h.01M26 24h.01" {...P} strokeWidth={2.4} />
      <path d="m14 33 3-5M26 33l-3-5" {...P} />
      <path d="M15.500 10.500h9" {...P} />
    </>
  ),
  土日営業: (
    <>
      <rect x="6" y="9" width="28" height="24" rx="4" {...P} />
      <path d="M6 16h28M13 5v7M27 5v7" {...P} />
      <path d="M13 23h.01M20 23h.01M27 23h.01M13 28h.01M20 28h.01" {...P} strokeWidth={2.4} />
    </>
  ),
  夜遅くまで営業: (
    <>
      <path d="M26.500 6.500a14 14 0 1 0 8 22.500 11.500 11.500 0 0 1-8-22.500Z" {...P} />
      <path d="M30 8v5M27.500 10.500h5" {...P} />
    </>
  ),
  女性スタッフ: (
    <>
      <circle cx="20" cy="13" r="6.500" {...P} />
      <path d="M13.500 14c-1 6-.5 11-3 15M26.500 14c1 6 .5 11 3 15" {...P} />
      <path d="M10 35c0-5.500 4.500-8 10-8s10 2.500 10 8" {...P} />
    </>
  ),
  予約なし可: (
    <>
      <path d="M10 34V8l16-3v29" {...P} />
      <path d="M6 34h28M21.500 20.500h.01" {...P} />
      <path d="M26 13h6M29.500 9.500 33 13l-3.500 3.500" {...P} />
    </>
  ),
};

const FALLBACK = (
  <>
    <circle cx="20" cy="20" r="13" {...P} />
    <path d="m14 20.500 4.500 4.500L27 15.500" {...P} />
  </>
);

export function TagIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
      {ICONS[name] ?? FALLBACK}
    </svg>
  );
}
