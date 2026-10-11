import type { CSSProperties } from "react";

/** 縦書きの列の並び。列は右から左へ。字ごとの出現（.pf-ch）をつけるときは animate を true に（題だけ） */
export function Tate({
  cols,
  className = "",
  animate = false,
  delay = 0,
  as: Tag = "span",
  emFrom,
  label = true,
}: {
  cols: string[];
  className?: string;
  animate?: boolean;
  delay?: number;
  as?: "span" | "h1" | "h2" | "p";
  /** 強調する範囲（全体の何字めから何字めまで。屋号など。藍色にする） */
  emFrom?: [number, number] | null;
  /** false のとき、読み上げに出さない（同じ文を別の所で読ませるとき） */
  label?: boolean;
}) {
  let k = 0;
  return (
    <Tag className={`pf-tate ${className}`} {...(label ? { "aria-label": cols.join("") } : { "aria-hidden": true })}>
      {cols.map((c, ci) => (
        <span key={ci} className="pf-col" aria-hidden="true">
          {Array.from(c).map((ch) => {
            const i = k++;
            const em = emFrom ? i >= emFrom[0] && i < emFrom[1] : false;
            return (
              <span
                key={i}
                className={`${animate ? "pf-ch" : ""}${em ? " pf-em" : ""}`}
                style={animate ? ({ "--i": i, "--d": `${delay}s` } as CSSProperties) : undefined}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

/** 絵の部品（筆のかすれ・朱の丸）が使うフィルター。ページに 1 回だけ置く（「G7 一膳」案から借用） */
export function Defs() {
  return (
    <svg className="pf-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="pf-rough" x="-3%" y="-30%" width="106%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.045" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="20" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.5" numOctaves="3" seed="11" result="n2" />
          <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  7 0 0 0 -1.55" result="m" />
          <feComposite in="d" in2="m" operator="in" />
        </filter>
        <filter id="pf-rough-s" x="-3%" y="-150%" width="106%" height="400%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.7" numOctaves="2" seed="5" result="n2" />
          <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  7 0 0 0 -1.7" result="m" />
          <feComposite in="d" in2="m" operator="in" />
        </filter>
        <filter id="pf-seal" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="B" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="8" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.45" result="gm" />
          <feComposite in="d" in2="gm" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/** 朱の丸（判を押すように出る。transform と opacity だけ） */
export function Seal({ className = "", delay = 0.9, reveal = false }: { className?: string; delay?: number; reveal?: boolean }) {
  return (
    <svg className={`pf-seal${reveal ? " pf-rvs" : ""} ${className}`} viewBox="0 0 100 100" aria-hidden="true" style={{ "--d": `${delay}s` } as CSSProperties}>
      <path
        d="M51 5 C76 4 96 25 95 51 C94 77 74 96 48 95 C23 94 5 74 6 48 C7 24 27 6 51 5 Z"
        fill="currentColor"
        filter="url(#pf-seal)"
      />
    </svg>
  );
}

/** 藍色の筆の跡（左から右へ伸びる。transform だけ）。絵の素材は使わず、パスだけで描く */
export function Brush({ kind = "wave", className = "", delay = 0.5, reveal = false }: { kind?: "wave" | "dash"; className?: string; delay?: number; reveal?: boolean }) {
  const style = { "--d": `${delay}s` } as CSSProperties;
  if (kind === "dash") {
    return (
      <svg className={`pf-brush${reveal ? " pf-rvb" : ""} ${className}`} viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true" style={style}>
        <path
          d="M4 36 C70 14 150 12 230 26 C320 42 410 44 500 28 C540 20 574 22 596 30 L592 38 C560 34 530 34 500 42 C410 58 320 56 228 40 C150 28 70 30 6 48 Z"
          fill="currentColor"
          filter="url(#pf-rough-s)"
        />
      </svg>
    );
  }
  return (
    <svg className={`pf-brush${reveal ? " pf-rvb" : ""} ${className}`} viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true" style={style}>
      <path
        d="M0 118 C110 60 240 44 372 86 C490 124 580 168 740 150 C880 134 990 112 1140 126 C1260 138 1360 128 1440 108 L1440 146 C1360 170 1262 182 1140 170 C990 156 880 178 742 196 C580 216 486 176 366 138 C240 100 112 112 0 172 Z"
        fill="currentColor"
        filter="url(#pf-rough)"
      />
      <path
        d="M30 196 C160 170 300 184 440 204 C560 222 700 214 820 198"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#pf-rough-s)"
      />
    </svg>
  );
}
