/**
 * 地図で探す。/map
 * 全業種の店をピンで表示する（業種の色＝lib/verticals の accent。いまは実データのある業種だけピンが出る）。
 * ?station={pref}/{name} … その駅の位置に合わせる。?pref={pref} … その県に合わせる。どちらも一覧はその範囲の店。
 * 試作の地図ページなので、件数ゲートと関係なく常に noindex（canonical は /map）。
 * データはサーバーで最小限（id, name, lat, lng, vertical, category, stationName, href＋県）に絞って、クライアントの地図へ渡す。
 */
import type { Metadata } from "next";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { buildMetadata } from "@/lib/seo/meta";
import { loadMapData, type MapPoint } from "@/lib/portal/mapData";
import { getStationIndex, safeDecode, stationHeading } from "@/lib/stations/query";
import MapExplorer, { type Focus, type VerticalChip } from "../MapExplorer";
import { PageFrame, type Tone } from "./frame";
import { StationCredit } from "./station-parts";

const TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "地" };

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

/** 点の範囲（南西・北東） */
function boundsOf(points: MapPoint[]): [[number, number], [number, number]] {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
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
  const prefParam = first(sp.pref);
  let focus: Focus = {};
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
      count = inPref.length;
      focus = {
        label: area.short,
        pref: area.slug,
        view: inPref.length > 0 ? { bounds: boundsOf(inPref) } : undefined,
      };
    }
  }

  // 掲載のある県だけ、一覧の見出しにする（地方ブロック順）
  const present = new Set(data.points.map((p) => p.pref));
  const prefs = PREFECTURES.filter((p) => present.has(p.slug)).map((p) => ({ slug: p.slug, short: p.short }));

  const live = verticals.filter((v) => v.count > 0).map((v) => v.name);
  const lead =
    `${focus.label ? `${focus.label}の店を` : "全国の店を"}地図から探せます。業種の色のピンで表示し、業種のチップで絞り込めます。` +
    (live.length < verticals.length ? `いまは${live.join("・")}の店を表示しています（ほかの業種は掲載準備中）。` : "");

  return (
    <PageFrame
      className="mp-mx-page"
      tone={TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "地図で探す", href: "/map" },
      ]}
      kicker="Machinowa — Map"
      heading="地図で探す"
      lead={lead}
      count={count}
      unit="店"
    >
      <section className="mp-pg-sec mp-mx-sec" aria-label="地図と店の一覧">
        <div className="mp-wrap">
          <MapExplorer
            points={data.points}
            weeks={data.weeks}
            verticals={verticals}
            prefs={prefs}
            focus={focus}
            missing={data.missing}
          />
        </div>
      </section>
      {station && <StationCredit />}
    </PageFrame>
  );
}
