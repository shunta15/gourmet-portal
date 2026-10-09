"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { REGIONS, type RegionKey } from "@/lib/regions";
import type { FeatureCardItem } from "@/lib/portal/noren/featureCard";
import { CardGrid } from "./FeatureList";

export type SearchFeature = FeatureCardItem & { regions: string[] };

/**
 * 特集を探す（/feature/search）の検索と結果（暖簾版）。検索の引数・絞り込み・結果の出し方は、今の components/FeatureSearchClient.tsx と同じ
 * （q・region・tag。入力するたびに結果が変わり、検索を押すと URL に載る）。見出しは呼び出し側のサーバーのページ。
 * データはサーバーのページで必要な項目だけに絞って渡す（クライアントの束に lib/data を入れない）。
 */
export default function FeatureSearch({ features }: { features: SearchFeature[] }) {
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

  // タグの集計（Feature.tag）
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
      if (region && !f.regions.includes(region)) return false;
      if (tag !== "ALL" && f.tag !== tag) return false;
      if (needle) {
        const hay = `${f.title} ${f.sub} ${f.kicker} ${f.tag} ${f.no}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [features, q, region, tag]);

  const buildUrl = (overrides: { q?: string; region?: string; tag?: string }) => {
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
    <>
      <section className="vI-list vI-find" aria-label="特集の検索">
        <div className="vI-list-in">
          <form className="vI-form" onSubmit={onSubmit} role="search" aria-label="特集を探す">
            <div className="vI-fld">
              <label htmlFor="vI-region">地域</label>
              <select id="vI-region" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">すべての地域</option>
                {Object.entries(REGIONS).map(([k, r]) => (
                  <option key={k} value={k}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="vI-fld">
              <label htmlFor="vI-tag">テーマ</label>
              <select id="vI-tag" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="ALL">すべてのテーマ</option>
                {allTags.map(([t]) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="vI-fld">
              <label htmlFor="vI-q">キーワード</label>
              <input
                id="vI-q"
                type="text"
                placeholder="特集名・エリア・気分（例：朝食、夜景、デート）"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button type="submit" className="vI-btn" data-cursor="SEARCH">
              検索 →
            </button>
          </form>

          <div className="vI-bar">
            <p className="vI-bar-c" aria-live="polite">
              {q && <>キーワード: 「{q}」 / </>}
              {region && <>{REGIONS[region as RegionKey]?.name} / </>}
              {tag !== "ALL" && <>{tag} / </>}
              {!q && !region && tag === "ALL" && "全件表示"}
            </p>
            <p className="vI-bar-n">
              <em>{results.length}</em> / {features.length}
              <small>本</small>
            </p>
          </div>

          {results.length > 0 ? (
            <CardGrid items={results} label="検索結果" />
          ) : (
            <p className="vI-empty">該当する特集記事が見つかりませんでした。条件を変えてお試しください。</p>
          )}
        </div>
      </section>

      {allTags.length > 0 && (
        <section className="vI-sec vI-sec--latest" aria-labelledby="vI-tagcloud">
          <div className="vI-sec-in">
            <div className="vI-sh">
              <div>
                <h2 id="vI-tagcloud" className="vF-h2d">気分から、<em>選ぶ。</em></h2>
                <p>テーマから探す</p>
              </div>
            </div>
            <ul className="vI-tags">
              {allTags.map(([t, count]) => (
                <li key={t}>
                  <Link href={buildUrl({ tag: t })} className={"vI-hash" + (t === tag ? " on" : "")} data-cursor="TAG">
                    #{t}
                    <span className="c">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
