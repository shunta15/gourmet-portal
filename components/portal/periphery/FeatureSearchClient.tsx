"use client";
/**
 * 特集を探す（/feature/search）の検索と結果（周りのページの新しい見た目）。検索の引数・絞り込み・結果の出し方は components/portal/noren/FeatureSearch.tsx と同じ
 * （q・region・tag。入力するたびに結果が変わり、検索を押すと URL に載る。地域の選択肢・テーマの集計・0 件の文も同じ。変えるときは両方）。見た目だけ、特集の一覧 /feature と同じ世界。
 * データはサーバーのページで必要な項目だけに絞って渡す（クライアントの束に lib/data を入れない）。
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { REGIONS, type RegionKey } from "@/lib/regions";
import { RELEASE_REST } from "@/lib/portal/noren/release";
import { FeatureGridP, type FeatureItemP } from "./FeatureCardP";
import { Sec } from "./parts";

export default function FeatureSearchClient({ features }: { features: FeatureItemP[] }) {
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

  // 地域の選択肢は、特集が 1 本以上ある地域だけ（選ぶと 0 件になる地域を出さない）。並びは REGIONS の順
  const regionOptions = useMemo(() => {
    const has = new Set<string>();
    features.forEach((f) => f.regions.forEach((k) => has.add(k)));
    return RELEASE_REST ? Object.entries(REGIONS).filter(([k]) => has.has(k)) : Object.entries(REGIONS);
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
      <section className="rp-shelf pp-fsec" aria-label="特集の検索">
        <form className="pp-fs" onSubmit={onSubmit} role="search" aria-label="特集を探す">
          <div className="pp-fld">
            <label htmlFor="pp-fs-region">地域</label>
            <select id="pp-fs-region" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">すべての地域</option>
              {regionOptions.map(([k, r]) => (
                <option key={k} value={k}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="pp-fld">
            <label htmlFor="pp-fs-tag">テーマ</label>
            <select id="pp-fs-tag" value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="ALL">すべてのテーマ</option>
              {allTags.map(([t]) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="pp-fld pp-fld--q">
            <label htmlFor="pp-fs-q">キーワード</label>
            <input
              id="pp-fs-q"
              type="text"
              placeholder="特集名・エリア・気分（例：朝食、夜景、デート）"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button type="submit" className="pf-btn pp-fs__btn">
            検索 →
          </button>
        </form>

        <div className="pp-bar">
          <p className="pp-bar-c" aria-live="polite">
            {q && <>キーワード: 「{q}」 / </>}
            {region && <>{REGIONS[region as RegionKey]?.name} / </>}
            {tag !== "ALL" && <>{tag} / </>}
            {!q && !region && tag === "ALL" && "全件表示"}
          </p>
          <p className="pp-bar-n">
            <em>{results.length}</em> / {features.length}
            <small>本</small>
          </p>
        </div>

        {results.length > 0 ? (
          <FeatureGridP items={results} label="検索結果" />
        ) : (
          <p className="pp-empty-note">該当する特集記事が見つかりませんでした。条件を変えてお試しください。</p>
        )}
      </section>

      {allTags.length > 0 && (
        <Sec
          id="pp-fs-tags"
          mark="気分から"
          title={
            <>
              気分から、<em>選ぶ。</em>
            </>
          }
          note="テーマから探す"
          k={1}
          brushReveal={false}
        >
          <ul className="pp-tags">
            {allTags.map(([t, count]) => (
              <li key={t}>
                <Link href={buildUrl({ tag: t })} className="pp-chip" aria-current={t === tag ? "true" : undefined}>
                  #{t}
                  <small>{count}</small>
                </Link>
              </li>
            ))}
          </ul>
        </Sec>
      )}
    </>
  );
}
