/**
 * 駅エリアのページ。/station/{pref}/{name}
 * 店は業種ごとのブロック。並びは「店の案内に最寄り駅として書かれている店（stated）」→
 * 「駅から直線距離 800m 以内の店（nearby、近い順）」。
 * 徒歩分数は店の案内文から取れたものだけ。距離から分数を作らない（lib/stations/walk.ts）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../JsonLd";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { isUsableImage } from "@/lib/portal/home";
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
import VideoTiles from "../video/VideoTiles";
import { notFoundMetadata } from "./data";
import { Block, PageFrame, accentStyle } from "./frame";
import { STATION_TONE, StationChips, StationCredit } from "./station-parts";

type Props = { params: Promise<{ pref: string; name: string }> };

export async function generateStaticParams() {
  const idx = await getStationIndex();
  return idx.all.map((s) => ({ pref: s.station.pref!, name: s.station.name }));
}

async function find(params: Props["params"]): Promise<{ pref: string; summary: StationSummary } | null> {
  const p = await params;
  const pref = safeDecode(p.pref);
  const name = safeDecode(p.name);
  const summary = (await getStationIndex()).bySlug.get(`${pref}/${name}`);
  return summary ? { pref, summary } : null;
}

/** JSON-LD の画像は絶対URL。自サイトの画像（/restaurants/...）は日本語を percent-encode して絶対URLにする */
function absImage(src: string): string {
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
  // 件数が 3 件未満のときはタイトルに件数を出さない（noindex の薄いページ）
  const title = fillTitle("{name}の店{count}選｜マチノワ", {
    name: stationHeading(st),
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

function StoreCard({ s }: { s: StationStore }) {
  const { place: p, vertical: v } = s;
  const img = p.image && isUsableImage(p.image) && !isBlockedImage(p.image) ? sized(p.image, 480) : null;
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
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={`${p.name}の写真`} loading="lazy" decoding="async" width={480} height={360} />
          ) : (
            <span className="g" aria-hidden="true">{VERTICAL_FACE[v.key].glyph}</span>
          )}
        </span>
        <span className="body">
          {cat && <small>{cat}</small>}
          <b>{p.name}</b>
          {walk && <span className="walk">{walk}</span>}
          {p.cityName && <span className="area">{p.cityName}</span>}
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
      {groups.map(({ v, stated, nearby }) => (
        <Block
          key={v.key}
          id={`mp-st-${v.key}-h`}
          kicker={VERTICAL_FACE[v.key].en}
          title={`${v.name}（${stated.length + nearby.length}店）`}
        >
          <div className="mp-st-group" style={accentStyle(v)}>
            {stated.length > 0 && (
              <>
                <div className="mp-st-sub">
                  <h3>店の案内に最寄り駅として書かれている店</h3>
                  <span>{stated.length}店</span>
                </div>
                <ul className="mp-st-cards">{stated.map((s) => <StoreCard key={s.place.id} s={s} />)}</ul>
              </>
            )}
            {nearby.length > 0 && (
              <>
                <div className="mp-st-sub">
                  <h3>駅から直線距離で{NEARBY_MAX_METERS}m以内の店</h3>
                  <span>{nearby.length}店・近い順</span>
                </div>
                <ul className="mp-st-cards">{nearby.map((s) => <StoreCard key={s.place.id} s={s} />)}</ul>
              </>
            )}
          </div>
        </Block>
      ))}

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

      <StationCredit />
      <JsonLd data={ld} />
    </PageFrame>
  );
}
