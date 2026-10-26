import Link from "next/link";
import Header from "../../Header";
import { IcPin, IcPinLine, IcTag, IcLink, IcExt, IcArrow } from "../../Icons";
import { LFL } from "../../links";
import type { ShopView, Photo } from "./data";

/* eslint-disable @next/next/no-img-element */
function Ph({ p, className, eager }: { p: Photo | null; className?: string; eager?: boolean }) {
  return p ? <img className={`lf-ph ${className ?? ""}`} src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined} /> : null;
}

/** 情報の出どころ(店・記事のページの下) */
export function Sources({ sources, note }: { sources: Array<{ label: string; url: string }>; note?: string }) {
  if (!sources.length) return null;
  return (
    <section className="lf-src" aria-label="情報の出どころ">
      <p className="lf-src-h">
        情報の出どころ{note ? <small>{note}</small> : null}
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function mapSrc(lat: number, lng: number) {
  const d = 0.0045;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${(lng - d).toFixed(5)},${(lat - d * 0.65).toFixed(5)},${(lng + d).toFixed(5)},${(lat + d * 0.65).toFixed(5)}&layer=mapnik&marker=${lat},${lng}`;
}

/** 店の紹介ページ(見本 4_店舗紹介)。写真は店の実写だけ。文は店の事実(inner/shop/copy.ts) */
export default function ShopPage({ v }: { v: ShopView }) {
  const { place, copy } = v;
  const hasMap = typeof place.lat === "number" && typeof place.lng === "number";
  return (
    <div className="lf-shop">
      <Header variant="c" current="shops" />

      <section className="sh-hero" aria-label={place.name}>
        <Ph p={v.hero} eager />
        <div className="sh-card">
          <p className="sh-kicker">
            <i aria-hidden="true" />
            {v.kindName}
          </p>
          <h1 style={place.name.length > 7 ? { fontSize: "calc(27 * var(--u))" } : undefined}>{place.name}</h1>
          <p className="sh-area">{v.loc}</p>
          <p className="sh-catch">
            {copy.catch[0]}
            <br />
            {copy.catch[1]}
          </p>
        </div>
      </section>

      <nav className="sh-crumb" aria-label="パンくず">
        <Link href={LFL.top}>トップ</Link>
        <span aria-hidden="true">&gt;</span>
        <Link href={LFL.shops}>店舗紹介</Link>
        <span aria-hidden="true">&gt;</span>
        <Link href={LFL.searchWith({ kind: place.category })}>{v.kindName}</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">{place.name}</span>
      </nav>

      <div className="sh-body">
        <article className="sh-art">
          <div className="sh-intro">
            <h2>
              {copy.introH[0]}
              <br />
              {copy.introH[1]}
            </h2>
            <p>{copy.introP}</p>
          </div>

          <section className="sh-f sh-f1">
            <div className="sh-f-ph"><Ph p={v.feats[0].photo} /></div>
            <div className="sh-f-tx">
              <h3>{v.feats[0].h}</h3>
              <p>{v.feats[0].p}</p>
            </div>
          </section>
          <section className="sh-f sh-f2">
            <div className="sh-f-tx">
              <h3>
                <i aria-hidden="true" />
                {v.feats[1].h}
              </h3>
              <p>{v.feats[1].p}</p>
            </div>
            <div className="sh-f-ph"><Ph p={v.feats[1].photo} /></div>
          </section>
          <section className="sh-f sh-f3">
            <div className="sh-f-ph"><Ph p={v.feats[2].photo} /></div>
            <div className="sh-f-tx">
              <h3>
                <i aria-hidden="true" />
                {v.feats[2].h}
              </h3>
              <p>{v.feats[2].p}</p>
            </div>
          </section>

          {v.article ? (
            <p className="sh-more">
              <Link href={v.article.href}>
                {v.article.title}
                <IcArrow />
              </Link>
            </p>
          ) : null}
        </article>

        <aside className="sh-side" aria-label="店舗情報">
          <p className="sh-side-k">
            <i aria-hidden="true" />
            店舗情報
          </p>
          <h2>{place.name}</h2>
          <div className="sh-side-ph"><Ph p={v.side} /></div>
          <dl className="sh-dl">
            <div>
              <dt>
                <IcPinLine className="lf-ico" />
                所在地
              </dt>
              <dd>{v.loc}</dd>
            </div>
            <div>
              <dt>
                <IcTag className="lf-ico" />
                カテゴリ
              </dt>
              <dd>{v.kindName}</dd>
            </div>
            <div>
              <dt>
                <IcLink className="lf-ico" />
                公式サイト
              </dt>
              <dd />
            </div>
          </dl>
          {v.official ? (
            <a className="sh-official" href={v.official} target="_blank" rel="noopener noreferrer nofollow">
              公式サイトを見る
              <IcExt className="lf-ico" />
            </a>
          ) : null}
          {hasMap ? (
            <div className="sh-map">
              <iframe title={`${place.name}の地図`} src={mapSrc(place.lat as number, place.lng as number)} loading="lazy" referrerPolicy="no-referrer" />
            </div>
          ) : null}
          {v.mapUrl ? (
            <a className="sh-gmap" href={v.mapUrl} target="_blank" rel="noopener noreferrer nofollow">
              Googleマップで見る
              <IcExt className="lf-ico" />
            </a>
          ) : null}
          <div className="sh-side-ph sh-side-ph2"><Ph p={v.side2} /></div>
        </aside>
      </div>

      <section className="sh-others" aria-label="このエリアの、ほかの店舗・スポット">
        <div className="sh-others-h">
          <h2>このエリアの、ほかの店舗・スポット</h2>
          <Link href={LFL.shops}>
            一覧を見る
            <IcArrow />
          </Link>
        </div>
        <ul>
          {v.others.map((o) => (
            <li key={o.id}>
              <Link href={o.href}>
                <Ph p={o.photo} />
                <span className="sh-o-tx">
                  <em>
                    <i aria-hidden="true" />
                    {o.kindName}
                  </em>
                  <b>{o.name}</b>
                  <span>{o.area}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Sources sources={v.sources} note="この店の情報を確かめたページ" />
    </div>
  );
}
