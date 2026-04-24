"use client";
import { useState } from "react";
import { REGIONS, RESTAURANTS, type RegionKey } from "@/lib/data";

export default function RestaurantGrid({
  region,
  onRegion,
}: {
  region: RegionKey;
  onRegion: (r: RegionKey) => void;
}) {
  const R = REGIONS[region];
  const [cuisine, setCuisine] = useState("ALL");
  const cuisines = ["ALL", ...new Set(RESTAURANTS.map((r) => r.cuisine))];
  const filtered = RESTAURANTS.filter(
    (r) => cuisine === "ALL" || r.cuisine === cuisine
  );
  return (
    <section className="restaurants">
      <div>
        <div className="section-head" style={{ padding: "0 0 40px" }}>
          <div className="no">
            <b style={{ color: "var(--accent)" }}>◎ 02</b>RESTAURANTS /
            今週の名店
          </div>
          <h2 className="reveal-line">
            <span>
              編集部の、<em>太鼓判</em>
            </span>
          </h2>
          <div
            className="lede"
            style={{ color: "rgba(244,239,227,.7)" }}
          >
            地域と業種を選んで、お店を絞り込めます。
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <div className="filter-label">◎ 地域 / REGION</div>
            <div className="chips">
              {Object.entries(REGIONS).map(([k, r]) => (
                <button
                  key={k}
                  type="button"
                  className={"chip " + (k === region ? "on" : "")}
                  onClick={() => onRegion(k as RegionKey)}
                  data-cursor="PICK"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">◎ 業種 / CUISINE</div>
            <div className="chips">
              {cuisines.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"chip " + (c === cuisine ? "on" : "")}
                  onClick={() => setCuisine(c)}
                  data-cursor="PICK"
                >
                  {c === "ALL" ? "すべて" : c.split(" / ")[1] || c}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-meta">
            <div className="fm-count">
              <em>{filtered.length}</em> / {RESTAURANTS.length} 店
            </div>
            <div className="fm-tag">
              {R.name} ·{" "}
              {cuisine === "ALL"
                ? "全業種"
                : cuisine.split(" / ")[1] || cuisine}
            </div>
          </div>
        </div>

        <div className="rest-grid">
          {filtered.map((r) => (
            <article
              key={r.id}
              className={"rest-card " + (r.shape || "")}
              data-cursor="VIEW"
            >
              <div
                className="img"
                style={{ backgroundImage: `url(${r.image})` }}
              />
              <div className="meta">
                <span>
                  #{String(r.id).padStart(2, "0")} · {r.area}
                </span>
                <span className="rating">★ {r.rating}</span>
              </div>
              <div className="body">
                <div className="cuisine">{r.cuisine}</div>
                <h4>{r.name}</h4>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="no-results">
              該当する店舗が見つかりませんでした。条件を変えてお試しください。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
