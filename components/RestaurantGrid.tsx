"use client";
import { useState } from "react";
import { REGIONS, RESTAURANTS, type RegionKey } from "@/lib/data";
import RestaurantCard from "./RestaurantCard";

type RegionFilter = RegionKey | "ALL";

export default function RestaurantGrid() {
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [cuisine, setCuisine] = useState("ALL");
  const regional =
    region === "ALL"
      ? RESTAURANTS
      : RESTAURANTS.filter((r) => r.region === region);
  const cuisines = ["ALL", ...new Set(regional.map((r) => r.cuisine))];
  const filtered = regional.filter(
    (r) => cuisine === "ALL" || r.cuisine === cuisine
  );
  const regionLabel = region === "ALL" ? "全国" : REGIONS[region].name;
  return (
    <section className="restaurants">
      <div>
        <div className="section-head" style={{ padding: "0 0 40px" }}>
          <div className="no">
            <b style={{ color: "var(--accent)" }}>◎ 02</b>今週の名店
          </div>
          <h2 className="reveal-line">
            <span>
              今週の、<em>名店</em>
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
            <div className="filter-label">◎ 地域</div>
            <div className="chips">
              <button
                type="button"
                className={"chip " + (region === "ALL" ? "on" : "")}
                onClick={() => {
                  setRegion("ALL");
                  setCuisine("ALL");
                }}
                data-cursor="PICK"
              >
                全国
              </button>
              {Object.entries(REGIONS).map(([k, r]) => (
                <button
                  key={k}
                  type="button"
                  className={"chip " + (k === region ? "on" : "")}
                  onClick={() => {
                    setRegion(k as RegionKey);
                    setCuisine("ALL");
                  }}
                  data-cursor="PICK"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">◎ 業種</div>
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
              <em>{filtered.length}</em> / {regional.length} 店
            </div>
            <div className="fm-tag">
              {regionLabel} ·{" "}
              {cuisine === "ALL"
                ? "全業種"
                : cuisine.split(" / ")[1] || cuisine}
            </div>
          </div>
        </div>

        <div className="rest-grid">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} r={r} />
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
