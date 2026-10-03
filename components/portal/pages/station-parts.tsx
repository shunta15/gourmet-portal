/**
 * 駅から探す（/station 以下）の共通部品（サーバー）。
 * 業種をまたぐページなので色は中立（墨と生成り）。店カードだけ業種の色。
 */
import Link from "next/link";
import type { StationSummary } from "@/lib/stations/query";
import { stationHref } from "@/lib/stations/query";
import type { Tone } from "./frame";

export const STATION_TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "駅" };

/** 駅データの出典（国土数値情報の利用条件に沿った表記） */
export const STATION_CREDIT = "駅データ: 国土数値情報（鉄道データ）（国土交通省）を加工して作成";

export function StationCredit() {
  return (
    <section className="mp-pg-sec mp-st-credit-sec" aria-label="出典">
      <div className="mp-wrap">
        <p className="mp-st-credit">{STATION_CREDIT}</p>
      </div>
    </section>
  );
}

/** 駅エリアのチップ（駅名・件数）。バーの長さは渡された一覧の最大件数に対する比 */
export function StationChips({
  items,
  showPref = false,
  prefShort,
}: {
  items: StationSummary[];
  /** true のとき駅名の横に県名を小さく添える（県をまたぐ一覧用） */
  showPref?: boolean;
  prefShort?: (pref: string) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="mp-area-list">
      {items.map((s) => (
        <li key={s.station.id}>
          <Link
            href={stationHref(s.station)}
            prefetch={false}
            className="mp-pref lit"
            style={{ ["--w" as string]: `${Math.max(8, Math.round((s.count / max) * 100))}%` }}
            data-cursor="STATION"
          >
            <span className="nm">
              {s.station.name}
              {showPref && prefShort && s.station.pref && <small>{prefShort(s.station.pref)}</small>}
            </span>
            <span className="ct">
              <b>{s.count}</b>店
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
