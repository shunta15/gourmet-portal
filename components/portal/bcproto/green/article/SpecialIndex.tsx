import Link from "next/link";
import { MaskLines, Write } from "../common/Motion";
import { Arrow, Leaf } from "./parts";
import { BASE, SEARCH_HREF, SPECIAL_HREF, specialHref } from "../common/site";
import { SPECIALS } from "@/lib/portal/vert/bodygreen/special";
import "./article.css";

/**
 * 特集記事の一覧(/bodycare/special)。業種の特集記事 3 本の入口。順位や「おすすめ」は出さない。
 * 写真は使わず、緑の面と若葉(装飾)。札は持ち上がり、矢印の丸が滑る(案4 の記事の動き)。
 */
export default function SpecialIndex() {
  return (
    <div className="ar-page" data-gr-page="article" data-kind="special">
      <div className="ar-wrap">
        <nav className="ar-crumb" aria-label="パンくず">
          <Link href={BASE}>マチノワ ボディケア</Link>
          <i>&gt;</i>
          <span>特集記事</span>
        </nav>

        <header className="ar-idx-hero">
          <span className="ar-chip" data-rv="fade">
            特集記事
          </span>
          <MaskLines as="h1" className="ar-h1" lines={["ボディケアの", "特集記事"]} delay={120} />
          <p className="ar-lead" data-rv="fade" style={{ ["--d" as string]: "560ms" } as React.CSSProperties}>
            ボディケアの店を探すときに役立つ記事です。書いてあるのは、法律で決まっていることと、マチノワに載っている店のデータにある事実だけです。
          </p>
          <div className="ar-note gr-hand ar-idx-note">
            <Write lines={["ゆっくり、", "読んでみてください。"]} delay={800} />
          </div>
        </header>

        <section aria-label="特集記事の一覧" className="ar-idx">
          <ul className="ar-idx-g" data-rv-group>
            {SPECIALS.map((s, i) => (
              <li key={s.slug} data-rv>
                <Link href={specialHref(s.slug)} className="ar-ic gr-lift gr-hov">
                  <div className="ph">
                    <Leaf size={52} />
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="tx">
                    <small>特集記事</small>
                    <h2>{s.title}</h2>
                    <p>{s.summary}</p>
                    <span className="go">
                      記事を読む
                      <span className="gr-arrow">
                        <Arrow />
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

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
