import Link from "next/link";
import { BASE, SEARCH_HREF, SHOPS_HREF, SPECIAL_HREF, PORTAL_HREF, IMG_COMMON } from "./site";

/**
 * 見本には無いので、ヘッダーと同じ見た目の控えめなフッター。ナビはヘッダーのメニューと同じ 4 つ(トップ・店を探す・店舗紹介・特集)。
 * サイトとして必要な「マチノワ トップ・編集部について・掲載基準・お問い合わせ」は、メニューに数えない小さな 1 行に置く(2026-10-23 オーナー決定)。行き先は本番の URL
 */
export default function Footer() {
  return (
    <footer className="gr-foot">
      <div className="gr-foot-in">
        <Link href={BASE} className="gr-foot-logo" aria-label="マチノワ Body Care トップ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG_COMMON}/logo.webp`} width={214} height={46} alt="マチノワ.Body Care" loading="lazy" />
        </Link>
        <nav className="gr-foot-nav" aria-label="フッターのリンク">
          <Link href={BASE}>トップ</Link>
          <Link href={SEARCH_HREF}>店を探す</Link>
          <Link href={SHOPS_HREF}>店舗紹介</Link>
          <Link href={SPECIAL_HREF}>特集</Link>
        </nav>
        <p className="gr-foot-c">© マチノワ</p>
        <nav className="gr-foot-sub" aria-label="サイトの案内">
          <Link href={PORTAL_HREF}>マチノワ トップ</Link>
          <Link href="/about">編集部について</Link>
          <Link href="/editorial/guidelines">掲載基準</Link>
          <Link href="/contact">お問い合わせ</Link>
        </nav>
      </div>
    </footer>
  );
}
