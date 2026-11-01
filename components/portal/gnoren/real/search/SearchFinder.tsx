"use client";
/**
 * さがす /search の「絞り込み + 検索結果」(クライアント)。見た目は試作 components/portal/gnoren/search/SearchView.tsx と同じ(search.css を import)。
 * 絞り込みの状態は URL に書く(history.replaceState。useSearchParams と連動)。意味は今の components/portal/noren/NorenSearch.tsx と同じ:
 *   ?q= 言葉(店名・最寄り・業種・町名・住所・紹介文・タグ) / ?region= 地域のキー / ?town= 市区町村(完全一致) / ?cuisine= 業種(大分類の名前かキー。古い細かい業種の名前も受ける) /
 *   ?scene= シーンのスラッグ / ?tag= タグ(完全一致) / ?page= / ?sort=(new・name。無ければおすすめ=店の並び順)
 * 'use client' の規約: @/lib/data 等は import しない(データはサーバー lib/portal/gnoren/search.ts で整形して props)。
 */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sized, sizedSrcSet } from "@/lib/imageUrl";
import { SearchIcon } from "../../common/icons";
import { ArrowIcon, ChevronDown, ChevronRight, CupIcon, CuisineIcon, DishMark, GridIcon, ListIcon, PinIcon } from "../../search/icons";
import "../../search/search.css";
import "./real.css";
import Card from "./Card";
import { AREA_W, AREA_X, CUISINE_LOOK, SCENE_W, SCENE_X } from "./layout";
import type { SearchData, SearchShop } from "./types";

const RegionMap = lazy(() => import("./RegionMap"));

const PER = 24;
type Sort = "" | "new" | "name";

const MOBILE_MQ = "(max-width: 768px), (orientation: landscape) and (max-height: 500px)";
const PH_PC = "エリア・駅名・店名・キーワードで探す";
const PH_M = "エリア・店名・キーワード";

/** 店 ID の番号(r12 → 12)。ID は掲載した順に振っているので、番号が大きいほど新しく載った店。r＋数字でない ID は 0 */
const idNo = (id: string) => (/^r\d+$/.test(id) ? parseInt(id.slice(1), 10) : 0);

type Params = { q: string; region: string; town: string; cuisine: string; scene: string; tag: string; sort: Sort; page: number };

function toUrl(p: Partial<Params>): string {
  const u = new URLSearchParams();
  if (p.q?.trim()) u.set("q", p.q.trim());
  if (p.region) u.set("region", p.region);
  if (p.town) u.set("town", p.town);
  if (p.cuisine) u.set("cuisine", p.cuisine);
  if (p.scene) u.set("scene", p.scene);
  if (p.tag) u.set("tag", p.tag);
  if (p.sort) u.set("sort", p.sort);
  if (p.page && p.page > 1) u.set("page", String(p.page));
  const s = u.toString();
  return s ? `/search?${s}` : "/search";
}

/**
 * URL を書き換える(履歴は積まない)。Next の window.history.replaceState は useSearchParams と連動するので、サーバーへ取りに行かずに(約 290KB の店のデータを取り直さずに)絞り込みが替わる。
 * 意味は router.replace と同じ(ページの位置は動かさない)。
 */
function replaceUrl(url: string) {
  window.history.replaceState(null, "", url);
}

export default function SearchFinder({ data }: { data: SearchData }) {
  const sp = useSearchParams();
  const cur: Params = {
    q: sp.get("q") || "",
    region: sp.get("region") || "",
    town: sp.get("town") || "",
    cuisine: sp.get("cuisine") || "",
    scene: sp.get("scene") || "",
    tag: sp.get("tag") || "",
    sort: sp.get("sort") === "new" ? "new" : sp.get("sort") === "name" ? "name" : "",
    page: Math.max(1, parseInt(sp.get("page") || "1", 10) || 1),
  };

  const [q, setQ] = useState(cur.q);
  useEffect(() => setQ(cur.q), [cur.q]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mapOpen, setMapOpen] = useState(false);
  const [ph, setPh] = useState(PH_PC);
  const resultsRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => setPh(mq.matches ? PH_M : PH_PC);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // 業種: 大分類の名前・キー、または古い細かい業種の名前(知らない名前は絞り込まない)
  const broad = cur.cuisine ? data.cuisines.find((c) => c.key === cur.cuisine || c.label === cur.cuisine) : undefined;
  const legacy = !broad && cur.cuisine ? data.legacyLabels.indexOf(cur.cuisine) : -1;
  const sceneKnown = !!cur.scene && cur.scene in data.sceneNames;

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = data.shops.filter((s: SearchShop) => {
      if (cur.region && s.region !== cur.region) return false;
      if (cur.town && s.town !== cur.town) return false;
      if (broad && !s.cuisineKeys.includes(broad.key)) return false;
      if (legacy >= 0 && !(s.lg ?? []).includes(legacy)) return false;
      if (sceneKnown && !s.sceneSlugs.includes(cur.scene)) return false;
      if (cur.tag && !s.allTags.includes(cur.tag)) return false;
      if (words.length) {
        const hay = [s.name, s.nearest ?? "", s.allTags.join(" "), s.kw].join(" ").toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (cur.sort === "new") list = [...list].sort((a, b) => idNo(b.id) - idNo(a.id));
    if (cur.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return list;
  }, [data.shops, q, cur.region, cur.town, broad, legacy, sceneKnown, cur.scene, cur.tag, cur.sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const page = Math.min(cur.page, pages);
  const shown = filtered.slice((page - 1) * PER, page * PER);

  const go = (o: Partial<Params>, scroll = false) => {
    replaceUrl(toUrl({ ...cur, q, ...o, page: o.page ?? 1 }));
    if (scroll) requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const clear = () => {
    setQ("");
    replaceUrl(toUrl({ sort: cur.sort }));
  };

  // 選んでいる条件(タグ・街・ほかの地域・ほかのシーンなど、札で見えないものも、ここで外せる)
  const regionName = (k: string) => data.regions.find((r) => r.key === k)?.name ?? k;
  const chosen: { key: string; label: string; off: () => void }[] = [];
  if (q.trim()) chosen.push({ key: "q", label: `言葉「${q.trim()}」`, off: () => { setQ(""); go({ q: "" }); } });
  if (cur.region) chosen.push({ key: "region", label: `エリア ${regionName(cur.region)}`, off: () => go({ region: "" }) });
  if (cur.town) chosen.push({ key: "town", label: `街 ${cur.town}`, off: () => go({ town: "" }) });
  if (broad) chosen.push({ key: "cuisine", label: `料理 ${broad.label}`, off: () => go({ cuisine: "" }) });
  else if (legacy >= 0) chosen.push({ key: "cuisine", label: `料理 ${cur.cuisine}`, off: () => go({ cuisine: "" }) });
  if (sceneKnown) chosen.push({ key: "scene", label: `シーン ${data.sceneNames[cur.scene]}`, off: () => go({ scene: "" }) });
  if (cur.tag) chosen.push({ key: "tag", label: `タグ ${cur.tag}`, off: () => go({ tag: "" }) });
  const isFiltered = chosen.length > 0;
  const count = filtered.length;

  const labelOfKey = useMemo(() => Object.fromEntries(data.cuisines.map((c) => [c.key, c.label])), [data.cuisines]);
  const areaKeys = new Set(data.areas.map((a) => a.key));
  const pageHref = (n: number) => toUrl({ ...cur, page: n });

  return (
    <div className="gn-search gn-search-r-inner" data-view={view}>
      {/* ───── 絞り込み ───── */}
      <section className="gn-search-find" aria-label="お店をさがす">
        <div className="gn-search-bar">
          <form
            className="gn-search-form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              go({ q }, true);
            }}
          >
            <SearchIcon className="gn-search-form-ic" />
            <input className="gn-search-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ph} aria-label="キーワードで探す" enterKeyHint="search" />
            <button type="submit" className="gn-search-submit">
              <span>検索する</span>
              <ArrowIcon />
            </button>
          </form>
        </div>
        <div className="gn-search-mapbox">
          <button type="button" className="gn-search-mapbtn" aria-expanded={mapOpen} aria-controls="gn-search-map" onClick={() => setMapOpen((v) => !v)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/_portal/gnoren/search/map.webp" alt="" width={192} height={160} />
            <span>地図から探す</span>
          </button>
          <div id="gn-search-map" className="gn-search-map gn-search-r-map" hidden={!mapOpen}>
            {mapOpen && (
              <Suspense fallback={<p className="gn-search-r-map-note">地図を読み込んでいます。</p>}>
                <RegionMap pins={data.mapPins} />
              </Suspense>
            )}
            <button type="button" onClick={() => setMapOpen(false)}>閉じる</button>
          </div>
        </div>

        {/* 料理 */}
        <div className="gn-search-lab gn-search-lab-1">
          <DishMark />
          <h2>料理から探す</h2>
        </div>
        <div className="gn-search-noren-row" role="group" aria-label="料理から探す">
          {data.cuisines.map((c) => {
            const look = CUISINE_LOOK[c.key] ?? CUISINE_LOOK.wa;
            const on = broad?.key === c.key;
            return (
              <button
                key={c.key}
                type="button"
                className="gn-search-noren"
                data-tone={look.tone}
                data-active={on ? "1" : "0"}
                aria-pressed={on}
                title={`${c.label} ${c.count}店`}
                style={{ "--x": look.x, "--w": look.w, "--ty": look.ty, "--fs": look.fs } as React.CSSProperties}
                onClick={() => go({ cuisine: on ? "" : c.label })}
              >
                <span className="gn-search-noren-cloth">
                  <CuisineIcon kind={look.icon} className="gn-search-noren-ic" />
                  <span className="gn-search-noren-t">{c.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* エリア */}
        <span className="gn-search-rule gn-search-rule-1" aria-hidden="true" />
        <div className="gn-search-lab gn-search-lab-2 gn-search-r-lab2">
          <PinIcon />
          <h2>エリアから探す</h2>
        </div>
        <label className="gn-search-r-region" data-on={cur.region && !areaKeys.has(cur.region) ? "1" : "0"}>
          <span className="gn-sr">ほかの地域</span>
          <select value={cur.region && !areaKeys.has(cur.region) ? cur.region : ""} onChange={(e) => go({ region: e.target.value })}>
            <option value="">ほかの地域</option>
            {data.regions.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}{r.count ? `(${r.count})` : ""}
              </option>
            ))}
          </select>
          <ChevronDown />
        </label>
        <div className="gn-search-area-row" role="group" aria-label="エリアから探す">
          {data.areas.map((a, i) => {
            const on = cur.region === a.key;
            return (
              <button
                key={a.key}
                type="button"
                className="gn-search-area"
                data-active={on ? "1" : "0"}
                aria-pressed={on}
                title={`${a.name} ${a.count}店`}
                style={{ "--x": AREA_X(i), "--w": AREA_W } as React.CSSProperties}
                onClick={() => go({ region: on ? "" : a.key })}
              >
                {a.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sized(a.img, 160)} srcSet={sizedSrcSet(a.img)} sizes="64px" alt="" width={138} height={138} loading="lazy" decoding="async" />
                ) : (
                  <i className="gn-search-r-noimg" aria-hidden="true" />
                )}
                <span>{a.name}</span>
                <ChevronRight />
              </button>
            );
          })}
        </div>

        {/* シーン */}
        <span className="gn-search-rule gn-search-rule-2" aria-hidden="true" />
        <div className="gn-search-lab gn-search-lab-3">
          <CupIcon />
          <h2>シーンから探す</h2>
        </div>
        <div className="gn-search-scene-row" role="group" aria-label="シーンから探す">
          {data.scenes.map((s, i) => {
            const on = cur.scene === s.slug;
            return (
              <button
                key={s.slug}
                type="button"
                className="gn-search-scene"
                data-active={on ? "1" : "0"}
                aria-pressed={on}
                title={`${s.name} ${s.count}店`}
                style={{ "--x": SCENE_X(i), "--w": SCENE_W } as React.CSSProperties}
                onClick={() => go({ scene: on ? "" : s.slug })}
              >
                <span className="gn-search-scene-ph">
                  {s.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sized(s.img, 330)} srcSet={sizedSrcSet(s.img)} sizes="(max-width: 768px) 128px, 160px" alt="" width={330} height={141} loading="lazy" decoding="async" />
                  ) : (
                    <span className="gn-search-r-noimg gn-linen" aria-hidden="true" />
                  )}
                  <i aria-hidden="true">
                    <ChevronRight />
                  </i>
                </span>
                <span className="gn-search-scene-t">{s.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ───── 検索結果 ───── */}
      <section className="gn-search-results" id="gn-search-results" aria-label="検索結果" ref={resultsRef}>
        <div className="gn-search-rhead">
          <h2 className="gn-search-rtitle">
            <span className="gn-search-rtitle-l">検索結果</span>
            <b aria-live="polite">{count}</b>
            <span className="gn-search-rtitle-r">件</span>
          </h2>
          {isFiltered && (
            <button type="button" className="gn-search-clear" onClick={clear}>
              条件をクリア
            </button>
          )}
          <label className="gn-search-sort">
            <span className="gn-sr">並べ替え</span>
            <select value={cur.sort} onChange={(e) => go({ sort: e.target.value as Sort })}>
              <option value="">おすすめ順</option>
              <option value="new">新着順</option>
              <option value="name">店名順</option>
            </select>
            <ChevronDown />
          </label>
          <div className="gn-search-toggle" role="group" aria-label="表示の切り替え">
            <button type="button" aria-label="グリッド表示" aria-pressed={view === "grid"} data-on={view === "grid" ? "1" : "0"} onClick={() => setView("grid")}>
              <GridIcon />
            </button>
            <button type="button" aria-label="リスト表示" aria-pressed={view === "list"} data-on={view === "list" ? "1" : "0"} onClick={() => setView("list")}>
              <ListIcon />
            </button>
          </div>
        </div>

        {isFiltered && (
          <ul className="gn-search-r-chosen" aria-label="選んでいる条件">
            {chosen.map((c) => (
              <li key={c.key}>
                <button type="button" onClick={c.off} aria-label={`${c.label}を外す`}>
                  <span>{c.label}</span>
                  <i aria-hidden="true">×</i>
                </button>
              </li>
            ))}
          </ul>
        )}

        {filtered.length === 0 ? (
          <div className="gn-search-empty" role="status">
            <p className="gn-search-empty-t">条件に合うお店が見つかりませんでした。</p>
            <p className="gn-search-empty-s">条件をゆるめて、もう一度さがしてみてください。</p>
            <button type="button" onClick={clear}>
              条件をクリアする
            </button>
          </div>
        ) : (
          <ul className="gn-search-grid">
            {shown.map((s, i) => (
              <Card key={s.id} shop={s} index={i} chipLabel={s.cuisineKeys[0] ? labelOfKey[s.cuisineKeys[0]] : undefined} />
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="gn-search-r-pager" aria-label="ページ">
            {page > 1 ? (
              <a href={pageHref(page - 1)} rel="prev" onClick={(e) => { e.preventDefault(); go({ page: page - 1 }, true); }}>
                前へ
              </a>
            ) : (
              <span className="is-off" aria-hidden="true">前へ</span>
            )}
            <span aria-current="page">
              {page} / {pages}
            </span>
            {page < pages ? (
              <a href={pageHref(page + 1)} rel="next" onClick={(e) => { e.preventDefault(); go({ page: page + 1 }, true); }}>
                次へ
              </a>
            ) : (
              <span className="is-off" aria-hidden="true">次へ</span>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
