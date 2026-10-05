"use client";
/**
 * /map の本体（クライアント）: 業種チップ・今開いている店だけの切替・地図・店の一覧。
 * データはサーバーの page から props で受け取る（@/lib/data は import しない）。
 * 一覧（テキストのリンク）は初期 HTML にも出る（JS なしでも中身がある）。チップで絞ると地図と一覧が同じ集合になる。
 */
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import PortalMap, { type MapView, type PinPoint } from "./PortalMap";
import { OpenBadge, OpenBar, OpenCount, OpenScope, useOpenOnly, type WeekTableProp } from "./OpenNow";
import { JapanMap, PrefCards, RegionList, StageNav, mapHref, regionIds, type PrefIds } from "./MapRegionPicker";
import { getRegionBySlug } from "@/lib/portal/mapRegions";

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

/** いまの段: 日本地図（地方を選ぶ）→ 地方（県を選ぶ）→ 県（店の一覧とピンの地図）。station は駅から来たときのピンの地図 */
export type Stage = "japan" | "region" | "pref" | "station";

interface Props {
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
}

export default function MapExplorer({ stage, region: regionSlug, points, weeks, verticals, prefs, focus, missing }: Props) {
  const [v, setV] = useState<string>("all");
  const open = useOpenOnly();
  const colors = useMemo(() => Object.fromEntries(verticals.map((x) => [x.key, x.color])), [verticals]);

  const shown = useMemo(() => (v === "all" ? points : points.filter((p) => p.vertical === v)), [points, v]);
  const idSet = useMemo(() => (focus.ids ? new Set(focus.ids) : null), [focus.ids]);
  const listed = useMemo(
    () => shown.filter((p) => (idSet ? idSet.has(p.id) : focus.pref ? p.pref === focus.pref : true)),
    [shown, idSet, focus.pref],
  );
  const groups = useMemo(() => {
    const byPref = new Map<string, ExplorerPoint[]>();
    for (const p of listed) {
      const list = byPref.get(p.pref);
      if (list) list.push(p);
      else byPref.set(p.pref, [p]);
    }
    const out = prefs.filter((x) => byPref.has(x.slug)).map((x) => ({ slug: x.slug, name: x.short, items: byPref.get(x.slug)! }));
    const unknown = byPref.get("");
    if (unknown) out.push({ slug: "", name: "県が不明", items: unknown });
    return out;
  }, [listed, prefs]);

  // 県ごとの店 ID（業種チップで絞った後。地方・県の店数はここから数える）
  const prefIds = useMemo(() => {
    const m: PrefIds = {};
    for (const p of shown) (m[p.pref] ??= []).push(p.id);
    return m;
  }, [shown]);
  const region = getRegionBySlug(regionSlug);
  const regionPoints = useMemo(() => (region ? regionIds(region, prefIds) : []), [region, prefIds]);
  const unknownPref = prefIds[""]?.length ?? 0;
  const prefName = focus.pref ? prefs.find((x) => x.slug === focus.pref)?.short : undefined;
  const showMap = stage === "pref" || stage === "station";

  const current = verticals.find((x) => x.key === v);
  const total = points.length;

  return (
    <OpenScope weeks={weeks}>
      <div className="mp-mx">
        <div className="mp-mx-bar">
          <ul className="mp-mx-chips" aria-label="業種で絞り込む">
            <li>
              <button type="button" className="mp-mx-chip" aria-pressed={v === "all"} onClick={() => setV("all")}>
                すべて<small>{total}</small>
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
          <OpenBar ids={stage === "region" ? regionPoints : shown.map((p) => p.id)} />
        </div>

        {stage === "japan" && (
          <>
            <div className="mp-jm">
              <div className="mp-jm-fig">
                <JapanMap prefIds={prefIds} />
                <p className="mp-jm-cap">
                  県をブロックで並べた概念図です（距離や面積は表しません）。地方を選ぶと、県が店数つきで並びます。
                </p>
              </div>
              <RegionList prefIds={prefIds} />
            </div>
            {shown.length === 0 && current && <p className="mp-mx-empty static">{current.name}は、まだ掲載がありません（掲載準備中）。</p>}
            <p className="mp-mx-meta">
              <span>
                全国の店{" "}
                <b data-testid="all-total">
                  <OpenCount ids={shown.map((p) => p.id)} unit="" />
                </b>
                店を、地方と県に分けています。
              </span>
              {missing > 0 && <span>位置が取れていない {missing}店は、この店数に含まれません。</span>}
              {unknownPref > 0 && <span>県が分からない {unknownPref}店は、地方・県の店数に含まれません。</span>}
            </p>
          </>
        )}

        {stage === "region" && region && (
          <>
            <StageNav region={region} />
            <PrefCards region={region} prefIds={prefIds} />
            {shown.length === 0 && current && <p className="mp-mx-empty static">{current.name}は、まだ掲載がありません（掲載準備中）。</p>}
            <p className="mp-mx-meta">
              <span>
                {region.label}の店{" "}
                <b data-testid="region-total">
                  <OpenCount ids={regionPoints} unit="" />
                </b>
                店。県を選ぶと、店の一覧と地図が出ます。
              </span>
              {missing > 0 && <span>位置が取れていない {missing}店は、この店数に含まれません。</span>}
            </p>
          </>
        )}

        {showMap && stage === "pref" && region && <StageNav region={region} prefName={prefName ?? focus.label} />}

        {showMap && (
          <>
            <div className="mp-mx-mapwrap">
              <PortalMap
                key={focus.pref ?? focus.station?.name ?? "all"}
                basemap="blank"
                points={shown}
                colors={colors}
                weeks={weeks}
                station={focus.station}
                view={focus.view}
                height="clamp(380px, 68vh, 700px)"
                label={`${focus.label ?? "全国"}の店の地図`}
              />
              {shown.length === 0 && current && (
                <p className="mp-mx-empty" role="status">
                  {current.name}は、まだ掲載がありません（掲載準備中）。
                </p>
              )}
            </div>

            <p className="mp-mx-meta">
              {focus.label ? (
                <>
                  <span>
                    {focus.label}の店{" "}
                    <b data-testid="listed-total">
                      <OpenCount ids={listed.map((p) => p.id)} unit="" />
                    </b>
                    店を、下の一覧に出しています。
                  </span>
                  <span>
                    地図には全国の店{" "}
                    <b data-testid="pin-total">
                      <OpenCount ids={shown.map((p) => p.id)} unit="" />
                    </b>
                    店を出し、{focus.label}に合わせています。
                  </span>
                </>
              ) : (
                <span>
                  全国の店{" "}
                  <b data-testid="pin-total">
                    <OpenCount ids={shown.map((p) => p.id)} unit="" />
                  </b>
                  店を、地図と下の一覧に出しています。
                </span>
              )}
              {missing > 0 && <span>位置が取れていない {missing}店は、地図には出ません。</span>}
              <span>ピンの位置は、住所や地図の座標から求めた目安です。正確な場所は各店のページでご確認ください。</span>
              {focus.label && (
                <Link href={mapHref({}, open)} prefetch={false} data-cursor="MAP">
                  日本地図から選びなおす
                </Link>
              )}
            </p>
          </>
        )}

        {showMap && (
          <section className="mp-mx-list" aria-label="店の一覧">
            {groups.length === 0 ? (
              <p className="mp-mx-empty static">
                {current ? `${current.name}の店は、まだ掲載がありません。` : "表示できる店がありません。"}
              </p>
            ) : (
              groups.map((g) => (
                <div key={g.slug || "none"} className="mp-og mp-mx-group">
                  <h2 className="mp-mx-gh">
                    {g.name}
                    <span>
                      <OpenCount ids={g.items.map((p) => p.id)} />
                    </span>
                  </h2>
                  <ul className="mp-mx-rows">
                    {g.items.map((p) => (
                      <li key={p.id} style={{ ["--ac" as string]: colors[p.vertical] } as CSSProperties}>
                        <Link href={p.href} prefetch={false} className="mp-mx-row">
                          <b>{p.name}</b>
                          <span className="meta">{[p.category, p.stationName].filter(Boolean).join("・")}</span>
                          <OpenBadge id={p.id} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </OpenScope>
  );
}
