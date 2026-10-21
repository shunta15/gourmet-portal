import Link from "next/link";
import Logo from "./Logo";
import BackToTop from "./BackToTop";
import { IconArrow, IconInstagram, IconFacebook, IconX, IconYoutube } from "./Icons";
import { IMG_COMMON, ptLinks, type PtMode } from "./site";

/**
 * 最初の見本の下の部分(2 枚の帯「ペットとの暮らしを もっと豊かに。」「マチノワPetについて」+ フッター本体)。最初・店舗紹介・記事が使う。
 * 探すの見本の青空の帯のフッターは使わない(探すページ担当が自分で作る。Shell に footer={false} を渡す)。
 * 見本の SNS・運営について・お問い合わせ・利用規約・プライバシーポリシーは試作に行き先が無いので # にしてある。
 */
export default function Footer({ mode = "proto" }: { mode?: PtMode }) {
  const L = ptLinks(mode);
  const live = mode === "live";
  // 本番 live: 運営・お問い合わせ・掲載基準は総合サイトの実在のページ。SNS は公式アカウントが無いので出さない。利用規約・プライバシーポリシーは該当のページが無いので出さない。
  const aboutHref = live ? "/about" : "#";
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
              <a href={aboutHref} className="pt-fb-btn pt-press pt-hov pt-magnet">
                <span>マチノワPetについて</span>
                <IconArrow className="pt-fb-btn-a" />
              </a>
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
          <nav className="pt-fg-col io" aria-label="サービスを探す">
            <h3>サービスを探す</h3>
            <Link href={live ? L.areaAnchor : L.search}>エリアから探す</Link>
            <Link href={live ? L.categoryAnchor : L.search}>カテゴリから探す</Link>
            <Link href={live ? L.search : L.shop()}>{live ? "お店を探す" : "おすすめのお店"}</Link>
          </nav>
          <nav className="pt-fg-col io" aria-label="読みもの">
            <h3>読みもの</h3>
            <Link href={L.articles}>特集記事</Link>
            {live ? null : <Link href={L.articles}>ペット業界の記事</Link>}
            <Link href={live ? `${L.articles}#ar-scene` : L.articles}>{live ? "利用シーンから探す" : "暮らしのシーン記事"}</Link>
          </nav>
          <nav className="pt-fg-col pt-fg-about io" aria-label="マチノワPetについて">
            <h3>マチノワPetについて</h3>
            <a href={aboutHref}>{live ? "編集部について" : "運営について"}</a>
            {live ? <a href="/editorial/guidelines">掲載基準</a> : null}
            <a href={live ? "/contact" : "#"}>お問い合わせ</a>
            {live ? null : <a href="#">利用規約</a>}
            {live ? null : <a href="#">プライバシーポリシー</a>}
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
