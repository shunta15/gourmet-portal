"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { REGIONS, RESTAURANTS, type RegionKey } from "@/lib/data";

export default function SearchBar({
  region,
  onRegion,
}: {
  region: RegionKey;
  onRegion: (r: RegionKey) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("ALL");
  const cuisines = ["ALL", ...new Set(RESTAURANTS.map((r) => r.cuisine))];

  const navigate = (overrideQ?: string) => {
    const params = new URLSearchParams();
    const finalQ = overrideQ ?? q;
    if (finalQ) params.set("q", finalQ);
    if (region) params.set("region", region);
    if (cuisine && cuisine !== "ALL") params.set("cuisine", cuisine);
    router.push(`/search?${params.toString()}`);
  };

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    navigate();
  };

  const onTagClick = (t: string) => {
    setQ(t);
    navigate(t);
  };

  return (
    <section className="search-bar-wrap">
      <div className="sb-head">
        <div className="sb-no">◎ SEARCH / さがす</div>
        <h3 className="sb-title">
          <span>食べたいお店を、</span>
          <em>見つける。</em>
        </h3>
      </div>
      <form className="search-bar" onSubmit={submit}>
        <div className="sb-field sb-field-region">
          <label>地域</label>
          <select
            value={region}
            onChange={(e) => onRegion(e.target.value as RegionKey)}
          >
            {Object.entries(REGIONS).map(([k, r]) => (
              <option key={k} value={k}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sb-field sb-field-cuisine">
          <label>業種</label>
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
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
            placeholder="店名・エリア・料理名"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button type="submit" className="sb-submit" data-cursor="SEARCH">
          <span>検索する</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10h12M12 6l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </form>
      <div className="sb-tags">
        <span className="sb-tags-label">人気のキーワード:</span>
        {["旅の夜", "焼肉", "デート", "接待", "一人飲み", "深夜営業"].map(
          (t) => (
            <button
              key={t}
              type="button"
              className="sb-tag"
              onClick={() => onTagClick(t)}
            >
              #{t}
            </button>
          )
        )}
      </div>
    </section>
  );
}
