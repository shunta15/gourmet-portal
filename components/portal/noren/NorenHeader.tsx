import Link from "next/link";
import { HEADER_NAV, NOREN_TOP } from "@/lib/portal/noren/nav";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";

/** 暖簾の共通ヘッダー（見本 /proto-noren と本番の /gourmet で共通）。ロゴ（top）と、メニュー 4 つ（トップ・さがす・店舗紹介・特集。lib/portal/noren/nav.ts の GOURMET_MENU。PC・スマホとも同じ並び） */
export default function NorenHeader({ top }: { top: string }) {
  return (
    <header className="vN-hd">
      <Link href={top} className="vN-logo" data-cursor="TOP">
        <span className="ja">マチノワ</span>
        {/* 呼び名をグルメの中でそろえる（RELEASE_PERIPHERY）: ロゴは「マチノワ グルメ」・メニューは日本語だけ（英字の添え書きは付けない） */}
        {RELEASE_PERIPHERY ? <em data-ja="">グルメ</em> : <em>Gourmet</em>}
      </Link>
      <nav className="vN-nav" aria-label="メイン">
        {HEADER_NAV.map((n) => (
          <Link key={n.href} href={n.href === NOREN_TOP ? top : n.href} data-cursor="GO">
            <span className="ja">{n.ja}</span>
            {!RELEASE_PERIPHERY && <em>{n.en}</em>}
          </Link>
        ))}
      </nav>
    </header>
  );
}
