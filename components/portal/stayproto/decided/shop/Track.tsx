"use client";

import type { CSSProperties, ReactNode } from "react";
import { trackTap, type TapKind } from "@/lib/portal/track";

/**
 * 宿のリンク(公式サイト・地図・電話)。外部リンクは rel="noopener noreferrer" target="_blank" で、別のタブで開く旨を読み上げ用の字で添える。
 * タップは lib/portal/track.ts で数える(storeId・kind・page だけ。ほかの新業種の店ページと同じ)。
 */
export default function TrackedA({
  href,
  kind,
  storeId,
  page,
  external = true,
  className,
  style,
  ariaLabel,
  children,
}: {
  href: string;
  kind: TapKind;
  storeId: string;
  page: string;
  external?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => trackTap({ storeId, kind, page })}
    >
      {children}
      {external ? <span className="sh-sr">（別のタブで開きます）</span> : null}
    </a>
  );
}
