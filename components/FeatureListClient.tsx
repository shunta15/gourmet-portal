"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Feature, RegionKey } from "@/lib/data";
import { REGIONS } from "@/lib/data";

type Props = {
  features: Feature[];
  regionMap: Record<string, RegionKey[]>;
  availableRegions: RegionKey[];
};

export default function FeatureListClient({
  features,
  regionMap,
  availableRegions,
}: Props) {
  const [region, setRegion] = useState<RegionKey | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return features.filter((f) => {
      if (region !== "all" && !(regionMap[f.id] ?? []).includes(region)) return false;
      if (!qn) return true;
      const hay = `${f.title} ${f.sub} ${f.kicker} ${f.tag} ${f.no}`.toLowerCase();
      return hay.includes(qn);
    });
  }, [features, regionMap, region, q]);

  return (
    <>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <input
          type="search"
          placeholder="キーワードで特集を検索（例：朝食、夜景、デート）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="特集記事のキーワード検索"
          style={{
            width: "100%",
            padding: "12px 16px",
            font: "400 14px/1.4 var(--body)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 6,
            color: "inherit",
          }}
        />

        <div
          role="tablist"
          aria-label="地域で絞り込む"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <FilterChip
            label={`すべて（${features.length}）`}
            active={region === "all"}
            onClick={() => setRegion("all")}
          />
          {availableRegions.map((k) => {
            const count = features.filter((f) =>
              (regionMap[f.id] ?? []).includes(k)
            ).length;
            return (
              <FilterChip
                key={k}
                label={`${REGIONS[k].name}（${count}）`}
                active={region === k}
                onClick={() => setRegion(k)}
              />
            );
          })}
        </div>

        <div style={{ font: "400 12px/1.6 var(--body)", opacity: 0.7 }}>
          {filtered.length} 件の特集記事
        </div>
      </div>

      <section className="features" style={{ paddingTop: 16 }}>
        <div className="features-carousel" style={{ flexWrap: "wrap" }}>
          {filtered.map((f) => (
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
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              opacity: 0.6,
              font: "400 14px/1.7 var(--body)",
            }}
          >
            該当する特集記事が見つかりませんでした。
            <br />
            別の地域・キーワードでお試しください。
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "8px 14px",
        font: "500 12px/1 var(--body)",
        letterSpacing: "0.04em",
        background: active ? "var(--ink, #111)" : "rgba(255,255,255,0.06)",
        color: active ? "var(--paper, #fff)" : "inherit",
        border: `1px solid ${
          active ? "var(--ink, #111)" : "rgba(255,255,255,0.2)"
        }`,
        borderRadius: 999,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {label}
    </button>
  );
}
