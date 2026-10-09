"use client";
/**
 * 地図の区画の「Google マップで開く」。今の店ページと同じく、押したら送客の計測（shop_tap の map）を送る。
 * 見た目は暖簾の店ページのもの（.vS-btn-ink）。サーバーコンポーネントの中から onClick を付けられないので、ここだけクライアントに分けた。
 */
import { trackTap } from "@/lib/portal/track";

export default function ShopMapLink({ href, storeId, page }: { href: string; storeId: string; page: string }) {
  return (
    <a
      className="vS-btn-ink"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="MAP"
      onClick={() => trackTap({ storeId, kind: "map", page })}
    >
      Google マップで開く ↗
    </a>
  );
}
