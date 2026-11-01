"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "../common/icons";
import { AREA_NOREN, GENRES, SCENES, SHOPS, TOTAL, type Shop } from "./data";
import {
  ArrowCircle, BowlStatIcon, ChevronDown, GenreIcon, GridIcon, HeartIcon, InkMark, LidBowlIcon, ListIcon, MapIcon,
  PeopleIcon, PinIcon, PinSmall, RefreshIcon, SearchBold, StoreIcon, Tri,
} from "./icons";
import "./search.css";

const IMG = "/_portal/gnoren3/search";
const SHOP_HREF = "/proto-gourmet/n3/shop/sample";
type Sort = "recommend" | "walk" | "name";

// 見本(2_さがす.png)の座標: 料理の暖簾の帯画像は x43〜1043・y516〜716(幅 1000・高さ 200)
const G_X = 43;
const G_W = 1000;

export default function SearchView() {
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [area, setArea] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [scene, setScene] = useState("");
  const [sort, setSort] = useState<Sort>("recommend");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const hasFilter = !!(appliedQ || area || cuisine || scene);

  const shown = useMemo(() => {
    const kw = appliedQ.trim().toLowerCase();
    let r = SHOPS.filter((s) => {
      if (area && s.area !== area) return false;
      if (cuisine && s.cat !== cuisine) return false;
      if (scene && !s.scenes.includes(scene)) return false;
      if (kw) {
        const hay = `${s.name} ${s.cat} ${s.area} ${s.station} ${s.desc} ${s.tags.join(" ")}`.toLowerCase();
        if (!kw.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (sort === "walk") r = [...r].sort((a, b) => a.walk - b.walk);
    if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return r;
  }, [appliedQ, area, cuisine, scene, sort]);

  const count = hasFilter ? shown.length : TOTAL;

  const goResults = () => {
    const el = document.getElementById("gn3-search-results");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  const clearAll = () => {
    setQ(""); setAppliedQ(""); setArea(""); setCuisine(""); setScene("");
  };

  return (
    <main className="gn3-search gn3-linen">
      {/* ───────── ヒーロー + 検索 + 絞り込み(見本 y55〜468) ───────── */}
      <section className="gn3-search-hero" aria-label="店をさがす">
       <div className="gn3-search-in">
        <div className="gn3-search-herobg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/hero.webp`} alt="" width={1086} height={357} fetchPriority="high" />
        </div>

        <h1 className="gn3-search-vert">
          <span>この街の</span>
          <span>うまいが、</span>
          <span>きっと見つかる。</span>
        </h1>

        <p className="gn3-search-ncopy">
          <span>おいしい</span>
          <span>出会いを</span>
          <span>さがしに行こう</span>
        </p>
        <div className="gn3-search-nlogo" aria-hidden="true">
          <InkMark className="gn3-search-nlogo-mark" paper="#eadfc8" />
          <span className="gn3-search-nlogo-name">マチノワ</span>
        </div>
        <div className="gn3-search-lantern" aria-hidden="true">
          <InkMark className="gn3-search-lantern-mark" paper="#f6ecd2" />
          <span className="gn3-search-lantern-name">マチノワ</span>
        </div>

        <ul className="gn3-search-stats" aria-label="掲載の数">
          <li className="gn3-search-stat s1">
            <StoreIcon className="gn3-search-stat-ic" />
            <span className="gn3-search-stat-n">509</span>
            <span className="gn3-search-stat-l">店舗</span>
          </li>
          <li className="gn3-search-stat s2">
            <MapIcon className="gn3-search-stat-ic" />
            <span className="gn3-search-stat-n">41</span>
            <span className="gn3-search-stat-l">エリア</span>
          </li>
          <li className="gn3-search-stat s3">
            <BowlStatIcon className="gn3-search-stat-ic" />
            <span className="gn3-search-stat-n">7</span>
            <span className="gn3-search-stat-l">料理分類</span>
          </li>
          <li className="gn3-search-stat-sep a" aria-hidden="true" />
          <li className="gn3-search-stat-sep b" aria-hidden="true" />
        </ul>

        <form
          className="gn3-search-box"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQ(q);
            goResults();
          }}
        >
          <div className="gn3-search-input">
            <SearchBold className="gn3-search-input-ic" />
            <input
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="店名・エリア・駅名・料理名でさがす"
              aria-label="店名・エリア・駅名・料理名でさがす"
              enterKeyHint="search"
            />
          </div>
          <button type="submit" className="gn3-search-go">さがす</button>
        </form>

        <div className="gn3-search-filters">
          <label className="gn3-search-sel s1">
            <PinIcon className="gn3-search-sel-ic pin" />
            <span className="gn3-search-sel-t">
              <b>エリア</b>
              <i>{area || "すべてのエリア"} <Tri className="gn3-search-tri" /></i>
            </span>
            <ChevronDown className="gn3-search-sel-chev" />
            <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="エリア">
              <option value="">すべてのエリア</option>
              {AREA_NOREN.map((a) => <option key={a.key} value={a.value}>{a.value}</option>)}
            </select>
          </label>
          <label className="gn3-search-sel s2">
            <LidBowlIcon className="gn3-search-sel-ic bowl" />
            <span className="gn3-search-sel-t">
              <b>料理分類</b>
              <i>{cuisine || "すべての料理"} <Tri className="gn3-search-tri" /></i>
            </span>
            <ChevronDown className="gn3-search-sel-chev" />
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} aria-label="料理分類">
              <option value="">すべての料理</option>
              {GENRES.map((g) => <option key={g.key} value={g.label}>{g.label}</option>)}
            </select>
          </label>
          <label className="gn3-search-sel s3">
            <PeopleIcon className="gn3-search-sel-ic ppl" />
            <span className="gn3-search-sel-t">
              <b>利用シーン</b>
              <i>{scene || "すべてのシーン"} <Tri className="gn3-search-tri" /></i>
            </span>
            <ChevronDown className="gn3-search-sel-chev" />
            <select value={scene} onChange={(e) => setScene(e.target.value)} aria-label="利用シーン">
              <option value="">すべてのシーン</option>
              {SCENES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="button" className="gn3-search-clear" onClick={clearAll}>
            <RefreshIcon className="gn3-search-clear-ic" />
            <span>条件をクリアする</span>
          </button>
        </div>
       </div>
      </section>

      {/* ───────── 料理からさがす(見本 y468〜731) ───────── */}
      <section className="gn3-search-ryo" aria-labelledby="gn3-search-ryo-h">
       <div className="gn3-search-in">
        <div className="gn3-search-ryo-head">
          <h2 id="gn3-search-ryo-h">料理からさがす</h2>
          <p>気分に合わせて、食のジャンルから見つける</p>
          <a className="gn3-search-more" href="#gn3-search-results" onClick={(e) => { e.preventDefault(); setCuisine(""); goResults(); }}>
            <span>すべての料理からさがす</span>
            <ArrowRight />
          </a>
        </div>
        <ul className="gn3-search-genres">
          {GENRES.map((g) => {
            const w = g.x1 - g.x0;
            return (
              <li
                key={g.key}
                className={`gn3-search-genre ${g.tone}`}
                style={{
                  ["--gx" as string]: g.x0 - G_X,
                  ["--gw" as string]: w,
                  ["--gbgw" as string]: `${(G_W / w) * 100}%`,
                  ["--gbgx" as string]: `${((g.x0 - G_X) / (G_W - w)) * 100}%`,
                  ["--gcx" as string]: g.cx - g.x0,
                }}
              >
                <button
                  type="button"
                  aria-pressed={cuisine === g.label}
                  onClick={() => { setCuisine(cuisine === g.label ? "" : g.label); goResults(); }}
                >
                  <GenreIcon k={g.key} className="gn3-search-genre-ic" />
                  <span className="gn3-search-genre-l">{g.label}</span>
                  <span className="gn3-search-sr">{g.label}の店をさがす</span>
                </button>
              </li>
            );
          })}
        </ul>
       </div>
      </section>

      {/* ───────── エリアからさがす(見本 y731〜945) ───────── */}
      <section className="gn3-search-area" aria-labelledby="gn3-search-area-h">
       <div className="gn3-search-in">
        <div className="gn3-search-areabg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/area.webp`} alt="" width={1086} height={214} />
        </div>
        <div className="gn3-search-area-head">
          <h2 id="gn3-search-area-h">エリアからさがす</h2>
          <p>行きたい街で、うまい店を見つける</p>
          <a className="gn3-search-more" href="#gn3-search-results" onClick={(e) => { e.preventDefault(); setArea(""); goResults(); }}>
            <span>すべてのエリアからさがす</span>
            <ArrowRight />
          </a>
        </div>
        <ul className="gn3-search-norens">
          {AREA_NOREN.map((a) => (
            <li key={a.key} className={`gn3-search-noren ${a.tone}`} style={{ ["--ncx" as string]: a.cx }}>
              <button type="button" aria-pressed={area === a.value} onClick={() => { setArea(area === a.value ? "" : a.value); goResults(); }}>
                <span className="gn3-search-noren-l">{a.label}</span>
                <ArrowCircle className="gn3-search-noren-ar" />
                <span className="gn3-search-sr">{a.value}の店をさがす</span>
              </button>
            </li>
          ))}
        </ul>
       </div>
      </section>

      {/* ───────── 検索結果(見本 y945〜) ───────── */}
      <section className="gn3-search-res" id="gn3-search-results" aria-labelledby="gn3-search-res-h">
       <div className="gn3-search-in">
        <div className="gn3-search-res-head">
          <h2 id="gn3-search-res-h">検索結果</h2>
          <p aria-live="polite">{count}件の店舗が見つかりました</p>
          <div className="gn3-search-tools">
            <label className="gn3-search-sort">
              <span>並べ替え</span>
              <span className="gn3-search-sortbox">
                <span>{sort === "recommend" ? "おすすめ順" : sort === "walk" ? "駅から近い順" : "店名順"}</span>
                <ChevronDown className="gn3-search-sortchev" />
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="並べ替え">
                  <option value="recommend">おすすめ順</option>
                  <option value="walk">駅から近い順</option>
                  <option value="name">店名順</option>
                </select>
              </span>
            </label>
            <div className="gn3-search-views" role="group" aria-label="表示の切り替え">
              <button type="button" aria-pressed={view === "grid"} aria-label="カードで表示" onClick={() => setView("grid")}><GridIcon /></button>
              <button type="button" aria-pressed={view === "list"} aria-label="一覧で表示" onClick={() => setView("list")}><ListIcon /></button>
            </div>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="gn3-search-empty">
            <p>条件に合う店舗が見つかりませんでした。</p>
            <button type="button" onClick={clearAll}>条件をクリアする</button>
          </div>
        ) : (
          <ul className={`gn3-search-cards ${view}`}>
            {shown.map((s) => (
              <Card key={s.id} s={s} liked={!!liked[s.id]} onLike={() => setLiked((m) => ({ ...m, [s.id]: !m[s.id] }))} />
            ))}
          </ul>
        )}
       </div>
      </section>
    </main>
  );
}

/** タグの行が枠からはみ出すとき、字間を詰めて 1 行に収める(見本のカード 2 のタグは詰めて収まっている) */
function useFitRow<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  const fit = () => {
    const el = ref.current;
    if (!el) return;
    for (const k of ["--fit-ls", "--fit-pad", "--fit-s"]) el.style.removeProperty(k);
    if (el.scrollWidth <= el.clientWidth + 0.5) return;
    for (const [ls, pad, sc] of [[0.02, 1, 1], [0, 1, 1], [-0.02, 0.9, 1], [-0.04, 0.8, 1], [-0.06, 0.7, 1], [-0.06, 0.7, 0.95], [-0.06, 0.65, 0.9], [-0.06, 0.6, 0.86]] as const) {
      el.style.setProperty("--fit-ls", `${ls}em`);
      el.style.setProperty("--fit-pad", String(pad));
      el.style.setProperty("--fit-s", String(sc));
      if (el.scrollWidth <= el.clientWidth + 0.5) return;
    }
  };
  useLayoutEffect(fit); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (document.fonts?.ready) document.fonts.ready.then(fit);
    document.fonts?.addEventListener?.("loadingdone", fit);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", fit);
    };
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

function Card({ s, liked, onLike }: { s: Shop; liked: boolean; onLike: () => void }) {
  const n = SHOPS.findIndex((x) => x.id === s.id) + 1;
  const tagsRef = useFitRow<HTMLUListElement>(s.id);
  return (
    <li className="gn3-search-card" style={{ ["--ph" as string]: s.photoH, ["--cw" as string]: s.chipW }}>
      <div className="gn3-search-card-ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/card${n}.webp`} alt="" width={240} height={s.photoH} loading="lazy" />
        <span className="gn3-search-chip">{s.cat}</span>
      </div>
      <button type="button" className="gn3-search-heart" aria-pressed={liked} aria-label={`${s.name}をお気に入り${liked ? "から外す" : "に入れる"}`} onClick={onLike}>
        <HeartIcon filled={liked} />
      </button>
      <div className="gn3-search-card-body">
        <h3><Link href={SHOP_HREF}>{s.name}</Link></h3>
        <p className="gn3-search-st"><PinSmall /><span>{s.area}・{s.station}</span></p>
        <p className="gn3-search-ds">{s.desc}</p>
        <ul className="gn3-search-tags" ref={tagsRef}>
          {s.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </li>
  );
}
