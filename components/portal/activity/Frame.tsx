import Link from "next/link";
import { assertPortalLive } from "@/lib/portal/launch";
import { hand, jp, lab, maru } from "./fonts";
import Header from "./Header";
import "./a-base.css";
import "./a-banner.css";
import "./a-top.css";
import "./a-search.css";
import "./a-shop.css";
import "./a-article.css";
import "./a-extra.css";

/**
 * アクティビティの最初・探す・店・特集・記事のページの外枠(サーバー)。青と黄の切手・チケット風・上に横メニュー(オーナーが決めた「A組」のデザイン)。
 * 書体 4 つの変数・紙の縁のざらつきの SVG フィルター・共通ヘッダーを出す。公開スイッチ OFF のあいだは 404(ほかの新業種の外枠 VkRoot と同じ)。
 * 共通のポータルのヘッダー・フッターは出さない。A組にはフッターが無いので、全ページの一番下(下の帯より下)に、フッターのナビ 1 行(トップ・探す・店舗紹介・特集。オーナー決定 2026-10-23)と、小さな文字の 1 行(マチノワ トップ・編集部について・掲載基準・お問い合わせ)だけ置く。
 * (種類・エリア・利用シーンの旧ページ app/activity/(sub)/ は、探すの絞り込みへ 308 で転送するので、外枠は使わない)
 */
export default function ActivityFrame({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return (
    <div className={`apa-root ${maru.variable} ${jp.variable} ${hand.variable} ${lab.variable}`}>
      <div className="apa-in">
        {/* 紙の縁のざらつき(切れ端・黄色い絵の具の縁)に使う SVG フィルター */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
          <filter id="apa-rough" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <Header />
        {children}
        <footer className="apa-foot">
          <nav aria-label="サイトの案内">
            <Link href="/">マチノワ トップ</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
