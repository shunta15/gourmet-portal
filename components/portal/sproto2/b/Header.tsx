import Link from "next/link";
import { S2B_LINKS } from "./nav";
import { Search } from "./Icons";

export type S2bNavKey = "top" | "search" | "shops" | "special";
const ITEMS: Array<{ key: S2bNavKey; label: string; href: string }> = [
  { key: "top", label: "トップ", href: S2B_LINKS.top },
  { key: "search", label: "施設を探す", href: S2B_LINKS.search },
  { key: "shops", label: "店舗紹介", href: S2B_LINKS.shops },
  { key: "special", label: "特集", href: S2B_LINKS.special },
];

/**
 * ヘッダー。見本2が 2 枚で少し違うので 2 種類(shop = 店舗紹介の見本: 明朝のロゴ + 青い丸の虫眼鏡 / special = 特集の見本: ゴシックのロゴ + 一言 + 虫眼鏡)。
 * ロゴは見本の画像から切り出した webp(押せる範囲 = ロゴ全体)。メニューの文字は生の文字。
 */
export default function Header({ variant, current }: { variant: "shop" | "special"; current: S2bNavKey }) {
  const shop = variant === "shop";
  return (
    <header className={`s2b-hd s2b-hd--${variant}`}>
      <Link href={S2B_LINKS.top} className="s2b-hd-logo" aria-label="マチノワスポーツ トップへ">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shop ? "/_portal/sproto2/b/logo-shop.webp" : "/_portal/sproto2/b/logo-special.webp"} alt="MACHINOWA SPORTS マチノワスポーツ" width={shop ? 356 : 222} height={shop ? 40 : 38} />
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
      <Link href={S2B_LINKS.search} className="s2b-hd-search" aria-label="施設を検索">
        <Search />
      </Link>
    </header>
  );
}
