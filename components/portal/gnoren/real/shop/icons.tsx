// 店ページ(real/shop)だけで使う小さな線画アイコン(試作の icons.tsx に無いもの)。
type P = React.SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "#4b3a31", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 利用シーンのタグ(人と人の輪郭) */
export function IconPeople(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...line} {...p} aria-hidden="true">
      <circle cx="8.6" cy="8.4" r="2.9" />
      <circle cx="16.4" cy="9.4" r="2.4" />
      <path d="M3.4 19c.2-3.2 2.4-5.2 5.2-5.2s5 2 5.2 5.2M14.4 14.4c.7-.3 1.4-.4 2-.4 2.2 0 3.9 1.6 4.2 4.4" />
    </svg>
  );
}
