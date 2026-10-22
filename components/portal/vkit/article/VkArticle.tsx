import Link from "next/link";
import Shell from "../common/Shell";
import { IconArrow, IconExternal } from "../common/Icons";
import { vkLinks, type VkConfig } from "../config";
import { dotDate, visualLen } from "../common/live";
import IndexNav from "./IndexNav";
import type { ArticleView, ArtSection, Row4 } from "./articleData";
import "./article.css";

/* eslint-disable @next/next/no-img-element */

// 店の記事(本番 /activity/article/{id}・/sports/article/{id}・/life/article/{id}。ステイの決定デザイン「記事」と同じ組み立て)。実在の店 1 軒ずつの紹介記事を出す:
//   最初の画面(大きな写真・見出し 2 行・副題 1 行・リード 4 行・右に INDEX)/ 01 横長の写真に暗い文字箱 / 02 左に文・右に写真 /
//   03 左に写真・中央に文・右に一言(一言は出さない)/ 04 基本情報の横並び / 掲載している店 / あわせて読みたい。
// 文は記事の事実だけ(articleData.ts)。体験した言い回し・モデルプラン・引用は出さない(体験・作り話になるため)。

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
        <span key={i} className="vk-a-ln">
          {l}
        </span>
      ))}
    </>
  );
}

function Section({ s }: { s: ArtSection }) {
  return (
    <section id={s.id} className={`vk-a-sec vk-a-sec--${s.layout} is-${s.shape}${s.photo ? "" : " is-nophoto"}${s.quote ? " has-q" : ""}`} aria-labelledby={`${s.id}-h`}>
      {s.photo ? (
        <figure className="vk-a-ph vk-zoom io" data-io="fade">
          <img src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={s.photo.alt} loading="lazy" decoding="async" />
        </figure>
      ) : null}
      <div className="vk-a-tx">
        <p className="vk-a-no io">
          <span className="vk-num">{s.no}</span>
          {s.kicker ? <span className="vk-a-kk">{s.kicker}</span> : null}
        </p>
        <h2 id={`${s.id}-h`} className="vk-a-h2 io" style={{ ["--d" as string]: "60ms" }}>
          <Lines lines={s.heading} />
        </h2>
        <div className="vk-a-bd io" style={{ ["--d" as string]: "140ms" }}>
          {s.paras.map((p, k) => (
            <p key={k}>{p}</p>
          ))}
        </div>
      </div>
      {s.quote ? (
        <blockquote className="vk-a-q io" style={{ ["--d" as string]: "220ms" }}>
          <p>{s.quote}</p>
        </blockquote>
      ) : null}
    </section>
  );
}

/** 04: 基本情報の線(丸 → 丸) */
function Row({ r }: { r: Row4 }) {
  if (r.items.length === 0) return null;
  return (
    <section id={r.id} className={`vk-a-r4 vk-a-r4--${r.mode} n${r.items.length} io`} aria-labelledby={`${r.id}-h`}>
      <div className="vk-a-r4-l">
        <p className="vk-a-no">
          <span className="vk-num">{r.no}</span>
          <span className="vk-a-kk">{r.kicker}</span>
        </p>
        <h2 id={`${r.id}-h`} className="vk-a-h2">
          <Lines lines={r.heading} />
        </h2>
        <p className="vk-a-r4-n">{r.note}</p>
      </div>
      <ol className="vk-a-r4-line">
        {r.items.map((it, i) => (
          <li key={i}>
            <i aria-hidden="true" />
            <span className="vk-a-r4-a">{it.a}</span>
            <span className="vk-a-r4-b">{it.b}</span>
            {it.c ? <span className="vk-a-r4-c">{it.c}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function VkArticle({ cfg, v }: { cfg: VkConfig; v: ArticleView }) {
  const L = vkLinks(cfg);
  const { shop } = v;
  const kicker = [shop.area || shop.prefName, shop.kindName].filter(Boolean).join("・");
  const nameLen = visualLen(v.nameMain);
  const nameCls = nameLen <= 12 ? "m" : nameLen <= 20 ? "s" : "xs";

  return (
    <Shell cfg={cfg} page="article">
      <article className="vk-a">
        <header className={`vk-a-hero ${v.hero ? "" : "is-nophoto"}`}>
          {v.hero ? (
            <div className="vk-a-hero-ph vk-live">
              <img className="vk-kb" src={v.hero.src} width={v.hero.w} height={v.hero.h} alt={v.hero.alt} fetchPriority="high" />
            </div>
          ) : null}
          <div className="vk-a-hero-in">
            <p className="vk-a-story">
              <span className="vk-lab">Article</span>
              {kicker ? <span className="vk-a-kick">{kicker}</span> : null}
            </p>
            <h1 className={`vk-a-h1 vk-a-h1--${titleSize(v.h1)}`}>
              <Lines lines={v.h1} />
            </h1>
            <p className="vk-a-sub">{v.sub}</p>
            {v.lede ? (
              <p id="vk-a-lead" className="vk-a-lede">
                {v.lede}
              </p>
            ) : null}
          </div>
          <IndexNav items={v.index} />
          <p className="vk-a-scroll" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </p>
        </header>

        <div className="vk-a-body">
          {v.sections.map((s) => (
            <Section key={s.id} s={s} />
          ))}
          <Row r={v.row4} />

          <section id="vk-a-info" className="vk-a-info" aria-labelledby="vk-a-info-h">
            <h2 id="vk-a-info-h" className="vk-a-info-h io">
              掲載している{cfg.noun}
            </h2>
            <div className="vk-a-info-g" data-ph={v.infoPhoto ? "1" : "0"}>
              {v.infoPhoto ? (
                <Link href={L.shop(shop.id)} className="vk-a-info-ph vk-zoom io" tabIndex={-1} aria-hidden="true">
                  <img src={v.infoPhoto.src} width={v.infoPhoto.w} height={v.infoPhoto.h} alt="" loading="lazy" decoding="async" />
                </Link>
              ) : null}
              <div className="vk-a-info-m io" style={{ ["--d" as string]: "80ms" }}>
                {kicker ? <p className="vk-a-info-k">{kicker}</p> : null}
                <p className={`vk-a-info-n vk-a-info-n--${nameCls}`}>
                  {v.nameMain}
                  {v.nameReading ? <span className="vk-a-info-y">{v.nameReading}</span> : null}
                </p>
                {v.blurb ? <p className="vk-a-info-d">{v.blurb}</p> : null}
              </div>
              <div className="vk-a-info-r io" style={{ ["--d" as string]: "160ms" }}>
                {v.info.length > 0 ? (
                  <dl className="vk-a-dl">
                    {v.info.map((r) => (
                      <div key={r.k}>
                        <dt>{r.k}</dt>
                        <dd>{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div className="vk-a-info-b">
                  <Link href={L.shop(shop.id)} className="vk-btn vk-btn--pill vk-a-btn">
                    {cfg.noun}の詳細を見る
                    <IconArrow />
                  </Link>
                  {shop.officialUrl ? (
                    <a href={shop.officialUrl} className="vk-btn vk-btn--pill vk-btn--line vk-a-btn" target="_blank" rel="noopener noreferrer">
                      公式サイトを見る
                      <IconExternal />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            {v.sources.length > 0 || v.checkedAt ? (
              <div className="vk-a-src io">
                <span className="vk-a-src-h">情報の出どころ</span>
                <ul>
                  {v.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {v.checkedAt ? <span className="vk-a-src-d">{dotDate(v.checkedAt)} 確認</span> : null}
              </div>
            ) : null}
          </section>

          {v.related.length > 0 ? (
            <section className="vk-a-rel" aria-labelledby="vk-a-rel-h">
              <div className="vk-a-rel-top">
                <h2 id="vk-a-rel-h" className="vk-a-rel-h io">
                  あわせて読みたい <span className="vk-lab">Related Articles</span>
                </h2>
                <Link href={L.articles} className="vk-more vk-more--plain io">
                  記事の一覧を見る
                  <IconArrow />
                </Link>
              </div>
              <ul data-io-group>
                {v.related.map((a) => (
                  <li key={a.id} className="io">
                    <Link href={L.article(a.id)} className="vk-a-rc vk-hov">
                      <span className="vk-a-rc-ph vk-zoom">
                        <img src={a.photo.src} width={a.photo.w} height={a.photo.h} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="vk-a-rc-b">
                        <span className="vk-a-rc-k">{a.shop.kindName}</span>
                        <span className="vk-a-rc-t">{a.shop.name}</span>
                        <span className="vk-a-rc-d">{a.title}</span>
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
