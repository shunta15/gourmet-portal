import Link from "next/link";
import Header from "../../Header";
import { IcPin, IcArrow, IcCheck } from "../../Icons";
import { LFL } from "../../links";
import type { SpecialView, Photo } from "./data";

/* eslint-disable @next/next/no-img-element */
const IMG = "/_portal/life/";
const CHECKS = ["どんな体験ができるか", "アクセスのしやすさ", "雰囲気・設備", "自分に合った楽しみ方"];
const KIND_SLUG = ["lesson", "shrine-temple", "fashion-craft"] as const;

function Ph({ p }: { p: Photo }) {
  return <img className="lf-ph" src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} loading="lazy" decoding="async" />;
}
/** 題の「の」「ちがい」を小さくする(見本の組み) */
function Title({ t }: { t: string }) {
  const parts = t.split(/(の?ちがい)/);
  return (
    <>
      {parts.map((s, i) => (/^の?ちがい$/.test(s) ? <small key={i}>{s}</small> : <span key={i}>{s}</span>))}
    </>
  );
}

/** 特集の一覧(見本 1_特集)。特集 1〜3 は lib/specials/life.json の 3 本、注目の店舗紹介は実在の 4 店。大きな写真の組みと特集の写真は見本から切り出した飾り */
export default function SpecialPage({ v }: { v: SpecialView }) {
  const [c1, c2, c3] = v.cards;
  return (
    <div className="lf-special">
      <Header variant="d" current="special" />

      <section className="sp-hero" aria-label="暮らしを彩る、街の文化。">
        <img className="sp-hero-img" src={`${IMG}c-hero.webp`} alt="" width={2880} height={1080} fetchPriority="high" aria-hidden="true" />
        <p className="sp-cap sp-cap1" aria-hidden="true">人の営みが、<br />まちをつくる。</p>
        <p className="sp-cap sp-cap2" aria-hidden="true">伝統が、<br />いまの暮らしを<br />豊かにする。</p>
        <h1>暮らしを彩る、街の文化。</h1>
        <p className="sp-sub">出会うのは、日々を少し豊かにする、まちのたからもの。</p>
      </section>

      {c1 ? (
        <section className="sp-b sp-b1" aria-label="特集 1">
          <img className="sp-b-img" src={`${IMG}c-b1.webp`} alt="" width={1167} height={891} loading="lazy" decoding="async" aria-hidden="true" />
          <p className="sp-vcap" aria-hidden="true">つくる時間が、<br />暮らしを深める。</p>
          <div className="sp-b-tx">
            <p className="sp-no sp-no--red">
              特集 <b>1</b>
            </p>
            <h2>
              <Title t={c1.title} />
            </h2>
            <p className="sp-lead">{c1.lead}</p>
            <Link href={c1.href} className="sp-btn sp-btn--red">
              特集を見る
              <IcArrow />
            </Link>
          </div>
          <ul className="sp-tiles">
            {v.tiles.map((t, i) => (
              <li key={t.label}>
                <Link href={LFL.searchWith({ kind: KIND_SLUG[i] })}>
                  <span className="sp-tile-ph">
                    <Ph p={t.photo} />
                  </span>
                  <b>{t.label}</b>
                  <em>{t.sub}</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {c2 ? (
        <section className="sp-b sp-b2" aria-label="特集 2">
          <img className="sp-b-img" src={`${IMG}c-b2.webp`} alt="" width={1035} height={586} loading="lazy" decoding="async" aria-hidden="true" />
          <div className="sp-b-tx">
            <p className="sp-no sp-no--navy">
              特集 <b>2</b>
            </p>
            <h2>
              <Title t={c2.title} />
            </h2>
            <p className="sp-lead">{c2.lead}</p>
            <Link href={c2.href} className="sp-btn sp-btn--navy">
              特集を見る
              <IcArrow />
            </Link>
          </div>
          <div className="sp-check">
            <p>こんなところをチェック</p>
            <ul>
              {CHECKS.map((c) => (
                <li key={c}>
                  <span className="sp-ck-b">
                    <IcCheck />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {c3 ? (
        <section className="sp-b sp-b3" aria-label="特集 3">
          <img className="sp-b-img" src={`${IMG}c-b3.webp`} alt="" width={1221} height={411} loading="lazy" decoding="async" aria-hidden="true" />
          <div className="sp-b-tx">
            <p className="sp-no sp-no--brown">
              特集 <b>3</b>
            </p>
            <h2>
              <Title t={c3.title} />
            </h2>
            <p className="sp-lead">{c3.lead}</p>
            <Link href={c3.href} className="sp-more" aria-label={`${c3.title}を見る`}>
              <span>
                週末、
                <br />
                まちで出会う
                <br />
                ちょっと特別な時間。
              </span>
              <i className="lf-circ">
                <IcArrow />
              </i>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="sp-shops" aria-label="注目の店舗紹介">
        <div className="sp-shops-h">
          <h2>注目の店舗紹介</h2>
          <p>— まちの暮らしを彩る、{v.shops.length}つのスポット —</p>
          <Link href={LFL.shops}>
            すべての店舗紹介を見る
            <IcArrow />
          </Link>
        </div>
        <ul>
          {v.shops.map((s) => (
            <li key={s.id}>
              <Link href={s.href}>
                <span className="sp-sh-ph">
                  <Ph p={s.photo} />
                  <i className="lf-tagchip">{s.kindName}</i>
                </span>
                <b>{s.name}</b>
                <em>
                  <IcPin className="lf-ico" />
                  {s.area}
                </em>
                <span className="sp-sh-d">{s.blurb}</span>
                <span className="lf-circ sp-sh-ar">
                  <IcArrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="sp-ft">
        <Link href={LFL.top} className="sp-ft-logo" aria-label="マチノワライフ トップへ">
          <svg viewBox="0 0 60 60" aria-hidden="true">
            <rect x="8" y="8" width="44" height="44" fill="none" stroke="#e9e1d3" strokeWidth="2.400" />
            <path d="M30 8v44M8 30h44M8 19h44M8 41h44M19 8v44M41 8v44" stroke="#e9e1d3" strokeWidth="1.600" />
          </svg>
          <span>
            <b>マチノワライフ</b>
            <i>MACHINOWA LIFE</i>
          </span>
        </Link>
        <nav className="sp-ft-nav" aria-label="フッターメニュー">
          <Link href={LFL.top}>トップ</Link>
          <Link href={LFL.search}>場所を探す</Link>
          <Link href={LFL.shops}>店舗紹介</Link>
          <Link href={LFL.special}>特集</Link>
        </nav>
        <p className="sp-ft-tx">
          まちの暮らしに出会い、好きになる。
          <br />
          マチノワライフは、地域の魅力を伝えるローカルライフスタイルメディアです。
        </p>
      </footer>
    </div>
  );
}
