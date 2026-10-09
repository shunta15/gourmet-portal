import Link from "next/link";
import { HEADER_NAV } from "@/lib/portal/noren/nav";

/** 暖簾の共通ヘッダー（見本 /proto-noren と本番の /gourmet で共通）。ロゴ（top）と、今のヘッダーと同じ 4 つの行き先 */
export default function NorenHeader({ top }: { top: string }) {
  return (
    <header className="vN-hd">
      <Link href={top} className="vN-logo" data-cursor="TOP">
        <span className="ja">マチノワ</span>
        <em>Gourmet</em>
      </Link>
      <nav className="vN-nav" aria-label="メイン">
        {HEADER_NAV.map((n) => (
          <Link key={n.href} href={n.href} data-cursor="GO">
            <span className="ja">{n.ja}</span>
            <em>{n.en}</em>
          </Link>
        ))}
      </nav>
    </header>
  );
}
