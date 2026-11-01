import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { GN_LIVE_LINKS, type GnLinks, type GnPage } from "./nav";

/**
 * 暖簾 2 試作の共通の枠。ヘッダー + children + フッター。
 * - links: ナビ・ロゴ・虫眼鏡・ハートの行き先(既定 GN_LIVE_LINKS。試作は GN_PROTO_LINKS を渡す)
 * - page: ナビの下線(テラコッタ)を引くタブ。"top" | "search" | "shop" | "feature"
 * - PC では ヘッダーは絵の上に重なる(position:absolute・高さ 58u)ので、children は見本と同じくページの y=0 から始める。
 * - ≤768px ではヘッダーは 56px で流れの中に入る(position:sticky)。children はその下から始まる。
 */
export default function Shell({ page, links = GN_LIVE_LINKS, children }: { page: GnPage; links?: GnLinks; children: ReactNode }) {
  return (
    <div className="gn-root">
      <Header page={page} links={links} />
      {children}
      <Footer links={links} />
    </div>
  );
}
