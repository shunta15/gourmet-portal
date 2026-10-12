"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { REGIONS, type RegionKey, type SearchItem } from "@/lib/regions";
import { BROAD_GROUPS, isLegacyCuisineLabel, matchesCuisineFilter } from "@/lib/cuisineBroad";
import { shopInScene } from "@/lib/portal/noren/sceneMatch";
import type { FacetExt, FacetPayload } from "@/lib/portal/facetDefs";
import SaveButton from "@/components/portal/SaveButton";
import { ShopCard } from "./ShopCard";
import { sized } from "@/lib/imageUrl";
import type { MapMode, MapPt } from "./ShopMap";
import { usesEPicture } from "@/lib/portal/noren/illustStyle";
import type { Look } from "@/lib/portal/noren/looks";
import { ArrowIcon, BlockCard, PinIcon, SearchIcon, TabIcon, isShowableTag } from "./BlockSearchParts";
import "./opensearch.css";
import "./blocksearch.css";

// 「こだわり条件で絞る」は今の /search と同じ部品（React.lazy で分ける。読み込みの間は見出しだけ）。
const SearchFacets = lazy(() => import("@/components/portal/SearchFacets"));
// 地図（絵図 a・手描き風 e・古地図 f・夜の灯り g・見下ろす h。components/portal/noren/ShopMap.tsx）。画面に出るまで読み込まない（next/dynamic。leaflet も中で遅れて読む）
const ShopMap = dynamic(() => import("./ShopMap"), {
  ssr: false,
  loading: () => <div className="vMp-maploading">地図を読み込み中…</div>,
});

/** 1 ページに出す店の数 */
const PER = 24;

type Tab = "area" | "genre" | "scene" | "tag" | "q";
const TABS: { key: Tab; label: string }[] = [
  { key: "area", label: "エリア" },
  { key: "genre", label: "業種" },
  { key: "scene", label: "利用シーン" },
  { key: "tag", label: "こだわり" },
  { key: "q", label: "キーワード" },
];
const isTab = (s: string | null): s is Tab => !!s && TABS.some((t) => t.key === s);
/** block の見た目のタブ（キーワードは、帯の検索の箱が常にあるので、タブには無い） */
const BLOCK_TABS = TABS.filter((t) => t.key !== "q");

type SceneDef = { slug: string; name: string; matchTags: string[] };
/** 検索の 1 店。最寄り駅（nearest）も渡る（地図のピンの店の情報の札に出す。block では駅名でも探せる） */
type SItem = SearchItem & { nearest?: string };
type Sort = "" | "new";
/** 店 ID の番号（r12 → 12）。ID は掲載した順に振っているので、番号が大きいほど新しく載った店。r＋数字でない ID は 0 */
const idNo = (id: string) => (/^r\d+$/.test(id) ? parseInt(id.slice(1), 10) : 0);

/** 件数の数字。値が替わると、前の数から数え上がる（「動きを減らす」設定では、すぐ替える）。最初に開いたときは 0 から */
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(value);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = prev.current ?? 0;
    prev.current = value;
    if (reduce || from === value) {
      setN(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setN(Math.round(from + (value - from) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

/**
 * 絞り込んだ店の地図。地域を選んでいないとき: a は日本地図のマス（県ごとの店の数）、b は地域ごとの丸。選んだら、その地域の位置のある店を全部ピンで（上限は設けない）。
 * ピンを押すと店名・エリア・業種の札が出て、店ページへ行ける。
 */
function ResultsMap({
  list,
  coords,
  prefOf,
  townOf,
  prefRegion,
  mode,
  regionKey,
  onPick,
  look = "noren",
}: {
  list: SearchItem[];
  coords: Record<string, [number, number]>;
  prefOf: Record<string, string>;
  townOf: Record<string, string>;
  prefRegion: Record<string, string>;
  mode: MapMode;
  regionKey: string;
  onPick: (region: string) => void;
  look?: Look;
}) {
  const { pts, prefCounts, regionCounts } = useMemo(() => {
    const pts: MapPt[] = list
      .filter((r) => coords[r.id])
      .map((r) => ({ id: r.id, name: r.name, lat: coords[r.id][0], lng: coords[r.id][1], area: r.area, cuisine: r.cuisine, photo: r.image ? sized(r.image, 360) : "", town: townOf[r.id] ?? "", region: r.region, nearest: (r as SItem).nearest }));
    const prefCounts: Record<string, number> = {};
    const byRegion = new Map<string, number>();
    for (const r of list) {
      const p = prefOf[r.id];
      if (p) prefCounts[p] = (prefCounts[p] ?? 0) + 1;
      byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + 1);
    }
    const regionCounts = [...byRegion.entries()].map(([key, count]) => ({ key, name: REGIONS[key as RegionKey]?.name ?? key, count }));
    return { pts, prefCounts, regionCounts };
  }, [list, coords, prefOf, townOf]);
  const nation = !regionKey;
  return (
    <div className={look === "block" ? "vMp-map vBk-map" : "vMp-map"}>
      <div className="vSc-map-fr">
        <ShopMap mode={mode} regionKey={regionKey} pts={pts} prefCounts={prefCounts} prefRegion={prefRegion} regionCounts={regionCounts} onPick={onPick} />
      </div>
      <p className="vMp-mapnote" aria-live="polite">
        {nation
          ? mode === "a"
            ? `県のマスに店の数を出しています(全 ${list.length} 軒)。店のある県を押すと、その地域の店に絞り込みます。`
            : `地域ごとの丸に店の数を出しています(全 ${list.length} 軒)。丸を押すと、その地域の店に絞り込みます。`
          : pts.length === 0
            ? "この条件の店には、地図に出せる位置の情報がありません。"
            : `位置のわかる ${pts.length} 軒を地図に出しています(結果は ${list.length} 軒)。${mode === "h" && !usesEPicture(mode, regionKey) ? "見下ろした地図は、拡大・移動はできません。" : ""}`}
        {usesEPicture(mode, regionKey) ? <small className="vMp-fallback"> この{nation ? "全国" : "地域"}は e の絵を出しています。</small> : null}
      </p>
    </div>
  );
}

/**
 * 店をさがす（/search）の検索と結果（暖簾版。「店をさがす」の中心のページ）。組み立て（上から）:
 *  - 探し方のタブ（エリア・業種・利用シーン・こだわり・キーワード。?tab= で表す。何も無ければ、絞り込みに使っている項目のタブ、無ければエリア）
 *  - 箱: 左に地図（絞り込んだ店のピン）・右にそのタブの一覧（押すと絞り込みが替わり、地図と結果も替わる。件数は、ほかの絞り込みを掛けたときの数）
 *  - 結果: 件数・店の札・ページ送り（?page=）
 * 引数 q・region・cuisine・scene・tag（と、こだわり条件の budget・f、tab、page）。入力すると結果が変わり、検索を押すと URL に載る。
 * 判定: 業種は lib/cuisineBroad.ts の matchesCuisineFilter、利用シーンは lib/portal/noren/sceneMatch.ts の shopInScene（シーンのページと同じ）、キーワードは今の /search と同じ。
 * データはサーバーのページで必要な項目だけに絞って渡す（クライアントの束に lib/data を入れない）。coords は座標のある店だけの [緯度, 経度]。
 */
export default function NorenSearch({
  restaurants,
  facets,
  sceneDefs,
  coords,
  prefOf,
  townOf,
  prefRegion,
  allowMapUrl = false,
  look = "noren",
  allowLookUrl = false,
}: {
  restaurants: SItem[];
  facets?: FacetPayload;
  sceneDefs: SceneDef[];
  coords: Record<string, [number, number]>;
  /** 店 ID → 住所の都道府県 slug（全店。位置の無い店も県のマスに数えるため） */
  prefOf: Record<string, string>;
  /** 店 ID → 市区町村（lib/towns.ts の取り出し方。絵図 a の目印の地名用） */
  townOf: Record<string, string>;
  /** 県 slug → その県の店の地域（region のキー）。店のデータの住所の県と region から作った対応 */
  prefRegion: Record<string, string>;
  /** URL の ?map=a|f|g|h で地図の見た目を替えられるか（本番でないときだけ true。?sp= と同じ） */
  allowMapUrl?: boolean;
  /** 見た目（lib/portal/noren/looks.ts）。"block" は参考画像の形（白い地・橙の差し色）。サーバーのページが決めて渡す */
  look?: Look;
  /** URL の ?look= を、タブ・絞り込みの移動でも保つか（見本でだけ true。本番は false） */
  allowLookUrl?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // こだわり条件（?budget= ?f=）だけが変わったときは、入力途中のキーワードなどを戻さない
  const spQ = sp.get("q") || "";
  const spRegion = sp.get("region") || "";
  const spCuisine = sp.get("cuisine") || "ALL";
  const spTag = sp.get("tag") || "";
  const spScene = sp.get("scene") || "";
  const spTab = sp.get("tab");
  const block = look === "block";
  const lookParam = allowLookUrl ? sp.get("look") : null;
  const spSort: Sort = block && sp.get("sort") === "new" ? "new" : "";
  // 地図の見た目: 既定は e（手描き風）。?map=a|f|g|h は、本番でないときだけ（b・c・d は e に読み替える）
  const mapParam = sp.get("map");
  const mapMode: MapMode = allowMapUrl && (mapParam === "a" || mapParam === "f" || mapParam === "g" || mapParam === "h") ? mapParam : "e";
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
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

  // 一覧（エリア・業種・シーン）の選んでいる行が見える位置まで、一覧の中だけをずらす（ページ全体は動かさない）
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.vMp-list .vMp-row[aria-current="true"], .vBk-list .vBk-row[aria-current="true"]');
    const box = el?.closest<HTMLElement>(".vMp-list, .vBk-list");
    if (!el || !box) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    box.scrollTo({ top: box.scrollTop + r.top - b.top - 8, left: box.scrollLeft + r.left - b.left - 8 });
  }, [spRegion, spCuisine, spScene, spTab]);

  // タグの集計（店の数が多い順）
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    restaurants.forEach((r) => {
      r.tags?.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [restaurants]);

  // 絞り込み。skip を渡すと、その軸だけ掛けない（その軸の一覧の件数を出すため）。知らない業種・シーンは絞り込まない
  const sceneDef = scene ? sceneDefs.find((x) => x.slug === scene) : undefined;
  const needle = q.trim().toLowerCase();
  const pass = (r: SearchItem, skip?: "region" | "cuisine" | "scene") => {
    if (skip !== "region" && region && r.region !== region) return false;
    if (skip !== "cuisine" && cuisine !== "ALL" && !matchesCuisineFilter(cuisine, r)) return false;
    if (tag && !(r.tags || []).includes(tag)) return false;
    if (skip !== "scene" && sceneDef && !shopInScene(sceneDef.matchTags, r.tags)) return false;
    if (needle) {
      const hay = (r.name + r.area + r.cuisine + r.address + r.desc + (r.tags || []).join(" ") + (block ? (r as SItem).nearest ?? "" : "")).toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  };
  const results = useMemo(
    () => restaurants.filter((r) => pass(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, region, cuisine, tag, scene, sceneDefs, restaurants, block],
  );
  // 一覧の件数（その軸以外の絞り込みを掛けたときの店の数）
  const counts = useMemo(() => {
    const byRegion = new Map<string, number>();
    let regionAll = 0;
    for (const r of restaurants) if (pass(r, "region")) { byRegion.set(r.region, (byRegion.get(r.region) || 0) + 1); regionAll++; }
    const cuisineRows = BROAD_GROUPS.map((g) => ({ label: g.label, count: 0 }));
    let cuisineAll = 0;
    for (const r of restaurants) if (pass(r, "cuisine")) { cuisineAll++; BROAD_GROUPS.forEach((g, i) => { if (matchesCuisineFilter(g.label, r)) cuisineRows[i].count++; }); }
    const sceneRows = sceneDefs.map((x) => ({ slug: x.slug, name: x.name, count: 0 }));
    let sceneAll = 0;
    for (const r of restaurants) if (pass(r, "scene")) { sceneAll++; sceneDefs.forEach((x, i) => { if (shopInScene(x.matchTags, r.tags)) sceneRows[i].count++; }); }
    return { byRegion, regionAll, cuisineRows, cuisineAll, sceneRows, sceneAll };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, region, cuisine, tag, scene, sceneDefs, restaurants, block]);

  const buildUrl = (overrides: { q?: string; region?: string; cuisine?: string; tag?: string; scene?: string; tab?: string; page?: string; sort?: string }) => {
    const next = {
      q: overrides.q !== undefined ? overrides.q : spQ,
      region: overrides.region !== undefined ? overrides.region : spRegion,
      cuisine: overrides.cuisine !== undefined ? overrides.cuisine : spCuisine,
      tag: overrides.tag !== undefined ? overrides.tag : spTag,
      scene: overrides.scene !== undefined ? overrides.scene : spScene,
      tab: overrides.tab !== undefined ? overrides.tab : spTab ?? "",
      page: overrides.page ?? "",
      sort: overrides.sort !== undefined ? overrides.sort : spSort,
    };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.region) params.set("region", next.region);
    if (next.cuisine && next.cuisine !== "ALL") params.set("cuisine", next.cuisine);
    if (next.scene) params.set("scene", next.scene);
    if (next.tag) params.set("tag", next.tag);
    if (next.tab && isTab(next.tab) && !(block && next.tab === "q")) params.set("tab", next.tab);
    // こだわり条件（ON のときだけ）は、キーワードや地域を変えても保つ
    if (facets) {
      const budget = sp.get("budget");
      const f = sp.get("f");
      if (budget) params.set("budget", budget);
      if (f) params.set("f", f);
    }
    if (allowMapUrl && (mapParam === "a" || mapParam === "b" || mapParam === "c" || mapParam === "d" || mapParam === "f" || mapParam === "g" || mapParam === "h")) params.set("map", mapParam);
    if (block && next.sort === "new") params.set("sort", "new");
    if (lookParam === "noren" || lookParam === "block") params.set("look", lookParam);
    if (next.page && next.page !== "1") params.set("page", next.page);
    return `/search${params.toString() ? "?" + params.toString() : ""}`;
  };

  /** 絞り込みをはずした URL（見た目・並べ替え・地図の指定だけ残す。こだわり条件もはずす） */
  const clearUrl = (() => {
    const params = new URLSearchParams();
    if (allowMapUrl && (mapParam === "b" || mapParam === "c" || mapParam === "d")) params.set("map", mapParam);
    if (block && spSort === "new") params.set("sort", "new");
    if (lookParam === "noren" || lookParam === "block") params.set("look", lookParam);
    return `/search${params.toString() ? "?" + params.toString() : ""}`;
  })();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ q: q.trim(), tab: "q" }));
  };

  const clearTag = () => {
    setTag("");
    router.push(buildUrl({ tag: "" }));
  };

  // 画面の組み立て。list は表示する店。ext（こだわり条件）が無ければ条件のパネルは出ない。
  // pending（こだわり条件の部品を読み込んでいる間）は、読み込み中の文だけ。入力欄・結果は出さない
  // （先に出すと、読み込みが終わって画面が入れ替わったとき、入力中の欄が作り直されてフォーカスとキャレットを失い、続きの入力が消える）
  const view = (list: SearchItem[], ext?: FacetExt, pending = false) => {
    const applied = !!spQ || !!spRegion || spCuisine !== "ALL" || !!spTag || !!spScene || !!ext?.active;
    // どのタブを開くか: ?tab= があればそれ、無ければ絞り込みに使っている項目のタブ、無ければエリア
    const active: Tab = isTab(spTab) && !(block && spTab === "q")
      ? spTab
      : spCuisine !== "ALL"
        ? "genre"
        : spScene
          ? "scene"
          : spTag || ext?.active
            ? "tag"
            : spQ && !spRegion && !block
              ? "q"
              : "area";
    const regionName = spRegion in REGIONS ? REGIONS[spRegion as RegionKey].name : "";
    const shown = list.slice((Math.min(page, Math.max(1, Math.ceil(list.length / PER))) - 1) * PER, Math.min(page, Math.max(1, Math.ceil(list.length / PER))) * PER);
    const pages = Math.max(1, Math.ceil(list.length / PER));
    const cur = Math.min(page, pages);
    const row = (href: string, label: string, count: number, on: boolean) => (
      <li key={label}>
        <Link href={href} className="vMp-row" aria-current={on ? "true" : undefined} data-cursor="PICK">
          <span>{label}</span>
          <em>{count}</em>
        </Link>
      </li>
    );
    // ---- block の見た目（参考画像の形。白い地・橙の差し色。絞り込み・件数・URL の作りは下の暖簾の見た目と同じ） ----
    if (block) {
      const ordered = spSort === "new" ? [...list].sort((a, b) => idNo(b.id) - idNo(a.id)) : list;
      const bshown = ordered.slice((cur - 1) * PER, cur * PER);
      const brow = (href: string, label: string, count: number, on: boolean) => (
        <li key={label}>
          <Link href={href} className="vBk-row" aria-current={on ? "true" : undefined}>
            <PinIcon size={16} />
            <span>{label}</span>
            <em>{count}</em>
          </Link>
        </li>
      );
      // いまの絞り込みの札（× でその条件だけ外れる）。キーワード・エリア・業種・シーン（タグは下に、こだわり条件は ext.summary）
      const chosen: { key: string; label: string; what: string; href: string }[] = [];
      if (spQ) chosen.push({ key: "q", label: `「${spQ}」`, what: `キーワード「${spQ}」`, href: buildUrl({ q: "" }) });
      if (regionName) chosen.push({ key: "region", label: regionName, what: `エリア「${regionName}」`, href: buildUrl({ region: "" }) });
      if (spCuisine !== "ALL") chosen.push({ key: "cuisine", label: spCuisine, what: `業種「${spCuisine}」`, href: buildUrl({ cuisine: "ALL" }) });
      if (sceneDef) chosen.push({ key: "scene", label: sceneDef.name, what: `利用シーン「${sceneDef.name}」`, href: buildUrl({ scene: "" }) });
      // 0 件のとき: 業種のリンクは、いまの条件をすべてはずして、その業種だけで探す（見た目・並べ替え・地図の指定だけ残す）
      const freshCuisine = (label: string) => {
        const u = new URLSearchParams(clearUrl.split("?")[1] ?? "");
        u.set("cuisine", label);
        u.set("tab", "genre");
        return `/search?${u.toString()}`;
      };
      return (
        <section className="vBk-main vBk-find" aria-label="店の検索">
          <div className="vBk-wrap">
            {pending ? (
              <p role="status" aria-busy="true" className="vBk-empty">
                条件を読み込んでいます…
              </p>
            ) : (
              <>
                {/* 探し方のタブ（選んでいるタブは橙） */}
                <nav className="vBk-tabs" aria-label="探し方">
                  {BLOCK_TABS.map((t) => (
                    <Link key={t.key} href={buildUrl({ tab: t.key })} className="vBk-tab" aria-current={active === t.key ? "true" : undefined}>
                      <TabIcon k={t.key} />
                      <span>{t.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* 箱: 左にイラストの地図・右にそのタブの一覧 */}
                <div className="vBk-box">
                  <ResultsMap look="block" list={list} coords={coords} prefOf={prefOf} townOf={townOf} prefRegion={prefRegion} mode={mapMode} regionKey={spRegion in REGIONS ? spRegion : ""} onPick={(rg) => router.push(buildUrl({ region: rg, tab: "area" }))} />
                  <div className={`vBk-side vBk-side--${active}`}>
                    {active === "area" && (
                      <>
                        {regionName && (
                          <p className="vBk-regionlink">
                            <Link href={`/region/${spRegion}`}>
                              {regionName}のページを見る <ArrowIcon size={15} />
                            </Link>
                          </p>
                        )}
                        <ul className="vBk-list" aria-label="エリア">
                          {brow(buildUrl({ region: "", tab: "area" }), "すべてのエリア", counts.regionAll, !spRegion)}
                          {Object.entries(REGIONS).map(([k, r]) => brow(buildUrl({ region: k, tab: "area" }), r.name, counts.byRegion.get(k) || 0, spRegion === k))}
                        </ul>
                      </>
                    )}
                    {active === "genre" && (
                      <ul className="vBk-list" aria-label="業種">
                        {brow(buildUrl({ cuisine: "ALL", tab: "genre" }), "すべての業種", counts.cuisineAll, spCuisine === "ALL")}
                        {counts.cuisineRows.map((c) => brow(buildUrl({ cuisine: c.label, tab: "genre" }), c.label, c.count, spCuisine === c.label))}
                        {isLegacyCuisineLabel(spCuisine) && brow(buildUrl({ cuisine: spCuisine, tab: "genre" }), spCuisine, results.length, true)}
                      </ul>
                    )}
                    {active === "scene" && (
                      <ul className="vBk-list" aria-label="利用シーン">
                        {brow(buildUrl({ scene: "", tab: "scene" }), "すべてのシーン", counts.sceneAll, !spScene)}
                        {counts.sceneRows.map((s) => brow(buildUrl({ scene: s.slug, tab: "scene" }), s.name, s.count, spScene === s.slug))}
                      </ul>
                    )}
                    {active === "tag" && (
                      <div className="vBk-tagtab">
                        {ext?.panel}
                        {allTags.some(([t]) => isShowableTag(t)) && (
                          <section className="vBk-tags" aria-labelledby="vBk-tagcloud">
                            <h2 id="vBk-tagcloud" className="vBk-h">
                              タグから探す
                            </h2>
                            <ul className="vBk-tagcloud">
                              {allTags.filter(([t]) => isShowableTag(t)).map(([t, count]) => (
                                <li key={t}>
                                  <Link href={buildUrl({ tag: t, tab: "tag" })} className={"vBk-hash" + (t === spTag ? " on" : "")} aria-current={t === spTag ? "true" : undefined}>
                                    #{t}
                                    <span className="c">{count}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {ext?.notice}
                {/* 結果 */}
                <div className="vBk-reshead">
                  <h2>検索結果</h2>
                  <p className="vBk-count" aria-live="polite">
                    <strong>
                      <CountUp value={list.length} />
                    </strong>
                    件
                  </p>
                  {chosen.map((c) => (
                    <span key={c.key} className="vBk-chosen">
                      <span>{c.label}</span>
                      <Link href={c.href} scroll={false} className="vBk-chosen-x" aria-label={`${c.what}を外す`}>
                        ×
                      </Link>
                    </span>
                  ))}
                  {spTag && (
                    <span className="vBk-chosen">
                      <span>#{spTag}</span>
                      <button type="button" className="vBk-chosen-x" onClick={clearTag} aria-label="タグを外す">
                        ×
                      </button>
                    </span>
                  )}
                  {ext?.summary}
                  {applied && (
                    <Link href={clearUrl} className="vBk-clear">
                      絞り込みをはずす
                    </Link>
                  )}
                  <div className="vBk-sort" role="group" aria-label="並べ替え">
                    <Link href={buildUrl({ sort: "" })} aria-current={spSort === "" ? "true" : undefined}>
                      標準
                    </Link>
                    <Link href={buildUrl({ sort: "new" })} aria-current={spSort === "new" ? "true" : undefined}>
                      新着順
                    </Link>
                  </div>
                </div>

                {bshown.length > 0 ? (
                  <ul key={`${spQ}|${spRegion}|${spCuisine}|${spScene}|${spTag}|${spSort}|${cur}`} className="vBk-grid" aria-label="検索結果">
                    {bshown.map((r, i) => (
                      <BlockCard key={r.id} r={r} tags={ext?.tagsOf?.(r.id)?.tags} eager={i < 3} />
                    ))}
                  </ul>
                ) : (
                  <div className="vBk-empty vBk-empty--rich" role="status">
                    <p className="vBk-empty-h">{spQ ? `「${spQ}」に合う店は見つかりませんでした` : "条件に合う店は見つかりませんでした"}</p>
                    <p className="vBk-empty-p">言葉や条件を変えて、もう一度さがしてみてください。</p>
                    <ul className="vBk-empty-links" aria-label="条件を外す">
                      {chosen.map((c) => (
                        <li key={c.key}>
                          <Link href={c.href} scroll={false}>
                            {c.what}を外す
                          </Link>
                        </li>
                      ))}
                      {spTag && (
                        <li>
                          <Link href={buildUrl({ tag: "" })} scroll={false}>
                            タグ「#{spTag}」を外す
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link href={clearUrl}>すべての条件をはずして、全店から探す</Link>
                      </li>
                    </ul>
                    <p className="vBk-empty-p">業種から探す</p>
                    <ul className="vBk-empty-cuis" aria-label="業種から探す">
                      {BROAD_GROUPS.map((g) => (
                        <li key={g.key}>
                          <Link href={freshCuisine(g.label)}>{g.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pages > 1 && (
                  <nav className="vBk-pager" aria-label="ページ">
                    {cur > 1 && <Link href={buildUrl({ page: String(cur - 1) })}>前へ</Link>}
                    <span aria-current="page">
                      {cur} / {pages}
                    </span>
                    {cur < pages && <Link href={buildUrl({ page: String(cur + 1) })}>次へ</Link>}
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
      );
    }
    return (
      <>
        <section className="vI-list vI-find vSc-find vMp" aria-label="店の検索">
          <div className="vI-list-in">
            {pending ? (
              <p role="status" aria-busy="true" className="vI-empty">
                条件を読み込んでいます…
              </p>
            ) : (
              <>
                {/* 探し方のタブ */}
                <nav className="vMp-tabs" aria-label="探し方">
                  {TABS.map((t) => (
                    <Link key={t.key} href={buildUrl({ tab: t.key })} className="vMp-tab" aria-current={active === t.key ? "true" : undefined} data-cursor="TAB">
                      {t.label}
                    </Link>
                  ))}
                </nav>

                {/* 箱: 左に地図・右にそのタブの一覧 */}
                <div className="vMp-box">
                  <ResultsMap list={list} coords={coords} prefOf={prefOf} townOf={townOf} prefRegion={prefRegion} mode={mapMode} regionKey={spRegion in REGIONS ? spRegion : ""} onPick={(rg) => router.push(buildUrl({ region: rg, tab: "area" }))} />
                  <div className={`vMp-side vMp-side--${active}`}>
                    {active === "area" && (
                      <>
                        {regionName && (
                          <p className="vSc-regionlink">
                            <Link href={`/region/${spRegion}`} data-cursor="GO">
                              {regionName}のページを見る <span aria-hidden="true">→</span>
                            </Link>
                          </p>
                        )}
                        <ul className="vMp-list" aria-label="エリア">
                          {row(buildUrl({ region: "", tab: "area" }), "すべてのエリア", counts.regionAll, !spRegion)}
                          {Object.entries(REGIONS).map(([k, r]) => row(buildUrl({ region: k, tab: "area" }), r.name, counts.byRegion.get(k) || 0, spRegion === k))}
                        </ul>
                      </>
                    )}
                    {active === "genre" && (
                      <ul className="vMp-list" aria-label="業種">
                        {row(buildUrl({ cuisine: "ALL", tab: "genre" }), "すべての業種", counts.cuisineAll, spCuisine === "ALL")}
                        {counts.cuisineRows.map((c) => row(buildUrl({ cuisine: c.label, tab: "genre" }), c.label, c.count, spCuisine === c.label))}
                        {/* 以前の細かい分類の名前の URL（?cuisine=居酒屋 など）で開いたときだけ、その名前を 1 つ足す（選択の表示を保つ。絞り込みは matchesCuisineFilter） */}
                        {isLegacyCuisineLabel(spCuisine) && row(buildUrl({ cuisine: spCuisine, tab: "genre" }), spCuisine, results.length, true)}
                      </ul>
                    )}
                    {active === "scene" && (
                      <ul className="vMp-list" aria-label="利用シーン">
                        {row(buildUrl({ scene: "", tab: "scene" }), "すべてのシーン", counts.sceneAll, !spScene)}
                        {counts.sceneRows.map((s) => row(buildUrl({ scene: s.slug, tab: "scene" }), s.name, s.count, spScene === s.slug))}
                      </ul>
                    )}
                    {active === "tag" && (
                      <div className="vMp-tagtab">
                        {ext?.panel}
                        {allTags.length > 0 && (
                          <section className="vMp-tags" aria-labelledby="vSc-tagcloud">
                            <h2 id="vSc-tagcloud" className="vMp-h">
                              タグから<em>さがす。</em>
                            </h2>
                            <ul className="vI-tags">
                              {allTags.map(([t, count]) => (
                                <li key={t}>
                                  <Link href={buildUrl({ tag: t, tab: "tag" })} className={"vI-hash" + (t === spTag ? " on" : "")} data-cursor="TAG" aria-current={t === spTag ? "true" : undefined}>
                                    #{t}
                                    <span className="c">{count}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </div>
                    )}
                    {active === "q" && (
                      <form className="vMp-qform" onSubmit={onSubmit} role="search" aria-label="キーワードでさがす">
                        <label htmlFor="vSc-q">キーワード</label>
                        <div className="vMp-qrow">
                          <input id="vSc-q" type="text" placeholder="店名・エリア・料理名・タグ" value={q} onChange={(e) => setQ(e.target.value)} />
                          <button type="submit" className="vI-btn" data-cursor="SEARCH">
                            検索 →
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* 結果 */}
                {spTag && active !== "tag" && (
                  <div className="vSc-active">
                    <span>タグ絞り込み</span>
                    <span className="vSc-chip">
                      #{spTag}
                      <button type="button" onClick={clearTag} aria-label="タグを外す">
                        ×
                      </button>
                    </span>
                  </div>
                )}
                {ext?.notice}
                <div className="vI-bar vMp-res">
                  <h2 className="vMp-resh">検索結果</h2>
                  <p className="vI-bar-c" aria-live="polite">
                    {q && <>キーワード: 「{q}」 / </>}
                    {regionName && <>{regionName} / </>}
                    {cuisine !== "ALL" && <>{cuisine} / </>}
                    {sceneDef && <>{sceneDef.name} / </>}
                    {tag && <>#{tag} / </>}
                    {ext?.summary}
                    {!applied && "全件表示"}
                    {applied && (
                      <Link href="/search" className="vMp-clear" data-cursor="BACK">
                        絞り込みをはずす
                      </Link>
                    )}
                  </p>
                  <p className="vI-bar-n">
                    <em><CountUp value={list.length} /></em> / {restaurants.length}
                    <small>店</small>
                  </p>
                </div>

                {shown.length > 0 ? (
                  <ul key={`${spQ}|${spRegion}|${spCuisine}|${spScene}|${spTag}|${cur}`} className="vSc-grid vMp-gridin" aria-label="検索結果">
                    {shown.map((r, i) => {
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

                {pages > 1 && (
                  <nav className="vMp-pager" aria-label="ページ">
                    {cur > 1 ? (
                      <Link href={buildUrl({ page: String(cur - 1) })} data-cursor="PREV">
                        前へ
                      </Link>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    <span aria-current="page">
                      {cur} / {pages}
                    </span>
                    {cur < pages ? (
                      <Link href={buildUrl({ page: String(cur + 1) })} data-cursor="NEXT">
                        次へ
                      </Link>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
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
