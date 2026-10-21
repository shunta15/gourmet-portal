import Link from "next/link";
import Logo from "./Logo";
import BackToTop from "./BackToTop";
import { IconArrow, IconInstagram, IconFacebook, IconX, IconYoutube } from "./Icons";
import { BASE, SEARCH_HREF, SHOP_HREF, ARTICLES_HREF, IMG_COMMON } from "./site";

/**
 * 最初の見本の下の部分(2 枚の帯「ペットとの暮らしを もっと豊かに。」「マチノワPetについて」+ フッター本体)。最初・店舗紹介・記事が使う。
 * 探すの見本の青空の帯のフッターは使わない(探すページ担当が自分で作る。Shell に footer={false} を渡す)。
 * 見本の SNS・運営について・お問い合わせ・利用規約・プライバシーポリシーは試作に行き先が無いので # にしてある。
 */
export default function Footer() {
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
              <a href="#" className="pt-fb-btn pt-press pt-hov">
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
        <div className="pt-foot-in pt-foot-grid">
          <div className="pt-fg-brand">
            <Link href={BASE} aria-label="マチノワPet トップ" className="pt-foot-logo-link">
              <Logo className="pt-foot-logo" />
            </Link>
            <p className="pt-fg-tag">ペットと、この街で、もっと豊かに。</p>
          </div>
          <nav className="pt-fg-col" aria-label="サービスを探す">
            <h3>サービスを探す</h3>
            <Link href={SEARCH_HREF}>エリアから探す</Link>
            <Link href={SEARCH_HREF}>カテゴリから探す</Link>
            <Link href={SHOP_HREF}>おすすめのお店</Link>
          </nav>
          <nav className="pt-fg-col" aria-label="読みもの">
            <h3>読みもの</h3>
            <Link href={ARTICLES_HREF}>特集記事</Link>
            <Link href={ARTICLES_HREF}>ペット業界の記事</Link>
            <Link href={ARTICLES_HREF}>暮らしのシーン記事</Link>
          </nav>
          <nav className="pt-fg-col pt-fg-about" aria-label="マチノワPetについて">
            <h3>マチノワPetについて</h3>
            <a href="#">運営について</a>
            <a href="#">お問い合わせ</a>
            <a href="#">利用規約</a>
            <a href="#">プライバシーポリシー</a>
          </nav>
          <div className="pt-fg-r">
            <div className="pt-fg-sns">
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
            <BackToTop />
            <p className="pt-fg-copy">
              © 2024 マチノワPet. All rights reserved.
              <span aria-hidden="true"> ｜ </span>
              <Link href={`${BASE}/credits`}>写真の出典</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
