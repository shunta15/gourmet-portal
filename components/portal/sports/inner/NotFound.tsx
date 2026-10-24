import Link from "next/link";
import Header from "./Header";
import { SPL } from "../links";
import "./shop/shop.css";
import "./story/story.css";
import "./list/list.css";

/**
 * 404(最初・探す・店・特集・記事のページ)。見本には無いページなので、見本2の部品(ヘッダー・店名の見出し・青い帯の白いボタン)だけで組む。外枠は InnerFrame(各 not-found.tsx が包む)。
 */
export default function SportsNotFound() {
  return (
    <div className="s2b-shop s2b-story s2b-nf">
      <div className="s2b-hdw s2b-hdw--shop">
        <Header variant="shop" current="top" />
      </div>
      <header className="s2b-st-title s2b-nf-t">
        <p className="s2b-sh-kicker">404 NOT FOUND</p>
        <h1>ページが見つかりません</h1>
        <p className="s2b-nf-d">お探しのページは見つかりませんでした。まだ公開していないページかもしれません。下から探してみてください。</p>
      </header>
      <nav className="s2b-nf-go" aria-label="ほかのページへ">
        <Link href={SPL.top}>マチノワスポーツのトップへ</Link>
        <Link href={SPL.search}>施設を探す</Link>
        <Link href={SPL.shops}>店舗紹介</Link>
        <Link href={SPL.special}>特集</Link>
      </nav>
    </div>
  );
}
