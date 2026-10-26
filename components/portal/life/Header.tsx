import Link from "next/link";
import { LFL } from "./links";
import { IcSearch } from "./Icons";

export type NavKey = "top" | "search" | "shops" | "special";
const NAV: Array<{ key: NavKey; label: string; href: string }> = [
  { key: "top", label: "トップ", href: LFL.top },
  { key: "search", label: "場所を探す", href: LFL.search },
  { key: "shops", label: "店舗紹介", href: LFL.shops },
  { key: "special", label: "特集", href: LFL.special },
];

/** 見本の丸い印(赤い輪が重なる) */
function EmblemRound() {
  return (
    <svg viewBox="0 0 60 60" className="lf-emb lf-emb-round" aria-hidden="true">
      <circle cx="30" cy="30" r="28.500" fill="#fffaf2" stroke="#b3322a" strokeWidth="1.600" />
      <g fill="none" stroke="#b3322a" strokeWidth="2.600">
        <circle cx="30" cy="20" r="9" />
        <circle cx="30" cy="40" r="9" />
        <circle cx="20" cy="30" r="9" />
        <circle cx="40" cy="30" r="9" />
      </g>
    </svg>
  );
}
/** 見本の四角い印(窓の格子) */
function EmblemSquare() {
  return (
    <svg viewBox="0 0 60 60" className="lf-emb lf-emb-sq" aria-hidden="true">
      <circle cx="30" cy="30" r="28.500" fill="#fffaf2" stroke="#4a2a22" strokeWidth="2.600" />
      <g stroke="#4a2a22" strokeWidth="2.600" fill="none">
        <rect x="14" y="14" width="32" height="32" />
        <path d="M30 14v32M14 30h32M14 22h32M14 38h32M22 14v32M38 14v32" strokeWidth="1.600" />
      </g>
    </svg>
  );
}

/**
 * ヘッダー。見本が 4 枚で少しずつ違うので 4 種類(a = 最初のページ / b = 探す / c = 店舗紹介 / d = 特集)。ロゴは生の文字(Shippori Mincho)。
 */
export default function Header({ variant, current }: { variant: "a" | "b" | "c" | "d"; current: NavKey }) {
  const tag: Record<string, [string, string?]> = {
    a: ["まちの、くらしの、", "いい出会いをつなぐローカルライフメディア"],
    b: ["まちの、いい時間に出会う", "日本のまちで見つける、暮らし・文化・ひと・場所"],
    c: ["まちの、好きが見つかる。", "日本の暮らしと文化をめぐるローカル発見メディア"],
    d: ["見つかる、好きになる、まちのくらし"],
  };
  return (
    <header className={`lf-hd lf-hd-${variant}`}>
      <Link href={LFL.top} className="lf-hd-logo" aria-label="マチノワライフ トップへ">
        {variant === "b" ? <EmblemRound /> : null}
        {variant === "d" ? <EmblemSquare /> : null}
        <span className="lf-hd-name">
          <b>マチノワライフ</b>
          <i>MACHINOWA LIFE</i>
          {variant === "d" ? <small>{tag.d[0]}</small> : null}
        </span>
      </Link>
      {variant !== "d" ? (
        <p className="lf-hd-tag">
          {tag[variant][0]}
          <br />
          {tag[variant][1]}
        </p>
      ) : null}
      <nav className="lf-hd-nav" aria-label="メインメニュー">
        {NAV.map((i) => (
          <Link key={i.key} href={i.href} className={i.key === current ? "is-cur" : undefined} aria-current={i.key === current ? "page" : undefined}>
            {i.label}
          </Link>
        ))}
      </nav>
      {variant === "d" ? (
        <form className="lf-hd-form" action={LFL.search} role="search">
          <input name="q" type="search" placeholder="エリア・キーワードで探す" aria-label="エリア・キーワードで探す" />
          <button type="submit" aria-label="検索">
            <IcSearch />
          </button>
        </form>
      ) : (
        <Link href={LFL.search} className="lf-hd-s" aria-label="場所を探す">
          <IcSearch />
        </Link>
      )}
      {variant === "d" ? (
        <p className="lf-hd-side">
          地域の
          <br />
          暮らしに出会う
          <br />
          日本のまちの
          <br />
          発見メディア
        </p>
      ) : null}
      {variant === "c" ? <i className="lf-hd-patch" aria-hidden="true" /> : null}
    </header>
  );
}
