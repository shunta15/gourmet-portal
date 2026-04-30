"use client";
import Link from "next/link";
import { useMemo } from "react";
import Footer from "./Footer";
import RestaurantCard from "./RestaurantCard";
import { useReveal } from "@/lib/hooks";
import { RESTAURANTS } from "@/lib/data";
import { SCENES, type Scene } from "@/lib/scenes";

export default function SceneHub({ scene }: { scene: Scene }) {
  useReveal();

  const matched = useMemo(
    () =>
      RESTAURANTS.filter((r) =>
        scene.matchTags.some((t) => (r.tags || []).includes(t))
      ),
    [scene]
  );

  const otherScenes = SCENES.filter((s) => s.slug !== scene.slug);
  const sceneNo = SCENES.findIndex((s) => s.slug === scene.slug) + 1;

  return (
    <div className="feat-page">
      <section className="scene-hero">
        <div className="scene-hero-inner">
          <div className="scene-no">
            No.{String(sceneNo).padStart(2, "0")}
          </div>
          <div
            style={{
              font: "500 11px/1 var(--mono)",
              letterSpacing: ".3em",
              color: "var(--accent)",
              marginBottom: 16,
            }}
          >
            ◎ シーン / {scene.title}
          </div>
          <h1
            style={{
              font: "600 clamp(40px, 8vw, 96px)/1 var(--serif)",
              letterSpacing: "-.02em",
              marginBottom: 20,
            }}
          >
            {scene.tagline}
          </h1>
          <p
            style={{
              font: "italic 400 clamp(16px, 2.4vw, 22px)/1.6 var(--serif)",
              color: "var(--accent)",
              marginBottom: 24,
            }}
          >
            {scene.subtitle}
          </p>
          <p
            style={{
              maxWidth: 720,
              margin: "0 auto",
              font: "400 14px/1.9 var(--body)",
              color: "var(--ink-soft)",
            }}
          >
            {scene.intro}
          </p>
        </div>
      </section>

      <div className="feat-body">
        <section
          className="article"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >
          <div
            className="article-head reveal"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <h2>
              この気分で、<em>選ぶなら。</em>
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              padding: "0 0 30px",
              borderBottom: "1px solid var(--line)",
              marginBottom: 30,
            }}
          >
            <span
              style={{
                font: "500 11px/1 var(--mono)",
                letterSpacing: ".25em",
                color: "var(--ink-soft)",
                alignSelf: "center",
              }}
            >
              絞り込みタグ:
            </span>
            {scene.matchTags.map((t) => (
              <Link
                key={t}
                href={`/search?tag=${encodeURIComponent(t)}`}
                className="hashtag"
                data-cursor="TAG"
              >
                #{t}
              </Link>
            ))}
          </div>

          {matched.length > 0 ? (
            <div className="rest-grid">
              {matched.map((r) => (
                <RestaurantCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "80px 40px",
                textAlign: "center",
                font: "italic 400 18px/1.6 var(--serif)",
                color: "var(--ink-soft)",
                border: "1px dashed var(--line)",
              }}
            >
              この条件にあった店舗を、編集部で増やしている最中です。
              <br />
              他のシーンもチェックしてみてください。
            </div>
          )}

          <div
            style={{
              marginTop: 40,
              padding: "30px 0",
              borderTop: "1px solid var(--line)",
              fontSize: 14,
              color: "var(--ink-soft)",
            }}
          >
            <strong style={{ color: "var(--ink)" }}>
              {matched.length} 軒
            </strong>{" "}
            / {RESTAURANTS.length} 店中
          </div>
        </section>

        <section className="article" style={{ borderBottom: "none" }}>
          <div
            className="article-head reveal"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <h2>
              他の気分で、<em>探す。</em>
            </h2>
          </div>
          <div className="scene-list">
            {otherScenes.map((s) => {
              const no = SCENES.findIndex((x) => x.slug === s.slug) + 1;
              return (
                <Link
                  key={s.slug}
                  href={`/scene/${s.slug}`}
                  className="scene-card"
                  data-cursor="ENTER"
                >
                  <div className="no">
                    {String(no).padStart(2, "0")}
                  </div>
                  <div className="info">
                    <div className="name">{s.name}</div>
                    <div className="tagline">{s.tagline}</div>
                  </div>
                  <div className="arrow">→</div>
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
