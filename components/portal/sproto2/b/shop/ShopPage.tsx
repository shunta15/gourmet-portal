import Link from "next/link";
import Header from "../Header";
import Ph from "../Ph";
import { S2B_LINKS } from "../nav";
import { Pin, Dumbbell, Clock, Chevron, External, ArrowShort } from "../Icons";
import "./shop.css";
import type { ShopView } from "./data";

const Arrow = () => (
  <svg className="s2b-arrow" viewBox="0 0 70 8" fill="none" aria-hidden="true">
    <path d="M0 4.5h68M63 1l5 3.5L63 8" stroke="currentColor" strokeWidth="0.9" />
  </svg>
);

/** 見本2「3_店舗紹介」の再現(1024 幅の見本を --u で拡大)。店の中身は ShopView(店データ + SHOP_COPY)。 */
export default function ShopPage({ v }: { v: ShopView }) {
  const { place: p, copy: c, photos } = v;
  const sl = c.slots;
  return (
    <div className="s2b-shop">
      <Header variant="shop" current="shops" />

      <nav className="s2b-sh-crumb" aria-label="パンくず">
        <Link href={S2B_LINKS.top}>トップ</Link>
        <Chevron className="s2b-ci" />
        <Link href={S2B_LINKS.shops}>店舗紹介</Link>
        <Chevron className="s2b-ci" />
        <span>{p.name}</span>
      </nav>

      <section className="s2b-sh-title" aria-label={`${p.name} 店舗紹介`}>
        <p className="s2b-sh-kicker">{c.kicker}</p>
        <h1>{p.name}</h1>
        <p className="s2b-sh-loc">
          <i aria-hidden="true" />
          <Pin className="s2b-ci" />
          <span>{v.area}</span>
          <i aria-hidden="true" />
        </p>
      </section>

      <section className="s2b-sh-hero">
        <div className="s2b-sh-h-main"><Ph photos={photos} slot={sl.heroMain} eager /></div>
        <div className="s2b-sh-h-top"><Ph photos={photos} slot={sl.heroTop} eager /></div>
        <div className="s2b-sh-h-bot"><Ph photos={photos} slot={sl.heroBottom} eager /></div>
      </section>

      <section className="s2b-sh-about">
        <p className="s2b-lab"><span>ABOUT</span><i /></p>
        <h2>{c.about.h.map((l, i) => <span key={i}>{l}</span>)}</h2>
        <p className="s2b-sh-about-p">{c.about.p}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="s2b-sh-script" src="/_portal/sproto2/b/script-more.webp" alt="More Fitness More Yourself" width={175} height={62} />
        <i className="s2b-sh-vline" aria-hidden="true" />
        <p className="s2b-sh-about-r">カラダを動かすことが、<br />きっと、<br />日常を変えていく。</p>
      </section>

      <section className="s2b-sh-f1">
        <div className="s2b-sh-f1-ph"><Ph photos={photos} slot={sl.f1} /></div>
        <div className="s2b-sh-f1-tx">
          <p className="s2b-lab"><span>FEATURE 01</span><i /></p>
          <h2 style={{ ["--hs" as string]: c.f1.h.length > 11 ? 24 : 28 }}>{c.f1.h}</h2>
          <p className="s2b-sh-f-p">{c.f1.p}</p>
          <Arrow />
        </div>
      </section>

      <section className="s2b-sh-f2">
        <div className="s2b-sh-f2-ph"><Ph photos={photos} slot={sl.f2} /></div>
        <div className="s2b-sh-f2-tx">
          <p className="s2b-lab"><span>FEATURE 02</span><i /></p>
          <h2 style={{ ["--hs" as string]: c.f2.h.length > 11 ? 24 : c.f2.h.length > 9 ? 25 : 28 }}>{c.f2.h}</h2>
          <p className="s2b-sh-f-p">{c.f2.p}</p>
          <Arrow />
        </div>
      </section>

      <section className="s2b-sh-info" aria-label="施設情報">
        <p className="s2b-sh-info-h">FACILITY INFO</p>
        <i className="s2b-sh-info-vl" aria-hidden="true" />
        <dl className="s2b-sh-info-c s2b-sh-info-c1">
          <Pin className="s2b-sh-info-ic s2b-sh-ic-pin" />
          <dt>所在地</dt>
          <dd>{v.area}</dd>
        </dl>
        <dl className="s2b-sh-info-c s2b-sh-info-c2">
          <Dumbbell className="s2b-sh-info-ic s2b-sh-ic-db" />
          <dt>カテゴリ</dt>
          <dd>{v.kindName}</dd>
        </dl>
        <dl className="s2b-sh-info-c s2b-sh-info-c3">
          <Clock className="s2b-sh-info-ic s2b-sh-ic-ck" />
          <dt>営業時間</dt>
          <dd className={v.hours.length > 1 ? "is-multi" : undefined}>
            {v.hours.map((h, i) => <span key={i}>{h}</span>)}
          </dd>
        </dl>
        {v.official ? (
          <a className="s2b-sh-official" href={v.official} target="_blank" rel="noopener noreferrer">
            公式サイトを見る<External className="s2b-ci" />
          </a>
        ) : null}
      </section>

      <section className="s2b-sh-rel" aria-label="関連記事">
        <div className="s2b-sh-rel-h">
          <span className="s2b-sh-rel-en">RELATED ARTICLES</span>
          <b>関連記事</b>
          <i aria-hidden="true" />
          <Link href={S2B_LINKS.special}>VIEW ALL<ArrowShort className="s2b-sh-rel-va" /></Link>
        </div>
        <ul className="s2b-sh-rel-l">
          {v.rel.map((r, i) => (
            <li key={r.href}>
              <Link href={r.href}>
                <span className="s2b-sh-rel-ph"><Ph photos={photos} slot={sl.rel[i] ?? sl.rel[0]} /></span>
                <em className={`s2b-tag${r.tag === "特集" ? " is-sp" : ""}`}>{r.tag}</em>
                <span className="s2b-sh-rel-t">{r.title}</span>
                <ArrowShort className="s2b-sh-rel-ar" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
