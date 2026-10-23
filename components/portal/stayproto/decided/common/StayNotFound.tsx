import Link from "next/link";
import Shell from "./Shell";
import { syLinks } from "./site";
import "./notfound.css";

/** 決定デザインの 404(本番 /stay 以下の存在しないページ)。ヘッダー・フッターは決定デザインのまま、中身は短い案内だけ */
export default function StayNotFound() {
  const L = syLinks("live");
  return (
    <Shell page="article" mode="live">
      <section className="sy-nf" aria-labelledby="sy-nf-h">
        <p className="sy-nf-en">404</p>
        <h1 id="sy-nf-h" className="sy-nf-h">
          ページが見つかりません
        </h1>
        <p className="sy-nf-p">お探しのページは見つかりませんでした。まだ公開していないページかもしれません。下から探してみてください。</p>
        <p className="sy-nf-links">
          <Link href={L.home}>マチノワステイのトップへ</Link>
          <Link href={L.search}>宿を探す</Link>
          <Link href={L.shops}>店舗紹介を見る</Link>
          <Link href={L.specials}>特集を見る</Link>
        </p>
      </section>
    </Shell>
  );
}
