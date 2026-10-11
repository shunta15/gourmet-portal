"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy, useEffect, useMemo, useState, type FormEvent } from "react";
import { REGIONS, type RegionKey, type SearchItem } from "@/lib/regions";
import { BROAD_GROUPS, isLegacyCuisineLabel, matchesCuisineFilter } from "@/lib/cuisineBroad";
import type { FacetExt, FacetPayload } from "@/lib/portal/facetDefs";
import SaveButton from "@/components/portal/SaveButton";
import { ShopCard } from "./ShopCard";
import { GenreCards, RegionChips, SceneChips } from "./FindParts";
import { shopInScene } from "@/lib/portal/noren/sceneMatch";
import type { OpenSearchData } from "@/lib/portal/noren/openSearch";
import "./opensearch.css";

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
export default function NorenSearch({
  restaurants,
  facets,
  hub,
  sceneDefs,
}: {
  restaurants: SearchItem[];
  facets?: FacetPayload;
  /** 絞り込みが何も無いときの「さがす」のトップに出す札の件数（サーバーで数える。lib/portal/noren/openSearch.ts） */
  hub: OpenSearchData;
  /** 利用シーンの定義（?scene=<slug> の絞り込み用。matchTags は lib/scenes.ts のもの。判定は lib/portal/noren/sceneMatch.ts の shopInScene） */
  sceneDefs: { slug: string; name: string; matchTags: string[] }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // こだわり条件（?budget= ?f=）だけが変わったときは、入力途中のキーワードなどを戻さない
  const spQ = sp.get("q") || "";
  const spRegion = sp.get("region") || "";
  const spCuisine = sp.get("cuisine") || "ALL";
  const spTag = sp.get("tag") || "";
  const spScene = sp.get("scene") || "";
  const [q, setQ] = useState(spQ);
  const [region, setRegion] = useState<string>(spRegion);
  const [cuisine, setCuisine] = useState<string>(spCuisine);
  const [tag, setTag] = useState<string>(spTag);
  const [scene, setScene] = useState<string>(spScene);
  useEffect(() => {
    setQ(spQ);
    setRegion(spRegion);
    setCuisine(spCuisine);
    setTag(spTag);
    setScene(spScene);
  }, [spQ, spRegion, spCuisine, spTag, spScene]);

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
    // 利用シーン（?scene=<slug>）。知らない slug は絞り込まない（シーンのページと同じ判定 shopInScene）
    const sceneDef = scene ? sceneDefs.find((x) => x.slug === scene) : undefined;
    return restaurants.filter((r) => {
      if (region && r.region !== region) return false;
      if (cuisine !== "ALL" && !matchesCuisineFilter(cuisine, r)) return false;
      if (tag && !(r.tags || []).includes(tag)) return false;
      if (sceneDef && !shopInScene(sceneDef.matchTags, r.tags)) return false;
      if (needle) {
        const hay = (r.name + r.area + r.cuisine + r.address + r.desc + (r.tags || []).join(" ")).toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, region, cuisine, tag, scene, sceneDefs, restaurants]);

  const buildUrl = (overrides: { q?: string; region?: string; cuisine?: string; tag?: string; scene?: string }) => {
    const next = {
      q: overrides.q !== undefined ? overrides.q : q,
      region: overrides.region !== undefined ? overrides.region : region,
      cuisine: overrides.cuisine !== undefined ? overrides.cuisine : cuisine,
      tag: overrides.tag !== undefined ? overrides.tag : tag,
      scene: overrides.scene !== undefined ? overrides.scene : scene,
    };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.region) params.set("region", next.region);
    if (next.cuisine && next.cuisine !== "ALL") params.set("cuisine", next.cuisine);
    if (next.tag) params.set("tag", next.tag);
    if (next.scene) params.set("scene", next.scene);
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
  const view = (list: SearchItem[], ext?: FacetExt, pending = false) => {
    // 「さがす」のトップ（絞り込みが何も無い）か、結果か。URL に載っている条件（spXxx）で決める（入力中の文字では切り替えない）
    const applied = !!spQ || !!spRegion || spCuisine !== "ALL" || !!spTag || !!spScene || !!ext?.active;
    const isHub = !applied;
    // エリアだけで絞っているときは、その地域のページへのリンクを出す
    const regionOnly = !!spRegion && spRegion in REGIONS && !spQ && spCuisine === "ALL" && !spTag && !spScene && !ext?.active;
    return (
    <>
      <section className="vI-list vI-find vSc-find" aria-label="店の検索">
        <div className="vI-list-in">
          {pending ? (
            <p role="status" aria-busy="true" className="vI-empty">
              条件を読み込んでいます…
            </p>
          ) : (
            <>
              {/* 検索の箱。絞り込みが何も無いとき（isHub）はキーワードだけ。絞り込みがあるときは、キーワード・エリア・業種・利用シーンの帯。
                  同じ form・同じ入力欄のまま中身だけ替わるので、入力中のフォーカスは失われない */}
              <form className={`vI-form vSc-form${isHub ? " vSc-form--hub" : ""}`} onSubmit={onSubmit} role="search" aria-label="店をさがす">
                <div className="vI-fld" key="q">
                  <label htmlFor="vSc-q">キーワード</label>
                  <input
                    id="vSc-q"
                    type="text"
                    placeholder="店名・エリア・料理名・タグ"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                {!isHub && (
                  <div className="vI-fld" key="region">
                    <label htmlFor="vSc-region">エリア</label>
                    <select id="vSc-region" value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="">すべてのエリア</option>
                      {Object.entries(REGIONS).map(([k, r]) => (
                        <option key={k} value={k}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!isHub && (
                  <div className="vI-fld" key="cuisine">
                    <label htmlFor="vSc-cuisine">業種</label>
                    <select id="vSc-cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                      <option value="ALL">すべての業種</option>
                      {BROAD_GROUPS.map((g) => (
                        <option key={g.label} value={g.label}>
                          {g.label}
                        </option>
                      ))}
                      {/* 以前の細かい分類の名前の URL（?cuisine=居酒屋 など）で開いたときだけ、その名前を 1 つ足す（選択の表示を保つ。絞り込みは lib/cuisineBroad.ts の matchesCuisineFilter） */}
                      {isLegacyCuisineLabel(cuisine) && <option value={cuisine}>{cuisine}</option>}
                    </select>
                  </div>
                )}
                {!isHub && (
                  <div className="vI-fld" key="scene">
                    <label htmlFor="vSc-scene">利用シーン</label>
                    <select id="vSc-scene" value={scene} onChange={(e) => setScene(e.target.value)}>
                      <option value="">すべてのシーン</option>
                      {sceneDefs.map((x) => (
                        <option key={x.slug} value={x.slug}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button type="submit" className="vI-btn" data-cursor="SEARCH" key="btn">
                  {isHub ? "さがす →" : "検索 →"}
                </button>
              </form>

              {/* 絞り込みが何も無いとき: エリア → 業種 → 利用シーン の札（押すと、エリア・シーンはそのページ、業種は /search?cuisine=…） */}
              {isHub && (
                <div className="vOs vOs--embed vSc-hub">
                  <div className="vOs-in">
                    <div className="vOs-blk" id="find-area">
                      <div className="vOs-blk-h">
                        <h2 className="vOs-h3">
                          エリアから<em>さがす。</em>
                        </h2>
                        <p className="vOs-note">{hub.regions.length} 地域。押すと、その地域のページへ。</p>
                      </div>
                      <RegionChips regions={hub.regions} />
                    </div>
                    <div className="vOs-blk vOs-blk--genre" id="find-cuisine">
                      <h2 className="vOs-h3">
                        業種から<em>さがす。</em>
                      </h2>
                      <GenreCards cuisines={hub.cuisines} />
                      <p className="vOs-note">1 軒が複数の分類に入ることがあります。</p>
                    </div>
                    <div className="vOs-blk" id="find-scene">
                      <div className="vOs-blk-h">
                        <h2 className="vOs-h3">
                          利用シーンから<em>さがす。</em>
                        </h2>
                        <p className="vOs-note">デート、接待、一人飲みなど、{hub.scenes.length} の場面から。押すと、そのシーンのページへ。</p>
                      </div>
                      <SceneChips scenes={hub.scenes} />
                    </div>
                  </div>
                </div>
              )}

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

              {!isHub && regionOnly && (
                <p className="vSc-regionlink">
                  <Link href={`/region/${spRegion}`} data-cursor="GO">
                    {REGIONS[spRegion as RegionKey].name}のページを見る <span aria-hidden="true">→</span>
                  </Link>
                </p>
              )}

              {!isHub && (
              <>
              <div className="vI-bar">
                <p className="vI-bar-c" aria-live="polite">
                  {q && <>キーワード: 「{q}」 / </>}
                  {region && <>{REGIONS[region as RegionKey]?.name} / </>}
                  {cuisine !== "ALL" && <>{cuisine} / </>}
                  {scene && sceneDefs.find((x) => x.slug === scene) && <>{sceneDefs.find((x) => x.slug === scene)?.name} / </>}
                  {tag && <>#{tag} / </>}
                  {ext?.summary}
                  {!q && !region && cuisine === "ALL" && !tag && !scene && !ext?.active && "全件表示"}
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
  };

  if (!facets) return view(results);
  // 読み込みが終わるまでは、読み込み中の文だけを出す（入力欄を持たない。画面の入れ替わりで入力中の文字・フォーカスを失わないため）
  return (
    <Suspense fallback={view(results, undefined, true)}>
      <SearchFacets base={results} facets={facets} sp={sp} render={view} />
    </Suspense>
  );
}
