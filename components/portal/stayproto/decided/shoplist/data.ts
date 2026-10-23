import "server-only";
import { KIND_EN, loadStayShops, sortShops, type LiveShop } from "../common/live";

/**
 * 店舗紹介の一覧(本番 /stay/shop)のデータの読み込み(サーバー専用)。
 * 出すのは、掲載中の全宿(common/live.ts の loadStayShops)。写真や記事の有無で絞らない(写真の無い宿は札に「写真は準備中です」を出す)。
 * 並びは エリア順(都道府県の並び → 市区町村 → 宿 ID。探すの既定と同じ。おすすめ順・人気順は無い)。絞り込みは付けない。
 */
export async function loadShopListShops(): Promise<LiveShop[]> {
  return sortShops(await loadStayShops(), "area");
}

/** 宿の種類のスラッグ → 英字のラベル(カードの HOTEL / RYOKAN …)。本体は common/live.ts */
export { KIND_EN };
