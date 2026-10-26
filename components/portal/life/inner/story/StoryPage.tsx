import Link from "next/link";
import Header from "../../Header";
import { IcPin, IcArrow, IcExt } from "../../Icons";
import { Sources } from "../shop/ShopPage";
import type { StoryView, StoryPhoto } from "./data";

/* eslint-disable @next/next/no-img-element */
function Img({ p, eager }: { p: StoryPhoto | null; eager?: boolean }) {
  return p ? <img className="lf-ph" src={p.src} width={p.w} height={p.h} alt={p.alt} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined} /> : null;
}

/** 特集の記事(/life/special/{slug})と店の特集記事(/life/article/{店 ID})。見本 4_店舗紹介 の部品(ヘッダー・店名の札・赤い縦線の見出し・右の店舗情報)で組む */
export default function StoryPage({ v }: { v: StoryView }) {
  return (
    <div className="lf-shop lf-story">
      <Header variant="c" current={v.nav === "shops" ? "shops" : "special"} />

      <section className="sh-hero st-hero" aria-label={v.title}>
        <Img p={v.hero} eager />
        <div className="sh-card st-card">
          <p className="sh-kicker">
            <i aria-hidden="true" />
            {v.kicker}
          </p>
          <h1>{v.title}</h1>
          {v.date ? <p className="sh-area">{v.date}</p> : null}
        </div>
      </section>

      <nav className="sh-crumb" aria-label="パンくず">
        {v.crumbs.map((c, i) => (
          <span key={i} className="st-crumb-i">
            {i > 0 ? <span aria-hidden="true">&gt;</span> : null}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </span>
        ))}
      </nav>

      <div className="sh-body">
        <article className="sh-art st-art">
          <div className="sh-intro">
            <p className="st-lead">{v.lead}</p>
          </div>
          {v.sections.map((s, i) => (
            <section key={i} className="st-sec">
              <p className="st-label">{s.label}</p>
              <h2>
                <i aria-hidden="true" />
                {s.heading}
              </h2>
              {s.paras.map((t, j) => (
                <p key={j} className="st-p">
                  {t}
                </p>
              ))}
              {s.photo ? (
                <div className="st-ph">
                  <Img p={s.photo} />
                </div>
              ) : null}
              {s.specs && s.specs.length ? (
                <dl className="st-specs">
                  {s.specs.map((x, k) => (
                    <div key={k}>
                      <dt>{x.k}</dt>
                      <dd>{x.v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {s.extra && s.extra.length ? (
                <div className="st-extra">
                  {s.extra.map((e, k) => (
                    <div key={k} className="st-ph st-ph-s">
                      <Img p={e} />
                    </div>
                  ))}
                </div>
              ) : null}
              {s.stores && s.stores.length ? (
                <ul className="st-stores">
                  {s.stores.map((x) => (
                    <li key={x.id}>
                      <Link href={x.href}>
                        {x.name}
                        <IcArrow />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          {v.closing ? <p className="st-closing">{v.closing}</p> : null}
        </article>

        <aside className="sh-side st-side" aria-label={v.info ? "店舗情報" : "この記事に出てくる店"}>
          {v.info ? (
            <>
              <p className="sh-side-k">
                <i aria-hidden="true" />
                店舗情報
              </p>
              <h2>{v.info.shopName}</h2>
              <dl className="sh-dl st-dl">
                <div>
                  <dt>所在地</dt>
                  <dd>{v.info.area}</dd>
                </div>
                <div>
                  <dt>カテゴリ</dt>
                  <dd>{v.info.kind}</dd>
                </div>
                {v.info.hours.length ? (
                  <div>
                    <dt>営業時間</dt>
                    <dd>
                      {v.info.hours.map((h, i) => (
                        <span key={i} className="st-hrs">
                          {h}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {v.info.official ? (
                <a className="sh-official" href={v.info.official} target="_blank" rel="noopener noreferrer nofollow">
                  公式サイトを見る
                  <IcExt className="lf-ico" />
                </a>
              ) : null}
              <Link className="sh-gmap st-shoplink" href={v.info.shopHref}>
                店舗紹介のページへ
                <IcArrow className="lf-ico" />
              </Link>
            </>
          ) : (
            <>
              <p className="sh-side-k">
                <i aria-hidden="true" />
                この記事に出てくる店
              </p>
              <ul className="st-ss">
                {v.stores.map((x) => (
                  <li key={x.id}>
                    <Link href={x.href}>
                      <span className="st-ss-ph">
                        <Img p={x.photo} />
                      </span>
                      <b>{x.name}</b>
                      <span>
                        <IcPin className="lf-ico" />
                        {x.area}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>

      {v.related.length ? (
        <section className="sh-others" aria-label={v.relatedHead.ja}>
          <div className="sh-others-h">
            <h2>{v.relatedHead.ja}</h2>
            <Link href={v.relatedHead.all.href}>
              一覧を見る
              <IcArrow />
            </Link>
          </div>
          <ul>
            {v.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>
                  <Img p={r.photo} />
                  <span className="sh-o-tx">
                    <em>
                      <i aria-hidden="true" />
                      {r.tag}
                    </em>
                    <b className="st-rel-t">{r.title}</b>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Sources sources={v.sources} note={v.checkedAt ? `${v.checkedAt} に確認` : undefined} />
    </div>
  );
}
