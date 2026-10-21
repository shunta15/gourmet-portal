import Link from "next/link";
import { Stars, FillHeading } from "../common/Motion";
import { IconArrow } from "../common/Icons";
import { ARTICLE_HREF, ARTICLES_HREF } from "../common/site";
import { RELATED, REVIEWS } from "./data";

/** 口コミ 3 件(★はスクロールで左から塗られる) */
export function Review() {
  return (
    <section className="sp-rev pt-bgshift pt-skew" data-skew="0.4" data-from="0.99" data-to="0.66" id="review" aria-label="口コミ" data-io-group style={{ ["--bg-to" as string]: "#f8f8f6", ["--bg-from" as string]: "#efe8dc" }}>
      <div className="sp-rev-l io">
        <p className="sp-lab">Review</p>
        <FillHeading as="h2" className="sp-ttl sp-ttl--rev" start={1.0} end={0.66}>
          口コミ
        </FillHeading>
        <Link href={ARTICLES_HREF} className="sp-ghost sp-ghost--rev pt-press pt-hov pt-magnet">
          <span>すべての口コミを見る</span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
      <div className="sp-rev-cards">
        {REVIEWS.map((r) => (
          <article key={r.name} className="sp-rc pt-lift pt-tilt io" data-tilt="5">
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
    <section className="sp-rel pt-bgshift pt-skew" data-skew="0.4" data-from="1.02" data-to="0.78" aria-label="関連記事" data-io-group style={{ ["--bg-to" as string]: "#f8f8f6", ["--bg-from" as string]: "#efe8dc" }}>
      <div className="sp-rel-l io">
        <p className="sp-lab">Related</p>
        <FillHeading as="h2" className="sp-ttl sp-ttl--rel" start={1.02} end={0.84}>
          関連記事
        </FillHeading>
      </div>
      <div className="sp-items">
      {RELATED.map((a) => (
        <Link key={a.src} href={ARTICLE_HREF} className="sp-ra pt-lift pt-tilt io" data-tilt="6" style={{ ["--l" as string]: a.l, ["--w" as string]: a.w }}>
          <div className="sp-ra-ph pt-zoom pt-wipe" data-wipe="right">
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
