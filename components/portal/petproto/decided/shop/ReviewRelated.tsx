import Link from "next/link";
import { Stars } from "../common/Motion";
import { IconArrow } from "../common/Icons";
import { ARTICLE_HREF, ARTICLES_HREF } from "../common/site";
import { RELATED, REVIEWS } from "./data";

/** 口コミ 3 件(★はスクロールで左から塗られる) */
export function Review() {
  return (
    <section className="sp-rev" id="review" aria-label="口コミ" data-io-group>
      <div className="sp-rev-l io">
        <p className="sp-lab">Review</p>
        <h2 className="sp-ttl sp-ttl--rev">口コミ</h2>
        <Link href={ARTICLES_HREF} className="sp-ghost sp-ghost--rev pt-press pt-hov">
          <span>すべての口コミを見る</span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
      <div className="sp-rev-cards">
        {REVIEWS.map((r) => (
          <article key={r.name} className="sp-rc pt-lift io">
            <img className="sp-rc-av" src={r.av} width={48} height={48} alt="" loading="lazy" />
            <p className="sp-rc-n">{r.name}</p>
            <p className="sp-rc-d">{r.date}</p>
            <p className="sp-rc-s">
              <Stars value={r.score} />
              <span className="sp-rc-v">{r.score.toFixed(1)}</span>
            </p>
            <p className="sp-rc-t">
              {r.text.map((l, i) => (
                <span key={i}>
                  {l}
                  {i < r.text.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** 関連記事 4 本 */
export function Related() {
  return (
    <section className="sp-rel" aria-label="関連記事" data-io-group>
      <div className="sp-rel-l io">
        <p className="sp-lab">Related</p>
        <h2 className="sp-ttl sp-ttl--rel">関連記事</h2>
      </div>
      <div className="sp-items">
      {RELATED.map((a) => (
        <Link key={a.src} href={ARTICLE_HREF} className="sp-ra pt-lift io" style={{ ["--l" as string]: a.l, ["--w" as string]: a.w }}>
          <div className="sp-ra-ph pt-zoom">
            <img src={a.src} width={350} height={92} alt="" loading="lazy" />
          </div>
          <h3 className="sp-ra-t">
            {a.title.map((l, i) => (
              <span key={i}>
                {l}
                {i < a.title.length - 1 ? <br /> : null}
              </span>
            ))}
          </h3>
          <p className="sp-ra-d">{a.date}</p>
        </Link>
      ))}
      </div>
    </section>
  );
}
