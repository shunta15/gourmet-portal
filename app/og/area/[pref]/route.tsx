import { AreaCard, renderOg } from "@/components/portal/og/cards";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { gourmetRegionKey } from "@/lib/areas/gourmet";
import { getPlaces } from "@/lib/places";
import { assertPortalLive } from "@/lib/portal/launch";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";

// 業種横断の街（県）の共有画像（/og/area/{pref}）。業種ごとの件数は実データ。
// グルメの Place.pref は region キー（愛知＝nagoya など）なので、対応表で引く（app/area/[pref] と同じ）
export async function GET(_req: Request, { params }: { params: Promise<{ pref: string }> }) {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const { pref } = await params;
  const area = getPrefBySlug(pref);
  if (!area) return new Response("Not found", { status: 404 });
  const rows = await Promise.all(
    (Object.keys(VERTICALS) as VerticalKey[]).map(async (key) => {
      if (key === "gourmet") {
        const g = gourmetRegionKey(pref);
        return { key, count: g ? (await getPlaces("gourmet", { pref: g })).length : 0 };
      }
      return { key, count: (await getPlaces(key, { pref })).length };
    }),
  );
  return renderOg(<AreaCard short={area.short} rows={rows} />);
}
