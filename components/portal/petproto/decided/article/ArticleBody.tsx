import type { CSSProperties } from "react";
import Link from "next/link";
import Img from "./Img";
import Toc from "./Toc";
import ArticleCard from "./ArticleCard";
import PawRun from "./PawRun";
import PadCount from "./PadCount";
import Typewriter from "./Typewriter";
import { IconArrow, IconChevron } from "../common/Icons";
import { Reveal, MaskLines, Write, Heart, CountUp, FillHeading } from "../common/Motion";
import { BASE, SEARCH_HREF, SHOP_HREF, ARTICLES_HREF, ARTICLE_HREF } from "../common/site";
import { BODY, CHAPTERS, SUMMARY, TOC } from "./body";
import { TABS } from "./data";

/**
 * 記事の本文ページ(見本なし。一覧の見た目で作った)。ヒーロー写真+見出し+日付+タグ → 目次(ポイント)→ 本文(見出し・写真・文章)→ まとめ → 関連記事 → 一覧へ戻る。
 * 動き: 章の番号はカウンター・章の見出しはマスク・図版はワイプ+スクロールで少し拡大+視差・文章はブラーイン・スポットの札は左右から寄る・
 * まとめはタイプライター・節の背景色がじわっと変わる・章の間に足あと・関連記事はティルト・追従する目次は印が滑る。
 */
export default function ArticleBody() {
  const related = TABS[0].items.slice(0, 3);
  return (
    <div className="ab-page">
      <nav className="ab-bc pt-wrap io" data-io="fade" aria-label="パンくず">
        <Link href={BASE}>ホーム</Link>
        <IconChevron />
        <Link href={ARTICLES_HREF}>特集記事</Link>
        <IconChevron />
        <span aria-current="page">{BODY.title.join(" ")}</span>
      </nav>

      <header className="ab-hero pt-live">
        <div className="ab-hero-photo pt-shine">
          <span className="ab-hero-par" data-par="0.04">
            <Img className="pt-kb" src="feature.webp" w={952} h={468} alt="秋の公園を走る犬" eager />
          </span>
        </div>
        <div className="ab-hero-txt">
          <Reveal as="p" variant="fade" className="ab-hero-label">
            {BODY.label}
          </Reveal>
          <MaskLines as="h1" className="ab-hero-h1" lines={BODY.title} delay={150} step={160} />
          <Write as="p" className="ab-hero-lede" lines={BODY.lede} delay={650} step={380} />
          <Reveal className="ab-meta" delay={1100}>
            <time className="ar-date">{BODY.date}</time>
            <span className="ab-meta-sep" aria-hidden="true" />
            <span className="ab-meta-tags">
              {BODY.tags.map((t, i) => (
                <span className="ar-tagp pt-popin" key={t} style={{ ["--d" as string]: `${1350 + i * 110}ms` } as CSSProperties}>
                  {t}
                </span>
              ))}
            </span>
          </Reveal>
        </div>
        <Heart className="ab-hero-heart" label="この記事をお気に入りに追加" size={20} />
      </header>

      <div className="ab-layout pt-wrap">
        <article className="ab-main">
          <section className="ab-points-w io" aria-labelledby="ab-points-h">
            <div className="ab-points pt-bgshift pt-skew" data-skew="0.4">
              <p className="ab-points-en pt-en">Point</p>
              <h2 id="ab-points-h" className="ab-points-h">
                <FillHeading as="span" start={0.96} end={0.6}>この記事のポイント</FillHeading>
              </h2>
              <ol className="ab-points-list" data-io-group>
                {BODY.points.map((p, i) => (
                  <li key={i} className="io" data-io={i % 2 ? "right" : "left"}>
                    <span className="ab-points-no pt-en">
                      <CountUp to={i + 1} duration={800} />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {CHAPTERS.map((c, i) => (
            <section id={c.id} key={c.id} className={`ab-ch ${i % 2 ? "ab-ch--r" : ""}`} aria-labelledby={`${c.id}-h`}>
              <header className="ab-ch-head io" data-io="fade">
                <PadCount className="ab-ch-no pt-en" to={i + 1} pad={2} duration={900} />
                <h2 id={`${c.id}-h`} className="ab-h2">
                  <MaskLines as="span" lines={[c.title]} delay={150} />
                </h2>
                <span className="ab-ch-en pt-en">{c.en}</span>
              </header>
              <div className="ab-ch-body pt-skew" data-skew="0.4">
                <figure className="ab-fig" data-par="0.04">
                  <span className="ab-fig-in pt-zoom pt-shine pt-wipe ar-sheen" data-wipe={i % 2 ? "right" : "left"}>
                    <span className="ab-fig-sc pt-scale-scroll">
                      <Img src={c.img} w={c.w} h={c.h} alt="" />
                    </span>
                  </span>
                </figure>
                <div className="ab-ch-text" data-io-group>
                  {c.paras.map((t, k) => (
                    <p className="ab-p pt-blurin" key={k}>
                      {t}
                    </p>
                  ))}
                </div>
              </div>
              <ul className="ab-spots" data-io-group>
                {c.spots.map((sp, k) => (
                  <li className="io" data-io={k % 2 ? "right" : "left"} key={sp.no}>
                    <PadCount className="ab-spot-no pt-en" to={Number(sp.no)} pad={2} duration={1000} />
                    <span className="ab-spot-b">
                      <strong>{sp.title}</strong>
                      <span>{sp.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {i < CHAPTERS.length - 1 ? <PawRun className={i % 2 ? "ar-paws--ab-l" : "ar-paws--ab-r"} count={9} direction={i % 2 ? "left" : "right"} /> : null}
            </section>
          ))}

          <section id="summary" className="ab-sum-w io" aria-labelledby="summary-h">
            <div className="ab-sum pt-bgshift pt-skew" data-skew="0.4">
              <h2 id="summary-h" className="ab-sum-h">
                <FillHeading as="span" start={0.96} end={0.6}>まとめ</FillHeading>
              </h2>
              <Typewriter className="ab-p" text={SUMMARY} />
              <div className="ab-cta">
                <Link href={SEARCH_HREF} className="pt-btn pt-press pt-shimmer pt-magnet">
                  お店を探す
                  <IconArrow />
                </Link>
                <Link href={SHOP_HREF} className="pt-btn pt-btn--line pt-press pt-magnet">
                  お店の紹介ページを見る
                  <IconArrow />
                </Link>
              </div>
            </div>
          </section>
        </article>

        <aside className="ab-side" aria-label="目次">
          <Toc items={TOC} />
        </aside>
      </div>

      <section id="related" className="ab-rel pt-wrap" aria-labelledby="related-h">
        <div className="ar-rowhead io">
          <h2 id="related-h" className="ar-h2 ar-h2--md">
            <span className="ab-rel-en pt-en">Related</span>
            <FillHeading as="span" start={0.96} end={0.6}>関連記事</FillHeading>
          </h2>
          <Link className="pt-more ar-more" href={ARTICLES_HREF}>
            すべての記事を見る
            <IconArrow />
          </Link>
        </div>
        <ul className="ab-rel-grid pt-skew" data-skew="0.4" data-io-group>
          {related.map((c, i) => (
            <ArticleCard key={c.title.join("")} c={{ ...c, href: ARTICLE_HREF }} dir={i === 0 ? "left" : i === 2 ? "right" : undefined} />
          ))}
        </ul>
        <div className="ab-back io">
          <Link href={ARTICLES_HREF} className="pt-btn pt-btn--line pt-press pt-magnet">
            <IconArrow style={{ rotate: "180deg" }} />
            記事の一覧へ戻る
          </Link>
          <Link href={BASE} className="ab-back-link">
            マチノワPet トップ
          </Link>
          <Link href={SEARCH_HREF} className="ab-back-link">
            お店を探す
          </Link>
          <Link href={SHOP_HREF} className="ab-back-link">
            お店の紹介ページ(見本)
          </Link>
        </div>
      </section>
    </div>
  );
}
