import Link from "next/link";
import Logo from "./Logo";
import BackToTop from "./BackToTop";
import { IconArrow, IconInstagram, IconFacebook, IconX, IconYoutube } from "./Icons";
import { IMG_COMMON, PORTAL_HREF, ptLinks, type PtMode } from "./site";

/**
 * 最初の見本の下の部分(2 枚の帯「ペットとの暮らしを もっと豊かに。」「マチノワPetについて」+ フッター本体)。最初・店舗紹介・記事が使う。
 * 探すの見本の青空の帯のフッターは使わない(探すページ担当が自分で作る。Shell に footer={false} を渡す)。
 * 見本の SNS・運営について・お問い合わせ・利用規約・プライバシーポリシーは試作に行き先が無いので # にしてある。
 * ナビの部分はヘッダーのメニューと同じ 4 つ(トップ・お店を探す・店舗紹介・特集。2026-10-24 オーナー決定)。エリア・カテゴリ・利用シーンの飛び先は外した。
 */
export default function Footer({ mode = "proto" }: { mode?: PtMode }) {
  const L = ptLinks(mode);
  const live = mode === "live";
  // 本番 live: 運営・お問い合わせ・掲載基準は総合サイトの実在のページ。SNS は公式アカウントが無いので出さない。利用規約・プライバシーポリシーは該当のページが無いので出さない。
  return (
    <footer className="pt-foot">
      <div className="pt-foot-top">
        <div className="pt-foot-in pt-foot-ban">
          <div className="pt-fb-brand io">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pt-fb-photo" src={`${IMG_COMMON}/footer-banner.webp`} width={488} height={158} alt="" loading="lazy" />
            <p className="pt-fb-t pt-min">
              <span>ペットとの暮らしを</span>
              <span>もっと豊かに。</span>
            </p>
            <p className="pt-fb-s">おでかけも、日常も、ずっといっしょに。</p>
          </div>
          <div className="pt-fb-about io">
            <div className="pt-fb-about-txt">
              <h2 className="pt-min">マチノワPetについて</h2>
              <p>
                マチノワPetは、ペットと人がもっと快適に、
                <br />
                もっと楽しく暮らせる社会を目指す地域密着型のポータルサイトです。
              </p>
              {/* 本番(live)は行き先の /about を消したのでボタンを置かない。見本(proto)は行き先なし(#)のまま */}
              {live ? null : (
                <a href="#" className="pt-fb-btn pt-press pt-hov pt-magnet">
                  <span>マチノワPetについて</span>
                  <IconArrow className="pt-fb-btn-a" />
                </a>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pt-fb-about-img" src={`${IMG_COMMON}/footer-about.webp`} width={254} height={158} alt="" loading="lazy" />
          </div>
        </div>
      </div>
      <div className="pt-foot-main">
        <div className="pt-foot-in pt-foot-grid" data-io-group>
          <div className="pt-fg-brand io">
            <Link href={L.home} aria-label="マチノワPet トップ" className="pt-foot-logo-link">
              <Logo className="pt-foot-logo" />
            </Link>
            <p className="pt-fg-tag">ペットと、この街で、もっと豊かに。</p>
          </div>
          <nav className="pt-fg-col io" aria-label="マチノワPet">
            <h3>マチノワPet</h3>
            <Link href={L.home}>トップ</Link>
            <Link href={L.search}>{live ? "お店を探す" : "おすすめのお店"}</Link>
            <Link href={L.shops}>店舗紹介</Link>
            <Link href={L.specials}>特集</Link>
          </nav>
          {/* サイトとして必要な小さな案内(メニューの数には数えない)。本番はマチノワ トップ・編集部について・掲載基準・お問い合わせ(総合サイトの実在のページ) */}
          <nav className="pt-foot-small" aria-label="サイトの案内">
            {live ? (
              <>
                <a href={PORTAL_HREF}>マチノワ トップ</a>
              </>
            ) : (
              <>
                <a href="#">運営について</a>
                <a href="#">お問い合わせ</a>
                <a href="#">利用規約</a>
                <a href="#">プライバシーポリシー</a>
              </>
            )}
          </nav>
          <div className="pt-fg-r">
            {live ? null : (
            <div className="pt-fg-sns pt-popin">
              <a href="#" aria-label="Instagram" className="pt-sns pt-sns--ig pt-press">
                <IconInstagram />
              </a>
              <a href="#" aria-label="Facebook" className="pt-sns pt-press">
                <IconFacebook />
              </a>
              <a href="#" aria-label="X" className="pt-sns pt-sns--x pt-press">
                <IconX />
              </a>
              <a href="#" aria-label="YouTube" className="pt-sns pt-sns--yt pt-press">
                <IconYoutube />
              </a>
            </div>
            )}
            <BackToTop />
            <p className="pt-fg-copy">{live ? "© マチノワPet" : "© 2024 マチノワPet. All rights reserved."}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
