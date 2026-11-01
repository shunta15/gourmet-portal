import type { SVGProps } from "react";
import { ICONS as PROTO_ICONS } from "../../featurelist/icons";

type P = SVGProps<SVGSVGElement>;
/** 雨の日(傘)。試作のアイコンに無いので自前で描く(currentColor) */
export function IcUmbrella(p: P) {
  return (
    <svg viewBox="0 0 40 34" aria-hidden="true" {...p}>
      <path d="M2.4 17.5 Q2.4 3.6 20 3.6 Q37.6 3.6 37.6 17.5 Q33.4 13.6 29 17.5 Q24.6 13.6 20 17.5 Q15.4 13.6 11 17.5 Q6.6 13.6 2.4 17.5 Z" fill="currentColor" />
      <path d="M20 3.4 V1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 17.5 V28.6 Q20 32.4 16.4 32.4 Q13.2 32.4 13.2 29.2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** テーマのアイコン(試作の 6 つ + 傘) */
export const FL_ICONS = {
  lunch: PROTO_ICONS.lunch,
  cafe: PROTO_ICONS.cafe,
  walk: PROTO_ICONS.walk,
  date: PROTO_ICONS.date,
  rain: IcUmbrella,
  family: PROTO_ICONS.family,
  area: PROTO_ICONS.area,
} as const;
