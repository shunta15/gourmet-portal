import Link from "next/link";
import { MaskLines, Write } from "../common/Motion";
import { Arrow } from "./parts";
import { BASE, SEARCH_HREF, SPECIAL_HREF } from "../common/site";
import SpecialFilter, { type SpecialCardItem } from "./SpecialFilter";
import "./article.css";

/**
 * 特集の一覧(/bodycare/special)。業種の特集記事 3 本の入口。順位や「おすすめ」は出さない。
 * 写真は使わず、緑の面と若葉(装飾)。札は持ち上がり、矢印の丸が滑る(案4 の記事の動き)。
 */
export default function SpecialIndex({ items }: { items: SpecialCardItem[] }) {
  return (
    <div className="ar-page" data-gr-page="article" data-kind="special">
      <div className="ar-wrap">
        <nav className="ar-crumb" aria-label="パンくず">
          <Link href={BASE}>マチノワ ボディケア</Link>
          <i>&gt;</i>
          <span>特集</span>
        </nav>

        <header className="ar-idx-hero">
          <span className="ar-chip" data-rv="fade">
            特集
          </span>
          <MaskLines as="h1" className="ar-h1" lines={["ボディケアの", "特集"]} delay={120} />
          <p className="ar-lead" data-rv="fade" style={{ ["--d" as string]: "560ms" } as React.CSSProperties}>
            ボディケアの記事を、種類ごとに絞り込んで読めます。店の特集記事・利用シーンの記事・業種の読みものがあります。書いてあるのは、法令や国の資料で確かめたことと、マチノワに載っている店のデータにある事実だけです。
          </p>
          <div className="ar-note gr-hand ar-idx-note">
            <Write lines={["ゆっくり、", "読んでみてください。"]} delay={800} />
          </div>
        </header>

        <SpecialFilter items={items} />

        <div className="ar-back" data-rv>
          <span>ほかのページへ</span>
          <Link href={BASE} className="gr-btn gr-btn--line gr-press">
            最初のページへ
            <Arrow />
          </Link>
          <Link href={SEARCH_HREF} className="gr-btn gr-press">
            探すページへ
            <Arrow />
          </Link>
        </div>
      </div>
    </div>
  );
}

export { SPECIAL_HREF };
