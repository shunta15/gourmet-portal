import type { CSSProperties, ReactNode } from "react";

/** A組の試作の飾り(松・山・波線・飛行機・切手の丸いスタンプ・旗の番号・アイコン)。全部 SVG。色は currentColor か CSS 変数 */

type P = { className?: string; style?: CSSProperties };

export function Pine({ className, style }: P) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2 5 13h4L3 23h5L1 33h18l-7-10h5l-6-10h4Z" />
      <path d="M10 33v6" />
    </svg>
  );
}

export function Pines({ className, style }: P) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="translate(0 4) scale(.85)">
        <path d="M10 2 5 13h4L3 23h5L1 33h18l-7-10h5l-6-10h4Z" />
        <path d="M10 33v6" />
      </g>
      <g transform="translate(20 0)">
        <path d="M10 2 5 13h4L3 23h5L1 33h18l-7-10h5l-6-10h4Z" />
        <path d="M10 33v6" />
      </g>
      <g transform="translate(44 6) scale(.8)">
        <path d="M10 2 5 13h4L3 23h5L1 33h18l-7-10h5l-6-10h4Z" />
        <path d="M10 33v6" />
      </g>
    </svg>
  );
}

export function Mountain({ className, style }: P) {
  return (
    <svg className={className} style={style} viewBox="0 0 70 34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 32 22 6l9 12 7-8 30 22" />
      <path d="m17 14 5-5 5 7M33 14l5-4 5 6" />
    </svg>
  );
}

export function Waves({ className, style }: P) {
  return (
    <svg className={className} style={style} viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M2 6q7-5 14 0t14 0 14 0 14 0" />
      <path d="M2 14q7-5 14 0t14 0 14 0 14 0" />
      <path d="M2 22q7-5 14 0t14 0 14 0 14 0" />
      <path d="M2 30q7-5 14 0t14 0 14 0" />
    </svg>
  );
}

export function Plane({ className, style }: P) {
  return (
    <svg className={className} style={style} viewBox="0 0 44 32" fill="currentColor" aria-hidden="true">
      <path d="M2 17 40 3c2-1 3 1 1 3L30 17l-1 12-4 1-5-10-9 4-1-4 7-5-12-3Z" />
    </svg>
  );
}

/** 切手風の丸いスタンプ。外の輪の文字(ring)・中の 1〜2 行(lines)・山の絵(mountain) */
export function Stamp({ className, style, ring, lines, mountain = true, wave = false, id }: P & { ring?: string; lines?: string[]; mountain?: boolean; wave?: boolean; id: string }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="50" cy="50" r="47" strokeWidth="2.4" />
      <circle cx="50" cy="50" r="40" strokeWidth="1" strokeDasharray="1.5 2.2" />
      <defs>
        <path id={`apa-ring-${id}`} d="M50 50m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
      </defs>
      {ring ? (
        <text fill="currentColor" stroke="none" fontSize="8.6" letterSpacing="2.4" fontFamily="var(--apa-lab), sans-serif" fontWeight="500">
          <textPath href={`#apa-ring-${id}`} startOffset="2%">
            {ring}
          </textPath>
        </text>
      ) : null}
      {mountain ? (
        <g strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" transform={lines ? "translate(0 -4)" : undefined}>
          <path d="M26 58 43 32l9 13 6-8 16 21Z" />
          <path d="M37 41l6-2 4 5" strokeWidth="1.4" />
          {wave ? (
            <>
              <path d="M28 66q4-3 8 0t8 0 8 0 8 0 6 0" strokeWidth="1.6" />
              <path d="M32 72q4-3 8 0t8 0 8 0 8 0" strokeWidth="1.6" />
            </>
          ) : null}
        </g>
      ) : null}
      {lines
        ? lines.map((t, i) => (
            <text key={t} x="50" y={lines.length === 1 ? 54 : 44 + i * 14} textAnchor="middle" fill="currentColor" stroke="none" fontSize="11.5" letterSpacing="1.6" fontFamily="var(--apa-lab), sans-serif" fontWeight="500">
              {t}
            </text>
          ))
        : null}
    </svg>
  );
}

/** ロゴの山 */
export function LogoMark({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 44 34" fill="none" aria-hidden="true">
      <path d="M9 17a13 13 0 0 1 26 0" stroke="#ec4a41" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M2 32 18 10l8 11 5-6 11 17Z" stroke="#0d4580" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M13 28q3-2 6 0t6 0 6 0" stroke="#0d4580" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** 節の番号の旗(紺の旗に白い数字) */
export function Flag({ n, className }: { n: string; className?: string }) {
  return (
    <span className={`apa-flag ${className ?? ""}`}>
      <span className="apa-flag-cloth">{n}</span>
      <span className="apa-flag-pole" aria-hidden="true" />
    </span>
  );
}

/* ---- アイコン ---- */
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function Ic({ children, className, style, vb = 24 }: P & { children: ReactNode; vb?: number }) {
  return (
    <svg className={className} style={style} viewBox={`0 0 ${vb} ${vb}`} {...base} aria-hidden="true">
      {children}
    </svg>
  );
}
export const IcSearch = (p: P) => (
  <Ic {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Ic>
);
export const IcHeart = (p: P) => (
  <Ic {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
  </Ic>
);
export const IcUser = (p: P) => (
  <Ic {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.6-4 4-6 8-6s7.4 2 8 6" />
  </Ic>
);
export const IcPin = (p: P) => (
  <Ic {...p}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.6" />
  </Ic>
);
export const IcCal = (p: P) => (
  <Ic {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.1M8 17h2M12 17h2" />
  </Ic>
);
export const IcClock = (p: P) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Ic>
);
export const IcPhone = (p: P) => (
  <Ic {...p}>
    <path d="M6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z" />
  </Ic>
);
export const IcYen = (p: P) => (
  <Ic {...p}>
    <path d="m6 5 6 8 6-8M12 13v7M7.5 14h9M7.5 17.5h9" />
  </Ic>
);
export const IcArrow = (p: P) => (
  <Ic {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Ic>
);
export const IcChev = (p: P) => (
  <Ic {...p}>
    <path d="m6 9 6 6 6-6" />
  </Ic>
);
export const IcChevR = (p: P) => (
  <Ic {...p}>
    <path d="m9 6 6 6-6 6" />
  </Ic>
);
export const IcChevL = (p: P) => (
  <Ic {...p}>
    <path d="m15 6-6 6 6 6" />
  </Ic>
);
export const IcCheck = (p: P) => (
  <Ic {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="m8.5 12.3 2.5 2.5 4.8-5.3" />
  </Ic>
);
export const IcPlay = (p: P) => (
  <svg className={p.className} style={p.style} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6.5v11l9-5.5Z" fill="currentColor" />
  </svg>
);
export const IcBinoc = (p: P) => (
  <Ic {...p}>
    <circle cx="7" cy="16" r="3.8" />
    <circle cx="17" cy="16" r="3.8" />
    <path d="M10.8 16h2.4M4.5 13 6.5 5h3l.5 4M19.5 13l-2-8h-3l-.5 4M10 9h4" />
  </Ic>
);
export const IcCompass = (p: P) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </Ic>
);
export const IcHiker = (p: P) => (
  <Ic {...p}>
    <circle cx="13" cy="4.5" r="1.8" />
    <path d="m11 9 2-1.5 3 2v3.5M13 8l-1.5 5.5L8 20M12 14l3.5 2.5.5 4M10 9 7.5 12" />
  </Ic>
);
export const IcUsers = (p: P) => (
  <Ic {...p}>
    <circle cx="8" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M2.5 19c.5-3.4 3-5 5.5-5s5 1.6 5.5 5M15 14.2c2.6-.5 5.5.8 6 4.8" />
  </Ic>
);
export const IcGroup = (p: P) => (
  <Ic {...p}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M3 14c0-2 1.4-3.5 3-3.5s3 1.5 3 3.5v4H3ZM9 14c0-2 1.4-3.5 3-3.5s3 1.5 3 3.5v4H9ZM15 14c0-2 1.4-3.5 3-3.5s3 1.5 3 3.5v4h-6Z" />
  </Ic>
);
export const IcInsta = (p: P) => (
  <Ic {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r=".6" />
  </Ic>
);
export const IcBook = (p: P) => (
  <Ic {...p}>
    <path d="M3 5.5c3-1 6-.8 9 1v13c-3-1.8-6-2-9-1ZM21 5.5c-3-1-6-.8-9 1v13c3-1.8 6-2 9-1Z" />
  </Ic>
);
export const IcPlane = (p: P) => (
  <Ic {...p}>
    <path d="M21 4 3 11l7 2.5L12.5 21 15 14Z" />
    <path d="m10 13.5 11-9.5" />
  </Ic>
);
export const IcExternal = (p: P) => (
  <Ic {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Ic>
);
export const IcHat = (p: P) => (
  <Ic {...p}>
    <path d="M4 15c0-6 3.5-9 8-9s8 3 8 9M2 17h20" />
  </Ic>
);
export const IcVest = (p: P) => (
  <Ic {...p}>
    <path d="M8 3 5 7v13h5v-7l2 2 2-2v7h5V7l-3-4-2 3-2 2-2-2Z" />
  </Ic>
);
export const IcBag = (p: P) => (
  <Ic {...p}>
    <rect x="5" y="8" width="14" height="12.5" rx="3" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2M9 13h6" />
  </Ic>
);
export const IcList = (p: P) => (
  <Ic {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.1M4.5 12h.1M4.5 18h.1" />
  </Ic>
);
export const IcStar = (p: P) => (
  <Ic {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8Z" />
  </Ic>
);
export const IcDoc = (p: P) => (
  <Ic {...p}>
    <path d="M6 3.5h8l4 4v13H6Z" />
    <path d="M14 3.5v4h4M9 12h6M9 16h6" />
  </Ic>
);
export const IcFilter = (p: P) => (
  <Ic {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Ic>
);

/** カメラ(写真の欄の印。見本の Instagram のロゴの代わり) */
export const IcCamera = (p: P) => (
  <Ic {...p}>
    <path d="M4 8.5h3l1.6-2.3h6.8L17 8.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.6" />
  </Ic>
);
