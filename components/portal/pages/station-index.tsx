/**
 * 駅から探す（業種横断）の入口。/station
 * 都道府県（地方ブロック順）ごとに、店のある駅エリアを件数つきで並べる。件数は実データだけ。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PREFECTURES, type Prefecture } from "@/lib/areas/prefectures";
import { BLOCK_FACE } from "@/lib/portal/meta";
import { buildMetadata } from "@/lib/seo/meta";
import { getStationIndex } from "@/lib/stations/query";
import { Block, PageFrame } from "./frame";
import { STATION_TONE, StationChips, StationCredit } from "./station-parts";

export async function generateMetadata(): Promise<Metadata> {
  const idx = await getStationIndex();
  return buildMetadata({
    vertical: "portal",
    title: "駅から店を探す｜マチノワ",
    description: `駅の周辺にある店を、都道府県ごとの駅エリアから探せます。${idx.all.length}の駅エリア、${idx.totalStores}店を掲載。`,
    path: "/station",
    count: idx.totalStores,
  });
}

const BLOCK_ORDER = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州沖縄"];

export default async function Page() {
  const idx = await getStationIndex();
  const prefs = PREFECTURES.filter((p) => idx.byPref.has(p.slug));
  const rows = BLOCK_ORDER.map((b) => ({
    block: b,
    prefs: prefs.filter((p) => p.block === b),
  })).filter((r) => r.prefs.length > 0);

  return (
    <PageFrame
      tone={STATION_TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "駅から探す", href: "/station" },
      ]}
      kicker="Machinowa — Station"
      heading="駅から店を探す"
      lead="駅の周辺にある店を、都道府県ごとの駅エリアから探せます。店の案内に最寄り駅として書かれている店と、駅から直線距離で800m以内の店を載せています。"
      count={idx.totalStores}
    >
      <Block id="mp-st-hub-h" kicker="Stations" title="都道府県から駅エリアを選ぶ">
        <div className="mp-areas">
          {rows.map(({ block, prefs: list }) => {
            const face = BLOCK_FACE[block];
            const n = list.reduce((a, p) => a + (idx.byPref.get(p.slug)?.length ?? 0), 0);
            return (
              <section className="mp-area-row" key={block}>
                <header className="mp-area-head">
                  <h3>{face.label}</h3>
                  <p>
                    <span className="en">{face.en}</span>
                    <span className="n">
                      <b>{n}</b>駅エリア
                    </span>
                  </p>
                </header>
                <div className="mp-st-prefs">
                  {list.map((p: Prefecture) => {
                    const stations = idx.byPref.get(p.slug) ?? [];
                    return (
                      <div className="mp-st-pref" key={p.slug}>
                        <h4>
                          <Link href={`/station/${p.slug}`} prefetch={false} data-cursor="AREA">
                            {p.short}
                          </Link>
                          <span>
                            {stations.length}駅エリア・{idx.storesInPref.get(p.slug) ?? 0}店
                          </span>
                        </h4>
                        <StationChips items={stations} />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </Block>
      <StationCredit />
    </PageFrame>
  );
}
