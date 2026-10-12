import "server-only";
import type { Feature } from "@/lib/regions";
import { getFeatureRegions } from "@/lib/featureRegions";
import { toCardItem } from "@/lib/portal/noren/featureList";
import { toListCard } from "@/lib/portal/photoFeature/roundupList";
import { tateCols } from "@/lib/portal/photoFeature/build";
import type { FeatureItemP } from "./FeatureCardP";

/**
 * 特集 1 本 → 検索・地域別の札のデータ（サーバー専用）。
 * 題・副題・小見出し・番号・テーマ・写真は今の札と同じ元（toCardItem）。地域・テーマの行と行き先は、特集の一覧 /feature の札と同じ関数（toListCard。href は LIVE_LINKS.feature = featureHrefOf）。
 */
export function toFeatureItem(f: Feature): FeatureItemP {
  const c = toCardItem(f);
  const l = toListCard(f);
  return {
    id: c.id,
    href: l.href,
    img: c.img,
    title: c.title,
    sub: c.sub,
    line: l.line,
    meta: [c.no, c.kicker].filter(Boolean).join("　"),
    cols: tateCols(c.title, 8, 3),
    no: c.no,
    tag: c.tag,
    kicker: c.kicker,
    regions: getFeatureRegions(c.id),
  };
}
