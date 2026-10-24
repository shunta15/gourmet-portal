import Link from "next/link";
import Header from "../Header";
import Ph from "../Ph";
import { SPL } from "../../links";
import { Pin, Dumbbell, Clock, Chevron, External, ArrowShort } from "../Icons";
import "./shop.css";
import type { ShopView } from "./data";

/** 情報の出どころ(公式サイト・Google マップのリンクの一覧。小さな文字の 1 ブロック。見本には無いが、載せる決まり) */
export function Sources({ items, checkedAt }: { items: Array<{ label: string; url: string }>; checkedAt?: string }) {
  if (items.length === 0) return null;
  return (
    <aside className="s2b-src" aria-label="情報の出どころ">
      <p className="s2b-src-h">情報の出どころ{checkedAt ? <small>確認日 {checkedAt.replace(/-/g, "/")}</small> : null}</p>
      <ul>
        {items.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** 青い帯「FACILITY INFO」(所在地・カテゴリ・営業時間・公式サイトを見る)。店の特集記事のページでも同じものを使う */
export function InfoBand({ area, kind, hours, official }: { area: string; kind: string; hours: string[]; official: string | null }) {
  return (
      <section className="s2b-sh-info" aria-label="施設情報">
        <p className="s2b-sh-info-h">FACILITY INFO</p>
        <i className="s2b-sh-info-vl" aria-hidden="true" />
        <dl className="s2b-sh-info-c s2b-sh-info-c1">
          <Pin className="s2b-sh-info-ic s2b-sh-ic-pin" />
          <dt>所在地</dt>
          <dd>{area}</dd>
        </dl>
        <dl className="s2b-sh-info-c s2b-sh-info-c2">
          <Dumbbell className="s2b-sh-info-ic s2b-sh-ic-db" />
          <dt>カテゴリ</dt>
          <dd>{kind}</dd>
        </dl>
        <dl className="s2b-sh-info-c s2b-sh-info-c3">
          <Clock className="s2b-sh-info-ic s2b-sh-ic-ck" />
          <dt>営業時間</dt>
          <dd className={hours.length > 1 ? "is-multi" : undefined}>
            {hours.map((h, i) => <span key={i}>{h}</span>)}
          </dd>
        </dl>
        {official ? (
          <a className="s2b-sh-official" href={official} target="_blank" rel="noopener noreferrer">
            公式サイトを見る<External className="s2b-ci" />
          </a>
        ) : null}
      </section>
  );
}

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
        <Link href={SPL.top}>トップ</Link>
        <Chevron className="s2b-ci" />
        <Link href={SPL.shops}>店舗紹介</Link>
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
        <img className="s2b-sh-script" src="/_portal/sports/inner/script-more.webp" alt="More Fitness More Yourself" width={175} height={62} />
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

      <InfoBand area={v.area} kind={v.kindName} hours={v.hours} official={v.official} />

      <section className="s2b-sh-rel" aria-label="関連記事">
        <div className="s2b-sh-rel-h">
          <span className="s2b-sh-rel-en">RELATED ARTICLES</span>
          <b>関連記事</b>
          <i aria-hidden="true" />
          <Link href={SPL.special}>VIEW ALL<ArrowShort className="s2b-sh-rel-va" /></Link>
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

      <Sources items={v.sources} checkedAt={p.article?.checkedAt} />
    </div>
  );
}
