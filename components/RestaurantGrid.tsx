"use client";
import Link from "next/link";
import { useState } from "react";
import { REGIONS, RESTAURANTS, type RegionKey } from "@/lib/data";
import { CUISINE_GROUPS } from "@/lib/cuisineGroups";
import RestaurantCard from "./RestaurantCard";

type RegionFilter = RegionKey | "ALL";
const PAGE_SIZE = 12;

export default function RestaurantGrid() {
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [cuisine, setCuisine] = useState("ALL");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const resetVisible = () => setVisible(PAGE_SIZE);
  const regional =
    region === "ALL"
      ? RESTAURANTS
      : RESTAURANTS.filter((r) => r.region === region);
  const filtered = regional.filter((r) => {
    if (cuisine === "ALL") return true;
    const group = CUISINE_GROUPS.find((g) => g.label === cuisine);
    if (!group) return false;
    return group.keywords.some((kw) => r.cuisine.includes(kw));
  });
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

        <div className="fs">
          {/* 地域行 */}
          <div className="fs-row">
            <span className="fs-lbl">地域</span>
            <div className="fs-chips">
              <button
                type="button"
                className={"fs-chip " + (region === "ALL" ? "on" : "")}
                onClick={() => { setRegion("ALL"); setCuisine("ALL"); resetVisible(); }}
                data-cursor="PICK"
              >
                全国
              </button>
              {Object.entries(REGIONS).map(([k, r]) => (
                <button
                  key={k}
                  type="button"
                  className={"fs-chip " + (k === region ? "on" : "")}
                  onClick={() => { setRegion(k as RegionKey); setCuisine("ALL"); resetVisible(); }}
                  data-cursor="PICK"
                >
                  {r.name}
                </button>
              ))}
            </div>
            <div className="fs-count">
              <em>{filtered.length}</em>
              <span>/ {regional.length} 店</span>
            </div>
          </div>

          {/* 業種行 */}
          <div className="fs-row">
            <span className="fs-lbl">業種</span>
            <div className="fs-tiles">
              <button
                type="button"
                className={"fs-tile " + (cuisine === "ALL" ? "on" : "")}
                onClick={() => { setCuisine("ALL"); resetVisible(); }}
                data-cursor="PICK"
              >
                すべて
              </button>
              {CUISINE_GROUPS.map((g) => (
                <button
                  key={g.label}
                  type="button"
                  className={"fs-tile " + (g.label === cuisine ? "on" : "")}
                  onClick={() => { setCuisine(g.label); resetVisible(); }}
                  data-cursor="PICK"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rest-grid">
          {filtered.slice(0, visible).map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
          {filtered.length === 0 && (
            <div className="no-results">
              該当する店舗が見つかりませんでした。条件を変えてお試しください。
            </div>
          )}
        </div>

        {filtered.length > visible && (
          <div className="more-bar">
            <button
              type="button"
              className="more-btn"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              data-cursor="MORE"
            >
              さらに読み込む
              <span>残り {filtered.length - visible} 店</span>
            </button>
            <Link href="/search" className="more-link" data-cursor="SEARCH">
              絞り込んで探す →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
