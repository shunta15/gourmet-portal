import Link from "next/link";
import Logo from "./Logo";
import BackToTop from "./BackToTop";
import { vkLinks, type VkConfig } from "../config";

/**
 * 下の帯(ロゴ+ナビ 4 つ。下に小さな 2 行目)。全ページ共通。
 * 公式アカウント(SNS)が無いので出さず、代わりに 編集部について・掲載基準・お問い合わせ(総合サイトの実在のページ)と © を 2 行目に出す。
 */
export default function Footer({ cfg }: { cfg: VkConfig }) {
  const L = vkLinks(cfg);
  return (
    <footer className="vk-foot">
      <div className="vk-foot-in">
        <div className="vk-foot-row">
          <Link href={L.home} aria-label={`${cfg.brand} トップ`} className="vk-foot-logo-link">
            <Logo cfg={cfg} className="vk-foot-logo" />
          </Link>
          <nav className="vk-foot-nav" aria-label="サイトの案内">
            <Link href={L.areaAnchor}>エリアから探す</Link>
            <Link href={L.typeAnchor}>{cfg.noun}の種類から探す</Link>
            <Link href={L.articles}>特集記事</Link>
            <a href={L.about}>{cfg.brand}について</a>
          </nav>
          <div className="vk-foot-r">
            <BackToTop />
          </div>
        </div>
        <div className="vk-foot-sub">
          <p className="vk-foot-links">
            <a href="/about">編集部について</a>
            <a href="/editorial/guidelines">掲載基準</a>
            <a href="/contact">お問い合わせ</a>
          </p>
          <p className="vk-foot-copy">© {cfg.brand}</p>
        </div>
      </div>
    </footer>
  );
}
