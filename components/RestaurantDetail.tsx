"use client";
import Link from "next/link";
import { useRef } from "react";
import { useParallax, useReveal } from "@/lib/hooks";
import { REGIONS, RESTAURANTS, type Restaurant } from "@/lib/data";
import RestaurantCard from "./RestaurantCard";
import RestaurantShortVideos from "./RestaurantShortVideos";
import Footer from "./Footer";

export default function RestaurantDetail({ r }: { r: Restaurant }) {
  useReveal();
  const heroRef = useRef<HTMLDivElement>(null);
  useParallax(heroRef, 0.18);
  const region = REGIONS[r.region];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    r.name + " " + r.address
  )}`;
  const related = RESTAURANTS.filter(
    (x) => x.region === r.region && x.id !== r.id
  ).slice(0, 4);

  return (
    <div className="feat-page">
      <section className="feat-hero">
        <div
          className="img"
          ref={heroRef}
          style={{ backgroundImage: `url(${r.image})` }}
        />
        <div className="feat-hero-inner">
          <div>
            <div className="kicker">
              <span className="b"></span>
              <span>店舗紹介</span>
              <span>·</span>
              <span>{region.name}</span>
              {r.rating && (
                <>
                  <span>·</span>
                  <span>★ {r.rating}</span>
                </>
              )}
            </div>
            <div style={{ marginTop: 30 }} className="reveal-line">
              <div
                style={{
                  font: "500 11px/1 var(--mono)",
                  letterSpacing: ".35em",
                  color: "var(--accent)",
                }}
              >
                {r.cuisine} · {r.area}
              </div>
            </div>
          </div>

          <div>
            <h1 style={{ marginBottom: 20 }}>{r.name}</h1>
            <div className="bot">
              <p>{r.desc}</p>
              <div className="dt">
                <h6>住所</h6>
                <p>{r.address}</p>
              </div>
              <div className="dt">
                <h6>営業時間</h6>
                <p>
                  {r.hours}
                  <br />
                  定休日: {r.closed}
                </p>
              </div>
              <div className="dt">
                <h6>アクセス</h6>
                <p>{r.nearest}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="feat-body">
        {r.body && r.body.length > 0 && (
          <section className="article" style={{ paddingTop: 80 }}>
            <div className="article-head reveal">
              <div className="label">
                紹介
                <span className="big">記</span>
              </div>
              <div>
                <h2>
                  この店、<em>こういう店。</em>
                </h2>
                {r.highlights && r.highlights.length > 0 && (
                  <ul className="highlights">
                    {r.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="article-body reveal">
              {r.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              詳細
              <span className="big">店</span>
            </div>
            <div>
              <h2>
                店舗、<em>詳細。</em>
              </h2>
              <p className="sub">{r.desc}</p>
            </div>
          </div>

          <div className="detail-specs">
            <div>
              <b>営業時間</b>
              {r.hours}
            </div>
            <div>
              <b>定休日</b>
              {r.closed}
            </div>
            <div>
              <b>席数</b>
              {r.seats}
            </div>
            <div>
              <b>アクセス</b>
              {r.nearest}
            </div>
            <div className="detail-spec-wide">
              <b>住所</b>
              {r.address}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 40,
              flexWrap: "wrap",
            }}
          >
            {r.reservationUrl && (
              <a
                href={r.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sb-submit"
                style={{ padding: "16px 32px" }}
                data-cursor="BOOK"
              >
                予約する →
              </a>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chip"
              style={{ padding: "16px 24px", borderRadius: 0 }}
              data-cursor="MAP"
            >
              Google Mapで開く
            </a>
            {r.source && (
              <a
                href={r.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="chip"
                style={{ padding: "16px 24px", borderRadius: 0 }}
                data-cursor="LINK"
              >
                {r.source.label} ↗
              </a>
            )}
            <Link
              href={`/region/${r.region}`}
              className="chip"
              style={{ padding: "16px 24px", borderRadius: 0 }}
              data-cursor="ENTER"
            >
              {region.name}の他の店を見る
            </Link>
          </div>
        </section>

        <section className="article">
          <div className="article-head reveal">
            <div className="label">
              ギャラリー
              <span className="big">写</span>
            </div>
            <div>
              <h2>
                空間と、<em>料理。</em>
              </h2>
              <p className="sub">店内・料理の写真を紹介します。</p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {r.gallery.map((img, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "4/3",
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                data-cursor="ZOOM"
              />
            ))}
          </div>
        </section>

        <RestaurantShortVideos restaurantId={r.id} />

        {related.length > 0 && (
          <section className="article" style={{ borderBottom: "none" }}>
            <div className="article-head reveal">
              <div className="label">
                関連店舗
                <span className="big">他</span>
              </div>
              <div>
                <h2>
                  {region.name}の、<em>他の名店。</em>
                </h2>
                <p className="sub">同じ地域の編集部おすすめ店。</p>
              </div>
            </div>
            <div
              className="rest-grid"
              style={{ background: "transparent", color: "inherit" }}
            >
              {related.map((rr) => (
                <RestaurantCard key={rr.id} r={rr} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
