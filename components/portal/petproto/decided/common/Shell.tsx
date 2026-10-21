import Header from "./Header";
import Footer from "./Footer";
import MotionFx from "./Motion";

export type PtPage = "top" | "search" | "shop" | "article";

/**
 * ペット決定案の各ページの外枠(サーバー)。ヘッダー・フッター・上端の進み具合の線・動きの仕組み(MotionFx)を出す。
 * 使い方(ページの default export の一番外側に置く):
 *   import Shell from "@/components/portal/petproto/decided/common/Shell";
 *   <Shell page="top">…ページの中身…</Shell>
 * props:
 *   page   : "top"(最初)| "search"(探す)| "shop"(店舗紹介)| "article"(記事)。ヘッダーの高さ・ロゴ・ナビの位置が見本どおりに切り替わる(既定 "top")。
 *            "top" だけ、ヘッダーがヒーローの上に重なる(ページの先頭の要素がヘッダーの下まで来る)。他は白い帯で、中身はその下から始まる。
 *   footer : false にするとフッターを出さない(探すページは青空の帯の自前のフッターを使う)。既定 true。
 * 見本の帯(28px)・共通の縦書きラベルと丸いカーソルを隠す・noindex・assertPreviewOrLocal・フォントの変数は app/proto-pet/decided/layout.tsx が受け持つ。
 * 中身は <div class="pt-main">(<main> ではない。グルメの共通の枠が既に <main> を出す)。
 */
export default function Shell({ page = "top", footer = true, children }: { page?: PtPage; footer?: boolean; children: React.ReactNode }) {
  return (
    <div className="pt-shell" data-pt-page={page}>
      <div className="pt-progress" aria-hidden="true" />
      <Header />
      <div className="pt-main" id="pt-main">
        {children}
      </div>
      {footer ? <Footer /> : null}
      <MotionFx />
    </div>
  );
}
