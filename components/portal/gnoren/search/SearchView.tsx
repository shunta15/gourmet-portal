"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeartIcon, SearchIcon } from "../common/icons";
import { AREAS, CUISINES, SCENES, SHOPS, type AreaKey, type CuisineKey, type SceneKey, type Shop } from "./data";
import { ArrowIcon, ChevronDown, ChevronRight, CupIcon, CuisineIcon, DishMark, GridIcon, ListIcon, PinIcon, TagGlyph } from "./icons";
import "./search.css";

const IMG = "/_portal/gnoren/search";
const SHOP_HREF = "/proto-gourmet/n/shop/sample";
const TOTAL = 509; // 見本の「509 件」(仮)

type Sort = "recommend" | "walk" | "name";

// スマホ(search.css の mobile と同じ条件)では入力欄が狭いので、プレースホルダを短くする
const MOBILE_MQ = "(max-width: 768px), (orientation: landscape) and (max-height: 500px)";
const PH_PC = "エリア・駅名・店名・キーワードで探す";
const PH_M = "エリア・店名・キーワード";

export default function SearchView() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<CuisineKey | null>(null);
  const [area, setArea] = useState<AreaKey | null>(null);
  const [scene, setScene] = useState<SceneKey | null>(null);
  const [sort, setSort] = useState<Sort>("recommend");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [liked, setLiked] = useState<Record<string, boolean>>(() => Object.fromEntries(SHOPS.map((s) => [s.id, s.liked])));
  const [mapOpen, setMapOpen] = useState(false);
  const [ph, setPh] = useState(PH_PC);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => setPh(mq.matches ? PH_M : PH_PC);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let list = SHOPS.filter((s) => {
      if (cuisine && s.cuisine !== cuisine) return false;
      if (area && s.area !== area) return false;
      if (scene && !s.scenes.includes(scene)) return false;
      if (kw) {
        const hay = [s.name, s.station, s.desc.join(""), s.tags.map((t) => t.label).join(" "), s.cuisine, s.area, s.scenes.join(" ")].join(" ").toLowerCase();
        if (!kw.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (sort === "walk") list = [...list].sort((a, b) => a.walk - b.walk);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return list;
  }, [q, cuisine, area, scene, sort]);

  const isFiltered = !!(q.trim() || cuisine || area || scene);
  const count = isFiltered ? filtered.length : TOTAL;
  const reset = () => {
    setQ("");
    setCuisine(null);
    setArea(null);
    setScene(null);
  };

  return (
    <main className="gn-search" data-view={view}>
      {/* ───── ヒーロー ───── */}
      <section className="gn-search-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-search-hero-img" src={`${IMG}/hero.webp`} alt="" width={2172} height={784} fetchPriority="high" />
        <div className="gn-search-hero-copy">
          <h1 className="gn-search-h1">
            この街で見つかる、
            <br />
            お気に入りの一軒。
          </h1>
          <p className="gn-search-lead">
            エリアや料理、シーンから、
            <br />
            あなたにぴったりのお店を見つけましょう。
            <br />
            マチノワ グルメで、今日の“おいしい出会い”を。
          </p>
        </div>
        <p className="gn-search-fy gn-script" aria-hidden="true">
          <span className="gn-search-fy-1">Find your</span>
          <span className="gn-search-fy-2">delicious place</span>
        </p>
        <p className="gn-search-fy-sub" aria-hidden="true">
          MACHINOWA GOURMET
          <br />
          GOOD FOOD
          <br />
          GOOD NEIGHBORS
        </p>
      </section>

      {/* ───── 統計 ───── */}
      <section className="gn-search-stats" aria-label="マチノワ グルメの掲載状況">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-search-town" src={`${IMG}/townscape.webp`} alt="" aria-hidden="true" width={788} height={148} />
        <span className="gn-search-stats-line" aria-hidden="true" />
        <p className="gn-search-stats-cap">マチノワ グルメで見つかる</p>
        <dl className="gn-search-stats-list">
          <div className="gn-search-stat gn-search-stat-1">
            <dt>
              <b>509</b>
              <span>店舗</span>
            </dt>
            <dd>この街の、選りすぐりの飲食店</dd>
          </div>
          <div className="gn-search-stat gn-search-stat-2">
            <dt>
              <b>41</b>
              <span>エリア</span>
            </dt>
            <dd>街のあらゆるエリアから</dd>
          </div>
          <div className="gn-search-stat gn-search-stat-3">
            <dt>
              <b>7</b>
              <span>料理分類</span>
            </dt>
            <dd>きっと見つかる、好きな味</dd>
          </div>
        </dl>
      </section>

      {/* ───── 絞り込み ───── */}
      <section className="gn-search-find" aria-label="お店をさがす">
        <div className="gn-search-bar">
          <form
            className="gn-search-form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("gn-search-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <SearchIcon className="gn-search-form-ic" />
            <input
              className="gn-search-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={ph}
              aria-label="キーワードで探す"
              enterKeyHint="search"
            />
            <button type="submit" className="gn-search-submit">
              <span>検索する</span>
              <ArrowIcon />
            </button>
          </form>
        </div>
        <div className="gn-search-mapbox">
          <button type="button" className="gn-search-mapbtn" aria-expanded={mapOpen} aria-controls="gn-search-map" onClick={() => setMapOpen((v) => !v)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/map.webp`} alt="" width={192} height={160} />
            <span>地図から探す</span>
          </button>
          <div id="gn-search-map" className="gn-search-map" hidden={!mapOpen}>
            <p>地図からの検索は準備中です。</p>
            <p>エリアのチップから絞り込めます。</p>
            <button type="button" onClick={() => setMapOpen(false)}>閉じる</button>
          </div>
        </div>

        {/* 料理 */}
        <div className="gn-search-lab gn-search-lab-1">
          <DishMark />
          <h2>料理から探す</h2>
        </div>
        <div className="gn-search-noren-row" role="group" aria-label="料理から探す">
          {CUISINES.map((c) => (
            <button
              key={c.key}
              type="button"
              className="gn-search-noren"
              data-tone={c.tone}
              data-active={cuisine === c.key ? "1" : "0"}
              aria-pressed={cuisine === c.key}
              style={{ "--x": c.x, "--w": c.w, "--ty": c.ty, "--fs": c.fs } as React.CSSProperties}
              onClick={() => setCuisine(cuisine === c.key ? null : c.key)}
            >
              <span className="gn-search-noren-cloth">
                <CuisineIcon kind={c.icon} className="gn-search-noren-ic" />
                <span className="gn-search-noren-t">{c.key}</span>
              </span>
            </button>
          ))}
        </div>

        {/* エリア */}
        <span className="gn-search-rule gn-search-rule-1" aria-hidden="true" />
        <div className="gn-search-lab gn-search-lab-2">
          <PinIcon />
          <h2>エリアから探す</h2>
        </div>
        <div className="gn-search-area-row" role="group" aria-label="エリアから探す">
          {AREAS.map((a, i) => (
            <button
              key={a.key}
              type="button"
              className="gn-search-area"
              data-active={area === a.key ? "1" : "0"}
              aria-pressed={area === a.key}
              style={{ "--x": a.x, "--w": a.w } as React.CSSProperties}
              onClick={() => setArea(area === a.key ? null : a.key)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/area${i + 1}.webp`} alt="" width={138} height={138} />
              <span>{a.key}</span>
              <ChevronRight />
            </button>
          ))}
        </div>

        {/* シーン */}
        <span className="gn-search-rule gn-search-rule-2" aria-hidden="true" />
        <div className="gn-search-lab gn-search-lab-3">
          <CupIcon />
          <h2>シーンから探す</h2>
        </div>
        <div className="gn-search-scene-row" role="group" aria-label="シーンから探す">
          {SCENES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className="gn-search-scene"
              data-active={scene === s.key ? "1" : "0"}
              aria-pressed={scene === s.key}
              style={{ "--x": s.x, "--w": s.w } as React.CSSProperties}
              onClick={() => setScene(scene === s.key ? null : s.key)}
            >
              <span className="gn-search-scene-ph">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/scene${i + 1}.webp`} alt="" width={s.w * 3} height={141} />
                <i aria-hidden="true">
                  <ChevronRight />
                </i>
              </span>
              <span className="gn-search-scene-t">{s.key}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ───── 検索結果 ───── */}
      <section className="gn-search-results" id="gn-search-results" aria-label="検索結果">
        <div className="gn-search-rhead">
          <h2 className="gn-search-rtitle">
            <span className="gn-search-rtitle-l">検索結果</span>
            <b aria-live="polite">{count}</b>
            <span className="gn-search-rtitle-r">件</span>
          </h2>
          {isFiltered && (
            <button type="button" className="gn-search-clear" onClick={reset}>
              条件をクリア
            </button>
          )}
          <label className="gn-search-sort">
            <span className="gn-sr">並べ替え</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="recommend">おすすめ順</option>
              <option value="walk">駅から近い順</option>
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

        {filtered.length === 0 ? (
          <div className="gn-search-empty" role="status">
            <p className="gn-search-empty-t">条件に合うお店が見つかりませんでした。</p>
            <p className="gn-search-empty-s">条件をゆるめて、もう一度さがしてみてください。</p>
            <button type="button" onClick={reset}>
              条件をクリアする
            </button>
          </div>
        ) : (
          <ul className="gn-search-grid">
            {filtered.map((s, i) => (
              <Card key={s.id} shop={s} index={i} liked={!!liked[s.id]} onLike={() => setLiked((m) => ({ ...m, [s.id]: !m[s.id] }))} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Card({ shop: s, index, liked, onLike }: { shop: Shop; index: number; liked: boolean; onLike: () => void }) {
  return (
    <li className="gn-search-card" style={{ "--i": index } as React.CSSProperties}>
      <div className="gn-search-card-ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/card${s.photo}.webp`} alt="" width={480} height={268} loading={index < 4 ? "eager" : "lazy"} />
        <span className="gn-search-chip" data-chip={s.chip}>
          {s.cuisine}
        </span>
      </div>
      <div className="gn-search-card-body">
        <h3 className="gn-search-card-name">
          <Link href={SHOP_HREF}>{s.name}</Link>
        </h3>
        <p className="gn-search-card-st">
          <PinIcon />
          <span>
            {s.station} 徒歩{s.walk}分
          </span>
        </p>
        <p className="gn-search-card-desc">
          {s.desc[0]}
          <br />
          {s.desc[1]}
        </p>
        <ul className="gn-search-card-tags">
          {s.tags.map((t) => (
            <li key={t.label}>
              <TagGlyph kind={t.icon} />
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="gn-search-heart" aria-pressed={liked} aria-label={liked ? `${s.name}をお気に入りから外す` : `${s.name}をお気に入りに追加`} onClick={onLike} data-on={liked ? "1" : "0"}>
        <span>
          <HeartIcon />
        </span>
      </button>
    </li>
  );
}
