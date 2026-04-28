"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, type FormEvent } from "react";
import Footer from "./Footer";
import RestaurantCard from "./RestaurantCard";
import { REGIONS, RESTAURANTS, type RegionKey } from "@/lib/data";

export default function SearchClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("");
  const [cuisine, setCuisine] = useState<string>("ALL");
  const [tag, setTag] = useState<string>("");

  useEffect(() => {
    setQ(sp.get("q") || "");
    setRegion(sp.get("region") || "");
    setCuisine(sp.get("cuisine") || "ALL");
    setTag(sp.get("tag") || "");
  }, [sp]);

  const cuisines = useMemo(
    () => ["ALL", ...new Set(RESTAURANTS.map((r) => r.cuisine))],
    []
  );

  // Aggregate all unique tags for the cloud
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    RESTAURANTS.forEach((r) => {
      r.tags?.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return RESTAURANTS.filter((r) => {
      if (region && r.region !== region) return false;
      if (cuisine !== "ALL" && r.cuisine !== cuisine) return false;
      if (tag && !(r.tags || []).includes(tag)) return false;
      if (needle) {
        const hay = (
          r.name +
          r.area +
          r.cuisine +
          r.address +
          r.desc +
          (r.tags || []).join(" ")
        ).toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, region, cuisine, tag]);

  const buildUrl = (overrides: {
    q?: string;
    region?: string;
    cuisine?: string;
    tag?: string;
  }) => {
    const next = {
      q: overrides.q !== undefined ? overrides.q : q,
      region: overrides.region !== undefined ? overrides.region : region,
      cuisine: overrides.cuisine !== undefined ? overrides.cuisine : cuisine,
      tag: overrides.tag !== undefined ? overrides.tag : tag,
    };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.region) params.set("region", next.region);
    if (next.cuisine && next.cuisine !== "ALL") params.set("cuisine", next.cuisine);
    if (next.tag) params.set("tag", next.tag);
    return `/search${params.toString() ? "?" + params.toString() : ""}`;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({}));
  };

  const clearTag = () => {
    setTag("");
    router.push(buildUrl({ tag: "" }));
  };

  return (
    <div className="feat-page">
      <section style={{ padding: "140px 40px 40px", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          <div
            style={{
              font: "500 11px/1 var(--mono)",
              letterSpacing: ".3em",
              color: "var(--accent)",
              marginBottom: 16,
            }}
          >
            ◎ 検索結果
          </div>
          <h1
            style={{
              font: "600 clamp(40px,6vw,80px)/0.95 var(--serif)",
              letterSpacing: "-.02em",
              marginBottom: 30,
            }}
          >
            食べたいお店を、<em style={{ color: "var(--accent)" }}>見つける。</em>
          </h1>

          <form
            className="search-bar"
            onSubmit={onSubmit}
            style={{ marginBottom: 24 }}
          >
            <div className="sb-field sb-field-region">
              <label>地域</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">すべての地域</option>
                {Object.entries(REGIONS).map(([k, r]) => (
                  <option key={k} value={k}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sb-field sb-field-cuisine">
              <label>業種</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              >
                {cuisines.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "すべての業種" : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sb-field sb-field-q">
              <label>キーワード</label>
              <input
                type="text"
                placeholder="店名・エリア・料理名・タグ"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button type="submit" className="sb-submit" data-cursor="SEARCH">
              <span>検索</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12M12 6l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </form>

          {tag && (
            <div className="active-tag-bar">
              <span className="label">タグ絞り込み:</span>
              <span className="active-tag">
                #{tag}
                <button
                  type="button"
                  onClick={clearTag}
                  aria-label="タグを外す"
                >
                  ×
                </button>
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderTop: "1px solid var(--line)",
              paddingTop: 20,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div
              style={{
                font: "500 11px/1 var(--mono)",
                letterSpacing: ".25em",
                color: "var(--ink-soft)",
              }}
            >
              {q && <>キーワード: 「{q}」 / </>}
              {region && <>{REGIONS[region as RegionKey]?.name} / </>}
              {cuisine !== "ALL" && <>{cuisine} / </>}
              {tag && <>#{tag} / </>}
              {!q && !region && cuisine === "ALL" && !tag && "全件表示"}
            </div>
            <div
              style={{
                font: "500 32px/1 var(--serif)",
                letterSpacing: "-.02em",
              }}
            >
              <em style={{ color: "var(--accent)", fontSize: 48 }}>
                {results.length}
              </em>{" "}
              / {RESTAURANTS.length} 店
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 40px 120px" }}>
        {results.length > 0 ? (
          <div className="rest-grid">
            {results.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div
            className="no-results"
            style={{
              padding: "120px 40px",
              textAlign: "center",
              font: "italic 400 18px/1.6 var(--serif)",
              color: "var(--ink-soft)",
              border: "1px dashed var(--line)",
            }}
          >
            該当する店舗が見つかりませんでした。条件を変えてお試しください。
          </div>
        )}
      </section>

      {allTags.length > 0 && (
        <section
          style={{
            padding: "60px 40px 120px",
            borderTop: "1px solid var(--line)",
            background: "var(--bg-2)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                font: "500 11px/1 var(--mono)",
                letterSpacing: ".3em",
                color: "var(--accent)",
                marginBottom: 16,
              }}
            >
              ◎ タグから探す
            </div>
            <div
              style={{
                font: "500 clamp(28px,4vw,48px)/1 var(--serif)",
                letterSpacing: "-.02em",
                marginBottom: 30,
              }}
            >
              気分から、<em style={{ color: "var(--accent)" }}>選ぶ。</em>
            </div>
            <div className="tag-cloud">
              {allTags.map(([t, count]) => (
                <Link
                  key={t}
                  href={buildUrl({ tag: t })}
                  className={"hashtag " + (t === tag ? "active" : "")}
                  data-cursor="TAG"
                >
                  #{t}
                  <span className="count">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
