"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy, useEffect, useMemo, useState, type FormEvent } from "react";
import { REGIONS, type RegionKey, type SearchItem } from "@/lib/regions";
import { CUISINE_GROUPS } from "@/lib/cuisineGroups";
import type { FacetExt, FacetPayload } from "@/lib/portal/facetDefs";
import SaveButton from "@/components/portal/SaveButton";
import { ShopCard } from "./ShopCard";

// 「こだわり条件で絞る」は今の /search と同じ部品（React.lazy で分ける。読み込みの間は見出しだけ）。
const SearchFacets = lazy(() => import("@/components/portal/SearchFacets"));

/**
 * 店をさがす（/search）の検索と結果（暖簾版）。今の components/SearchClient.tsx と同じ中身:
 *  - 引数 q・region・cuisine・tag（と、こだわり条件の budget・f）。入力すると結果が変わり、検索を押すと URL に載る。タグを押すと tag が入り、「×」で外れる
 *  - 絞り込み（地域・業種の語・タグ・キーワード（店名・エリア・料理・住所・紹介文・タグ））、タグの集計（多い順）、件数、0 件のときの文
 *  - 店ページのタグ（/search?tag=…）から来たときは、その絞り込みが効いた状態で出る
 * 見出しは呼び出し側のサーバーのページ。フッターは暖簾の枠が出す。店カードは暖簾の店カード（縦書きの店名＋写真。写真が無い店は布だけ）。評価の数字は出さない。
 * データはサーバーのページで必要な項目だけに絞って渡す（クライアントの束に lib/data を入れない）。image は使える写真だけ（空なら写真なし）。
 */
export default function NorenSearch({ restaurants, facets }: { restaurants: SearchItem[]; facets?: FacetPayload }) {
  const router = useRouter();
  const sp = useSearchParams();

  // こだわり条件（?budget= ?f=）だけが変わったときは、入力途中のキーワードなどを戻さない
  const spQ = sp.get("q") || "";
  const spRegion = sp.get("region") || "";
  const spCuisine = sp.get("cuisine") || "ALL";
  const spTag = sp.get("tag") || "";
  const [q, setQ] = useState(spQ);
  const [region, setRegion] = useState<string>(spRegion);
  const [cuisine, setCuisine] = useState<string>(spCuisine);
  const [tag, setTag] = useState<string>(spTag);
  useEffect(() => {
    setQ(spQ);
    setRegion(spRegion);
    setCuisine(spCuisine);
    setTag(spTag);
  }, [spQ, spRegion, spCuisine, spTag]);

  // タグの集計（店の数が多い順）
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    restaurants.forEach((r) => {
      r.tags?.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [restaurants]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (region && r.region !== region) return false;
      if (cuisine !== "ALL") {
        const group = CUISINE_GROUPS.find((g) => g.label === cuisine);
        if (group) {
          const matched = group.keywords.some((kw) => r.cuisine.includes(kw));
          if (!matched) return false;
        }
      }
      if (tag && !(r.tags || []).includes(tag)) return false;
      if (needle) {
        const hay = (r.name + r.area + r.cuisine + r.address + r.desc + (r.tags || []).join(" ")).toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, region, cuisine, tag, restaurants]);

  const buildUrl = (overrides: { q?: string; region?: string; cuisine?: string; tag?: string }) => {
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
    // こだわり条件（ON のときだけ）は、キーワードや地域を変えても保つ
    if (facets) {
      const budget = sp.get("budget");
      const f = sp.get("f");
      if (budget) params.set("budget", budget);
      if (f) params.set("f", f);
    }
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

  // 画面の組み立て。list は表示する店。ext（こだわり条件）が無ければ条件のパネルは出ない。
  // pending（こだわり条件の部品を読み込んでいる間）は、読み込み中の文だけ。入力欄・結果は出さない
  // （先に出すと、読み込みが終わって画面が入れ替わったとき、入力中の欄が作り直されてフォーカスとキャレットを失い、続きの入力が消える）
  const view = (list: SearchItem[], ext?: FacetExt, pending = false) => (
    <>
      <section className="vI-list vI-find vSc-find" aria-label="店の検索">
        <div className="vI-list-in">
          {pending ? (
            <p role="status" aria-busy="true" className="vI-empty">
              条件を読み込んでいます…
            </p>
          ) : (
            <>
              <form className="vI-form" onSubmit={onSubmit} role="search" aria-label="店をさがす">
                <div className="vI-fld">
                  <label htmlFor="vSc-region">地域</label>
                  <select id="vSc-region" value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="">すべての地域</option>
                    {Object.entries(REGIONS).map(([k, r]) => (
                      <option key={k} value={k}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="vI-fld">
                  <label htmlFor="vSc-cuisine">業種</label>
                  <select id="vSc-cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                    <option value="ALL">すべての業種</option>
                    {CUISINE_GROUPS.map((g) => (
                      <option key={g.label} value={g.label}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="vI-fld">
                  <label htmlFor="vSc-q">キーワード</label>
                  <input
                    id="vSc-q"
                    type="text"
                    placeholder="店名・エリア・料理名・タグ"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <button type="submit" className="vI-btn" data-cursor="SEARCH">
                  検索 →
                </button>
              </form>

              {tag && (
                <div className="vSc-active">
                  <span>タグ絞り込み</span>
                  <span className="vSc-chip">
                    #{tag}
                    <button type="button" onClick={clearTag} aria-label="タグを外す">
                      ×
                    </button>
                  </span>
                </div>
              )}

              {ext?.panel}

              <div className="vI-bar">
                <p className="vI-bar-c" aria-live="polite">
                  {q && <>キーワード: 「{q}」 / </>}
                  {region && <>{REGIONS[region as RegionKey]?.name} / </>}
                  {cuisine !== "ALL" && <>{cuisine} / </>}
                  {tag && <>#{tag} / </>}
                  {ext?.summary}
                  {!q && !region && cuisine === "ALL" && !tag && !ext?.active && "全件表示"}
                </p>
                <p className="vI-bar-n">
                  <em>{list.length}</em> / {restaurants.length}
                  <small>店</small>
                </p>
              </div>

              {ext?.notice}

              {list.length > 0 ? (
                <ul className="vSc-grid" aria-label="検索結果">
                  {list.map((r, i) => {
                    const t = ext?.tagsOf?.(r.id);
                    return (
                      <ShopCard
                        key={r.id}
                        s={{ id: r.id, name: r.name, cuisine: r.cuisine, area: r.area, img: r.image }}
                        tags={t?.tags}
                        tagsTotal={t?.total}
                        eager={i < 4}
                        save={<SaveButton id={r.id} name={r.name} variant="card" page="/search" />}
                      />
                    );
                  })}
                </ul>
              ) : (
                <p className="vI-empty">該当する店舗が見つかりませんでした。条件を変えてお試しください。</p>
              )}
            </>
          )}
        </div>
      </section>

      {!pending && allTags.length > 0 && (
        <section className="vN-paper vI-paper" aria-labelledby="vSc-tagcloud">
          <div className="vI-sec-in">
            <div className="vI-sh">
              <div>
                <h2 id="vSc-tagcloud" className="vF-h2d">気分から、<em>選ぶ。</em></h2>
                <p>タグから探す</p>
              </div>
            </div>
            <ul className="vI-tags">
              {allTags.map(([t, count]) => (
                <li key={t}>
                  <Link href={buildUrl({ tag: t })} className={"vI-hash" + (t === tag ? " on" : "")} data-cursor="TAG" aria-current={t === tag ? "true" : undefined}>
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

  if (!facets) return view(results);
  // 読み込みが終わるまでは、読み込み中の文だけを出す（入力欄を持たない。画面の入れ替わりで入力中の文字・フォーカスを失わないため）
  return (
    <Suspense fallback={view(results, undefined, true)}>
      <SearchFacets base={results} facets={facets} sp={sp} render={view} />
    </Suspense>
  );
}
