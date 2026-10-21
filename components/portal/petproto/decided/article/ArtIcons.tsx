import type { SVGProps } from "react";
import { IconHeart } from "../common/Icons";

/** カテゴリ・シーンの線画アイコン(見本の黒い線。currentColor。pt-draw を付けると触ったとき描き直される) */
type P = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function Scissors(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="6.2" cy="17.6" r="2.7" />
      <circle cx="17.8" cy="17.6" r="2.7" />
      <path d="M8.3 15.8 19.6 4.2M15.7 15.8 4.4 4.2M10.9 12.4 6.6 8.2M13.1 12.4l4.3-4.2" />
    </svg>
  );
}
function House(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3.4 11.2 12 3.6l8.6 7.6v9a.8.8 0 0 1-.8.8H4.2a.8.8 0 0 1-.8-.8z" />
      <path d="M9.6 21v-5.2a2.4 2.4 0 0 1 4.8 0V21" />
    </svg>
  );
}
function Cup(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3.6 7.6h13.6v4.4a6.8 6.8 0 0 1-13.6 0z" />
      <path d="M17.2 9.2h1.6a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M2.4 20.6h16.8M7.4 4.2c.9.8.9 1.7 0 2.5M11.6 3.6c.9.8.9 1.9 0 2.7" />
    </svg>
  );
}
function Stetho(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6.6 3.4v5.3a3.8 3.8 0 0 0 7.6 0V3.4M6 3.4h1.8M13 3.4h1.8" />
      <path d="M10.4 12.5v2.2a4.3 4.3 0 0 0 8.6 0v-2.1" />
      <circle cx="19" cy="11" r="1.7" />
    </svg>
  );
}
function Tree(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 2.8 7.6 9.4h2.6L6.2 14.6h3.9L8 17.4h8l-2.1-2.8h3.9l-4-5.2h2.6z" />
      <path d="M12 17.4v4" />
    </svg>
  );
}
function Umbrella(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 12.2a9 9 0 0 1 18 0 3 3 0 0 0-4.5-1.2 3 3 0 0 0-4.5-.1 3 3 0 0 0-4.5.1A3 3 0 0 0 3 12.2z" />
      <path d="M12 3.2V2.4M12 10.9v8.2a2 2 0 0 1-4 0" />
    </svg>
  );
}
function Car(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4.2 10.6 6 6.4a2 2 0 0 1 1.9-1.3h8.2a2 2 0 0 1 1.9 1.3l1.8 4.2" />
      <path d="M3 10.6h18v7.2a1 1 0 0 1-1 1h-1.7V20h-2.7v-1.2H8.4V20H5.7v-1.2H4a1 1 0 0 1-1-1z" />
      <circle cx="7.4" cy="14.5" r=".9" />
      <circle cx="16.6" cy="14.5" r=".9" />
    </svg>
  );
}
function PawLine(p: P) {
  return (
    <svg {...base} strokeWidth={1.6} {...p}>
      <ellipse cx="7.2" cy="7.6" rx="1.9" ry="2.6" transform="rotate(-14 7.2 7.6)" />
      <ellipse cx="16.8" cy="7.6" rx="1.9" ry="2.6" transform="rotate(14 16.8 7.6)" />
      <ellipse cx="3.6" cy="12.6" rx="1.8" ry="2.4" transform="rotate(-30 3.6 12.6)" />
      <ellipse cx="20.4" cy="12.6" rx="1.8" ry="2.4" transform="rotate(30 20.4 12.6)" />
      <path d="M12 11.4c2.3 0 5.4 3.9 6.4 5.4 1.2 1.8.5 4-1.7 4.2-1.8.2-3-.9-4.7-.9s-2.9 1.1-4.7.9c-2.2-.2-2.9-2.4-1.7-4.2 1-1.5 4.1-5.4 6.4-5.4z" />
    </svg>
  );
}

export function ArtIcon({ name, ...p }: { name: string } & P) {
  switch (name) {
    case "scissors":
      return <Scissors {...p} />;
    case "house":
      return <House {...p} />;
    case "cup":
      return <Cup {...p} />;
    case "stetho":
      return <Stetho {...p} />;
    case "tree":
      return <Tree {...p} />;
    case "umbrella":
      return <Umbrella {...p} />;
    case "car":
      return <Car {...p} />;
    case "paw":
      return <PawLine {...p} />;
    case "heart":
      return <IconHeart {...p} strokeWidth={1.7} />;
    default:
      return null;
  }
}
