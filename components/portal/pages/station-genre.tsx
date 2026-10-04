/**
 * ジャンル × 駅エリアのページ。/station/{pref}/{駅名}/{ジャンル}（例 /station/osaka/難波/焼き鳥）
 *
 * ジャンルは lib/cuisineGroups.ts の label（日本語のまま）。店がジャンルに当たるかは /search?cuisine= と同じ判定。
 * 店の一覧・カード・並び順は駅ページと同じ（店の案内に最寄り駅として書かれている店 → 直線距離 800m 以内の店、近い順）。
 * ページを作る条件は lib/stations/genre.ts（その駅エリア × ジャンルが 3 店以上、かつ駅の店がそのジャンルだけではない）。
 * 満たさない組み合わせは 404（noindex の薄いページは作らない）。
 */
import { liveStaticParams } from "@/lib/portal/launch";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../JsonLd";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import { isUsableImage } from "@/lib/portal/home";
import { sized } from "@/lib/imageUrl";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { buildMetadata } from "@/lib/seo/meta";
import { absUrl, fillTitle } from "@/lib/seo/util";
import { stationItemList } from "@/lib/seo/stationLd";
import { genreHref, genreKey, getGenreIndex, nearGenrePages, type GenrePage } from "@/lib/stations/genre";
import {
  NEARBY_MAX_METERS,
  aliasText,
  getStationIndex,
  placeHref,
  safeDecode,
  stationHeading,
  stationHref,
} from "@/lib/stations/query";
import { parseTown } from "@/lib/towns";
import { loadMapData, subsetOf } from "@/lib/portal/mapData";
import { packWeeks } from "@/lib/portal/openNow";
import PortalMap from "../PortalMap";
import { OpenBar, OpenCount, OpenScope } from "../OpenNow";
import { notFoundMetadata } from "./data";
import { Block, PageFrame, ShareSection, accentStyle } from "./frame";
import { STATION_TONE, GenreChips, StationCredit } from "./station-parts";
import { StoreCard, absImage } from "./station";

type Props = { params: Promise<{ pref: string; name: string; genre: string }> };

export const generateStaticParams = liveStaticParams(async () => {
  const gi = await getGenreIndex();
  return gi.pages.map((p) => ({ pref: p.summary.station.pref!, name: p.summary.station.name, genre: p.genre }));
});

async function find(params: Props["params"]): Promise<{ pref: string; page: GenrePage } | null> {
  const p = await params;
  const pref = safeDecode(p.pref);
  const name = safeDecode(p.name);
  const genre = safeDecode(p.genre);
  const page = (await getGenreIndex()).byKey.get(genreKey(pref, name, genre));
  return page ? { pref, page } : null;
}

/**
 * 店のある市区町村名（店の住所から取る。lib/towns.ts の parseTown と同じ規則で、政令市は区まで）。
 * 店の「area」は「京都・四条」のような自由記述なので使わない。取れない店は数えない。店の多い市区町村から、同数は出てきた順。
 */
function cityNames(page: GenrePage): string[] {
  const counts = new Map<string, number>();
  for (const s of page.stores) {
    const town = parseTown(s.place.address, s.place.pref)?.town;
    if (town) counts.set(town, (counts.get(town) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/** 件数・内訳・市区町村から作る説明文（決まり文句は足さない） */
function describe(page: GenrePage, areaName: string): string {
  const st = page.summary.station;
  const cities = cityNames(page);
  const parts = [
    `${st.cityName ?? areaName}の${stationHeading(st)}にある${page.genre}の店を${page.count}件掲載。`,
    `この駅周辺の店は全部で${page.summary.count}件。`,
  ];
  // 駅エリアの市区町村と同じ 1 つだけなら、冒頭の文と重なるので書かない
  if (cities.length > 1 || (cities.length === 1 && cities[0] !== st.cityName)) {
    parts.push(`店のある市区町村は${cities.slice(0, 4).join("・")}${cities.length > 4 ? "ほか" : ""}。`);
  }
  const kinds = [
    page.statedCount > 0 ? `店の案内に最寄り駅として書かれている店${page.statedCount}件` : "",
    page.nearbyCount > 0 ? `駅から直線距離${NEARBY_MAX_METERS}m以内の店${page.nearbyCount}件` : "",
  ].filter(Boolean);
  parts.push(`${kinds.join("と、")}を並べています。`);
  return parts.join("");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find(params);
  if (!hit) return notFoundMetadata();
  const { pref, page } = hit;
  const st = page.summary.station;
  const area = getPrefBySlug(pref);
  // 同じ駅名が別の県にもあるとき（愛野＝静岡・長崎 など）は、タイトルが他のページと重ならないよう県名を添える
  const idx = await getStationIndex();
  const dup = idx.all.some((s) => s.station.id !== st.id && s.station.name === st.name);
  const title = fillTitle("{name}の{category}{count}選｜マチノワ", {
    name: dup && area ? `${st.name}（${area.short}）` : st.name,
    category: page.genre,
    count: page.count,
  });
  return buildMetadata({
    vertical: "portal",
    title,
    description: describe(page, area?.name ?? ""),
    path: genreHref(pref, st.name, page.genre),
    count: page.count,
  });
}

export default async function Page({ params }: Props) {
  const hit = await find(params);
  if (!hit) notFound();
  const { pref, page } = hit;
  const { summary, genre } = page;
  const st = summary.station;
  const area = getPrefBySlug(pref);
  if (!area) notFound();
  const gi = await getGenreIndex();

  const heading = `${st.name}の${genre}`;
  const stationLabel = stationHeading(st);
  const aka = aliasText(st);
  const cities = cityNames(page);
  const stated = page.stores.filter((s) => s.kind === "stated");
  const nearby = page.stores.filter((s) => s.kind === "nearby");
  const v = VERTICALS.gourmet;

  // 同じ駅のほかのジャンル／同じ県でこのジャンルがある近い駅（どちらもページのあるものだけ）
  const otherGenres = (gi.byStation.get(st.id) ?? []).filter((g) => g.genre !== genre);
  const nearGenre = nearGenrePages(gi, summary, genre, 8);

  // 営業中かどうかは現在時刻で変わるので、判定はクライアント（components/portal/OpenNow.tsx）。ここでは営業予定の表だけ渡す
  const weeks = packWeeks(page.stores.map((s) => ({ id: s.place.id, hours: s.place.hours, closed: s.place.holidays })));
  // 小さな地図（店のピン＋駅の位置）。座標の無い店は出さない
  const mini = subsetOf(await loadMapData(), page.stores.map((s) => s.place.id));
  const colors = Object.fromEntries(Object.values(VERTICALS).map((x) => [x.key, x.accent.color]));
  const stationName = `${st.name}駅`;

  const ld = stationItemList(
    `${heading}の店`,
    page.stores.map((s) => ({
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
        { name: stationLabel, href: stationHref(st) },
        { name: genre, href: genreHref(pref, st.name, genre) },
      ]}
      kicker="Machinowa — Station × Genre"
      heading={heading}
      lead={`${st.cityName ?? area.name}の${stationLabel}${aka ? `（${aka}）` : ""}にある店のうち、${genre}の店を掲載しています。店の案内に最寄り駅として書かれている店を先に、続けて駅から直線距離で${NEARBY_MAX_METERS}m以内の店を近い順に並べています。`}
      count={page.count}
      unit="店"
      extra={
        <dl className="mp-st-facts">
          {cities.length > 0 && (
            <div>
              <dt>市区町村</dt>
              <dd>{cities.join("・")}</dd>
            </div>
          )}
          <div>
            <dt>この駅周辺の店</dt>
            <dd>
              全{summary.count}件のうち、{genre}は{page.count}件
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
          {page.count - mini.points.length > 0 && `位置が取れていない${page.count - mini.points.length}店は地図に出ていません。`}
        </p>
      </Block>

      <OpenScope weeks={weeks}>
        <section className="mp-pg-sec mp-obar-sec" aria-label="営業中の絞り込み">
          <div className="mp-wrap">
            <OpenBar ids={page.stores.map((s) => s.place.id)} />
          </div>
        </section>
        <Block
          id="mp-st-list-h"
          kicker="Shops"
          className="mp-og"
          title={
            <>
              {heading}の店（<OpenCount ids={page.stores.map((s) => s.place.id)} />）
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
      </OpenScope>

      {otherGenres.length > 0 && (
        <Block id="mp-st-genre-h" kicker="Genre" title={`${st.name}のほかのジャンル`}>
          <GenreChips
            items={otherGenres.map((g) => ({
              key: g.genre,
              href: genreHref(pref, st.name, g.genre),
              label: `${st.name}の${g.genre}`,
              count: g.count,
            }))}
          />
        </Block>
      )}

      {nearGenre.length > 0 && (
        <Block id="mp-st-near-h" kicker="Nearby" title={`${area.short}のほかの駅の${genre}`}>
          <GenreChips
            items={nearGenre.map((g) => ({
              key: g.summary.station.id,
              href: genreHref(pref, g.summary.station.name, genre),
              label: `${g.summary.station.name}の${genre}`,
              count: g.count,
            }))}
          />
        </Block>
      )}

      <Block id="mp-st-more-h" kicker="More" title="ほかの探し方">
        <ul className="mp-chips">
          <li>
            <Link href={stationHref(st)} prefetch={false} data-cursor="STATION">
              {stationLabel}の店をすべて見る（{summary.count}）
            </Link>
          </li>
          <li>
            <Link href={`/station/${pref}`} prefetch={false} data-cursor="STATION">
              {area.short}の駅エリア一覧
            </Link>
          </li>
          <li>
            <Link href={`/area/${pref}`} prefetch={false} data-cursor="AREA">
              {area.short}の街を業種から探す
            </Link>
          </li>
        </ul>
      </Block>

      <ShareSection path={genreHref(pref, st.name, genre)} text={`${heading}｜マチノワ`} label="このページを共有" />
      <StationCredit />
      <JsonLd data={ld} />
    </PageFrame>
  );
}
