import Link from "next/link";
import { SPL } from "../links";
import { Search } from "./Icons";
import { LogoShop, LogoSpecial } from "./Logos";

export type S2bNavKey = "top" | "search" | "shops" | "special";
const ITEMS: Array<{ key: S2bNavKey; label: string; href: string }> = [
  { key: "top", label: "トップ", href: SPL.top },
  { key: "search", label: "施設を探す", href: SPL.search },
  { key: "shops", label: "店舗紹介", href: SPL.shops },
  { key: "special", label: "特集", href: SPL.special },
];

/**
 * ヘッダー。見本2が 2 枚で少し違うので 2 種類(shop = 店舗紹介の見本: 明朝のロゴ + 青い丸の虫眼鏡 / special = 特集の見本: ゴシックのロゴ + 一言 + 虫眼鏡)。
 * ロゴは SVG の文字(Logos.tsx。以前は見本から切り出した webp で粗かった)。押せる範囲 = ロゴ全体。メニューの文字は生の文字。
 */
export default function Header({ variant, current }: { variant: "shop" | "special"; current: S2bNavKey }) {
  const shop = variant === "shop";
  return (
    <header className={`s2b-hd s2b-hd--${variant}`}>
      <Link href={SPL.top} className="s2b-hd-logo" aria-label="マチノワスポーツ トップへ">
        {shop ? <LogoShop /> : <LogoSpecial />}
      </Link>
      {shop ? null : (
        <p className="s2b-hd-tag">
          街のスポーツが<br />もっと身近になる。
        </p>
      )}
      <nav className="s2b-hd-nav" aria-label="メインメニュー">
        {ITEMS.map((i, n) => (
          <span key={i.key} className="s2b-hd-item">
            {shop && n > 0 ? <i aria-hidden="true">/</i> : null}
            <Link href={i.href} className={i.key === current ? "is-cur" : undefined} aria-current={i.key === current ? "page" : undefined}>
              {i.label}
            </Link>
          </span>
        ))}
      </nav>
      <Link href={SPL.search} className="s2b-hd-search" aria-label="施設を検索">
        <Search />
      </Link>
    </header>
  );
}
