import type { SVGProps } from "react";

// 最初のページ専用の線画アイコン(カテゴリ 6・Industry/Scene の茶の線画)。currentColor。サーバーでも使える。
type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.15, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function CatIcon({ name, ...p }: { name: string } & P) {
  switch (name) {
    case "cafe":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" {...base} {...p} className={`pt-draw ${p.className ?? ""}`.trim()}>
          <path d="M7.2 1.4v2.2M10.8 1.4v2.2" />
          <path d="M3.7 5.1h11.2v3.7c0 3.2-2.2 5.5-5.6 5.5S3.7 12 3.7 8.8z" />
          <path d="M14.9 6.3h1.2a1.8 1.8 0 0 1 0 3.6h-1.3" />
          <path d="M4.1 6.9h10.4M4.3 8.7h10" />
          <path d="M6.6 14.6v1.3h5.4v-1.3" />
          <path d="M2.1 17.5h15.2" />
        </svg>
      );
    case "trim":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" {...base} {...p} className={`pt-draw ${p.className ?? ""}`.trim()}>
          <ellipse cx="4.5" cy="4.5" rx="1.7" ry="3" transform="rotate(-45 4.5 4.5)" />
          <ellipse cx="15.5" cy="4.5" rx="1.7" ry="3" transform="rotate(45 15.5 4.5)" />
          <ellipse cx="4.5" cy="15.5" rx="1.7" ry="3" transform="rotate(45 4.5 15.5)" />
          <ellipse cx="15.5" cy="15.5" rx="1.7" ry="3" transform="rotate(-45 15.5 15.5)" />
          <path d="M6.7 6.7 13.3 13.3M13.3 6.7 6.7 13.3" />
        </svg>
      );
    case "run":
      return (
        <svg viewBox="0 0 24 12" aria-hidden="true" {...base} {...p} className={`pt-draw ${p.className ?? ""}`.trim()}>
          <path d="M6.95 4.6H17.05A2.5 2.5 0 1 1 19.3 6A2.5 2.5 0 1 1 17.05 7.4H6.95A2.5 2.5 0 1 1 4.7 6A2.5 2.5 0 1 1 6.95 4.6Z" />
        </svg>
      );
    case "hotel":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" {...base} {...p} className={`pt-draw ${p.className ?? ""}`.trim()}>
          <path d="M1.8 9.2 10 2l8.2 7.2M3.6 8.3V17.2h12.8V8.3" />
          <path d="M8 11.9c.2-1.3 1.2-1.9 2-1.9s1.8.6 2 1.9c.1 1.2-.8 2.1-2 2.1s-2.1-.9-2-2.1z" />
        </svg>
      );
    case "clinic":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" {...base} {...p} className={`pt-draw ${p.className ?? ""}`.trim()}>
          <path d="M7.4 2.2h5.2a1.2 1.2 0 0 1 1.2 1.2v3.8h3.8a1.2 1.2 0 0 1 1.2 1.2v3.2a1.2 1.2 0 0 1-1.2 1.2h-3.8v3.8a1.2 1.2 0 0 1-1.2 1.2H7.4a1.2 1.2 0 0 1-1.2-1.2v-3.8H2.4a1.2 1.2 0 0 1-1.2-1.2V8.4a1.2 1.2 0 0 1 1.2-1.2h3.8V3.4a1.2 1.2 0 0 1 1.2-1.2z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true" {...base} {...p} className={`pt-draw ${p.className ?? ""}`.trim()}>
          <path d="M3.4 6.8h13.2v10.6H3.4z" />
          <path d="M6.9 6.8V5.6a3.1 3.1 0 0 1 6.2 0v1.2" />
          <path d="M8.2 9.4c.3 2.8 3.3 2.8 3.6 0" />
        </svg>
      );
  }
}

/** Industry の茶の犬(ずんぐりした線画)/ Scene の茶の犬(ほほえむ顔) */
export function PetMark({ kind, ...p }: { kind: "dog" | "cat" } & P) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (kind === "dog")
    return (
      <svg viewBox="3.1 1.7 17.8 19.8" preserveAspectRatio="xMidYMid meet" aria-hidden="true" {...s} {...p}>
        <path d="M5 4.6C5.6 2.9 7.5 2.4 8.9 3.4c1 .7 1.8 1 3.1 1s2.1-.3 3.1-1c1.4-1 3.3-.5 3.9 1.2.8 2 .6 4.4-.4 6.2-1 1.9-3.3 3-6.6 3s-5.6-1.1-6.6-3C4.4 9 4.2 6.600 5 4.600z" />
        <circle cx="9.1" cy="8" r=".65" fill="currentColor" />
        <circle cx="14.9" cy="8" r=".65" fill="currentColor" />
        <path d="M11 10.3h2l-1 1.1zM12 11.4v1.1" />
        <path d="M4.3 20.8c-.9-3.6.2-6.6 3.2-7.8M19.7 20.8c.9-3.6-.2-6.6-3.2-7.8M3.8 20.9h16.4M12 13.8v7" />
      </svg>
    );
  return (
    <svg viewBox="3.1 1.7 17.8 19.8" preserveAspectRatio="xMidYMid meet" aria-hidden="true" {...s} {...p}>
      <path d="M6.2 5.6C6.6 3.6 8.3 2.4 10 2.7c.7.1 1.2.3 2 .3s1.3-.2 2-.3c1.7-.3 3.4.9 3.8 2.9.4 2 .1 3.800-.9 5.300-1.1 1.500-3 2.200-4.900 2.200s-3.800-.7-4.900-2.200C6.100 9.400 5.800 7.600 6.200 5.600z" />
      <circle cx="9.4" cy="7.2" r=".65" fill="currentColor" />
      <circle cx="14.6" cy="7.2" r=".65" fill="currentColor" />
      <path d="M10.2 9.6c.7.8 3 .8 3.600 0" />
      <path d="M4.6 20.8c-.9-3.800.4-6.600 3.400-7.600M19.400 20.8c.9-3.800-.4-6.600-3.400-7.600M4 20.9h16M9 15.400h6v5.500" />
    </svg>
  );
}

/** 飾りの葉(細い枝に葉が 4 枚。塗り + 枝は線。currentColor。逃げる飾り・揺れる飾りに使う) */
export function Leaf(p: P) {
  const l = "M0 0C5-5.2 12.5-5.2 17.5 0 12.5 5.2 5 5.2 0 0z";
  return (
    <svg viewBox="0 0 40 58" aria-hidden="true" {...p}>
      <path d="M19 56C19.6 40 20.4 24 23 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d={l} fill="currentColor" transform="translate(23 6) rotate(-84) scale(.95)" />
      <path d={l} fill="currentColor" transform="translate(21.6 24) rotate(-148) scale(1.05)" />
      <path d={l} fill="currentColor" transform="translate(21 33) rotate(-24) scale(1.05)" />
      <path d={l} fill="currentColor" transform="translate(19.8 46) rotate(-152) scale(.9)" />
    </svg>
  );
}
