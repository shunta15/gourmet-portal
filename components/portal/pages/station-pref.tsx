/**
 * 県の駅エリア一覧。/station/{pref}
 * 店のある駅エリアを件数の多い順に並べる。店のある駅が無い県は 404。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { getStationIndex, safeDecode } from "@/lib/stations/query";
import { notFoundMetadata } from "./data";
import { Block, PageFrame } from "./frame";
import { STATION_TONE, StationChips, StationCredit } from "./station-parts";

type Props = { params: Promise<{ pref: string }> };

export async function generateStaticParams() {
  const idx = await getStationIndex();
  return [...idx.byPref.keys()].map((pref) => ({ pref }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pref = safeDecode((await params).pref);
  const area = getPrefBySlug(pref);
  const idx = await getStationIndex();
  const stations = idx.byPref.get(pref);
  if (!area || !stations) return notFoundMetadata();
  const stores = idx.storesInPref.get(pref) ?? 0;
  return buildMetadata({
    vertical: "portal",
    title: `${area.short}の駅から店を探す｜マチノワ`,
    description: `${area.short}の${stations.length}の駅エリア、${stores}店。駅の周辺にある店を、件数の多い駅から探せます。`,
    path: `/station/${pref}`,
    count: stores,
  });
}

export default async function Page({ params }: Props) {
  const pref = safeDecode((await params).pref);
  const area = getPrefBySlug(pref);
  const idx = await getStationIndex();
  const stations = idx.byPref.get(pref);
  if (!area || !stations) notFound();
  const stores = idx.storesInPref.get(pref) ?? 0;

  return (
    <PageFrame
      tone={STATION_TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "駅から探す", href: "/station" },
        { name: area.short, href: `/station/${pref}` },
      ]}
      kicker="Machinowa — Station"
      heading={`${area.short}の駅から店を探す`}
      lead={`${area.short}で店のある${stations.length}の駅エリアを、店の多い順に並べています。駅エリアを選ぶと、駅の周辺の店を業種ごとに見られます。`}
      count={stores}
    >
      <Block id="mp-st-pref-h" kicker="Stations" title={`${area.short}の駅エリア`}>
        <StationChips items={stations} />
      </Block>
      <Block id="mp-st-more-h" kicker="More" title="ほかの探し方">
        <ul className="mp-chips">
          <li>
            <Link href="/station" prefetch={false} data-cursor="STATION">
              全国の駅から探す
            </Link>
          </li>
          <li>
            <Link href={`/area/${pref}`} prefetch={false} data-cursor="AREA">
              {area.short}の街を業種から探す
            </Link>
          </li>
        </ul>
      </Block>
      <StationCredit />
    </PageFrame>
  );
}
