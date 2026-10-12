import "server-only";
import { RESTAURANTS } from "@/lib/data";
import { visibleStores } from "@/lib/hiddenStores";

/**
 * 暖簾のエリアのページ（/region・/region/<key>・/region/<key>/<街>）のデータ側（サーバー専用）。
 * 店・特集・街・シーンの取り方は、元のページ（app/region/**）と同じ関数を、各ページから呼ぶ。ここは地域ごとの店数だけ。
 */

/** 地域ごとの店数（コード側の RESTAURANTS から数える。元の /region（エリア一覧）と同じ数え方） */
export function regionShopCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of visibleStores(RESTAURANTS)) counts[r.region] = (counts[r.region] || 0) + 1;
  return counts;
}
