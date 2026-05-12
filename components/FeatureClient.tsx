"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Marquee from "./Marquee";
import Footer from "./Footer";
import { FEATURES, type FeatureArticle } from "@/lib/data";
import { useParallax, useReveal } from "@/lib/hooks";

function FeatureHero({ article }: { article: FeatureArticle }) {
  const imgRef = useRef<HTMLDivElement>(null);
  useParallax(imgRef, 0.2);
  return (
    <section className="feat-hero">
      <div
        className="img"
        ref={imgRef}
        style={{ backgroundImage: `url(${article.heroImage})` }}
      />
      <div className="feat-hero-inner">
        <div>
          <div className="kicker">
            <span className="b"></span>
            <span>{article.no}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.reading}</span>
          </div>
          <div style={{ marginTop: 30 }} className="reveal-line">
            <div
              style={{
                font: "500 11px/1 var(--mono)",
                letterSpacing: ".35em",
                color: "var(--accent)",
              }}
            >
              {article.kicker}
            </div>
          </div>
        </div>

        <div>
          <h1
            style={{ marginBottom: 20 }}
            dangerouslySetInnerHTML={{ __html: article.titleHTML }}
          />
          <div className="bot">
            <p>{article.lede}</p>
            <div className="dt">
              <h6>副題</h6>
              <p>{article.subtitle}</p>
            </div>
            <div className="dt">
              <h6>編集</h6>
              <p>{article.author}</p>
            </div>
            <div className="dt">
              <h6>戻る</h6>
              <p>
                <Link href="/" data-cursor="BACK">
                  ← トップへ戻る
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RankingList({ article }: { article: FeatureArticle }) {
  const isCourse = article.articleType === "course";

  if (isCourse) {
    return (
      <div className="course-timeline">
        {article.ranking.map((r, i) => (
          <div key={i} className="course-stop-wrap">
            <article className="course-stop reveal">
              <div className="course-stop-label">
                <span className="course-stop-no">{r.rank}</span>
                {r.time && <span className="course-badge course-badge-time">{r.time}</span>}
                {r.purpose && <span className="course-badge course-badge-purpose">{r.purpose}</span>}
              </div>
              <div className="info">
                <div className="cuisine">
                  {r.cuisine} · {r.area}
                </div>
                <h3>{r.name}</h3>
                <p className="desc">{r.desc}</p>
                <div className="specs">
                  {r.specs.map((s, j) => (
                    <div key={j}>
                      <b>{s.k}</b>
                      {s.v}
                    </div>
                  ))}
                </div>
                {r.href && (
                  <Link
                    href={r.href}
                    className="chip"
                    style={{
                      display: "inline-flex",
                      marginTop: 18,
                      padding: "12px 18px",
                      borderRadius: 0,
                    }}
                    data-cursor="VIEW"
                  >
                    店舗詳細を見る →
                  </Link>
                )}
              </div>
              <div className="imgs">
                {r.images.map((im, j) => (
                  <div
                    key={j}
                    className="im"
                    style={{ backgroundImage: `url(${im})` }}
                    data-cursor="ZOOM"
                  />
                ))}
              </div>
            </article>
            {r.transit && (
              <div className="course-transit">
                <span className="course-transit-line" />
                <span className="course-transit-text">↓ {r.transit}</span>
                <span className="course-transit-line" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ranking">
      {article.ranking.map((r, i) => (
        <article key={i} className="rank-item reveal">
          <div className="rank">
            <em>{r.rank}</em>
          </div>
          <div className="info">
            <div className="cuisine">
              {r.cuisine} · {r.area}
            </div>
            <h3>{r.name}</h3>
            <p className="desc">{r.desc}</p>
            <div className="specs">
              {r.specs.map((s, j) => (
                <div key={j}>
                  <b>{s.k}</b>
                  {s.v}
                </div>
              ))}
            </div>
            {r.href && (
              <Link
                href={r.href}
                className="chip"
                style={{
                  display: "inline-flex",
                  marginTop: 18,
                  padding: "12px 18px",
                  borderRadius: 0,
                }}
                data-cursor="VIEW"
              >
                店舗詳細を見る →
              </Link>
            )}
          </div>
          <div className="imgs">
            {r.images.map((im, j) => (
              <div
                key={j}
                className="im"
                style={{ backgroundImage: `url(${im})` }}
                data-cursor="ZOOM"
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function FeatureTabs({ activeId }: { activeId: string }) {
  return (
    <div className="tabs">
      {FEATURES.map((t) => (
        <Link
          key={t.id}
          href={`/feature/${t.id}`}
          className={"tab " + (t.id === activeId ? "active" : "")}
          data-cursor="READ"
        >
          <span className="no">{t.no}</span>
          {t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title}
        </Link>
      ))}
    </div>
  );
}

function SideArticles({ article }: { article: FeatureArticle }) {
  const isGuide = article.articleType === "guide";

  return (
    <div className="side-article">
      <div>
        <div
          style={{
            font: "500 10px/1 var(--mono)",
            letterSpacing: ".35em",
            color: "var(--accent)",
            marginBottom: 24,
          }}
        >
          関連記事
        </div>
        <h3>
          次に読む、<em>{isGuide ? "街ガイド" : "利用シーン"}。</em>
        </h3>
      </div>
      <div className="side-grid">
        {article.sideArticles.map((s, i) => (
          <Link key={i} href={s.h} className="side-card" data-cursor="READ">
            <div
              className="img"
              style={{ backgroundImage: `url(${s.img})` }}
            />
            <div className="info">
              <div className="t">{s.t}</div>
              <h4>記事を読む →</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function FeatureClient({ article }: { article: FeatureArticle }) {
  useReveal();
  const A = article;
  const isGuide = A.articleType === "guide";
  const introText = isGuide
    ? `順位ではなく、編集部が選んだ${A.ranking.length}スポットを順にご紹介します。`
    : `順位ではなく、編集部が選んだ${A.ranking.length}軒の名店を順にご紹介します。`;

  return (
    <div className="feat-page">
      <FeatureHero article={A} />
      <Marquee
        items={[
          A.subtitle,
          "編集部厳選",
          A.kicker,
          "厳選五選",
          "2026年 春号",
        ]}
      />

      <div className="feat-body">
        <FeatureTabs activeId={A.id} />

        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              厳選
              <span className="big">{A.ranking.length}</span>
            </div>
            <div>
              <h2>
                {A.subtitle.split(" / ")[0]}<em>。</em>
              </h2>
              <p className="sub">
                {introText}
                {A.lede}
              </p>
            </div>
          </div>
          <RankingList article={A} />
        </section>

        <section className="quote-block">
          <blockquote>{A.quote}</blockquote>
          <cite>{A.quoteCite}</cite>
        </section>

        <SideArticles article={A} />

        <section className="article" style={{ borderBottom: "none" }}>
          <div className="article-head reveal">
            <div className="label">
              編集後記<span className="big">末</span>
            </div>
            <div>
              <h2>
                最後に、<em>{isGuide ? "歩き方" : "選び方"}。</em>
              </h2>
              <p className="sub">{A.closing}</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
