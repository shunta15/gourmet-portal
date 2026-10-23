import Link from "next/link";
import type { CSSProperties } from "react";
import Banner from "./Banner";
import ShopCard, { type CardShop } from "./ShopCard";
import { Flag, IcArrow, IcCheck, IcClock, IcDoc, IcExternal, Mountain, Pines, Stamp } from "./Deco";
import { aLinks } from "./links";

/**
 * 記事のページ(店ごとの特集記事・季節の特集・読みもの・はじめての方へのガイド)。見本が無いページなので、
 * 店舗紹介(見本 82)・特集(見本 81)の部品と作法だけで組んだ: パンくず・写真の枠・クリーム色の札・旗の番号の見出し・白い面・探すの札・情報の出どころ・下の山の帯。
 * 新しい種類の要素は足していない(CSS は a-extra.css の「記事」の節。色・書体・余白の単位はほかのページと同じ)。
 * 文は、店の記事は店データ(Place.article・特集)、季節・読みもの・ガイドは lib/activity/editorial.json から(Story に渡す前に点検済み)。
 */
export type StoryPhoto = { src: string; alt: string };
export type StorySec = {
  no: string;
  id?: string;
  heading: string;
  paras: string[];
  photo?: StoryPhoto | null;
  extra?: StoryPhoto[];
  specs?: Array<{ k: string; v: string }>;
  /** 店のメモ(ガイド。店名のリンクと、その店の事実の文) */
  notes?: Array<{ name: string; href: string; text: string }>;
  /** この節に出てくる店の札 */
  cards?: CardShop[];
};
export type StoryData = {
  crumb: Array<{ label: string; href?: string }>;
  tag: string;
  tagEn: string;
  title: string[];
  sub?: string;
  lead: string[];
  date?: string;
  photo: StoryPhoto | null;
  /** 写真に重ねる手書きの文(2〜3 行) */
  hand?: string[];
  secs: StorySec[];
  facts?: Array<{ k: string; v: string }>;
  factsTitle?: string;
  /** 一番下の「あわせて読みたい」の札(店) */
  more?: { heading: string; en: string; cards: CardShop[]; hrefOf: (id: string) => string };
  sources?: Array<{ label: string; url: string }>;
  checkedAt?: string;
  actions: Array<{ label: string; href: string; external?: boolean; ghost?: boolean }>;
  banner: { v: "shop" | "article"; href: string; external?: boolean };
};

function Photo({ p, eager }: { p: StoryPhoto; eager?: boolean }) {
  return <img src={p.src} alt={p.alt} loading={eager ? "eager" : "lazy"} />;
}

export default function Story({ d }: { d: StoryData }) {
  const long = d.title.join("").length;
  const size = long <= 24 ? "" : long <= 44 ? " is-m" : " is-s";
  return (
    <div className="apa-page apa-story">
      <nav className="h-crumb" aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <i>›</i>
        <Link href={aLinks.top}>アクティビティ</Link>
        {d.crumb.map((c, i) => (
          <span key={`${c.label}-${i}`} className="y-crumb-it">
            <i>›</i>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </nav>

      <div className="y-wrap">
        {/* ---- 最初の画面(写真の枠 + クリーム色の札) ---- */}
        <section className="y-hero" aria-label={d.title.join("")}>
          <i className="y-yel" />
          {d.photo ? (
            <figure className="y-photo apa-perf">
              <Photo p={d.photo} eager />
              {d.hand?.length ? (
                <figcaption className="apa-hand">
                  {d.hand.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </figcaption>
              ) : null}
              <Stamp id="story" className="y-stamp" ring="MACHINOWA ACTIVITY" mountain wave />
            </figure>
          ) : null}
          <div className={`y-panel${d.photo ? "" : " is-solo"}`}>
            <p className="y-tag">
              <span>{d.tag}</span>
              <small>{d.tagEn}</small>
            </p>
            <h1 className={`y-h1${size}`}>
              {d.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h1>
            {d.sub ? <p className="y-sub">{d.sub}</p> : null}
            {d.lead.map((p) => (
              <p key={p} className="y-lead">
                {p}
              </p>
            ))}
            {d.date ? (
              <p className="y-date">
                <IcClock />
                {d.date}
              </p>
            ) : null}
            {d.actions.length ? (
              <div className="y-actions">
                {d.actions.map((a) =>
                  a.external ? (
                    <a key={a.href} className={`y-btn${a.ghost ? " is-ghost" : ""}`} href={a.href} target="_blank" rel="noopener noreferrer">
                      <IcExternal />
                      {a.label}
                    </a>
                  ) : (
                    <Link key={a.href} className={`y-btn${a.ghost ? " is-ghost" : ""}`} href={a.href}>
                      {a.label} <IcArrow />
                    </Link>
                  ),
                )}
              </div>
            ) : null}
            <Pines className="y-pines" />
          </div>
        </section>

        {/* ---- 節(旗の番号 + 白い面。文と写真は左右交互) ---- */}
        {d.secs.map((s, i) => {
          // 店の札が 1〜2 枚で写真が無い節は、文の右がわに札を置く(札が左に寄って右が空かないように)。3 枚以上は文の下に並べる
          const nCards = s.cards?.length ?? 0;
          const side = !s.photo && nCards > 0 && nCards <= 2;
          return (
          <section key={s.no + s.heading} className={`y-sec${i % 2 === 1 ? " is-flip" : ""}`} id={s.id} aria-labelledby={`${s.id ?? `y-s${i}`}-h`}>
            <header className="y-sec-h">
              <Flag n={s.no} className="y-flag" />
              <h2 id={`${s.id ?? `y-s${i}`}-h`}>{s.heading}</h2>
              {i === 0 ? <Mountain className="y-sec-deco" /> : null}
            </header>
            <div className={`y-sec-b${s.photo ? " has-ph" : ""}${side ? " has-cards" : ""}`}>
              <div className="y-sec-t">
                {s.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.specs?.length ? (
                  <dl className="y-specs">
                    {s.specs.map((x) => (
                      <div key={x.k}>
                        <dt>{x.k}</dt>
                        <dd>{x.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {s.notes?.length ? (
                  <ul className="y-notes">
                    {s.notes.map((n) => (
                      <li key={n.href + n.text}>
                        <IcCheck />
                        <span>
                          <Link href={n.href}>{n.name}</Link>
                          {n.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {s.photo ? (
                <figure className="y-sec-ph">
                  <Photo p={s.photo} />
                </figure>
              ) : null}
              {side ? (
                <div className="s-grid y-cards" style={{ ["--c" as string]: nCards } as CSSProperties}>
                  {s.cards!.map((c) => (
                    <ShopCard key={c.id} s={c} variant="list" />
                  ))}
                </div>
              ) : null}
            </div>
            {s.extra?.length ? (
              <div className="y-extra">
                {s.extra.map((p) => (
                  <figure key={p.src}>
                    <Photo p={p} />
                  </figure>
                ))}
              </div>
            ) : null}
            {!side && nCards > 0 ? (
              <div className="s-grid y-cards">
                {s.cards!.map((c) => (
                  <ShopCard key={c.id} s={c} variant="list" />
                ))}
              </div>
            ) : null}
          </section>
          );
        })}

        {/* ---- 基本情報 ---- */}
        {d.facts?.length ? (
          <section className="y-facts" aria-label={d.factsTitle ?? "基本情報"}>
            <header className="y-sec-h">
              <span className="y-icon">
                <IcDoc />
              </span>
              <h2>{d.factsTitle ?? "基本情報"}</h2>
              <small>INFORMATION</small>
            </header>
            <dl className="y-specs is-wide">
              {d.facts.map((x) => (
                <div key={x.k}>
                  <dt>{x.k}</dt>
                  <dd>{x.v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* ---- あわせて読みたい ---- */}
        {d.more?.cards.length ? (
          <section className="y-more" aria-label={d.more.heading}>
            <header className="y-sec-h">
              <span className="y-icon">
                <IcArrow />
              </span>
              <h2>{d.more.heading}</h2>
              <small>{d.more.en}</small>
            </header>
            <div className="s-grid y-cards">
              {d.more.cards.map((c) => (
                <ShopCard key={c.id} s={c} variant="list" href={d.more!.hrefOf(c.id)} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ---- 情報の出どころ ---- */}
        {d.sources?.length ? (
          <section className="y-src" aria-label="情報の出どころ">
            <header className="y-sec-h">
              <span className="y-icon is-flag">
                <IcDoc />
              </span>
              <h2>情報の出どころ</h2>
              <small>SOURCES</small>
              {d.checkedAt ? <span className="y-src-date">確認日 {d.checkedAt.replace(/-/g, ".")}</span> : null}
            </header>
            <ul className="y-src-list">
              {d.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    <IcExternal />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="y-src-note">情報は変わることがあります。最新の案内は、公式サイトなどでご確認ください。</p>
          </section>
        ) : null}
      </div>

      <Banner v={d.banner.v} href={d.banner.href} external={d.banner.external} />
    </div>
  );
}
