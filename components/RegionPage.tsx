"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Marquee from "./Marquee";
import Footer from "./Footer";
import RestaurantCard from "./RestaurantCard";
import LeafletMap from "./LeafletMap";
import { sized } from "@/lib/imageUrl";
import { REGIONS } from "@/lib/regions";
import type { RegionKey, RestaurantCardItem, Feature, Stat } from "@/lib/regions";
import { useParallax, useReveal } from "@/lib/hooks";

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href?: string;
  sub?: string;
}

interface RegionPageProps {
  regionKey: RegionKey;
  restaurants: RestaurantCardItem[];
  features: Feature[];
  stats: Stat[];
  mapPoints?: MapPoint[];
  /** 街（市区町村）ごとの店数。店数の多い順。街ページ（/region/<key>/<街>）への導線 */
  towns?: { town: string; count: number; href: string }[];
  /** この地域のシーン特集（記事があれば） */
  sceneFeatures?: { id: string; href: string; kicker: string; title: string; image: string; sceneName: string }[];
}

export default function RegionPage({
  regionKey,
  restaurants,
  features,
  stats,
  mapPoints = [],
  towns = [],
  sceneFeatures = [],
}: RegionPageProps) {
  useReveal();
  const heroRef = useRef<HTMLDivElement>(null);
  useParallax(heroRef, 0.18);
  const r = REGIONS[regionKey];

  useEffect(() => {
    document.body.setAttribute("data-region", regionKey);
  }, [regionKey]);

  return (
    <div className="feat-page">
      <section className="feat-hero">
        <div
          className="img"
          ref={heroRef}
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundImage: `url("${r.heroImages[0]}")`,
          }}
        >
          <img
            src={sized(r.heroImages[0], 1600)}
            alt={r.name}
            fetchPriority="high"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="feat-hero-inner">
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>地域別ポータル</span>
              <span>·</span>
              <span>{r.name}</span>
              <span>·</span>
              <span>2026年 春号</span>
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
                <p>{stats[0].n} 店</p>
              </div>
              <div className="dt">
                <h6>エリア</h6>
                <p>{stats[1].n}</p>
              </div>
              <div className="dt">
                <h6>★ 評価</h6>
                <p>{stats[3].n}</p>
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
          r.tagline,
          "編集部厳選",
          "2026年 春号",
        ]}
      />

      <div className="feat-body">
        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              店舗一覧
              <span className="big">{stats[0].n}</span>
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

        {towns.length > 0 && (
          <section className="article">
            <div className="article-head reveal">
              <div className="label">
                街から探す
                <span className="big">街</span>
              </div>
              <div>
                <h2>
                  街から、<em>探す。</em>
                </h2>
                <p className="sub">
                  掲載店のある{towns.length}の街を、店数の多い順に並べました。
                </p>
              </div>
            </div>
            <div className="hashtag-row" style={{ paddingTop: 0, borderBottom: "none" }}>
              {towns.map((t) => (
                <Link key={t.town} href={t.href} className="hashtag" data-cursor="ENTER">
                  {t.town}
                  <span className="count">{t.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sceneFeatures.length > 0 && (
          <section className="article">
            <div className="article-head reveal">
              <div className="label">
                シーン特集
                <span className="big">選</span>
              </div>
              <div>
                <h2>
                  シーンで、<em>選ぶ。</em>
                </h2>
                <p className="sub">{r.name}の店を、利用シーン別にまとめた特集です。</p>
              </div>
            </div>
            <div className="side-grid">
              {sceneFeatures.map((f) => (
                <Link key={f.id} href={f.href} className="side-card" data-cursor="READ">
                  <div className="img">
                    <img
                      src={sized(f.image, 640)}
                      alt={f.title}
                      loading="lazy"
                      decoding="async"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="info">
                    <div className="t">{f.sceneName} · {f.kicker}</div>
                    <h4>{f.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {mapPoints.length > 0 && (
          <section className="article">
            <div className="article-head reveal">
              <div className="label">
                地図で
                <span className="big">探</span>
              </div>
              <div>
                <h2>
                  地図で、<em>見つける。</em>
                </h2>
                <p className="sub">{mapPoints.length}軒をピンで表示</p>
              </div>
            </div>

            <LeafletMap points={mapPoints} height={460} />
          </section>
        )}

        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              他地域へ
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
              .map(([k, rr], i) => {
                const imgUrl = sized(rr.heroImages[0], 640);
                return (
                <Link
                  key={k}
                  href={`/region/${k}`}
                  className="region-card"
                  data-cursor="ENTER"
                >
                  <div className="img">
                    <img
                      src={imgUrl}
                      alt={rr.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="rc-body">
                    <div className="rc-no">
                      地域 / {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3>{rr.name}</h3>
                    <p className="rc-tag">
                      <em>{rr.tagline}</em>
                    </p>
                  </div>
                </Link>
                );
              })}
          </div>
        </section>

        <section className="article" style={{ borderBottom: "none" }}>
          <div className="article-head reveal">
            <div className="label">
              特集記事
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
            {features.slice(0, 4).map((f) => {
              const imgUrl = sized(f.image, 640);
              return (
              <Link
                key={f.id}
                href={`/feature/${f.id}`}
                className="side-card"
                data-cursor="READ"
              >
                <div className="img">
                  <img
                    src={imgUrl}
                    alt={f.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="info">
                  <div className="t">{f.kicker}</div>
                  <h4>{f.title}</h4>
                </div>
              </Link>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
