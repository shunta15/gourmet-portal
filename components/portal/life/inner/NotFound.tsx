import Link from "next/link";
import Header from "../Header";
import { LFL } from "../links";

/** 404(最初・探す・店・特集・記事のページ)。見本には無いページなので、見本の部品(ヘッダー・赤い縦線の見出し・赤いボタン)だけで組む。外枠は LifeFrame(各 not-found.tsx が包む) */
export default function LifeNotFound() {
  return (
    <div className="lf-shop lf-nf">
      <Header variant="c" current="top" />
      <header className="ls-title nf-t">
        <p className="sh-kicker">
          <i aria-hidden="true" />
          404
        </p>
        <h1>ページが見つかりません</h1>
        <p className="nf-d">お探しのページは見つかりませんでした。まだ公開していないページかもしれません。下から探してみてください。</p>
      </header>
      <nav className="nf-go" aria-label="ほかのページへ">
        <Link href={LFL.top}>マチノワライフのトップへ</Link>
        <Link href={LFL.search}>場所を探す</Link>
        <Link href={LFL.shops}>店舗紹介</Link>
        <Link href={LFL.special}>特集</Link>
      </nav>
    </div>
  );
}
