import Link from "next/link";
import { StationChips } from "./pages/station-parts";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import type { StationSummary } from "@/lib/stations/query";

/**
 * 総合トップの「駅から探す」入口（サーバー）。件数の多い駅エリア上位と /station への導線。
 * 件数は店のある駅エリアの実データ。店が1件も無ければ何も出さない。
 */
export default function StationEntry({ items, stationTotal, storeTotal }: { items: StationSummary[]; stationTotal: number; storeTotal: number }) {
  if (items.length === 0) return null;
  return (
    <section id="station" className="mp-sec mp-st-entry" aria-labelledby="mp-st-h">
      <div className="mp-wrap">
        <header className="mp-sec-head row" data-reveal>
          <div>
            <p className="mp-kicker">Stations</p>
            <h2 id="mp-st-h" className="mp-h2">駅から探す</h2>
            <p className="mp-lead">
              駅の周辺にある店を、駅エリアから探せます。いまは{stationTotal}の駅エリアに{storeTotal}店を掲載しています。店の多い駅エリアから。
            </p>
          </div>
          <Link href="/station" className="mp-more" data-cursor="STATION">
            駅の一覧を見る <span aria-hidden="true">→</span>
          </Link>
        </header>
        <StationChips items={items} showPref prefShort={(p) => getPrefBySlug(p)?.short ?? ""} />
      </div>
    </section>
  );
}
