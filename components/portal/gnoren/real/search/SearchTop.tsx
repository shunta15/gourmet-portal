import "../../search/search.css";
import "./real.css";

const IMG = "/_portal/gnoren/search";

/**
 * さがす /search の上の部分(ヒーロー + 統計の帯。サーバー描画)。見た目は試作 SearchView の同じ部分(search.css)。
 * 言葉は実データと、今の本番の言い回し(OpenSearchBlock の「店を、さがす。」「全 N 軒を、言葉・エリア・業種・利用シーンからさがせます。」)。数はデータから数えたもの。
 * 英字の飾り(Find your delicious place・MACHINOWA GOURMET 他)はサイトの飾り。
 */
export default function SearchTop({ total, regionCount, cuisineCount }: { total: number; regionCount: number; cuisineCount: number }) {
  return (
    <>
      <section className="gn-search-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-search-hero-img" src={`${IMG}/hero.webp`} alt="" width={2172} height={784} fetchPriority="high" />
        <div className="gn-search-hero-copy">
          <h1 className="gn-search-h1">
            店を、
            <br />
            さがす。
          </h1>
          <p className="gn-search-lead">
            全 {total} 軒を、
            <br />
            言葉・エリア・業種・利用シーンから
            <br />
            さがせます。
          </p>
        </div>
        <p className="gn-search-fy gn-script" aria-hidden="true">
          <span className="gn-search-fy-1">Find your</span>
          <span className="gn-search-fy-2">delicious place</span>
        </p>
        <p className="gn-search-fy-sub" aria-hidden="true">
          MACHINOWA GOURMET
          <br />
          GOOD FOOD
          <br />
          GOOD NEIGHBORS
        </p>
      </section>

      <section className="gn-search-stats" aria-label="マチノワ グルメの掲載状況">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-search-town" src={`${IMG}/townscape.webp`} alt="" aria-hidden="true" width={788} height={148} />
        <span className="gn-search-stats-line" aria-hidden="true" />
        <p className="gn-search-stats-cap">マチノワ グルメで見つかる</p>
        <dl className="gn-search-stats-list">
          <div className="gn-search-stat gn-search-stat-1">
            <dt>
              <b>{total}</b>
              <span>店舗</span>
            </dt>
            <dd>掲載している飲食店</dd>
          </div>
          <div className="gn-search-stat gn-search-stat-2">
            <dt>
              <b>{regionCount}</b>
              <span>エリア</span>
            </dt>
            <dd>店のある地域</dd>
          </div>
          <div className="gn-search-stat gn-search-stat-3">
            <dt>
              <b>{cuisineCount}</b>
              <span>料理分類</span>
            </dt>
            <dd>料理から探せる分け方</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
