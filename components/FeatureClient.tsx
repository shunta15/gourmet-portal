"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Marquee from "./Marquee";
import Footer from "./Footer";
import { FEATURE_ARTICLE, type FeatureArticle } from "@/lib/data";
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
          <h1 style={{ marginBottom: 20 }}>
            <span
              className="line"
              style={{ display: "block", overflow: "hidden" }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation:
                    "riseUp 1.2s cubic-bezier(.22,1,.36,1) forwards",
                  transform: "translateY(110%)",
                }}
              >
                旅の夜は、
              </span>
            </span>
            <span
              className="line"
              style={{ display: "block", overflow: "hidden" }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation:
                    "riseUp 1.2s .15s cubic-bezier(.22,1,.36,1) forwards",
                  transform: "translateY(110%)",
                }}
              >
                ここの<em>焼肉</em>へ。
              </span>
            </span>
          </h1>
          <div className="bot">
            <p>{article.lede}</p>
            <div className="dt">
              <h6>TAGS</h6>
              <p>焼肉 / 旅 / 下町</p>
            </div>
            <div className="dt">
              <h6>EDITOR</h6>
              <p>{article.author}</p>
            </div>
            <div className="dt">
              <h6>ACTION</h6>
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
  return (
    <div className="ranking">
      {article.ranking.map((r, i) => (
        <article key={i} className="rank-item reveal">
          <div className="rank">
            第<em>{r.rank}</em>位
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

function FeatureTabs() {
  const tabs = [
    { no: "01", label: "旅の夜は焼肉" },
    { no: "02", label: "下町焼肉五選" },
    { no: "03", label: "春の和食" },
    { no: "04", label: "路地の奥" },
    { no: "05", label: "深夜の動線" },
  ];
  const [active, setActive] = useState(0);
  return (
    <div className="tabs">
      {tabs.map((t, i) => (
        <button
          key={i}
          type="button"
          className={"tab " + (i === active ? "active" : "")}
          onClick={() => setActive(i)}
          data-cursor="READ"
        >
          <span className="no">{t.no}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SideArticles({ article }: { article: FeatureArticle }) {
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
          RELATED ARTICLES / 関連記事
        </div>
        <h3>
          焼肉だけで、<em>終わらない夜。</em>
        </h3>
      </div>
      <div className="side-grid">
        {article.sideArticles.map((s, i) => (
          <a key={i} className="side-card" data-cursor="READ">
            <div
              className="img"
              style={{ backgroundImage: `url(${s.img})` }}
            />
            <div className="info">
              <div className="t">{s.t}</div>
              <h4>{s.h}</h4>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function FeatureClient() {
  useReveal();
  const A = FEATURE_ARTICLE;
  return (
    <div className="feat-page">
      <FeatureHero article={A} />
      <Marquee
        items={[
          "YAKINIKU · 焼肉",
          "旅 × 下町",
          "五選",
          "BEST FIVE",
          "編集部厳選",
          "2026 SPRING",
        ]}
      />

      <div className="feat-body">
        <FeatureTabs />

        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              RANKING
              <span className="big">01</span>
            </div>
            <div>
              <h2>
                下町焼肉、<em>五選。</em>
              </h2>
              <p className="sub">
                旅の夜、最初に向かうべき一軒から、帰る朝の一軒まで。編集部が百軒を巡り、五軒に絞った。序列ではなく、夜の順路と読んで欲しい。
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
              EDITOR&apos;S NOTE<span className="big">末</span>
            </div>
            <div>
              <h2>
                炎は、<em>記憶になる。</em>
              </h2>
              <p className="sub">
                旅の夜、何を食べたかは、その旅そのものになる。焼肉は、特に。煙と炎、仲間の声、ビールの泡
                ―― すべてがひとつの記憶に焼きつく。五軒のどれかが、あなたの次の旅の記憶になれば、編集部としてこれ以上の幸せはない。
              </p>
              <p
                className="sub"
                style={{
                  marginTop: 30,
                  font: "italic 500 15px/1.8 var(--serif)",
                }}
              >
                ― 次回は「春の和食、桜のように」。乞うご期待。
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
