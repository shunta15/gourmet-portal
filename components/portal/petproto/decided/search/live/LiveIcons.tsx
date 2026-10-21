import type { SVGProps } from "react";

/**
 * 本番(live)の探す・店舗紹介が足した線のアイコン(見本に無いもの)。見本の線画(../SearchIcons.tsx)と同じ流儀:
 * stroke=currentColor・線幅 1.5・viewBox 24。className="pt-draw" で触ると描き直される。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 札(こだわり) */
export function IconTag(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M3.6 12.2V5.4c0-.9.7-1.8 1.8-1.8h6.8l8.2 8.2c.7.7.7 1.8 0 2.5l-6.2 6.2c-.7.7-1.8.7-2.5 0z" />
      <path d="M8 8.4h.01" strokeWidth={2.4} />
    </svg>
  );
}

/** 猫の顔(猫に対応) */
export function IconCatFace(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M4.6 10.4V4.2l4.2 2.6c1.9-.6 4.5-.6 6.4 0l4.2-2.6v6.2" />
      <path d="M4.6 10.4c-.4 1-.6 2-.6 3 0 4 3.6 6.8 8 6.8s8-2.8 8-6.8c0-1-.2-2-.6-3" />
      <path d="M9 12.6h.01M15 12.6h.01" strokeWidth={2} />
      <path d="M10.8 15.2h2.4M12 15.2v1.2M10.2 17c.5.4 1.1.6 1.8.6s1.3-.2 1.8-.6M3 14.2l3.2.6M3.4 17l2.8-.9M21 14.2l-3.2.6M20.6 17l-2.8-.9" strokeWidth={1.2} />
    </svg>
  );
}

/** 月(夜間の対応) */
export function IconMoon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" />
    </svg>
  );
}

/** 肉球の線画(そのほかの条件・写真なしの印) */
export function IconPawLine(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <ellipse cx="8.4" cy="6.6" rx="1.9" ry="2.6" transform="rotate(-12 8.4 6.6)" />
      <ellipse cx="15.6" cy="6.6" rx="1.9" ry="2.6" transform="rotate(12 15.6 6.6)" />
      <ellipse cx="4.6" cy="11.8" rx="1.8" ry="2.4" transform="rotate(-28 4.6 11.8)" />
      <ellipse cx="19.4" cy="11.8" rx="1.8" ry="2.4" transform="rotate(28 19.4 11.8)" />
      <path d="M12 11.2c2.2 0 4.8 3.2 6.2 5.2 1.1 1.6.6 3.4-1.2 3.7-1.5.3-3-.7-5-.7s-3.5 1-5 .7c-1.8-.3-2.3-2.1-1.2-3.7 1.4-2 4-5.2 6.2-5.2z" />
    </svg>
  );
}

/** チェック(施設・サービス。そのほか) */
export function IconCheckLine(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m8.2 12.3 2.6 2.6 5-5.4" />
    </svg>
  );
}
