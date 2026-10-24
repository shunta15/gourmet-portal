import Link from "next/link";
import Header from "../Header";
import { S2B_LINKS } from "../nav";
import { Pin, ArrowShort } from "../Icons";
import "./special.css";
import type { SpecialView, SpCard, Photo } from "./data";

const Arrow = ({ cls }: { cls?: string }) => (
  <svg className={`s2b-arrow${cls ? ` ${cls}` : ""}`} viewBox="0 0 70 8" fill="none" aria-hidden="true">
    <path d="M0 4.5h68M63 1l5 3.5L63 8" stroke="currentColor" strokeWidth="0.9" />
  </svg>
);
const Img = ({ p, cls, eager }: { p: Photo; cls?: string; eager?: boolean }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img className={cls ? `s2b-ph ${cls}` : "s2b-ph"} src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} loading={eager ? "eager" : "lazy"} decoding="async" />
);

// 目次の 04・05 は、特集の記事がまだ無い(見本どおりの見た目で残す。押しても行き先なし)
const INDEX_EXTRA = ["はじめての人に\nおすすめのエリア", "スポーツのある\n街のライフスタイル"];
const SIDE_EN = ["GYM\nBOXING\nGOLF\nCOMPARISON", "", "FITNESS\nFOR\nYOUR\nLIFESTYLE"];
const Lines = ({ t }: { t: string }) => (
  <>
    {t.split("\n").map((l, i) => (
      <span key={i} className="s2b-ln">{l}</span>
    ))}
  </>
);

function Block({ c, n, cls }: { c: SpCard; n: string; cls: string }) {
  return (
    <section className={`s2b-sp-b ${cls}`}>
      <div className="s2b-sp-b-ph"><Img p={c.photo} /></div>
      <i className="s2b-sp-deco s2b-sp-deco--a" aria-hidden="true" />
      <i className="s2b-sp-deco s2b-sp-deco--b" aria-hidden="true" />
      <span className="s2b-sp-num" aria-hidden="true">{n}</span>
      <h2>{c.title}</h2>
      <p className="s2b-sp-lead">{c.lead}</p>
      <Arrow cls="s2b-sp-barrow" />
      <Link href={c.href} className="s2b-sp-cover" aria-label={`${c.title} を読む`} />
    </section>
  );
}

/** 見本2「1_特集」の再現(937 幅の見本を --u で拡大)。記事 3 本・店 3 店は SpecialView(実データ)。 */
export default function SpecialPage({ v }: { v: SpecialView }) {
  const [c1, c2, c3] = v.cards;
  const titles = [...v.cards.map((c) => c.title)];
  return (
    <div className="s2b-spec">
      <Header variant="special" current="special" />

      <section className="s2b-sp-hero" aria-label="特集">
        <h1 className="s2b-sr">街で、からだを動かそう。 見つかる、はじめられる、つづけられる。街のフィットネス・スポーツ情報メディア</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/_portal/sproto2/b/special-hero.webp" alt="" width={937} height={502} />
      </section>

      <div className="s2b-sp-th">
        <span className="s2b-sp-th-en">THEMED CONTENT</span>
        <span className="s2b-sp-th-ja">街で楽しむスポーツのこと、くわしく。</span>
        <span className="s2b-sp-th-r">FEATURES<br />FOR AN ACTIVE LIFE</span>
      </div>

      {c1 ? (
        <section className="s2b-sp-b1">
          <div className="s2b-sp-b1-ph"><Img p={c1.photo} /></div>
          <i className="s2b-sp-deco s2b-sp-deco--a" aria-hidden="true" />
          <i className="s2b-sp-deco s2b-sp-deco--b" aria-hidden="true" />
          <span className="s2b-sp-num" aria-hidden="true">01</span>
          <p className="s2b-sp-cap" aria-hidden="true"><Lines t={SIDE_EN[0]} /></p>
          <h2>{c1.title}</h2>
          <p className="s2b-sp-lead">{c1.lead}</p>
          <Arrow cls="s2b-sp-barrow" />
          <Link href={c1.href} className="s2b-sp-cover s2b-sp-cover--b1" aria-label={`${c1.title} を読む`} />
          {v.tiles.map((t, i) => (
            <div key={i} className={`s2b-sp-tile s2b-sp-tile--${i}`}>
              <Img p={t.photo} />
              <p><b>{t.label}</b><span>{t.sub}</span></p>
            </div>
          ))}
          <ol className="s2b-sp-idx">
            {titles.map((t, i) => (
              <li key={i}>
                <Link href={v.cards[i].href}><em>{`0${i + 1}`}</em><span>{t}</span></Link>
              </li>
            ))}
            {INDEX_EXTRA.map((t, i) => (
              <li key={`x${i}`}>
                <div className="s2b-sp-idx-x"><em>{`0${i + 4}`}</em><span><Lines t={t} /></span></div>
              </li>
            ))}
          </ol>
          <i className="s2b-sp-deco s2b-sp-deco--r" aria-hidden="true" />
        </section>
      ) : null}

      {c2 ? (
        <>
          <Block c={c2} n="02" cls="s2b-sp-b2" />
        </>
      ) : null}
      {c3 ? <Block c={c3} n="03" cls="s2b-sp-b3" /> : null}

      <section className="s2b-sp-pick" aria-label="スポーツの店を探す">
        <p className="s2b-sp-pick-en">PICK UP</p>
        <h2>スポーツの店を探す</h2>
        <p className="s2b-sp-pick-d">街で見つかる、注目のスポーツ施設。</p>
        <Link href={S2B_LINKS.shops} className="s2b-sp-pick-all">すべての店舗を見る<ArrowShort className="s2b-sp-pick-aa" /></Link>
        <i className="s2b-sp-pick-line" aria-hidden="true" />
        <ul className="s2b-sp-shops">
          {v.shops.map((s) => (
            <li key={s.id}>
              <Link href={s.href}>
                <span className="s2b-sp-shop-ph"><Img p={s.photo} /><em>{s.kindName}</em></span>
                <b>{s.name}</b>
                <span className="s2b-sp-shop-loc"><Pin className="s2b-ci" />{s.area}</span>
                <ArrowShort className="s2b-sp-shop-ar" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
