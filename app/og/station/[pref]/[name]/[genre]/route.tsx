import { StationCard, renderOg } from "@/components/portal/og/cards";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { assertPortalLive } from "@/lib/portal/launch";
import { genreKey, getGenreIndex } from "@/lib/stations/genre";
import { safeDecode, uniqueLines } from "@/lib/stations/query";

// ジャンル × 駅のページの共有画像（/og/station/{pref}/{name}/{genre}）。店数は、そのジャンルの店だけの実数（ページと同じ集計）
export async function GET(_req: Request, { params }: { params: Promise<{ pref: string; name: string; genre: string }> }) {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const p = await params;
  const pref = safeDecode(p.pref);
  const name = safeDecode(p.name);
  const genre = safeDecode(p.genre);
  const page = (await getGenreIndex()).byKey.get(genreKey(pref, name, genre));
  const area = getPrefBySlug(pref);
  if (!page || !area) return new Response("Not found", { status: 404 });
  const st = page.summary.station;
  const lineNames = [...new Set(uniqueLines(st).map((l) => l.line))];
  const lines = lineNames.slice(0, 3).concat(lineNames.length > 3 ? [`ほか${lineNames.length - 3}路線`] : []);
  return renderOg(
    <StationCard
      heading={`${st.name}の${genre}`}
      place={`${area.name}${st.cityName ?? ""}`}
      count={page.count}
      lines={lines}
      prefShort={area.short}
    />,
  );
}
