"use client";
/**
 * /map の本体（クライアント）: 業種チップ・今開いている店だけの切替・日本地図の枠（MapStage）・段ごとの一覧。
 * データはサーバーの page から props で受け取る（@/lib/data は import しない）。
 * 一覧（テキストのリンク）は初期 HTML にも出る（JS なしでも中身がある）。チップで絞ると地図と一覧が同じ集合になる。
 *
 * 段: japan（地方を選ぶ）→ region（県を選ぶ）→ pref（店の一覧とピンの地図）。station は駅から来たとき（ピンの地図だけ）。
 * どの段に居るかは URL（?r=・?p=）が正。ただしリンクを押した瞬間に、サーバーの応答を待たずに画面を動かすため、
 * 押した先を pending として持ち、URL の側が追いついたら捨てる（追いつかなければ 4 秒で捨てる）。
 * 県・地方・店数は、props の points（全国の店）からここで数える（サーバーとの食い違いが出ない）。
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import PortalMap, { type MapView, type PinPoint } from "./PortalMap";
import { OpenBadge, OpenBar, OpenCount, OpenScope, statusOf, useNowMs, useOpenOnly, type WeekTableProp } from "./OpenNow";
import MapStage, { mapHref, type Stage, type Target } from "./MapStage";
import { PrefRows, RegionList, StageNav } from "./MapRegionPicker";
import { getRegionBySlug, regionOfPref, type StationLabel } from "@/lib/portal/mapRegions";
import { isOpenState } from "@/lib/portal/openNow";

export interface ExplorerPoint extends PinPoint {
  /** 都道府県 slug（分からなければ空） */
  pref: string;
}

export interface VerticalChip {
  key: string;
  name: string;
  color: string;
  /** 地図に出せる店の数（実数） */
  count: number;
}

export interface Focus {
  /** ページ上部に出す、見ている範囲の名前（無ければ全国） */
  label?: string;
  /** 一覧に出す店を県で絞る */
  pref?: string;
  /** 一覧に出す店を店 ID で絞る（駅） */
  ids?: string[];
  view?: MapView;
  station?: { name: string; lat: number; lng: number };
}

export type { Stage };

interface Props {
  /** ページの見出し（サーバーで作る）。PC では左の列の先頭に入る */
  head: ReactNode;
  stage: Stage;
  /** 地方の slug（stage が region・pref のとき） */
  region?: string;
  points: ExplorerPoint[];
  weeks: WeekTableProp;
  verticals: VerticalChip[];
  /** 県 slug → 短い名前（地方ブロック順の並びで渡す） */
  prefs: { slug: string; short: string }[];
  focus: Focus;
  /** 座標が無くて地図に出せない店の数 */
  missing: number;
  /** 県 slug → 駅名の注記 */
  stations: Record<string, StationLabel[]>;
}

const WALK_RINGS = [
  { m: 400, label: "400m" },
  { m: 800, label: "800m" },
];

export default function MapExplorer({ head, stage, region: regionSlug, points, weeks, verticals, prefs, focus, missing, stations }: Props) {
  const [v, setV] = useState<string>("all");
  const [hl, setHl] = useState<string | null>(null);
  const [hlStore, setHlStore] = useState<string | null>(null);
  const open = useOpenOnly();
  const only = open;
  const now = useNowMs();
  const colors = useMemo(() => Object.fromEntries(verticals.map((x) => [x.key, x.color])), [verticals]);

  /* ── いまの段（URL）と、押した直後の先（pending） ── */
  const actual: Target = useMemo(
    () => (stage === "pref" && focus.pref ? { stage: "pref", region: regionSlug, pref: focus.pref } : stage === "region" ? { stage: "region", region: regionSlug } : { stage: "japan" }),
    [stage, regionSlug, focus.pref],
  );
  const actualKey = `${actual.stage}|${actual.region ?? ""}|${actual.pref ?? ""}`;
  const [pending, setPending] = useState<Target | null>(null);
  useEffect(() => {
    setPending(null);
  }, [actualKey]);
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(null), 4000);
    return () => clearTimeout(t);
  }, [pending]);
  const eff: Target = pending ?? actual;
  // 段が変わったあと、押したリンクが消えて操作の位置が失われていたら、新しい見出しへ移す（キーボード・読み上げの利用者向け）
  const prevKey = useRef(actualKey);
  useEffect(() => {
    if (prevKey.current === actualKey) return; // 最初の表示では動かさない（StrictMode の二重実行でも）
    prevKey.current = actualKey;
    const timer = setTimeout(() => {
      const ae = document.activeElement;
      if (!ae || ae === document.body || !document.body.contains(ae)) {
        document.querySelector<HTMLElement>(".mp-mx-body .mp-st-h")?.focus({ preventScroll: true });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [actualKey]);
  const go = useCallback((t: Target, e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    setPending(t);
  }, []);

  // ピンの地図は、カメラが寄り終わるころに作る（Leaflet の読み込み・初期化の重い処理を、寄る動きの途中にぶつけない）。
  // URL を直接開いたときは最初から作る
  const [mapOn, setMapOn] = useState(stage === "pref");
  useEffect(() => {
    if (eff.stage !== "pref") {
      setMapOn(false);
      return;
    }
    const timer = setTimeout(() => setMapOn(true), 650);
    return () => clearTimeout(timer);
  }, [eff.stage, eff.pref]);

  /* ── 絞り込みと店数 ── */
  const shown = useMemo(() => (v === "all" ? points : points.filter((p) => p.vertical === v)), [points, v]);
  const total = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of shown) m[p.pref] = (m[p.pref] ?? 0) + 1;
    return m;
  }, [shown]);
  const counts = useMemo(() => {
    if (!only || now === null) return total;
    const m: Record<string, number> = {};
    for (const p of shown) {
      const r = statusOf(weeks, p.id, now);
      if (r && isOpenState(r.state)) m[p.pref] = (m[p.pref] ?? 0) + 1;
    }
    return m;
  }, [only, now, shown, total, weeks]);

  const isStation = stage === "station";
  const region = getRegionBySlug(eff.stage === "pref" ? (regionOfPref(eff.pref ?? "")?.slug ?? eff.region) : eff.region);
  const prefInfo = eff.stage === "pref" ? prefs.find((x) => x.slug === eff.pref) : undefined;
  const prefName = prefInfo?.short ?? (eff.stage === "pref" ? focus.label : undefined);

  const idSet = useMemo(() => (focus.ids ? new Set(focus.ids) : null), [focus.ids]);
  const listed = useMemo(() => {
    if (isStation) return shown.filter((p) => (idSet ? idSet.has(p.id) : true));
    if (eff.stage === "pref") return shown.filter((p) => p.pref === eff.pref);
    return [];
  }, [shown, idSet, isStation, eff.stage, eff.pref]);

  const regionIds = useMemo(() => (region ? shown.filter((p) => region.prefs.some((x) => x.slug === p.pref)).map((p) => p.id) : []), [region, shown]);
  const unknownPref = total[""] ?? 0;
  const current = verticals.find((x) => x.key === v);
  const allCount = points.length;
  const sumCounts = (slugs: string[]) => slugs.reduce((a, s) => a + (counts[s] ?? 0), 0);
  const regionN = region ? sumCounts(region.prefs.map((p) => p.slug)) : 0;
  const prefN = eff.stage === "pref" && eff.pref ? (counts[eff.pref] ?? 0) : 0;
  const nationN = sumCounts(Object.keys(counts));

  /* ── 県の段のピンの地図 ── */
  const prefView: MapView | undefined = useMemo(() => {
    if (eff.stage !== "pref" || !eff.pref) return undefined;
    const inPref = points.filter((p) => p.pref === eff.pref);
    if (inPref.length === 0) return undefined;
    const lats = inPref.map((p) => p.lat);
    const lngs = inPref.map((p) => p.lng);
    return {
      bounds: [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
    };
  }, [eff.stage, eff.pref, points]);

  const back =
    eff.stage === "pref" && region
      ? { href: mapHref(region.prefs.length === 1 ? {} : { r: region.slug }, open), label: region.prefs.length === 1 ? "日本地図" : region.label, target: (region.prefs.length === 1 ? { stage: "japan" } : { stage: "region", region: region.slug }) as Target }
      : eff.stage === "region"
        ? { href: mapHref({}, open), label: "日本地図", target: { stage: "japan" } as Target }
        : null;

  const announce = isStation
    ? `${focus.label ?? ""}の店の地図と一覧を表示しています。`
    : eff.stage === "pref"
      ? `${prefName ?? ""}の店 ${prefN}店の地図と一覧を表示しています。`
      : eff.stage === "region"
        ? `${region?.label ?? ""}の県を表示しています。県を選んでください。`
        : "日本地図を表示しています。地方を選んでください。";

  const plate =
    eff.stage === "pref"
      ? { k: "PREFECTURE", t: prefName ?? "", s: `${prefN}店・点は店、文字は最寄り駅` }
      : eff.stage === "region"
        ? { k: "REGION", t: region?.label ?? "", s: `${regionN}店・県を選ぶ` }
        : { k: "JAPAN", t: "日本", s: "47都道府県・8地方" };

  const emptyNote = current && shown.length === 0 ? `${current.name}は、まだ掲載がありません（掲載準備中）。` : null;

  return (
    <OpenScope weeks={weeks}>
      <div className="mp-mx" data-stage={isStation ? "station" : eff.stage}>
        <div className="mp-mx-head">{head}</div>

        <div className="mp-mx-top">
          <ul className="mp-mx-chips" aria-label="業種で絞り込む">
            <li>
              <button type="button" className="mp-mx-chip" aria-pressed={v === "all"} onClick={() => setV("all")}>
                すべて<small>{allCount}</small>
              </button>
            </li>
            {verticals.map((x) => (
              <li key={x.key} style={{ ["--ac" as string]: x.color } as CSSProperties}>
                <button
                  type="button"
                  className="mp-mx-chip"
                  aria-pressed={v === x.key}
                  data-empty={x.count === 0 ? "1" : undefined}
                  onClick={() => setV(x.key)}
                >
                  <i aria-hidden="true" />
                  {x.name}
                  <small>{x.count > 0 ? x.count : "準備中"}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mp-mx-obar">
          <OpenBar ids={isStation ? listed.map((p) => p.id) : eff.stage === "pref" ? listed.map((p) => p.id) : eff.stage === "region" ? regionIds : shown.map((p) => p.id)} />
        </div>

        <div className="mp-mx-frame">
          {isStation ? (
            <div className="mp-fr mp-fr-station" data-stage="station">
              <PortalMap
                basemap="plain"
                fill
                points={shown}
                colors={colors}
                weeks={weeks}
                station={focus.station}
                view={focus.view}
                rings={WALK_RINGS}
                height="100%"
                label={`${focus.label ?? ""}の店の地図`}
                highlightId={hlStore}
              />
              {emptyNote && (
                <p className="mp-mx-empty" role="status">
                  {emptyNote}
                </p>
              )}
              <div className="mp-fr-ui">
                <p className="mp-fr-note">点線の輪は、駅の位置から 400m と 800m の直線距離です。</p>
              </div>
            </div>
          ) : (
            <MapStage eff={eff} open={open} counts={counts} total={total} hl={hl} setHl={setHl} go={go} back={back} plate={plate}>
              {eff.stage === "pref" && eff.pref && mapOn && (
                <PortalMap
                  key={eff.pref}
                  basemap="plain"
                  fill
                  limit
                  intro
                  points={listed}
                  colors={colors}
                  weeks={weeks}
                  view={prefView}
                  stations={stations[eff.pref]}
                  highlightId={hlStore}
                  height="100%"
                  label={`${prefName ?? ""}の店の地図`}
                />
              )}
              {eff.stage === "pref" && emptyNote && (
                <p className="mp-mx-empty" role="status">
                  {emptyNote}
                </p>
              )}
            </MapStage>
          )}
        </div>

        <div className="mp-mx-body">
          {eff.stage === "japan" && !isStation && (
            <>
              <header className="mp-st">
                <p className="mp-st-k">Japan ・ 日本全国</p>
                <h2 className="mp-st-h" tabIndex={-1}>
                  地方から選ぶ
                  <span className="mp-st-n">
                    <b data-testid="all-total">{nationN}</b>店
                  </span>
                </h2>
              </header>
              <RegionList counts={counts} total={total} hl={hl} open={open} go={go} setHl={setHl} />
              {emptyNote && <p className="mp-mx-empty static">{emptyNote}</p>}
              <p className="mp-mx-meta">
                <span>全国の店を、地方と県に分けています（地図の色が濃いほど店が多い）。</span>
                {missing > 0 && <span>位置が取れていない {missing}店は、この店数に含まれません。</span>}
                {unknownPref > 0 && <span>県が分からない {unknownPref}店は、地方・県の店数に含まれません。</span>}
              </p>
            </>
          )}

          {eff.stage === "region" && region && !isStation && (
            <>
              <StageNav region={region} open={open} go={go} />
              <header className="mp-st">
                <p className="mp-st-k">Region ・ 県を選ぶ</p>
                <h2 className="mp-st-h" tabIndex={-1}>
                  {region.label}
                  <span className="mp-st-n">
                    <b data-testid="region-total">{regionN}</b>店
                  </span>
                </h2>
              </header>
              <PrefRows region={region} counts={counts} total={total} open={open} go={go} setHl={setHl} />
              {emptyNote && <p className="mp-mx-empty static">{emptyNote}</p>}
              <p className="mp-mx-meta">
                <span>県を選ぶと、店の点の図と一覧が出ます。0店の県は押せません。</span>
                {missing > 0 && <span>位置が取れていない {missing}店は、この店数に含まれません。</span>}
              </p>
            </>
          )}

          {(eff.stage === "pref" || isStation) && (
            <>
              {!isStation && region && <StageNav region={region} prefName={prefName} open={open} go={go} />}
              <header className="mp-st">
                <p className="mp-st-k">{isStation ? "Station ・ 駅" : "Prefecture ・ 店の一覧"}</p>
                <h2 className="mp-st-h" tabIndex={-1}>
                  {isStation ? (focus.label ?? "") : (prefName ?? "")}
                  <span className="mp-st-n">
                    <b data-testid="listed-total">
                      <OpenCount ids={listed.map((p) => p.id)} unit="" />
                    </b>
                    店
                  </span>
                </h2>
              </header>
              <section className="mp-mx-list" aria-label="店の一覧">
                {listed.length === 0 ? (
                  <p className="mp-mx-empty static">{current ? `${current.name}の店は、まだ掲載がありません。` : "表示できる店がありません。"}</p>
                ) : (
                  <ul className="mp-mx-rows" onPointerLeave={() => setHlStore(null)}>
                    {listed.map((p) => (
                      <li key={p.id} style={{ ["--ac" as string]: colors[p.vertical] } as CSSProperties}>
                        <Link
                          href={p.href}
                          prefetch={false}
                          className="mp-mx-row"
                          onPointerEnter={() => setHlStore(p.id)}
                          onFocus={() => setHlStore(p.id)}
                          onBlur={() => setHlStore(null)}
                        >
                          <b>{p.name}</b>
                          <span className="meta">{[p.category, p.stationName].filter(Boolean).join("・")}</span>
                          <OpenBadge id={p.id} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <p className="mp-mx-meta">
                {isStation ? (
                  <span>
                    {focus.label}の店 <b data-testid="pin-total">{listed.length}</b>店を、地図と一覧に出しています。
                  </span>
                ) : (
                  <span>
                    {prefName}の店 <b data-testid="pin-total">{listed.length}</b>店を、点の図と一覧に出しています。
                  </span>
                )}
                {missing > 0 && <span>位置が取れていない {missing}店は、図には出ません。</span>}
                <span>点の位置は、住所や地図の座標から求めた目安です。正確な場所は各店のページでご確認ください。</span>
                {!isStation && <span>駅名は、店の案内に最寄り駅として書かれている駅です。</span>}
                <Link href={mapHref({}, open)} prefetch={false} data-cursor="MAP" onClick={(e) => go({ stage: "japan" }, e)}>
                  日本地図から選びなおす
                </Link>
              </p>
            </>
          )}

          <p className="mp-mx-foot">
            営業中・営業時間外は、店の案内にある営業時間と定休日をもとに、日本時間の現在時刻で判定しています。営業時間や定休日が読み取れない店は「営業時間不明」です。
            <b>臨時休業・祝日は店にご確認ください。</b>
          </p>
        </div>

        <p className="mp-sr" role="status" aria-live="polite">
          {announce}
        </p>
      </div>
    </OpenScope>
  );
}
