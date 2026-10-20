"use client";

import type { ReactNode } from "react";
import { trackTap, type TapKind } from "@/lib/portal/track";

/**
 * 店のリンク(電話・地図・予約・公式サイト・SNS)。押した回数だけを数える(店 ID・種類・ページのパスだけ。lib/portal/track.ts)。
 * 外部リンクは別タブ+rel="noopener noreferrer"。tel: は同じタブ。
 */
export default function TapLink({
  href,
  kind,
  storeId,
  external = false,
  className,
  children,
}: {
  href: string;
  kind: TapKind;
  storeId: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => trackTap({ storeId, kind, page: `/bodycare/shop/${storeId}` })}
    >
      {children}
      {external && <span className="gr-sr">(別のタブで開きます)</span>}
    </a>
  );
}
