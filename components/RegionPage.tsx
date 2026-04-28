"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Marquee from "./Marquee";
import Footer from "./Footer";
import RestaurantCard from "./RestaurantCard";
import {
  REGIONS,
  RESTAURANTS,
  FEATURES,
  type RegionKey,
} from "@/lib/data";
import { useParallax, useReveal } from "@/lib/hooks";

export default function RegionPage({ regionKey }: { regionKey: RegionKey }) {
  useReveal();
  const heroRef = useRef<HTMLDivElement>(null);
  useParallax(heroRef, 0.18);
  const r = REGIONS[regionKey];
  const restaurants = RESTAURANTS.filter((x) => x.region === regionKey);

  useEffect(() => {
    document.body.setAttribute("data-region", regionKey);
  }, [regionKey]);

  return (
    <div className="feat-page">
      <section className="feat-hero">
        <div
          className="img"
          ref={heroRef}
          style={{ backgroundImage: `url(${r.heroImages[0]})` }}
        />
        <div className="feat-hero-inner">
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>MINI PORTAL</span>
              <span>·</span>
              <span>{r.nameEn}</span>
              <span>·</span>
              <span>EDITION 2026</span>
            </div>
            <div style={{ marginTop: 30 }} className="reveal-line">
              <div
                style={{
                  font: "500 11px/1 var(--mono)",
                  letterSpacing: ".35em",
                  color: "var(--accent)",
                }}
              >
                {r.tagline}
              </div>
            </div>
          </div>

          <div>
            <h1 style={{ marginBottom: 20 }}>{r.name}</h1>
            <div className="bot">
              <p>{r.intro}</p>
              <div className="dt">
                <h6>店舗数</h6>
                <p>{r.stats[0].n} 店</p>
              </div>
              <div className="dt">
                <h6>エリア</h6>
                <p>{r.stats[1].n}</p>
              </div>
              <div className="dt">
                <h6>★ AVG</h6>
                <p>{r.stats[3].n}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          r.name,
          r.tagline,
          r.subtitle,
          r.nameEn.toUpperCase(),
          "編集部厳選",
          "2026 SPRING",
        ]}
      />

      <div className="feat-body">
        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              RESTAURANTS
              <span className="big">{r.stats[0].n}</span>
            </div>
            <div>
              <h2>
                編集部の、<em>太鼓判。</em>
              </h2>
              <p className="sub">
                {r.subtitle}
                {restaurants.length}軒のおすすめ店をご紹介します。
              </p>
            </div>
          </div>

          <div
            className="rest-grid"
            style={{ background: "transparent", color: "inherit" }}
          >
            {restaurants.map((rr) => (
              <RestaurantCard key={rr.id} r={rr} />
            ))}
          </div>
        </section>

        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              JUMP
              <span className="big">他</span>
            </div>
            <div>
              <h2>
                他の地域へ、<em>潜入。</em>
              </h2>
              <p className="sub">五つの地域、それぞれ独自の紙面。</p>
            </div>
          </div>
          <div className="regions-grid">
            {Object.entries(REGIONS)
              .filter(([k]) => k !== regionKey)
              .map(([k, rr], i) => (
                <Link
                  key={k}
                  href={`/region/${k}`}
                  className="region-card"
                  data-cursor="ENTER"
                >
                  <div
                    className="img"
                    style={{ backgroundImage: `url(${rr.heroImages[0]})` }}
                  />
                  <div className="rc-body">
                    <div className="rc-no">
                      EDITION / {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3>{rr.name}</h3>
                    <div className="rc-en">{rr.nameEn}</div>
                    <p className="rc-tag">
                      <em>{rr.tagline}</em>
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        <section className="article" style={{ borderBottom: "none" }}>
          <div className="article-head reveal">
            <div className="label">
              FEATURES
              <span className="big">読</span>
            </div>
            <div>
              <h2>
                読みもの、<em>編集部から。</em>
              </h2>
              <p className="sub">
                同地域の特集記事をピックアップしました。
              </p>
            </div>
          </div>
          <div className="side-grid">
            {FEATURES.slice(0, 4).map((f) => (
              <Link
                key={f.id}
                href={`/feature/${f.id}`}
                className="side-card"
                data-cursor="READ"
              >
                <div
                  className="img"
                  style={{ backgroundImage: `url(${f.image})` }}
                />
                <div className="info">
                  <div className="t">{f.kicker}</div>
                  <h4>{f.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
