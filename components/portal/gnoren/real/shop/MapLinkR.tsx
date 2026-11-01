"use client";
/** 「Google マップで見る」。今の店ページと同じく、押したら送客の計測(shop_tap の map)を送る。 */
import { trackTap } from "@/lib/portal/track";

export default function MapLinkR({ href, storeId, page, className, children }: { href: string; storeId: string; page: string; className?: string; children: React.ReactNode }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackTap({ storeId, kind: "map", page })}>
      {children}
    </a>
  );
}
