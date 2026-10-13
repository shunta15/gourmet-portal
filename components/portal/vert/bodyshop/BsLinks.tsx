"use client";
/**
 * 店のリンクのボタン(電話・地図・予約・公式サイト・SNS)。値がある項目だけが links に入ってくる(lib/portal/sns.ts の shopLinks)。
 * 外部リンクは rel="noopener noreferrer" target="_blank"。タップは lib/portal/track.ts で数える(storeId・kind・page だけ)。
 */
import { trackTap } from "@/lib/portal/track";
import type { ShopLink } from "@/lib/portal/sns";

export default function BsLinks({ links, storeId, page }: { links: ShopLink[]; storeId: string; page: string }) {
  if (links.length === 0) return null;
  return (
    <div className="bs-links">
      {links.map((l) => (
        <a
          key={l.kind}
          className="bs-link"
          href={l.href}
          {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          onClick={() => trackTap({ storeId, kind: l.kind, page })}
        >
          {l.label}
          {l.external && <span className="bs-sr">(別のタブで開きます)</span>}
        </a>
      ))}
    </div>
  );
}
