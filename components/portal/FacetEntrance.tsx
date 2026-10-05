import Link from "next/link";
import { CSS_FACET_ENTRANCE } from "./searchFacetsCss";

/**
 * グルメのトップ（公開スイッチ ON の /gourmet）の、さがすの下の入口。「こだわり条件でさがす」→ /search。
 * サーバーコンポーネント（JS を足さない）。CSS は React 19 の <style href precedence> で、この入口が出るときだけ head に入る。
 */
export default function FacetEntrance() {
  return (
    <>
      <style href="fc-entrance" precedence="fc-1">
        {CSS_FACET_ENTRANCE}
      </style>
      <div className="fc-entrance">
        <Link href="/search" className="fc-entrance-link" data-cursor="FILTER">
          <span className="fc-entrance-no">◎ こだわり条件</span>
          <span className="fc-entrance-text">
            予算・営業時間・駅からの近さ・個室など、条件を重ねて絞る
            <small>店の案内に書かれていることだけを使います。書かれていない条件は「不明」として、含めません。</small>
          </span>
          <span className="fc-entrance-go" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </>
  );
}
