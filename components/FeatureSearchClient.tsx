"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, type FormEvent } from "react";
import Footer from "./Footer";
import { FEATURES, REGIONS, type Feature, type RegionKey } from "@/lib/data";
import { getFeatureRegions } from "@/lib/featureRegions";

type FeatureWithRegions = Feature & { regions: RegionKey[] };

export default function FeatureSearchClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("");
  const [tag, setTag] = useState<string>("ALL");

  useEffect(() => {
    setQ(sp.get("q") || "");
    setRegion(sp.get("region") || "");
    setTag(sp.get("tag") || "ALL");
  }, [sp]);

  // 各 Feature に推定 region を付与
  const features: FeatureWithRegions[] = useMemo(
    () =>
      FEATURES.map((f) => ({
        ...f,
        regions: getFeatureRegions(f.id),
      })),
    []
  );

  // タグの集計（FEATURES.tag を使う）
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    features.forEach((f) => {
      if (f.tag) counts.set(f.tag, (counts.get(f.tag) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [features]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return features.filter((f) => {
      if (region && !f.regions.includes(region as RegionKey)) return false;
      if (tag !== "ALL" && f.tag !== tag) return false;
      if (needle) {
        const hay = `${f.title} ${f.sub} ${f.kicker} ${f.tag} ${f.no}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [features, q, region, tag]);

  const buildUrl = (overrides: {
    q?: string;
    region?: string;
    tag?: string;
  }) => {
    const next = {
      q: overrides.q !== undefined ? overrides.q : q,
      region: overrides.region !== undefined ? overrides.region : region,
      tag: overrides.tag !== undefined ? overrides.tag : tag,
    };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.region) params.set("region", next.region);
    if (next.tag && next.tag !== "ALL") params.set("tag", next.tag);
    return `/feature/search${params.toString() ? "?" + params.toString() : ""}`;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({}));
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
            ◎ 特集を探す
          </div>
          <h1
            style={{
              font: "600 clamp(40px,6vw,80px)/0.95 var(--serif)",
              letterSpacing: "-.02em",
              marginBottom: 30,
            }}
          >
            読みたい特集を、<em style={{ color: "var(--accent)" }}>見つける。</em>
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
              <label>テーマ</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="ALL">すべてのテーマ</option>
                {allTags.map(([t]) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sb-field sb-field-q">
              <label>キーワード</label>
              <input
                type="text"
                placeholder="特集名・エリア・気分（例：朝食、夜景、デート）"
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
              {tag !== "ALL" && <>{tag} / </>}
              {!q && !region && tag === "ALL" && "全件表示"}
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
              / {features.length} 本
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 40px 120px" }}>
        {results.length > 0 ? (
          <div className="features-carousel" style={{ flexWrap: "wrap", justifyContent: "center" }}>
            {results.map((f) => (
              <Link
                key={f.id}
                href={`/feature/${f.id}`}
                className="feature-card"
                data-cursor="READ"
                style={{ flex: "0 0 min(420px, 90vw)" }}
              >
                <div
                  className="img"
                  style={{ backgroundImage: `url(${f.image})` }}
                />
                <div className="big-no">{f.no}</div>
                <div className="meta">
                  <span className="tag">{f.tag}</span>
                  <span>{f.kicker}</span>
                </div>
                <div className="body">
                  <div className="kicker">特集 / {f.no}</div>
                  <h3>{f.title}</h3>
                  <p>{f.sub}</p>
                  <span className="read">記事を読む →</span>
                </div>
              </Link>
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
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            該当する特集記事が見つかりませんでした。条件を変えてお試しください。
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
              ◎ テーマから探す
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
