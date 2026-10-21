import type { CSSProperties } from "react";
import { Paw } from "../common/Icons";

/**
 * 節の間を歩く肉球の足あと(スクロールに合わせて 1 つずつ「ぺたっ」。PawTrail と同じ見た目・同じ仕組み)。
 * PawTrail との違い: 足あと 1 つずつを Flee(カーソルが近づくとふわっと逃げる)の包みに入れてある。
 * 位置・大きさ・間隔・濃さは className(article.css の .ar-paws)で決める。pointer-events: none・aria-hidden。
 */
export default function PawRun({ count = 8, direction = "right", className = "" }: { count?: number; direction?: "right" | "left"; className?: string }) {
  const base = direction === "right" ? 90 : 270;
  return (
    <span className={`pt-paws pt-paws--${direction} ar-paws ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: Math.max(1, count) }, (_, i) => (
        <span key={i} className="pt-flee ar-paw-fl" data-flee="24" data-flee-r="86">
          <i className="pt-paw" style={{ ["--i" as string]: i, ["--alt" as string]: i % 2 ? 1 : -1, ["--rot" as string]: `${base + (i % 2 ? 9 : -9)}deg` } as CSSProperties}>
            <Paw className="pt-paw-i" />
          </i>
        </span>
      ))}
    </span>
  );
}
