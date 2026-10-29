import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { GnPage } from "./nav";

/**
 * 暖簾 2 試作の共通の枠。ヘッダー + children + フッター。
 * - page: ナビの下線(テラコッタ)を引くタブ。"top" | "search" | "shop" | "feature"
 * - PC では ヘッダーは絵の上に重なる(position:absolute・高さ 58u)ので、children は見本と同じくページの y=0 から始める。
 * - ≤768px ではヘッダーは 56px で流れの中に入る(position:sticky)。children はその下から始まる。
 */
export default function Shell({ page, children }: { page: GnPage; children: ReactNode }) {
  return (
    <div className="gn-root">
      <Header page={page} />
      {children}
      <Footer />
    </div>
  );
}
