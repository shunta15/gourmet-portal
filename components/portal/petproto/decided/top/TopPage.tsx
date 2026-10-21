import Link from "next/link";
import Shell from "../common/Shell";
import { Reveal, MaskLines, Write, Heart } from "../common/Motion";
import { IconSearch, IconArrow, IconChevron } from "../common/Icons";
import { SEARCH_HREF, SHOP_HREF, ARTICLES_HREF, ARTICLE_HREF } from "../common/site";
import { CatIcon, PetMark } from "./icons";
import { T, CATS, FEATURES, STORES, INDUSTRY, SCENES, AREAS } from "./data";
import "./top.css";

/* eslint-disable @next/next/no-img-element */

// ペット決定案 ①最初のページ(見本 最初.webp の完全再現)。寸法は見本 948 幅の px を --u で置く(top.css)。

function Hero() {
  return (
    <section className="tp-hero" aria-label="マチノワPet">
      <div className="tp-hero-in">
        <div className="tp-hero-photo pt-live pt-shine">
          <img className="pt-kb" src={`${T}/hero.webp`} width={948} height={332} alt="" fetchPriority="high" />
        </div>
        <div className="tp-bun" aria-hidden="true" />
        <MaskLines as="h1" className="tp-h1" lines={["ペットと、", "この街で、", "もっと豊かに。"]} delay={120} step={150} />
        <Reveal as="p" variant="fade" delay={650} className="tp-lead">
          マチノワPetは、ペットと一緒に行けるお店や
          <br />
          サービスを見つけられる地域密着型のポータルサイトです。
          <br />
          ペットとのおでかけが、もっと身近で、もっと楽しくなる。
          <br />
          そんな毎日を、この街から。
        </Reveal>
        <form className="tp-search pt-pop pt-float pt-live" action={SEARCH_HREF} method="get" role="search">
          <IconSearch className="tp-search-ic" />
          <input className="tp-search-in" type="text" name="q" placeholder="エリア・駅名・お店の名前で探す" aria-label="エリア・駅名・お店の名前で探す" autoComplete="off" />
          <button type="submit" className="tp-search-go pt-press pt-shimmer" aria-label="検索する">
            <IconArrow />
          </button>
        </form>
        <Write className="tp-hand pt-hand" lines={["いっしょの時間が、", "この街を、もっと好きにする。"]} delay={1100} step={800} />
        <div className="tp-scroll pt-live" aria-hidden="true">
          <span>SCROLL</span>
          <i />
        </div>
      </div>
    </section>
  );
}

function SecHead({ id, en, jp, more, href, children }: { id: string; en: string; jp: string; more: string; href: string; children?: React.ReactNode }) {
  return (
    <div className="pt-sechead tp-sh">
      <h2 id={id} className="pt-h2 tp-h2 io">
        {en}
      </h2>
      <span className="pt-h2-sub tp-sub io">{jp}</span>
      {children}
      <Link className="pt-more tp-more pt-press io" href={href}>
        {more}
        <IconArrow />
      </Link>
    </div>
  );
}

function Category() {
  return (
    <section className="tp-sec tp-cat" id="pt-category" aria-labelledby="tp-cat-h">
      <SecHead id="tp-cat-h" en="Category" jp="カテゴリから探す" more="すべてのカテゴリを見る" href={SEARCH_HREF} />
      <ul className="tp-cats" data-io-group>
        {CATS.map((c) => (
          <li key={c.title} className="tp-cat-li io" style={{ ["--x" as string]: c.x - 45, ["--w" as string]: c.w, ["--tl" as string]: c.tl }}>
            <Link href={SEARCH_HREF} className="tp-cat-card pt-hov tp-hv">
              <span className="tp-cat-ph tp-up pt-zoom">
                <img src={`${T}/cat-${CATS.indexOf(c) + 1}.webp`} width={c.w} height={97} alt="" loading="lazy" />
              </span>
              <span className={`tp-cat-ic pt-bounce ${c.icon === "run" ? "tp-cat-ic--run" : ""}`}>
                <CatIcon name={c.icon} />
              </span>
              <span className="tp-cat-t">{c.title}</span>
              <span className="tp-cat-s">
                {c.l1}
                <br />
                {c.l2}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Feature() {
  return (
    <div className="tp-band tp-band--feat">
      <section className="tp-sec tp-feat" aria-labelledby="tp-feat-h">
        <div className="pt-sechead tp-sh">
          <h2 id="tp-feat-h" className="pt-h2 tp-h2 io">
            Feature
          </h2>
          <span className="tp-h2-jp pt-min io">特集記事</span>
          <p className="tp-feat-desc io">
            ペットとのおでかけがもっと楽しくなるおすすめの特集をご紹介。
            <br />
            季節のスポットや、テーマに合わせた特集で、今すぐ行きたくなる情報をお届けします。
          </p>
          <Link className="pt-more tp-more pt-press io" href={ARTICLES_HREF}>
            すべての特集記事を見る
            <IconArrow />
          </Link>
        </div>
        <ul className="tp-feats" data-io-group>
          {FEATURES.map((f, i) => (
            <li key={f.t1} className="tp-feat-li io" style={{ ["--x" as string]: f.x - 45, ["--w" as string]: f.w }}>
              <Link href={ARTICLE_HREF} className="tp-fcard pt-hov tp-hv">
                <span className="tp-fcard-in tp-up">
                  <span className="tp-fcard-ph pt-zoom">
                    <img src={`${T}/feat-${i + 1}.webp`} width={f.w} height={99} alt="" loading="lazy" />
                  </span>
                  <span className="tp-fcard-tag" style={{ ["--tw" as string]: f.tagw }}>
                    {f.tag}
                  </span>
                  <span className="tp-fcard-t">
                    {f.t1}
                    <br />
                    {f.t2}
                  </span>
                  <time className="tp-fcard-d">{f.date}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Pickup() {
  return (
    <section className="tp-sec tp-pick" aria-labelledby="tp-pick-h">
      <SecHead id="tp-pick-h" en="Pick up Stores" jp="おすすめのお店" more="すべてのお店を見る" href={SEARCH_HREF} />
      <ul className="tp-picks" data-io-group>
        {STORES.map((s, i) => (
          <li key={s.name} className="tp-pick-li io" style={{ ["--x" as string]: s.x - 45, ["--w" as string]: s.w }}>
            <article className="tp-pcard pt-hov tp-hv">
              <Link href={SHOP_HREF} className="tp-pcard-link" tabIndex={-1} aria-hidden="true">
                <span className="tp-pcard-ph tp-up pt-zoom">
                  <img src={`${T}/pick-${i + 1}.webp`} width={s.w} height={90} alt="" loading="lazy" />
                </span>
              </Link>
              <Heart className="tp-pheart" label={`${s.name}をお気に入りに追加`} size={11} />
              <h3 className={`tp-pcard-n ${s.en ? "tp-pcard-n--en" : ""}`}>
                <Link href={SHOP_HREF}>{s.name}</Link>
              </h3>
              <p className="tp-pcard-a">{s.area}</p>
              <ul className="tp-pcard-tags">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleCol({ kind, items }: { kind: "ind" | "scene"; items: typeof INDUSTRY | typeof SCENES }) {
  const ind = kind === "ind";
  return (
    <div className={`tp-acol tp-acol--${kind}`}>
      <div className="tp-ahead">
        <span className="tp-amark io">
          <PetMark kind={ind ? "dog" : "cat"} />
        </span>
        <h2 className="pt-h2 tp-h2 tp-ah2 io">{ind ? "Industry" : "Scene"}</h2>
        <span className="pt-h2-sub tp-sub tp-asub io">{ind ? "ペット業界の記事" : "ペットとの暮らしのシーン記事"}</span>
        <Link className="pt-more tp-more pt-press io" href={ARTICLES_HREF}>
          すべての記事を見る
          <IconArrow />
        </Link>
        <p className="tp-adesc io">
          {ind ? (
            <>
              ペット業界の最新情報やトレンド、専門家のコラムなど
              <br />
              ペットとの暮らしに役立つ情報をお届けします。
            </>
          ) : (
            <>
              おでかけ、旅行、日常の暮らしなど、さまざまなシーンで役立つ
              <br />
              アイデアや体験レポートをご紹介します。
            </>
          )}
        </p>
      </div>
      <ul className="tp-arows" data-io-group>
        {items.map((a, i) => (
          <li key={a.t1} className="tp-arow-li io">
            <Link href={ARTICLE_HREF} className="tp-arow pt-hov">
              <span className="tp-arow-ph pt-zoom">
                <img src={`${T}/${ind ? "ind" : "scene"}-${i + 1}.webp`} width={98} height={52} alt="" loading="lazy" />
              </span>
              <span className="tp-arow-t">
                {a.t1}
                <br />
                {a.t2}
              </span>
              <time className="tp-arow-d">{a.date}</time>
              <IconChevron className="tp-arow-c" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Articles() {
  return (
    <section className="tp-sec tp-art" aria-label="業界の記事とシーン記事">
      <ArticleCol kind="ind" items={INDUSTRY} />
      <i className="tp-vdiv" aria-hidden="true" />
      <ArticleCol kind="scene" items={SCENES} />
    </section>
  );
}

function Area() {
  return (
    <section className="tp-area" id="pt-area" aria-labelledby="tp-area-h" data-scrollp>
      <div className="tp-area-in">
        <img className="tp-area-bg" src={`${T}/area-bg.webp`} width={948} height={128} alt="" loading="lazy" />
        <div className="tp-area-txt">
          <p className="tp-area-en io">Area Search</p>
          <h2 id="tp-area-h" className="tp-area-h io">
            エリアから探す
          </h2>
          <p className="tp-area-p io">
            お住まいの地域から、ペットと一緒に行ける
            <br />
            お店やサービスを見つけられます。
          </p>
          <Link href={SEARCH_HREF} className="tp-area-btn pt-press pt-shimmer io">
            エリア一覧を見る
            <IconArrow />
          </Link>
        </div>
        <Write className="tp-area-hand pt-hand" lines={["ペットと行ける場所が、", "きっと見つかる。"]} delay={300} step={700} />
        <ul className="tp-circles" data-io-group>
          {AREAS.map((a, i) => (
            <li key={a.en} className="tp-circle-li io" style={{ ["--cx" as string]: a.cx }}>
              <Link href={SEARCH_HREF} className="tp-circle pt-hov">
                <span className="tp-circle-ph pt-zoom">
                  <img src={`${T}/area-${i + 1}.webp`} width={43} height={43} alt="" loading="lazy" />
                </span>
                <span className="tp-circle-jp">{a.jp}</span>
                <span className="tp-circle-en">{a.en}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function TopPage() {
  return (
    <Shell page="top">
      <Hero />
      <div className="tp-flow">
        <Category />
        <Feature />
        <Pickup />
        <Articles />
        <Area />
      </div>
    </Shell>
  );
}
