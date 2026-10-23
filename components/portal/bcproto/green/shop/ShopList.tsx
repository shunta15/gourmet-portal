import Link from "next/link";
import { loadGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import { PAGE_SIZE, filterGreenShops } from "@/lib/portal/vert/bodygreen/filter";
import { MaskLines } from "../common/Motion";
import ShopCard from "../common/ShopCard";
import { BASE, SEARCH_HREF, SPECIAL_HREF, shopListHref } from "../common/site";
import { Arrow } from "../article/parts";
import "../article/article.css";
import "./shoplist.css";

/**
 * 店舗紹介の一覧(/bodycare/shop)。メニューの「店舗紹介」の行き先。掲載中の全店(111 店)の札を並べる(見出し・件数・札)。絞り込みは付けない。
 * 作りは探す(GreenSearch)・特集の一覧(SpecialIndex)と同じ枠: 見出しの帯(パンくず・チップ・見出し・導入の文) → 店の札(ShopCard。札ぜんたいが店のページ /bodycare/shop/{id} へのリンク)。
 * 並びは探すの既定(都道府県順。写真のある店が先)と同じ。続きは「さらに 20 件を見る」(URL の引数 n。JS が無くてもリンクで開く)。
 * 星・点数・口コミ・料金・「おすすめ」・順位は出さない(データに無い)。metadata・構造化データ(BreadcrumbList)は app/bodycare/(shop)/shop/page.tsx。
 */
export default async function ShopList({ n }: { n: number }) {
  const shops = await loadGreenShops();
  const list = filterGreenShops(shops, { sort: "area" });
  const shown = list.slice(0, n);
  const left = list.length - shown.length;
  return (
    <div className="ar-page" data-gr-page="article" data-kind="special">
      <div className="ar-wrap">
        <nav className="ar-crumb" aria-label="パンくず">
          <Link href={BASE}>マチノワ ボディケア</Link>
          <i>&gt;</i>
          <span>店舗紹介</span>
        </nav>

        <header className="ar-idx-hero">
          <span className="ar-chip" data-rv="fade">
            ボディケア
          </span>
          <MaskLines as="h1" className="ar-h1" lines={["店舗紹介"]} delay={120} />
          <p className="ar-lead" data-rv="fade" style={{ ["--d" as string]: "560ms" } as React.CSSProperties}>
            掲載中のボディケアの店を、すべて並べました。店の札を押すと、その店の店舗紹介のページが開きます。並びは順位ではありません。
          </p>
          <p className="sl-count" data-rv="fade" aria-live="polite" style={{ ["--d" as string]: "700ms" } as React.CSSProperties}>
            掲載 <b>{list.length}</b> 件{left > 0 && <span>({shown.length} 件を表示)</span>}
          </p>
        </header>

        <section aria-label="店の一覧" className="sl-sec">
          <ul className="sl-g" data-rv-group>
            {shown.map((s, i) => (
              <li key={s.id} data-rv>
                <ShopCard shop={s} eager={i < 4} as="h2" />
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className="sl-empty">表示できる店はまだありません。</p>}
          {left > 0 && (
            <nav className="sl-pager" aria-label="続きを見る" data-rv="fade">
              <Link href={shopListHref(n + PAGE_SIZE)} scroll={false} className="gr-btn gr-press">
                さらに {Math.min(PAGE_SIZE, left)} 件を見る
                <Arrow />
              </Link>
              <span>
                {shown.length} / {list.length} 件を表示
              </span>
            </nav>
          )}
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
          <Link href={SPECIAL_HREF} className="gr-btn gr-btn--line gr-press">
            特集へ
            <Arrow />
          </Link>
        </div>
      </div>
    </div>
  );
}
