import Link from "next/link";
import { IcSearch } from "./Icons";

const NAV = [
  { key: "top", label: "トップ", href: "/proto-sports" },
  { key: "search", label: "施設を探す", href: "/proto-sports/search" },
  { key: "shop", label: "店舗紹介", href: "/sports/shop" },
  { key: "special", label: "特集", href: "/proto-sports/special" },
] as const;

/** ヘッダー。top(最初のページ。細い帯)と search(探すページ。ロゴが大きく、現在のページに下線・右に青い虫めがね)で見本の寸法が違う */
export default function Header({ variant, active }: { variant: "top" | "search"; active: string }) {
  return (
    <header className={`s2-hd s2-hd-${variant}`}>
      <Link href="/proto-sports" className="s2-logo" aria-label="マチノワ スポーツ">
        <span className="s2-logo-en">
          <b>MACHINOWA</b> <i>SPORTS</i>
        </span>
        {variant === "search" ? <span className="s2-logo-jp">マチノワスポーツ</span> : null}
        <span className="s2-logo-tag">{variant === "top" ? "マチのスポーツで、毎日をおもしろく。" : "まちのスポーツで、毎日をもっと楽しく。"}</span>
      </Link>
      <nav className="s2-nav" aria-label="メニュー">
        {NAV.map((n) => (
          <Link key={n.key} href={n.href} aria-current={active === n.key ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <Link href="/proto-sports/search" className="s2-hd-s" aria-label="施設を探す">
        <IcSearch />
      </Link>
    </header>
  );
}
