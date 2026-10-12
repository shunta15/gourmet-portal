"use client";
import type { ReactNode } from "react";

/**
 * ページ内のアンカーへのリンク（「店舗情報のみ見る」）。押すと、入口の暖簾（Gate）に「上がった扱いにする」知らせを送ってから、普通のアンカーとして着く。
 * 知らせを受けた Gate は、スクロールで上がるのを待たずに消える（スクロールは妨げない）。JS が無いときは、ただのアンカー。
 */
export default function JumpLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode; tabIndex?: number; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        try {
          window.dispatchEvent(new Event("pf-gate-skip"));
        } catch {
          /* 知らせが送れなくても、アンカーは動く */
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
