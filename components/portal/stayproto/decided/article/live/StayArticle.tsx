import Link from "next/link";
import Shell from "../../common/Shell";
import { IconArrow, IconExternal } from "../../common/Icons";
import { syLinks } from "../../common/site";
import { dotDate, visualLen } from "../../common/live";
import IndexNav from "../IndexNav";
import type { ArticleView, ArtSection } from "./articleData";
import "../article.css";

/* eslint-disable @next/next/no-img-element */

// 宿の記事(本番 /stay/article/{id}。決定デザイン・見本 1_記事)。実在の宿 1 軒ずつの紹介記事を、見本の組み立て(ヒーロー・節ごとの帯・時間の帯・宿の情報・あわせて読みたい)で出す。
// 文は Place.article の事実だけ(articleData.ts)。見本の「編集部の宿泊記」「一泊二日のモデルプラン」「ただ、何もしない時間が…」の引用・「取材した宿」は出さない
// (泊まった体験・作り話になるため。時間は公式サイトなどで確認できたチェックイン/アウトだけを同じ見た目の線で出す)。

const L = syLinks("live");

/** 宿名の長さで見出しの大きさを決める(2 行〜3 行に収める) */
function titleSize(name: string): string {
  const n = visualLen(name);
  return n <= 9 ? "s1" : n <= 16 ? "s2" : n <= 26 ? "s3" : "s4";
}

const LAYOUT = ["band", "right", "left"] as const;

function Section({ s, i }: { s: ArtSection; i: number }) {
  const layout = s.photo ? LAYOUT[i % 3] : "plain";
  return (
    <section id={s.id} className={`sy-a-sec sy-a-sec--${layout}`} aria-labelledby={`${s.id}-h`}>
      {s.photo ? (
        <figure className="sy-a-ph sy-zoom io" data-io="fade">
          <img src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={s.photo.alt} loading="lazy" decoding="async" />
        </figure>
      ) : null}
      <div className="sy-a-tx">
        <p className="sy-a-no io">
          <span className="sy-num">{s.no}</span>
        </p>
        <h2 id={`${s.id}-h`} className="sy-a-h2 io" style={{ ["--d" as string]: "60ms" }}>
          {s.heading}
        </h2>
        <div className="sy-a-bd io" style={{ ["--d" as string]: "140ms" }}>
          {s.paras.map((p, k) => (
            <p key={k}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** チェックイン・チェックアウトを、見本の時間の線(丸 → 丸)と同じ見た目で。公式サイトなどで確認できた時間だけ */
function Times({ no, shop }: { no: string; shop: ArticleView["shop"] }) {
  const items = [
    shop.checkIn ? { t: shop.checkIn, l: "チェックイン" } : null,
    shop.checkOut ? { t: shop.checkOut, l: "チェックアウト" } : null,
  ].filter((x): x is { t: string; l: string } => !!x);
  if (items.length === 0) return null;
  return (
    <section id="sy-a-time" className="sy-a-time io" aria-labelledby="sy-a-time-h">
      <div className="sy-a-time-l">
        <p className="sy-a-no">
          <span className="sy-num">{no}</span>
        </p>
        <h2 id="sy-a-time-h" className="sy-a-h2">
          チェックインと
          <br />
          チェックアウト
        </h2>
        <p className="sy-a-time-n">公式サイトなどで確認できた時間です。</p>
      </div>
      <ol className="sy-a-time-line">
        {items.map((it) => (
          <li key={it.l}>
            <i aria-hidden="true" />
            <time className="sy-a-time-t">{it.t}</time>
            <span className="sy-a-time-s">{it.l}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function StayArticle({ v }: { v: ArticleView }) {
  const { shop } = v;
  const kicker = [shop.area || shop.prefName, shop.kindName].filter(Boolean).join("・");
  const hasTime = !!(shop.checkIn || shop.checkOut);
  const timeNo = String(v.sections.length + 1).padStart(2, "0");
  const index = [
    ...(v.lede.length > 0 ? [{ id: "sy-a-lead", label: "はじめに" }] : []),
    ...v.sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(hasTime ? [{ id: "sy-a-time", label: "チェックイン・アウト" }] : []),
    { id: "sy-a-info", label: "宿の情報" },
  ].slice(0, 8);

  return (
    <Shell page="article" mode="live">
      <article className="sy-a">
        <header className={`sy-a-hero ${v.hero ? "" : "is-nophoto"}`}>
          {v.hero ? (
            <div className="sy-a-hero-ph sy-live">
              <img className="sy-kb" src={v.hero.src} width={v.hero.w} height={v.hero.h} alt={v.hero.alt} fetchPriority="high" />
            </div>
          ) : null}
          <div className="sy-a-hero-in">
            <p className="sy-a-story">
              <span className="sy-lab">Article</span>
              {kicker ? <span className="sy-a-kick">{kicker}</span> : null}
            </p>
            <h1 className={`sy-a-h1 sy-a-h1--${titleSize(shop.name)}`}>{shop.name}</h1>
            <p className="sy-a-sub">{v.headline}</p>
            {v.lede.length > 0 ? (
              <div id="sy-a-lead" className="sy-a-lede">
                {v.lede.map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
              </div>
            ) : null}
          </div>
          <IndexNav items={index} />
          <p className="sy-a-scroll" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </p>
        </header>

        <div className="sy-a-body">
          {v.sections.map((s, i) => (
            <Section key={s.id} s={s} i={i} />
          ))}
          {hasTime ? <Times no={timeNo} shop={shop} /> : null}

          <section id="sy-a-info" className="sy-a-info" aria-labelledby="sy-a-info-h">
            <h2 id="sy-a-info-h" className="sy-a-info-h io">
              掲載している宿
            </h2>
            <div className="sy-a-info-g" data-ph={shop.photo ? "1" : "0"}>
              {shop.photo ? (
                <Link href={L.shop(shop.id)} className="sy-a-info-ph sy-zoom io" tabIndex={-1} aria-hidden="true">
                  <img src={shop.photo.src} width={shop.photo.w} height={shop.photo.h} alt="" loading="lazy" decoding="async" />
                </Link>
              ) : null}
              <div className="sy-a-info-m io" style={{ ["--d" as string]: "80ms" }}>
                {kicker ? <p className="sy-a-info-k">{kicker}</p> : null}
                <p className={`sy-a-info-n sy-a-info-n--${visualLen(shop.name) <= 12 ? "m" : visualLen(shop.name) <= 22 ? "s" : "xs"}`}>{shop.name}</p>
                {v.blurb ? <p className="sy-a-info-d">{v.blurb}</p> : null}
              </div>
              <div className="sy-a-info-r io" style={{ ["--d" as string]: "160ms" }}>
                {v.info.length > 0 ? (
                  <dl className="sy-a-dl">
                    {v.info.map((r) => (
                      <div key={r.k}>
                        <dt>{r.k}</dt>
                        <dd>{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div className="sy-a-info-b">
                  <Link href={L.shop(shop.id)} className="sy-btn sy-btn--pill sy-a-btn">
                    施設詳細を見る
                    <IconArrow />
                  </Link>
                  {shop.officialUrl ? (
                    <a href={shop.officialUrl} className="sy-btn sy-btn--pill sy-btn--line sy-a-btn" target="_blank" rel="noopener noreferrer">
                      公式サイトで空室・料金を確認
                      <IconExternal />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            {v.sources.length > 0 || v.checkedAt ? (
              <div className="sy-a-src io">
                <span className="sy-a-src-h">情報の出どころ</span>
                <ul>
                  {v.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {v.checkedAt ? <span className="sy-a-src-d">{dotDate(v.checkedAt)} 確認</span> : null}
              </div>
            ) : null}
          </section>

          {v.related.length > 0 ? (
            <section className="sy-a-rel" aria-labelledby="sy-a-rel-h">
              <div className="sy-a-rel-top">
                <h2 id="sy-a-rel-h" className="sy-a-rel-h io">
                  あわせて読みたい <span className="sy-lab">Related Articles</span>
                </h2>
                <Link href={L.articles} className="sy-more sy-more--plain io">
                  記事の一覧を見る
                  <IconArrow />
                </Link>
              </div>
              <ul data-io-group>
                {v.related.map((a) => (
                  <li key={a.id} className="io">
                    <Link href={L.article(a.id)} className="sy-a-rc sy-hov">
                      <span className="sy-a-rc-ph sy-zoom">
                        <img src={a.photo.src} width={a.photo.w} height={a.photo.h} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="sy-a-rc-b">
                        <span className="sy-a-rc-k">{a.shop.kindName}</span>
                        <span className="sy-a-rc-t">{a.shop.name}</span>
                        <span className="sy-a-rc-d">{a.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    </Shell>
  );
}
