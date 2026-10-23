import Link from "next/link";
import Logo from "./Logo";
import BackToTop from "./BackToTop";
import { IconInstagram, IconX, IconYoutube } from "./Icons";
import { PORTAL_HREF, syLinks, type SyMode } from "./site";

/**
 * 下の帯(見本の記事ページの最後の帯: ロゴ+ナビ+SNS)。全ページ共通。ナビはヘッダーのメニューと同じ 4 つ(トップ・宿を探す・店舗紹介・特集。2026-10-24 オーナー決定)。
 * 本番 live は、SNS(公式アカウントが無い)を出さず、代わりに 小さな案内の 1 行(マチノワ トップ・編集部について・掲載基準・お問い合わせ。総合サイトの実在のページ。メニューの数には数えない)と © を 2 行目に出す。
 * 試作 proto は見本どおり SNS 3 つ(行き先は #)。
 */
export default function Footer({ mode = "proto" }: { mode?: SyMode }) {
  const L = syLinks(mode);
  const live = mode === "live";
  return (
    <footer className="sy-foot">
      <div className="sy-foot-in">
        <div className="sy-foot-row">
          <Link href={L.home} aria-label="マチノワステイ トップ" className="sy-foot-logo-link">
            <Logo className="sy-foot-logo" />
          </Link>
          <nav className="sy-foot-nav" aria-label="マチノワステイ">
            <Link href={L.home}>トップ</Link>
            <Link href={L.search}>宿を探す</Link>
            <Link href={L.shops}>店舗紹介</Link>
            <Link href={L.specials}>特集</Link>
          </nav>
          <div className="sy-foot-r">
            {live ? null : (
              <div className="sy-foot-sns">
                <a href="#" aria-label="Instagram" className="sy-sns">
                  <IconInstagram />
                </a>
                <a href="#" aria-label="X" className="sy-sns">
                  <IconX />
                </a>
                <a href="#" aria-label="YouTube" className="sy-sns">
                  <IconYoutube />
                </a>
              </div>
            )}
            <BackToTop />
          </div>
        </div>
        <div className="sy-foot-sub">
          <p className="sy-foot-links">
            {live ? (
              <>
                <a href={PORTAL_HREF}>マチノワ トップ</a>
                <a href="/about">編集部について</a>
                <a href="/editorial/guidelines">掲載基準</a>
                <a href="/contact">お問い合わせ</a>
              </>
            ) : (
              <>
                <a href="#">運営について</a>
                <a href="#">お問い合わせ</a>
                <a href="#">利用規約</a>
                <a href="#">プライバシーポリシー</a>
              </>
            )}
          </p>
          <p className="sy-foot-copy">{live ? "© マチノワステイ" : "© 2024 マチノワステイ. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}
