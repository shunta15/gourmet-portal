import Link from "next/link";
import ContactLine from "@/components/portal/ContactLine";
import Logo from "./Logo";
import BackToTop from "./BackToTop";
import { vkLinks, type VkConfig } from "../config";

/**
 * 下の帯(ロゴ+ナビ 4 つ。下に小さな 2 行目)。全ページ共通。
 * ナビはヘッダーのメニューと同じ 4 つ(トップ・〇〇を探す・店舗紹介・特集)。
 * 公式アカウント(SNS)が無いので出さず、代わりに 2 行目に、サイトとして必要な小さな案内
 * (マチノワ トップ・編集部について・掲載基準・お問い合わせ。総合サイトの実在のページ)と © を出す。この小さな案内はメニューの数には数えない。
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
            <Link href={L.home}>トップ</Link>
            <Link href={L.search}>{cfg.noun}を探す</Link>
            <Link href={L.shops}>店舗紹介</Link>
            <Link href={L.special}>特集</Link>
          </nav>
          <div className="vk-foot-r">
            <BackToTop />
          </div>
        </div>
        <div className="vk-foot-sub">
          <p className="vk-foot-links">
            <a href="/">マチノワ トップ</a>
            <a href="/videos">動画</a>
          </p>
          <p className="vk-foot-copy">© {cfg.brand}</p>
          <ContactLine />
        </div>
      </div>
    </footer>
  );
}
