import Link from "next/link";
import Shell from "../../common/Shell";
import { IconArrow, IconExternal } from "../../common/Icons";
import { syLinks } from "../../common/site";
import { dotDate, visualLen } from "../../common/live";
import IndexNav from "../IndexNav";
import type { ArticleView, ArtSection, Row4 } from "./articleData";
import "../article.css";

/* eslint-disable @next/next/no-img-element */

// 宿の記事(本番 /stay/article/{id}。決定デザイン・見本 1_記事)。実在の宿 1 軒ずつの紹介記事を、見本の組み立てで出す:
//   最初の画面(大きな写真・見出し 2 行・副題 1 行・リード 4 行・右に INDEX)/ 01 横長の写真に暗い文字箱 / 02 左に文・右に写真 /
//   03 左に写真・中央に文・右に一言 / 04 時刻の横並び(時刻が 2 つ未満なら「宿の基本」の横並び)/ 掲載している宿 / あわせて読みたい。
// 文は記事の事実だけ(articleData.ts・articleEdit.ts)。見本の「編集部の宿泊記」「一泊二日のモデルプラン」「ただ、何もしない時間が…」の引用は出さない(泊まった体験・作り話になるため)。

const L = syLinks("live");

/** 見出し(2 行)の大きさ。長い方の行の長さで決める */
function titleSize(lines: string[]): string {
  const n = Math.max(...lines.map((l) => visualLen(l)));
  return n <= 8 ? "s1" : n <= 11 ? "s2" : n <= 15 ? "s3" : "s4";
}

/** 行の切れ目で改行する(読み上げでは 1 つの見出し) */
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="sy-a-ln">
          {l}
        </span>
      ))}
    </>
  );
}

function Section({ s }: { s: ArtSection }) {
  return (
    <section id={s.id} className={`sy-a-sec sy-a-sec--${s.layout} is-${s.shape}${s.photo ? "" : " is-nophoto"}${s.quote ? " has-q" : ""}`} aria-labelledby={`${s.id}-h`}>
      {s.photo ? (
        <figure className="sy-a-ph sy-zoom io" data-io="fade">
          <img src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={s.photo.alt} loading="lazy" decoding="async" />
        </figure>
      ) : null}
      <div className="sy-a-tx">
        <p className="sy-a-no io">
          <span className="sy-num">{s.no}</span>
          {s.kicker ? <span className="sy-a-kk">{s.kicker}</span> : null}
        </p>
        <h2 id={`${s.id}-h`} className="sy-a-h2 io" style={{ ["--d" as string]: "60ms" }}>
          <Lines lines={s.heading} />
        </h2>
        <div className="sy-a-bd io" style={{ ["--d" as string]: "140ms" }}>
          {s.paras.map((p, k) => (
            <p key={k}>{p}</p>
          ))}
        </div>
      </div>
      {s.quote ? (
        <blockquote className="sy-a-q io" style={{ ["--d" as string]: "220ms" }}>
          <p>{s.quote}</p>
        </blockquote>
      ) : null}
    </section>
  );
}

/** 04: 時刻の線(丸 → 丸)。時刻が無い宿は「宿の基本」を同じ見た目の線で */
function Row({ r }: { r: Row4 }) {
  if (r.items.length === 0) return null;
  return (
    <section id={r.id} className={`sy-a-r4 sy-a-r4--${r.mode} n${r.items.length} io`} aria-labelledby={`${r.id}-h`}>
      <div className="sy-a-r4-l">
        <p className="sy-a-no">
          <span className="sy-num">{r.no}</span>
          <span className="sy-a-kk">{r.kicker}</span>
        </p>
        <h2 id={`${r.id}-h`} className="sy-a-h2">
          <Lines lines={r.heading} />
        </h2>
        <p className="sy-a-r4-n">{r.note}</p>
      </div>
      <ol className="sy-a-r4-line">
        {r.items.map((it, i) => (
          <li key={i}>
            <i aria-hidden="true" />
            <span className="sy-a-r4-a">{it.a}</span>
            <span className="sy-a-r4-b">{it.b}</span>
            {it.c ? <span className="sy-a-r4-c">{it.c}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function StayArticle({ v }: { v: ArticleView }) {
  const { shop } = v;
  const kicker = [shop.area || shop.prefName, shop.kindName].filter(Boolean).join("・");
  const nameLen = visualLen(v.nameMain);
  const nameCls = nameLen <= 12 ? "m" : nameLen <= 20 ? "s" : "xs";

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
            <h1 className={`sy-a-h1 sy-a-h1--${titleSize(v.h1)}`}>
              <Lines lines={v.h1} />
            </h1>
            <p className="sy-a-sub">{v.sub}</p>
            {v.lede ? (
              <p id="sy-a-lead" className="sy-a-lede">
                {v.lede}
              </p>
            ) : null}
          </div>
          <IndexNav items={v.index} />
          <p className="sy-a-scroll" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </p>
        </header>

        <div className="sy-a-body">
          {v.sections.map((s) => (
            <Section key={s.id} s={s} />
          ))}
          <Row r={v.row4} />

          <section id="sy-a-info" className="sy-a-info" aria-labelledby="sy-a-info-h">
            <h2 id="sy-a-info-h" className="sy-a-info-h io">
              掲載している宿
            </h2>
            <div className="sy-a-info-g" data-ph={v.infoPhoto ? "1" : "0"}>
              {v.infoPhoto ? (
                <Link href={L.shop(shop.id)} className="sy-a-info-ph sy-zoom io" tabIndex={-1} aria-hidden="true">
                  <img src={v.infoPhoto.src} width={v.infoPhoto.w} height={v.infoPhoto.h} alt="" loading="lazy" decoding="async" />
                </Link>
              ) : null}
              <div className="sy-a-info-m io" style={{ ["--d" as string]: "80ms" }}>
                {kicker ? <p className="sy-a-info-k">{kicker}</p> : null}
                <p className={`sy-a-info-n sy-a-info-n--${nameCls}`}>
                  {v.nameMain}
                  {v.nameReading ? <span className="sy-a-info-y">{v.nameReading}</span> : null}
                </p>
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
                      公式サイトを見る
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
