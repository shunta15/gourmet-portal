/**
 * 地図で探す。/map
 * 全業種の店を、デフォルメした日本地図（タイルグリッド）→ 地方 → 県の点の図、と絞り込んで探す（業種の色＝lib/verticals の accent。
 * いまは実データのある業種だけ点が出る）。県の段の図は地図タイルを使わず、店の座標と駅名だけで描く（実際の地図らしさを出さない）。
 * 段: 日本地図（地方を選ぶ）→ ?r={地方} … その地方の県が店数つきで並ぶ → ?p={県} … 店の一覧と点の図。
 * ?station={pref}/{name} … その駅の位置に合わせる。?pref={pref} は ?p の別名（以前の指定）。一覧はその範囲の店。
 * 優先順位は station > 県（p・pref）> 地方（r）。変な値は無視して次へ。店が 0 の県は、その地方の段に戻す。
 * 試作の地図ページなので、件数ゲートと関係なく常に noindex（canonical は /map）。
 * データはサーバーで最小限（id, name, lat, lng, vertical, category, stationName, href＋県）に絞って、クライアントの地図へ渡す。
 * 見出しはこのページ専用（PageFrame の背の高い見出しは使わない。日本地図が最初の画面に収まるように、PC では左の列に収める）。
 */
import type { Metadata } from "next";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { getRegionBySlug, regionOfPref } from "@/lib/portal/mapRegions";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { buildMetadata } from "@/lib/seo/meta";
import { loadMapData } from "@/lib/portal/mapData";
import { getStationIndex, safeDecode, stationHeading } from "@/lib/stations/query";
import MapExplorer, { type Focus, type Stage, type VerticalChip } from "../MapExplorer";
import PortalFonts from "../PortalFonts";
import Breadcrumbs from "../Breadcrumbs";
import { StationCredit } from "./station-parts";
import "../map.css";

type SP = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SP> };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    vertical: "portal",
    title: "地図で探す｜マチノワ",
    description: "グルメをはじめ、業種をまたいで街の店を地図から探せます。業種で絞り込み、今開いている店だけに切り替えられます。",
    path: "/map",
    // 試作の地図ページ。件数に関わらず index にしない（count 0 → noindex）。公開時に判断する
    count: 0,
  });
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const data = await loadMapData();

  // 業種チップ（全業種。ピンの色は業種の色）
  const verticals: VerticalChip[] = (Object.keys(VERTICALS) as VerticalKey[]).map((k) => ({
    key: k,
    name: VERTICALS[k].name,
    color: VERTICALS[k].accent.color,
    count: data.byVertical[k],
  }));

  // 範囲の指定（駅が優先。変な値は無視して全国）
  const stationParam = first(sp.station);
  const prefParam = first(sp.p) ?? first(sp.pref);
  const regionParam = first(sp.r);
  let focus: Focus = {};
  let stage: Stage = "japan";
  let regionSlug: string | undefined;
  let station: { name: string; heading: string } | null = null;
  // ページ上部に出す件数（範囲を指定したときは、その範囲の、地図に出せる店の数）
  let count = data.points.length;
  if (stationParam) {
    const hit = (await getStationIndex()).bySlug.get(safeDecode(stationParam));
    if (hit) {
      const st = hit.station;
      station = { name: st.name, heading: stationHeading(st) };
      const ids = hit.stores.map((s) => s.place.id);
      const idSet = new Set(ids);
      count = data.points.filter((p) => idSet.has(p.id)).length;
      stage = "station";
      focus = {
        label: stationHeading(st),
        ids,
        view: { center: [st.lat, st.lng], zoom: 16 },
        station: { name: st.name.endsWith("駅") ? st.name : `${st.name}駅`, lat: st.lat, lng: st.lng },
      };
    }
  } else if (prefParam) {
    const area = getPrefBySlug(prefParam);
    if (area) {
      const inPref = data.points.filter((p) => p.pref === area.slug);
      regionSlug = regionOfPref(area.slug)?.slug;
      if (inPref.length > 0) {
        stage = "pref";
        count = inPref.length;
        focus = { label: area.short, pref: area.slug };
      } else {
        // 店が 0 の県は、その地方の段に戻す（そこでは押せない表示）
        stage = "region";
        count = data.points.filter((p) => regionOfPref(p.pref)?.slug === regionSlug).length;
      }
    }
  }
  if (stage === "japan" && regionParam) {
    const reg = getRegionBySlug(regionParam);
    if (reg) {
      stage = "region";
      regionSlug = reg.slug;
      count = data.points.filter((p) => regionOfPref(p.pref)?.slug === reg.slug).length;
    }
  }

  // 掲載のある県だけ、一覧の見出しにする（地方ブロック順）
  const present = new Set(data.points.map((p) => p.pref));
  const prefs = PREFECTURES.filter((p) => present.has(p.slug)).map((p) => ({ slug: p.slug, short: p.short }));

  const live = verticals.filter((v) => v.count > 0).map((v) => v.name);
  const lead =
    "日本地図から地方を選び、県、店の順に絞り込めます。" +
    (live.length < verticals.length ? `いまは${live.join("・")}の店を表示しています（ほかの業種は掲載準備中）。` : "");

  const head = (
    <>
      <PortalFonts />
      <Breadcrumbs
        items={[
          { name: "マチノワ", href: "/" },
          { name: "地図で探す", href: "/map" },
        ]}
      />
      <p className="mp-kicker">Machinowa — Map</p>
      <h1 className="mp-mx-title">地図で探す</h1>
      <p className="mp-mx-lead">{lead}</p>
      <div className="mp-mx-state">
        <p className="mp-state">
          <i aria-hidden="true" />
          {count > 0 ? "掲載中" : "掲載準備中"}
        </p>
        <p className="mp-mx-count">
          <b>{count}</b>
          {station ? "店（この駅）" : "店"}
        </p>
      </div>
    </>
  );

  return (
    <div className="mp-pg mp-mx-page" style={{ ["--ac" as string]: "#15110e", ["--acl" as string]: "#e7dfd0" }}>
      <section className="mp-mx-sec" aria-label="地図と店の一覧">
        <div className="mp-wrap">
          <MapExplorer
            head={head}
            stage={stage}
            region={regionSlug}
            points={data.points}
            weeks={data.weeks}
            verticals={verticals}
            prefs={prefs}
            focus={focus}
            missing={data.missing}
            stations={data.stationsByPref}
          />
        </div>
      </section>
      {station && <StationCredit />}
    </div>
  );
}
