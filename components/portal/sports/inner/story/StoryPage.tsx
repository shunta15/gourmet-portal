import Link from "next/link";
import Header from "../Header";
import { Sources, InfoBand } from "../shop/ShopPage";
import { Pin, Chevron, ArrowShort } from "../Icons";
import "../shop/shop.css";
import "../special/special.css";
import "./story.css";
import type { StoryPhoto, StoryView } from "./data";

/* eslint-disable @next/next/no-img-element */
const Photo = ({ p, cls, eager }: { p: StoryPhoto; cls?: string; eager?: boolean }) => (
  <img className={cls ? `s2b-ph ${cls}` : "s2b-ph"} src={p.src} width={p.w} height={p.h} alt={p.alt} loading={eager ? "eager" : "lazy"} decoding="async" />
);

/**
 * 特集の記事(/sports/special/{slug})と店の特集記事(/sports/article/{店 ID})のページ。見本2には無いページなので、見本2の部品(ヘッダー・パンくず・店名の見出し・
 * 英字ラベル+線・明朝の見出し・桃色の面・青い「FACILITY INFO」の帯・店の札・「関連記事」の札)だけで組む(新しい種類の要素は足さない)。
 * 1024 幅の見本を --u で拡大(店舗紹介と同じ)。文は特集の JSON・店の紹介記事のまま。出どころのリンク一覧は一番下。
 */
export default function StoryPage({ v }: { v: StoryView }) {
  return (
    <div className="s2b-shop s2b-story">
      <div className={`s2b-hdw s2b-hdw--${v.nav === "special" ? "special" : "shop"}`}>
        <Header variant={v.nav === "special" ? "special" : "shop"} current={v.nav === "special" ? "special" : "shops"} />
      </div>

      <nav className="s2b-sh-crumb s2b-st-crumb" aria-label="パンくず">
        {v.crumbs.map((c, i) => (
          <span key={i} className="s2b-st-crumb-i">
            {i > 0 ? <Chevron className="s2b-ci" /> : null}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </span>
        ))}
      </nav>

      <header className="s2b-st-title">
        <p className="s2b-sh-kicker">{v.kicker}</p>
        <h1>{v.title}</h1>
        <p className="s2b-sh-loc">
          <i aria-hidden="true" />
          <span>{v.date ? `${v.date}　マチノワ編集部` : "マチノワ編集部"}</span>
          <i aria-hidden="true" />
        </p>
      </header>

      {v.hero ? (
        <section className="s2b-st-hero" aria-label="写真">
          <Photo p={v.hero} eager />
        </section>
      ) : null}

      {v.lead ? (
        <section className="s2b-st-lead" aria-label="導入">
          <div className="s2b-st-in">
            <p className="s2b-lab"><span>INTRODUCTION</span><i /></p>
            <p className="s2b-st-p">{v.lead}</p>
          </div>
        </section>
      ) : null}

      {v.sections.map((s, i) => (
        <section key={i} className="s2b-st-sec" data-alt={i % 2} aria-label={s.heading}>
          <div className="s2b-st-in">
            <p className="s2b-lab"><span>{s.label}</span><i /></p>
            <h2>{s.heading}</h2>
            {s.photo ? <div className="s2b-st-ph" style={{ aspectRatio: `${Math.min(Math.max(s.photo.w / Math.max(1, s.photo.h), 1.1), 2)}` }}><Photo p={s.photo} /></div> : null}
            {s.paras.map((t, j) => (
              <p key={j} className="s2b-st-p">{t}</p>
            ))}
            {s.specs && s.specs.length > 0 ? (
              <dl className="s2b-st-specs">
                {s.specs.map((x) => (
                  <div key={x.k}>
                    <dt>{x.k}</dt>
                    <dd>{x.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {s.extra && s.extra.length > 0 ? (
              <ul className="s2b-st-extra">
                {s.extra.map((e) => (
                  <li key={e.src}><Photo p={e} /></li>
                ))}
              </ul>
            ) : null}
            {s.stores && s.stores.length > 0 ? (
              <ul className="s2b-st-stores" aria-label="この節に出てくる店">
                {s.stores.map((x) => (
                  <li key={x.id}>
                    <Link href={x.href} className="s2b-tag">{x.name}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      {v.closing ? (
        <section className="s2b-st-lead s2b-st-closing" aria-label="結び">
          <div className="s2b-st-in">
            <p className="s2b-lab"><span>CLOSING</span><i /></p>
            <p className="s2b-st-p">{v.closing}</p>
          </div>
        </section>
      ) : null}

      {v.info ? <InfoBand area={v.info.area} kind={v.info.kind} hours={v.info.hours} official={v.info.official} /> : null}

      {v.stores.length > 0 ? (
        <section className="s2b-sh-rel s2b-st-stores-sec" aria-label="この記事に出てくる店">
          <div className="s2b-sh-rel-h">
            <span className="s2b-sh-rel-en">STORES</span>
            <b>この記事に出てくる店</b>
            <i aria-hidden="true" />
            <Link href="/sports/shop">VIEW ALL<ArrowShort className="s2b-sh-rel-va" /></Link>
          </div>
          <ul className="s2b-sp-shops s2b-st-shops">
            {v.stores.map((s) => (
              <li key={s.id}>
                <Link href={s.href}>
                  <span className="s2b-sp-shop-ph">{s.photo ? <Photo p={s.photo} /> : null}<em>{s.kind}</em></span>
                  <b>{s.name}</b>
                  <span className="s2b-sp-shop-loc"><Pin className="s2b-ci" />{s.area}</span>
                  <ArrowShort className="s2b-sp-shop-ar" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {v.related.length > 0 ? (
        <section className="s2b-sh-rel" aria-label="関連記事">
          <div className="s2b-sh-rel-h">
            <span className="s2b-sh-rel-en">{v.relatedHead.en}</span>
            <b>{v.relatedHead.ja}</b>
            <i aria-hidden="true" />
            <Link href={v.relatedHead.all.href}>{v.relatedHead.all.label}<ArrowShort className="s2b-sh-rel-va" /></Link>
          </div>
          <ul className="s2b-sh-rel-l">
            {v.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>
                  <span className="s2b-sh-rel-ph">{r.photo ? <Photo p={r.photo} /> : null}</span>
                  <em className={`s2b-tag${r.tag === "特集" ? " is-sp" : ""}`}>{r.tag}</em>
                  <span className="s2b-sh-rel-t">{r.title}</span>
                  <ArrowShort className="s2b-sh-rel-ar" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Sources items={v.sources} checkedAt={v.checkedAt} />
    </div>
  );
}
