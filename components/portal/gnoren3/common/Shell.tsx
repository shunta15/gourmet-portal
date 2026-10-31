import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { Gn3Page } from "./nav";

/**
 * 暖簾 3 試作の共通の枠。ヘッダー + children + フッター。
 * - page: ナビの下線を引くタブ。"top" | "search" | "shop" | "feature"
 * - PC のヘッダーは「流れの中の濃い帯」(高さ 55u)。絵に重ならない。children はその下から始まる。
 *   見本の y 座標から 55 を引いた値が、children の中での y(= calc(var(--u) * (見本の y − 55)))。
 * - ≤768px ではヘッダーは 56px・sticky。
 */
export default function Shell({ page, children }: { page: Gn3Page; children: ReactNode }) {
  return (
    <div className="gn3-root">
      <Header page={page} />
      {children}
      <Footer />
    </div>
  );
}
