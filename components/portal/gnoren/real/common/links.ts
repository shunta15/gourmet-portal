/** 本番の URL を作る道具(軽い。サーバー・クライアントのどちらからも import してよい。ブラウザに見える URL を返す。内部パス /gourmet/... ではない)。 */
import { featureHrefOf } from "@/lib/portal/noren/onePage";

/** 店ページ /restaurant/<id> */
export const shopHref = (id: string): string => `/restaurant/${id}`;

/**
 * 特集記事への行き先。lib/portal/noren/onePage.ts の featureHrefOf と同じ結果
 * (1 店 1 ページの対象の記事は /restaurant/<店の ID>、それ以外は /feature/<記事 ID>)。
 */
export const featureHref = (id: string): string => featureHrefOf(id);

/** さがす /search の絞り込み URL。今の /search のクエリ名(?q= ?region= ?town= ?cuisine= ?scene=)。空・未指定は付けない */
export function searchHref(p: { region?: string; cuisine?: string; scene?: string; q?: string; town?: string } = {}): string {
  const qs = new URLSearchParams();
  if (p.q?.trim()) qs.set("q", p.q.trim());
  if (p.region) qs.set("region", p.region);
  if (p.town) qs.set("town", p.town);
  if (p.cuisine) qs.set("cuisine", p.cuisine);
  if (p.scene) qs.set("scene", p.scene);
  const s = qs.toString();
  return s ? `/search?${s}` : "/search";
}
