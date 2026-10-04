/**
 * 業種横断の街ページ（県）。/area/{pref}
 * グルメは既存の /region/{key}（lib/areas/gourmet.ts の対応表で引く）。新業種は /{v}/area/{pref}。
 * 件数は実データだけ。0 のときは「掲載準備中」を出し、リンクは張らない。
 */
import { liveStaticParams } from "@/lib/portal/launch";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { gourmetRegionKey } from "@/lib/areas/gourmet";
import { getPlaces } from "@/lib/places";
import { VERTICALS, NEW_VERTICAL_KEYS } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { getStationIndex } from "@/lib/stations/query";
import { getVideosByPref } from "@/lib/videos";
import { loadMapData, subsetOfPref } from "@/lib/portal/mapData";
import VideoTiles from "../video/VideoTiles";
import PortalMap from "../PortalMap";
import { notFoundMetadata, pick } from "./data";
import { StationChips } from "./station-parts";
import { Block, PageFrame, ShareSection, accentStyle, type Tone } from "./frame";

type Props = { params: Promise<{ pref: string }> };

/** 業種横断のページは特定の業種の色を持たない（墨と生成り） */
const NEUTRAL: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "街" };

const ORDER = Object.values(VERTICALS);

/** 業種ごとの件数と飛び先。グルメは region キーで数える（Place.pref はグルメだと region キーのため） */
async function rowsFor(pref: string) {
  const gKey = gourmetRegionKey(pref);
  return Promise.all(
    ORDER.map(async (v) => {
      if (v.key === "gourmet") {
        const count = gKey ? (await getPlaces("gourmet", { pref: gKey })).length : 0;
        return { v, count, href: gKey ? `/region/${gKey}` : null };
      }
      const count = pick(await getPlaces(v.key), { pref }).length;
      return { v, count, href: count > 0 ? `${v.path}/area/${pref}` : null };
    }),
  );
}

export const generateStaticParams = liveStaticParams(() => {
  return PREFECTURES.map((p) => ({ pref: p.slug }));
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pref } = await params;
  const area = getPrefBySlug(pref);
  if (!area) return notFoundMetadata();
  // index 判定は新業種の掲載数で行う（lib/seo/gate.ts）。新業種が 3 件に満たないあいだは noindex
  const newCount = pick((await Promise.all(NEW_VERTICAL_KEYS.map((k) => getPlaces(k)))).flat(), { pref }).length;
  return buildMetadata({
    vertical: "portal",
    title: `${area.short}の店を業種から探す｜マチノワ`,
    description: `${area.short}のグルメ・ビューティー・ボディケア・ペット・おでかけ・ステイ。業種をまたいで、街の店を探せます。`,
    path: `/area/${pref}`,
    count: newCount,
  });
}

export default async function Page({ params }: Props) {
  const { pref } = await params;
  const area = getPrefBySlug(pref);
  if (!area) notFound();
  const rows = await rowsFor(pref);
  const total = rows.reduce((a, r) => a + r.count, 0);
  // その県の駅エリア（店の多い順の上位）。店のある駅が無い県では出さない
  const stations = (await getStationIndex()).byPref.get(pref) ?? [];
  // その県の店が映っている動画。0 本なら出さない
  const videos = await getVideosByPref(pref);
  // 県の小さな地図（店のピン）。座標のある店が無い県では出さない
  const mini = subsetOfPref(await loadMapData(), pref);
  const colors = Object.fromEntries(ORDER.map((v) => [v.key, v.accent.color]));

  return (
    <PageFrame
      tone={NEUTRAL}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: area.short, href: `/area/${pref}` },
      ]}
      kicker="Machinowa — Area"
      heading={`${area.short}の店を業種から探す`}
      lead={`${area.short}のグルメ・ビューティー・ボディケア・ペット・おでかけ・ステイを、業種ごとに見渡せます。`}
      count={total}
    >
      <Block id="mp-xv-h" kicker="Verticals" title={`${area.short}の業種別の掲載`}>
        <ul className="mp-xv">
          {rows.map(({ v, count, href }) => {
            const face = VERTICAL_FACE[v.key];
            const inner = (
              <>
                <span className="g" aria-hidden="true">{face.glyph}</span>
                <b className="nm">{v.name}</b>
                <span className="ct">
                  {count > 0 ? (
                    <>
                      <strong>{count}</strong>件
                    </>
                  ) : (
                    "掲載準備中"
                  )}
                </span>
                {href && <span className="go">{v.name}を見る →</span>}
              </>
            );
            return (
              <li key={v.key} style={accentStyle(v)}>
                {href ? (
                  <Link href={href} prefetch={false} className="mp-xv-card" data-cursor={face.en.toUpperCase()}>
                    {inner}
                  </Link>
                ) : (
                  <div className="mp-xv-card">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Block>

      {mini.points.length > 0 && (
        <Block id="mp-xv-map-h" kicker="Map" title={`${area.short}の店を地図で見る`}>
          <PortalMap
            fit
            lazy
            points={mini.points}
            colors={colors}
            weeks={mini.weeks}
            height="clamp(280px, 42vh, 420px)"
            label={`${area.short}の店の地図`}
          />
          <p className="mp-note-links">
            <Link href={`/map?pref=${pref}`} prefetch={false} data-cursor="MAP">
              {area.short}を地図で見る（大きな地図で開く） <span aria-hidden="true">→</span>
            </Link>
          </p>
          <p className="mp-map-note">
            ピンは店の住所や地図の座標から求めた位置で、目安です。地図には座標のある{mini.points.length}店を出しています。
          </p>
        </Block>
      )}

      {stations.length > 0 && (
        <Block id="mp-xv-st-h" kicker="Stations" title={`${area.short}の駅から探す`}>
          <StationChips items={stations.slice(0, 12)} />
          <p className="mp-note-links">
            <Link href={`/station/${pref}`} prefetch={false} data-cursor="STATION">
              {area.short}の駅エリア一覧（{stations.length}）
            </Link>
            <Link href="/station" prefetch={false} data-cursor="STATION">
              全国の駅から探す
            </Link>
          </p>
        </Block>
      )}

      {videos.length > 0 && (
        <Block id="mp-xv-video-h" kicker="Video" title={`${area.short}の動画`}>
          <VideoTiles videos={videos.slice(0, 8)} />
          <p className="mp-note-links">
            <Link href={`/videos?pref=${pref}`} prefetch={false} data-cursor="VIDEO">
              {area.short}の動画をすべて見る（{videos.length}）
            </Link>
          </p>
        </Block>
      )}

      <Block id="mp-xv-hub-h" kicker="Entrances" title="業種の入口">
        <ul className="mp-others six">
          {ORDER.map((v) => (
            <li key={v.key} style={accentStyle(v)}>
              <Link href={v.path} prefetch={false} data-cursor={VERTICAL_FACE[v.key].en.toUpperCase()}>
                <span className="g" aria-hidden="true">{VERTICAL_FACE[v.key].glyph}</span>
                <b>{v.name}</b>
                <small>{VERTICAL_FACE[v.key].en}</small>
              </Link>
            </li>
          ))}
        </ul>
      </Block>

      <ShareSection path={`/area/${pref}`} text={`${area.short}の店を業種から探す｜マチノワ`} label="この街のページを共有" />
    </PageFrame>
  );
}
