import Link from "next/link";
import Shell from "./Shell";
import { ptLinks } from "./site";
import "./notfound.css";

/** 決定デザインの 404(本番 /pet 以下の存在しないページ)。ヘッダー・フッターは決定デザインのまま、中身は短い案内だけ */
export default function PetNotFound() {
  const L = ptLinks("live");
  return (
    <Shell page="article" mode="live">
      <section className="pt-nf" aria-labelledby="pt-nf-h">
        <p className="pt-nf-en">404</p>
        <h1 id="pt-nf-h" className="pt-nf-h">
          ページが見つかりません
        </h1>
        <p className="pt-nf-p">お探しのページは見つかりませんでした。まだ公開していないページかもしれません。下から探してみてください。</p>
        <p className="pt-nf-links">
          <Link href={L.home}>マチノワPetのトップへ</Link>
          <Link href={L.search}>お店を探す</Link>
          <Link href={L.articles}>記事を見る</Link>
        </p>
      </section>
    </Shell>
  );
}
