"use client";

import type { ReactNode } from "react";
import { trackTap } from "@/lib/portal/track";
import type { TapKind } from "@/lib/portal/track";

/**
 * 店のリンク(電話・地図・予約・公式サイト・SNS)。値のあるものだけを親が渡す。外部リンクは rel="noopener noreferrer" target="_blank"。
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
  style?: React.CSSProperties;
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
      {external ? <span className="lsp-sr">（別のタブで開きます）</span> : null}
    </a>
  );
}
