import Link from "next/link";
import { IcHeart, IcSearch, IcUser, LogoMark } from "./Deco";
import { aLinks } from "./links";

/**
 * 共通のヘッダー(見本どおり。白い帯・左にロゴと一言・中央に横メニュー・右に検索/お気に入り/編集部/掲載相談)。
 * 全ページ「アクティビティ」の下に赤い線。メニューの行き先は本物のページ(スポット・コース=探す / 特集・マガジン=特集)。
 * 見本の「ログイン」「新規登録」は、サイトにその仕組みが無いので、同じ位置・同じ見た目のまま、文字と行き先を
 * 実在のページに替えた(ログイン → 編集部 = /about / 新規登録 → 掲載相談 = /contact。掲載依頼・修正依頼の窓口)。
 * お気に入りは、ハートで入れた体験だけの探す(/activity/search?fav=1)。
 */
const NAV = [
  { t: "スポット", href: aLinks.search, k: "spot" },
  { t: "アクティビティ", href: aLinks.top, k: "act" },
  { t: "コース", href: aLinks.course, k: "course" },
  { t: "特集", href: aLinks.article, k: "feature" },
  { t: "マガジン", href: aLinks.magazine, k: "magazine" },
];
// スマホのメニューには、PC では右に並ぶアイコンの行き先も入れる(スマホにはアイコンの列が無い)
const EXTRA = [
  { t: "検索", href: aLinks.search },
  { t: "お気に入り", href: aLinks.favs },
  { t: "編集部について", href: aLinks.about },
  { t: "掲載の相談", href: aLinks.contact },
];

export default function Header() {
  return (
    <header className="apa-head">
      <div className="apa-head-in">
        <Link href={aLinks.top} className="apa-logo" aria-label="マチノワ アクティビティ">
          <LogoMark className="apa-logo-mark" />
          <span className="apa-logo-t">マチノワ</span>
        </Link>
        <p className="apa-head-tag">まちでつながる、わたしのアクティビティ</p>
        <nav className="apa-nav" aria-label="メニュー">
          {NAV.map((n) => (
            <Link key={n.k} href={n.href} className={`apa-nav-${n.k}${n.k === "act" ? " is-on" : ""}`} aria-current={n.k === "act" ? "page" : undefined}>
              {n.t}
            </Link>
          ))}
        </nav>
        <div className="apa-head-ic">
          <Link href={aLinks.search} className="apa-hi apa-hi-search">
            <IcSearch />
            <span>検索</span>
          </Link>
          <Link href={aLinks.favs} className="apa-hi apa-hi-fav">
            <IcHeart />
            <span>お気に入り</span>
          </Link>
          <Link href={aLinks.about} className="apa-hi apa-hi-user">
            <IcUser />
            <span>編集部</span>
          </Link>
          <Link href={aLinks.contact} className="apa-signup">
            掲載相談
          </Link>
        </div>
        <details className="apa-burger">
          <summary aria-label="メニューを開く">
            <i />
            <i />
            <i />
          </summary>
          <div className="apa-burger-list">
            {NAV.map((n) => (
              <Link key={n.k} href={n.href}>
                {n.t}
              </Link>
            ))}
            {EXTRA.map((n) => (
              <Link key={n.t} href={n.href}>
                {n.t}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
