import { StationCard, renderOg } from "@/components/portal/og/cards";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { assertPortalLive } from "@/lib/portal/launch";
import { getStationIndex, safeDecode, stationHeading, uniqueLines } from "@/lib/stations/query";

// 駅ページの共有画像（/og/station/{pref}/{name}）。店数・路線は実データ（駅ページと同じ集計）
export async function GET(_req: Request, { params }: { params: Promise<{ pref: string; name: string }> }) {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const p = await params;
  const pref = safeDecode(p.pref);
  const name = safeDecode(p.name);
  const summary = (await getStationIndex()).bySlug.get(`${pref}/${name}`);
  const area = getPrefBySlug(pref);
  if (!summary || !area) return new Response("Not found", { status: 404 });
  const st = summary.station;
  const lineNames = [...new Set(uniqueLines(st).map((l) => l.line))];
  const lines = lineNames.slice(0, 3).concat(lineNames.length > 3 ? [`ほか${lineNames.length - 3}路線`] : []);
  return renderOg(
    <StationCard
      heading={stationHeading(st)}
      place={`${area.name}${st.cityName ?? ""}`}
      count={summary.count}
      lines={lines}
      prefShort={area.short}
    />,
  );
}
