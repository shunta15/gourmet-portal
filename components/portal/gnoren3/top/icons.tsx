import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** ロゴのまる(暖簾・提灯に染め抜かれたもの)。上=三日月・下=レンズ形。61×57。中央に暖簾の継ぎ目の細い隙間 */
export function NorenMark({ slit = true, ...p }: P & { slit?: boolean }) {
  return (
    <svg viewBox="0 0 61 57" aria-hidden="true" {...p}>
      <path d="M1.3 39.2A30.5 30.5 0 1 1 59.7 39.2A30 30 0 0 0 1.3 39.2Z" fill="currentColor" />
      <path d="M6 44C14 31 47 31 55 44C47 56.5 14 56.5 6 44Z" fill="currentColor" />
      {slit ? <rect x="26.4" y="0" width="2.8" height="57" fill="#f0e6d2" opacity=".78" /> : null}
    </svg>
  );
}

/** 料理分類の絵柄(40×40 の枠・中の絵は約 28u)。色は currentColor */
export function CuisineIcon({ kind, ...p }: P & { kind: string }) {
  const sw = 1.7;
  switch (kind) {
    case "rice": // 和食: ごはん茶碗
      return (
        <svg viewBox="0 -2.500 40 40" {...p} aria-hidden="true">
          <path d="M8 19c0-6.5 5.5-10.5 12-10.5S32 12.500 32 19" {...line} strokeWidth={sw} />
          <path d="M14 14.500l2 1m3-2.500l2 1m3 0l2 1" {...line} strokeWidth={1.2} />
          <path d="M7.500 19.500h25c0 7.500-5 12-12.500 12S7.500 27 7.500 19.500Z" fill="currentColor" opacity=".92" />
          <path d="M15.500 31.500h9v3h-9Z" fill="currentColor" />
        </svg>
      );
    case "fork": // 洋食: フォークとナイフ
      return (
        <svg viewBox="0 0 40 40" {...p} aria-hidden="true">
          <path d="M11.200 6.500v10.500m3.300-10.500v10.500m3.300-10.500v10.500" {...line} strokeWidth="1.900" />
          <path d="M10.300 15.500h8.400v3.200c0 2-1.500 3.200-3.400 3.600h-1.600c-2-.4-3.400-1.600-3.400-3.600Z" fill="currentColor" />
          <path d="M13.500 21.500h3.200l-.5 12.500a1.100 1.100 0 0 1-2.200 0Z" fill="currentColor" />
          <path d="M26 6.500c3.500.8 5 5.500 5 11.500h-5Z" fill="currentColor" />
          <path d="M26 17.500h5l-.6 16.500a1.900 1.900 0 0 1-3.800 0Z" fill="currentColor" />
        </svg>
      );
    case "bowl": // 中華・アジア: 湯気の立つ丼
      return (
        <svg viewBox="0 0 40 40" {...p} aria-hidden="true">
          <path d="M20 3c-1.600 1.600 1.200 2.800 0 4.500" {...line} strokeWidth="1.300" />
          <path d="M6 16.500h28c0 8.500-6 14.500-14 14.500S6 25 6 16.500Z" {...line} strokeWidth={sw} />
          <path d="M7 16.500c3.500-2.700 22.500-2.700 26 0" {...line} strokeWidth="1.400" />
          <path d="M13.500 14.200l2.200-.8m2.500.2l2.200-.5m2.800.3l2-.8" {...line} strokeWidth="1.100" />
          <path d="M15 33.500h10" {...line} strokeWidth={sw} />
        </svg>
      );
    case "ramen": // ラーメン: 箸と丼
      return (
        <svg viewBox="0 0 40 40" {...p} aria-hidden="true">
          <path d="M6 11.500L33 5.500M7 14.500L34 8.500" {...line} strokeWidth="1.900" />
          <path d="M15.500 13v6m4.500-7.500v8m4.500-9v9" {...line} strokeWidth="1.500" />
          <path d="M6.500 19.500h27c0 8-6 13.500-13.500 13.500S6.500 27.500 6.500 19.500Z" fill="currentColor" />
          <path d="M15 33h10v2.500H15Z" fill="currentColor" />
        </svg>
      );
    case "grill": // 焼肉・焼鳥: 皿に盛った肉
      return (
        <svg viewBox="0 0 40 40" {...p} aria-hidden="true">
          <path d="M6 21.500h28c0 4.500-6 7.500-14 7.500S6 26 6 21.500Z" {...line} strokeWidth={sw} />
          <path d="M20 29v5m-4 .5h8" {...line} strokeWidth={sw} />
          <rect x="9.500" y="9.500" width="9" height="6" rx="2.500" transform="rotate(-24 14 12.500)" {...line} strokeWidth="1.500" />
          <rect x="17.500" y="8" width="9" height="6.500" rx="2.500" transform="rotate(18 22 11)" {...line} strokeWidth="1.500" />
          <rect x="13" y="14.500" width="11" height="6" rx="2.500" {...line} strokeWidth="1.500" />
          <path d="M11 17l5-2.500M24 13l3 3" {...line} strokeWidth="1.100" />
        </svg>
      );
    case "bar": // 居酒屋・バー: 瓶とグラス
      return (
        <svg viewBox="0 0 40 40" {...p} aria-hidden="true">
          <path d="M14 4.500h5.500v6.500c2.200 2 3.300 3.800 3.300 6.200V33c0 1.100-.9 2-2 2h-8.100c-1.100 0-2-.9-2-2V17.200c0-2.400 1.100-4.200 3.300-6.200Z" {...line} strokeWidth={sw} />
          <path d="M26.500 22c0 5.500 1.600 7.800 4.500 7.800s4.500-2.300 4.500-7.800Z" {...line} strokeWidth={sw} />
          <path d="M31 29.800v5.500m-3.500.2h7" {...line} strokeWidth={sw} />
        </svg>
      );
    case "cafe": // カフェ・甘味: カップとソーサー
      return (
        <svg viewBox="0 -2 40 40" {...p} aria-hidden="true">
          <path d="M9 13.500h21v6.500c0 6.500-4.500 10.500-10.500 10.500S9 26.500 9 20Z" fill="currentColor" />
          <path d="M30 16c4.500-1 6.500 1.500 5.200 4.500S31.500 24 28.500 23.500" {...line} strokeWidth="2.200" />
          <path d="M4 33c5 3 27 3 32 0-4-3.500-28-3.500-32 0Z" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

/** ヒーロー下の数字帯の絵(店・地図・ごはん)。現在色で塗る。 */
export function StatIcon({ kind, ...p }: P & { kind: string }) {
  if (kind === "shop") {
    return (
      <svg viewBox="0 0 26 23" preserveAspectRatio="none" {...p} aria-hidden="true">
        <path d="M3 8.500L5 1.500h16l2 7Z" fill="currentColor" />
        <path d="M2 8.500h22v2.800H2Z" fill="currentColor" />
        <path d="M4.500 11.500V22h17V11.500" {...line} strokeWidth="1.800" />
        <rect x="8.500" y="14" width="9" height="8" rx=".5" fill="currentColor" />
        <rect x="10.500" y="15.800" width="5" height="3" fill="#2a1d14" opacity=".55" />
      </svg>
    );
  }
  if (kind === "map") {
    return (
      <svg viewBox="0 0 29 25" preserveAspectRatio="none" {...p} aria-hidden="true">
        <path d="M0.5 4.800L8.800 1.800v18.600L0.500 23.500Z" fill="currentColor" opacity=".92" />
        <path d="M10.600 1.800 18.700 4.800v18.700l-8.100-3Z" fill="currentColor" opacity=".92" />
        <path d="M20.500 4.800 28.500 1.800v18.600l-8 3.100Z" fill="currentColor" opacity=".92" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 31 25" preserveAspectRatio="none" {...p} aria-hidden="true">
      <path d="M0.800 10.500h29.400c0 8-6 12.500-14.700 12.500S0.800 18.500 0.800 10.500Z" fill="currentColor" opacity=".93" />
      <path d="M1.500 10.500C3 5.500 8.500 2.500 15.500 2.500S28 5.500 29.500 10.500c-4.500 2.400-23.500 2.400-28 0Z" fill="#2a1d14" opacity=".78" />
      <path d="M8 7.500c2.500-3 5-4 7.500-4s5.500.8 7.500 2.500" {...line} strokeWidth="1.400" opacity=".9" />
      <path d="M10.500 23h10v2h-10Z" fill="currentColor" />
    </svg>
  );
}

/** 丸い矢印(旗の下・「全 41 エリア」の横)。viewBox 20×20 */
export function CircleArrow(p: P) {
  return (
    <svg viewBox="0 0 20 20" {...p} aria-hidden="true">
      <circle cx="10" cy="10" r="9.200" {...line} strokeWidth="1" />
      <path d="M5.500 10h8.500M10.800 6.800 14 10l-3.200 3.200" {...line} strokeWidth="1.100" />
    </svg>
  );
}

/** 「→」(すべて見る)。見本は 12×6u */
export function MoreArrow(p: P) {
  return (
    <svg viewBox="0 0 12 6" {...p} aria-hidden="true">
      <path d="M0.300 3H11M8.600.8 11 3 8.600 5.200" {...line} strokeWidth=".9" />
    </svg>
  );
}
