import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];
const C = 100;
const R = 74;
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (d: number) => [C + R * Math.cos(rad(d)), C + R * Math.sin(rad(d))] as const;

/** 6業種の色でできた「輪」の印（装飾。静的SVG・JS不要） */
export default function RingMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`mp-ringmark ${className}`.trim()} role="img" aria-label="6つの業種をつなぐ輪">
      <circle cx={C} cy={C} r={R + 18} fill="none" stroke="rgba(21,17,14,.16)" strokeDasharray="2 5" />
      {ORDER.map((k, i) => {
        const mid = -90 + i * 60;
        const [x0, y0] = pt(mid - 26);
        const [x1, y1] = pt(mid + 26);
        return (
          <path
            key={k}
            d={`M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`}
            fill="none"
            stroke={VERTICALS[k].accent.color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        );
      })}
      <text x={C} y={C + 18} textAnchor="middle" fontSize="54" style={{ fontFamily: "var(--serif)", fontWeight: 500 }} fill="currentColor">
        輪
      </text>
    </svg>
  );
}
