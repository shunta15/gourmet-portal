import Link from "next/link";
import { HEADER_NAV, NOREN_TOP } from "@/lib/portal/noren/nav";

/** 暖簾の見本の共通ヘッダー。ロゴ（トップ）と、今のヘッダーと同じ 4 つの行き先 */
export default function NorenHeader() {
  return (
    <header className="vN-hd">
      <Link href={NOREN_TOP} className="vN-logo" data-cursor="TOP">
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
