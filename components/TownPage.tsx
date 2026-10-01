"use client";
import Link from "next/link";
import Footer from "./Footer";
import RestaurantCard from "./RestaurantCard";
import LeafletMap from "./LeafletMap";
import { useReveal } from "@/lib/hooks";
import { sized } from "@/lib/imageUrl";
import type { RestaurantCardItem } from "@/lib/regions";

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href?: string;
  sub?: string;
}

export type TownFeatureCard = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  image: string;
};

export type TownSceneCard = TownFeatureCard & { sceneName: string };

interface TownPageProps {
  regionKey: string;
  regionName: string;
  pref: string;
  town: string;
  restaurants: RestaurantCardItem[];
  mapPoints: MapPoint[];
  /** lib/townIntros.ts の紹介文（あれば表示。無ければ掲載店数だけの簡素な導入） */
  intro?: { lede: string; facts: { k: string; v: string; source: string }[] } | null;
  /** 業態の内訳（店数の多い順） */
  cuisines: { label: string; count: number }[];
  /** 街ガイド特集（地名一致）と、この街の店の特集記事 */
  features: TownFeatureCard[];
  /** この街のシーン特集（記事があれば） */
  sceneFeatures: TownSceneCard[];
  /** 同じ地域の他の街（店数の多い順） */
  otherTowns: { town: string; count: number; href: string }[];
  /** 3店以上の街は index 対象。それ未満は noindex の「小さな街」 */
  indexable: boolean;
}

function CardGrid({ items }: { items: (TownFeatureCard & { sceneName?: string })[] }) {
  return (
    <div className="side-grid">
      {items.map((f) => (
        <Link key={f.id} href={f.href} className="side-card" data-cursor="READ">
          <div className="img">
            <img
              src={sized(f.image, 640)}
              alt={f.title}
              loading="lazy"
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="info">
            <div className="t">{f.sceneName ? `${f.sceneName} · ${f.kicker}` : f.kicker}</div>
            <h4>{f.title}</h4>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function TownPage({
  regionKey,
  regionName,
  pref,
  town,
  restaurants,
  mapPoints,
  intro,
  cuisines,
  features,
  sceneFeatures,
  otherTowns,
  indexable,
}: TownPageProps) {
  useReveal();
  const count = restaurants.length;
  const lede =
    intro?.lede ||
    `マチノワに掲載している${pref}${town}の飲食店${count}店を、一覧と地図でまとめています。店名・業態・住所・営業時間は、店舗ごとのページで確認できます。`;

  return (
    <div className="feat-page">
      <section className="scene-hero">
        <div className="scene-hero-inner">
          <div className="scene-no">街ガイド</div>
          <div
            style={{
              font: "500 11px/1 var(--mono)",
              letterSpacing: ".3em",
              color: "var(--accent)",
              marginBottom: 16,
            }}
          >
            ◎ {pref} / {regionName}
          </div>
          <h1
            style={{
              font: "600 clamp(36px, 8vw, 88px)/1.1 var(--serif)",
              letterSpacing: "-.02em",
              marginBottom: 20,
              overflowWrap: "anywhere",
            }}
          >
            {town}
          </h1>
          <p
            style={{
              font: "italic 400 clamp(15px, 2.2vw, 20px)/1.6 var(--serif)",
              color: "var(--accent)",
              marginBottom: 24,
            }}
          >
            掲載店 {count} 店
          </p>
          <p
            style={{
              maxWidth: 720,
              margin: "0 auto",
              font: "400 14px/1.9 var(--body)",
              color: "var(--ink-soft)",
              textAlign: "left",
            }}
          >
            {lede}
          </p>
          {!indexable && (
            <p
              style={{
                maxWidth: 720,
                margin: "18px auto 0",
                font: "400 12px/1.8 var(--body)",
                color: "var(--ink-soft)",
              }}
            >
              この街の掲載店はまだ少なめです。店が増え次第、紹介を充実させていきます。
            </p>
          )}
        </div>
      </section>

      <div className="feat-body">
        {intro && intro.facts.length > 0 && (
          <section className="article" style={{ paddingTop: 60, paddingBottom: 40 }}>
            <div className="article-head reveal" style={{ gridTemplateColumns: "1fr", paddingBottom: 24 }}>
              <h2>
                {town}の、<em>基本情報。</em>
              </h2>
            </div>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 160px) minmax(0, 1fr)",
                gap: "14px 24px",
                font: "400 14px/1.8 var(--body)",
                margin: 0,
              }}
            >
              {intro.facts.map((f, i) => (
                <div key={i} style={{ display: "contents" }}>
                  <dt style={{ font: "500 12px/1.8 var(--mono)", letterSpacing: ".1em", color: "var(--ink-soft)" }}>
                    {f.k}
                  </dt>
                  <dd style={{ margin: 0 }}>
                    {f.v}
                    <span style={{ display: "block", font: "400 11px/1.6 var(--body)", color: "var(--ink-soft)" }}>
                      出典: {f.source}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="article" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="article-head reveal" style={{ gridTemplateColumns: "1fr" }}>
            <h2>
              {town}の、<em>店。</em>
            </h2>
          </div>
          {cuisines.length > 0 && (
            <div className="hashtag-row" style={{ paddingTop: 0, marginBottom: 30 }}>
              {cuisines.map((c) => (
                <span key={c.label} className="hashtag">
                  {c.label}
                  <span className="count">{c.count}</span>
                </span>
              ))}
            </div>
          )}
          <div className="rest-grid rest-grid--uniform">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        </section>

        {mapPoints.length > 0 && (
          <section className="article">
            <div className="article-head reveal" style={{ gridTemplateColumns: "1fr" }}>
              <h2>
                地図で、<em>見つける。</em>
              </h2>
              <p className="sub">{mapPoints.length}軒をピンで表示</p>
            </div>
            <LeafletMap points={mapPoints} height={460} />
          </section>
        )}

        {sceneFeatures.length > 0 && (
          <section className="article">
            <div className="article-head reveal" style={{ gridTemplateColumns: "1fr" }}>
              <h2>
                シーンで、<em>選ぶ。</em>
              </h2>
              <p className="sub">{town}の店を、利用シーン別にまとめた特集です。</p>
            </div>
            <CardGrid items={sceneFeatures} />
          </section>
        )}

        {features.length > 0 && (
          <section className="article">
            <div className="article-head reveal" style={{ gridTemplateColumns: "1fr" }}>
              <h2>
                読みもの、<em>編集部から。</em>
              </h2>
              <p className="sub">{town}の店が載っている特集記事です。</p>
            </div>
            <CardGrid items={features} />
          </section>
        )}

        <section className="article" style={{ borderBottom: "none" }}>
          <div className="article-head reveal" style={{ gridTemplateColumns: "1fr" }}>
            <h2>
              {regionName}の、<em>他の街。</em>
            </h2>
          </div>
          {otherTowns.length > 0 && (
            <div className="hashtag-row" style={{ paddingTop: 0, borderBottom: "none" }}>
              {otherTowns.map((t) => (
                <Link key={t.town} href={t.href} className="hashtag" data-cursor="ENTER">
                  {t.town}
                  <span className="count">{t.count}</span>
                </Link>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <Link
              href={`/region/${regionKey}`}
              className="chip"
              style={{ display: "inline-flex", padding: "14px 22px", borderRadius: 0 }}
              data-cursor="ENTER"
            >
              {regionName}の店をすべて見る →
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
