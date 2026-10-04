import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/seo/gate";
import { SITE_URL } from "@/lib/seo/util";
import { assertPortalLive } from "@/lib/portal/launch";
import { getStationIndex } from "@/lib/stations/query";

export const revalidate = 3600;

/**
 * /station/sitemap.xml。index 対象（店 3 件以上。判定は lib/seo/gate.ts の1か所）の駅エリアと、
 * それをまとめる /station・/station/{pref} だけを出す。既存の /sitemap.xml は変えない。
 * 日本語の駅名は URL のパスセグメントなので percent-encode する（既存 app/sitemap.ts の特集と同じ）。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const idx = await getStationIndex();
  const paths: string[] = [];
  if (isIndexable(idx.totalStores)) paths.push("/station");
  for (const [pref] of idx.byPref) {
    if (isIndexable(idx.storesInPref.get(pref) ?? 0)) paths.push(`/station/${pref}`);
  }
  for (const s of idx.all) {
    if (isIndexable(s.count)) paths.push(`/station/${s.station.pref}/${encodeURIComponent(s.station.name)}`);
  }
  return paths.map((p) => ({ url: `${SITE_URL}${p}` }));
}
