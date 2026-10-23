import Link from "next/link";
import { IcArrow, Mountain, Pines } from "./Deco";
import ActivityFrame from "./Frame";
import { aLinks } from "./links";

/** 404(最初・探す・店・特集・記事のページ)。見本の無いページなので、記事のページと同じ部品(クリーム色の札・赤いボタン)だけで組んだ。外枠は ActivityFrame */
export default function ActivityNotFound() {
  return (
    <ActivityFrame>
      <div className="apa-page apa-story">
        <div className="y-wrap">
          <section className="y-hero" aria-labelledby="y-nf-h">
            <div className="y-panel is-solo">
              <p className="y-tag">
                <span>404</span>
                <small>NOT FOUND</small>
              </p>
              <h1 id="y-nf-h" className="y-h1">
                <span>ページが見つかりません</span>
              </h1>
              <p className="y-lead">お探しのページは見つかりませんでした。まだ公開していないページかもしれません。下から探してみてください。</p>
              <div className="y-actions">
                <Link className="y-btn" href={aLinks.top}>
                  アクティビティのトップへ <IcArrow />
                </Link>
                <Link className="y-btn is-ghost" href={aLinks.search}>
                  体験を探す <IcArrow />
                </Link>
                <Link className="y-btn is-ghost" href={aLinks.article}>
                  特集を見る <IcArrow />
                </Link>
              </div>
              <Pines className="y-pines" />
              <Mountain className="y-sec-deco" />
            </div>
          </section>
        </div>
      </div>
    </ActivityFrame>
  );
}
