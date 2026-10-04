/**
 * 駅エリアのページ。/station/{pref}/{name}
 * 店は業種ごとのブロック。並びは「店の案内に最寄り駅として書かれている店（stated）」→
 * 「駅から直線距離 800m 以内の店（nearby、近い順）」。
 * 徒歩分数は店の案内文から取れたものだけ。距離から分数を作らない（lib/stations/walk.ts）。
 */
import { liveStaticParams } from "@/lib/portal/launch";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../JsonLd";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { isUsableImage } from "@/lib/portal/home";
import { shopPhoto } from "@/lib/portal/photos";
import { sized } from "@/lib/imageUrl";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { buildMetadata } from "@/lib/seo/meta";
import { isIndexable } from "@/lib/seo/gate";
import { SITE_URL, absUrl, fillTitle } from "@/lib/seo/util";
import { stationItemList } from "@/lib/seo/stationLd";
import {
  NEARBY_MAX_METERS,
  aliasText,
  getStationIndex,
  nearStations,
  placeCategoryName,
  placeHref,
  roundMeters,
  safeDecode,
  stationHeading,
  stationHref,
  uniqueLines,
  type StationStore,
  type StationSummary,
} from "@/lib/stations/query";
import { getVideosByStation } from "@/lib/videos";
import { loadMapData, subsetOf } from "@/lib/portal/mapData";
import { packWeeks } from "@/lib/portal/openNow";
import VideoTiles from "../video/VideoTiles";
import PortalMap from "../PortalMap";
import ShopPhoto from "../ShopPhoto";
import { OpenBadge, OpenBar, OpenCount, OpenScope } from "../OpenNow";
import { notFoundMetadata } from "./data";
import { Block, PageFrame, ShareSection, accentStyle } from "./frame";
import { STATION_TONE, GenreChips, StationChips, StationCredit } from "./station-parts";
import { genreHref, getGenreIndex } from "@/lib/stations/genre";

type Props = { params: Promise<{ pref: string; name: string }> };

export const generateStaticParams = liveStaticParams(async () => {
  const idx = await getStationIndex();
  return idx.all.map((s) => ({ pref: s.station.pref!, name: s.station.name }));
});

async function find(params: Props["params"]): Promise<{ pref: string; summary: StationSummary } | null> {
  const p = await params;
  const pref = safeDecode(p.pref);
  const name = safeDecode(p.name);
  const summary = (await getStationIndex()).bySlug.get(`${pref}/${name}`);
  return summary ? { pref, summary } : null;
}

/** JSON-LD の画像は絶対URL。自サイトの画像（/restaurants/...）は日本語を percent-encode して絶対URLにする */
export function absImage(src: string): string {
  if (!src.startsWith("/")) return src;
  let path = src;
  try {
    path = encodeURI(decodeURI(src));
  } catch {
    /* そのまま */
  }
  return `${SITE_URL}${path}`;
}

/** 件数・路線・別名から作る説明文 */
function describe(summary: StationSummary): string {
  const st = summary.station;
  const aka = aliasText(st);
  const lineNames = [...new Set(uniqueLines(st).map((l) => l.line))];
  const lines = lineNames.slice(0, 4).join("・") + (lineNames.length > 4 ? "ほか" : "");
  return (
    `${st.cityName ?? ""}の${stationHeading(st)}${aka ? `（${aka}）` : ""}にある店を${summary.count}件掲載。` +
    `路線は${lines}。店の案内に最寄り駅として書かれている店と、駅から直線距離${NEARBY_MAX_METERS}m以内の店を並べています。`
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find(params);
  if (!hit) return notFoundMetadata();
  const { pref, summary } = hit;
  const st = summary.station;
  // 同じ駅名が別の県にもあるとき（愛野＝静岡・長崎 など）は、タイトルが他のページと重ならないよう県名を添える
  const idx = await getStationIndex();
  const dup = idx.all.some((s) => s.station.id !== st.id && s.station.name === st.name);
  const prefShort = getPrefBySlug(pref)?.short ?? "";
  // 件数が 3 件未満のときはタイトルに件数を出さない（noindex の薄いページ）
  const title = fillTitle("{name}の店{count}選｜マチノワ", {
    name: dup && prefShort ? `${stationHeading(st)}（${prefShort}）` : stationHeading(st),
    count: isIndexable(summary.count) ? summary.count : 0,
  });
  return buildMetadata({
    vertical: "portal",
    title,
    description: describe(summary),
    path: `/station/${pref}/${st.name}`,
    count: summary.count,
  });
}

export function StoreCard({ s }: { s: StationStore }) {
  const { place: p, vertical: v } = s;
  const cat = placeCategoryName(v, p);
  const walk =
    s.kind === "stated"
      ? s.walkMin != null
        ? `徒歩${s.walkMin}分（店の案内）`
        : null
      : s.meters != null
        ? `駅から約${roundMeters(s.meters)}m（直線距離）`
        : null;
  return (
    <li>
      <Link href={placeHref(v, p)} prefetch={false} className="mp-st-card" data-cursor={VERTICAL_FACE[v.key].en.toUpperCase()}>
        <span className="img">
          {shopPhoto(p.image) ? (
            <ShopPhoto image={p.image} alt={`${p.name}の写真`} sizes="(max-width: 700px) 46vw, 280px" />
          ) : (
            <span className="g" aria-hidden="true">{VERTICAL_FACE[v.key].glyph}</span>
          )}
        </span>
        <span className="body">
          {cat && <small>{cat}</small>}
          <b>{p.name}</b>
          {walk && <span className="walk">{walk}</span>}
          {p.cityName && <span className="area">{p.cityName}</span>}
          <OpenBadge id={p.id} />
        </span>
      </Link>
    </li>
  );
}

export default async function Page({ params }: Props) {
  const hit = await find(params);
  if (!hit) notFound();
  const { pref, summary } = hit;
  const st = summary.station;
  const area = getPrefBySlug(pref);
  if (!area) notFound();
  const idx = await getStationIndex();
  // この駅エリアで、条件を満たすジャンルのページ（店 3 店以上で、駅の店がそのジャンルだけではない）。無ければ入口は出さない
  const genrePages = (await getGenreIndex()).byStation.get(st.id) ?? [];

  const heading = stationHeading(st);
  const aka = aliasText(st);
  const lines = uniqueLines(st);
  const near = nearStations(idx, st, 8);
  const prefStations = idx.byPref.get(pref)?.length ?? 0;
  // この駅エリアの店が映っている動画。0 本なら出さない
  const videos = getVideosByStation(st.id);

  // 業種ごとのブロック。店が無い業種は出さない
  const groups = Object.values(VERTICALS)
    .map((v) => ({
      v,
      stated: summary.stores.filter((s) => s.vertical.key === v.key && s.kind === "stated"),
      nearby: summary.stores.filter((s) => s.vertical.key === v.key && s.kind === "nearby"),
    }))
    .filter((g) => g.stated.length + g.nearby.length > 0);

  // 営業中かどうかは現在時刻で変わるので、判定はクライアント（components/portal/OpenNow.tsx）。ここでは営業予定の表だけ渡す
  const weeks = packWeeks(summary.stores.map((s) => ({ id: s.place.id, hours: s.place.hours, closed: s.place.holidays })));
  // 小さな地図（店のピン＋駅の位置）。座標の無い店は出さない
  const mini = subsetOf(await loadMapData(), summary.stores.map((s) => s.place.id));
  const colors = Object.fromEntries(Object.values(VERTICALS).map((v) => [v.key, v.accent.color]));
  const stationName = st.name.endsWith("駅") ? st.name : `${st.name}駅`;

  const ld = stationItemList(
    `${heading}の店`,
    summary.stores.map((s) => ({
      name: s.place.name,
      url: absUrl(placeHref(s.vertical, s.place)),
      image:
        s.place.image && isUsableImage(s.place.image) && !isBlockedImage(s.place.image)
          ? absImage(sized(s.place.image, 480))
          : undefined,
    })),
  );

  return (
    <PageFrame
      tone={STATION_TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "駅から探す", href: "/station" },
        { name: area.short, href: `/station/${pref}` },
        { name: `${heading}`, href: `/station/${pref}/${st.name}` },
      ]}
      kicker="Machinowa — Station"
      heading={heading}
      lead={`${st.cityName ?? area.name}の${heading}${aka ? `（${aka}）` : ""}にある店を、業種ごとに掲載しています。店の案内に最寄り駅として書かれている店を先に、続けて駅から直線距離で${NEARBY_MAX_METERS}m以内の店を近い順に並べています。`}
      count={summary.count}
      extra={
        <dl className="mp-st-facts">
          <div>
            <dt>市区町村</dt>
            <dd>{st.cityName ?? area.name}</dd>
          </div>
          <div>
            <dt>路線</dt>
            <dd>
              <ul className="mp-st-lines">
                {lines.map((l) => (
                  <li key={`${l.line}|${l.operator}`}>
                    {l.line}
                    <small>{l.operator}</small>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      }
    >
      <Block id="mp-st-map-h" kicker="Map" title={`${heading}の地図`}>
        <PortalMap
          fit
          lazy
          points={mini.points}
          colors={colors}
          weeks={mini.weeks}
          station={{ name: stationName, lat: st.lat, lng: st.lng }}
          height="clamp(280px, 42vh, 400px)"
          label={`${heading}の店の地図`}
        />
        <p className="mp-note-links">
          <Link href={`/map?station=${pref}/${st.name}`} prefetch={false} data-cursor="MAP">
            地図で見る（大きな地図で開く） <span aria-hidden="true">→</span>
          </Link>
        </p>
        <p className="mp-map-note">
          駅の位置は駅データ、店のピンは店の住所や地図の座標から求めた位置で、どちらも目安です。
          {summary.count - mini.points.length > 0 && `位置が取れていない${summary.count - mini.points.length}店は地図に出ていません。`}
        </p>
      </Block>

      {genrePages.length > 0 && (
        <Block id="mp-st-genre-h" kicker="Genre" title={`${st.name}のジャンル別の店`}>
          <GenreChips
            items={genrePages.map((g) => ({
              key: g.genre,
              href: genreHref(pref, st.name, g.genre),
              label: `${st.name}の${g.genre}`,
              count: g.count,
            }))}
          />
        </Block>
      )}

      <OpenScope weeks={weeks}>
        <section className="mp-pg-sec mp-obar-sec" aria-label="営業中の絞り込み">
          <div className="mp-wrap">
            <OpenBar ids={summary.stores.map((s) => s.place.id)} />
          </div>
        </section>
        {groups.map(({ v, stated, nearby }) => (
          <Block
            key={v.key}
            id={`mp-st-${v.key}-h`}
            kicker={VERTICAL_FACE[v.key].en}
            className="mp-og"
            title={
              <>
                {v.name}（<OpenCount ids={[...stated, ...nearby].map((s) => s.place.id)} />）
              </>
            }
          >
            <div className="mp-st-group" style={accentStyle(v)}>
              {stated.length > 0 && (
                <div className="mp-og">
                  <div className="mp-st-sub">
                    <h3>店の案内に最寄り駅として書かれている店</h3>
                    <span>
                      <OpenCount ids={stated.map((s) => s.place.id)} />
                    </span>
                  </div>
                  <ul className="mp-st-cards">{stated.map((s) => <StoreCard key={s.place.id} s={s} />)}</ul>
                </div>
              )}
              {nearby.length > 0 && (
                <div className="mp-og">
                  <div className="mp-st-sub">
                    <h3>駅から直線距離で{NEARBY_MAX_METERS}m以内の店</h3>
                    <span>
                      <OpenCount ids={nearby.map((s) => s.place.id)} />・近い順
                    </span>
                  </div>
                  <ul className="mp-st-cards">{nearby.map((s) => <StoreCard key={s.place.id} s={s} />)}</ul>
                </div>
              )}
            </div>
          </Block>
        ))}
      </OpenScope>

      {videos.length > 0 && (
        <Block id="mp-st-video-h" kicker="Video" title="この駅の周辺の動画">
          <VideoTiles videos={videos} />
          <p className="mp-note-links">
            <Link href="/videos" prefetch={false} data-cursor="VIDEO">
              動画で探す
            </Link>
          </p>
        </Block>
      )}

      {near.length > 0 && (
        <Block id="mp-st-near-h" kicker="Nearby" title="近くの駅エリア">
          <StationChips items={near} />
        </Block>
      )}

      <Block id="mp-st-more-h" kicker="More" title="ほかの探し方">
        <ul className="mp-chips">
          <li>
            <Link href={`/station/${pref}`} prefetch={false} data-cursor="STATION">
              {area.short}の駅エリア一覧（{prefStations}）
            </Link>
          </li>
          <li>
            <Link href={`/area/${pref}`} prefetch={false} data-cursor="AREA">
              {area.short}の街を業種から探す
            </Link>
          </li>
          <li>
            <Link href="/station" prefetch={false} data-cursor="STATION">
              全国の駅から探す
            </Link>
          </li>
        </ul>
      </Block>

      <ShareSection path={`/station/${pref}/${st.name}`} text={`${heading}の店｜マチノワ`} label="この駅のページを共有" />
      <StationCredit />
      <JsonLd data={ld} />
    </PageFrame>
  );
}
