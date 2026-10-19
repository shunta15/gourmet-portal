// ボディケア「グリーン案」の共通の行き先・画像の置き場。ここだけを import すれば、ページ間のリンクが揃う。
export const BASE = "/proto-bodycare/green";
export const SEARCH_HREF = `${BASE}/search`; // 探すページ
export const SHOP_HREF = `${BASE}/shop/sample`; // 店舗詳細
export const FEATURE_HREF = `${BASE}/feature/sample`; // 店の特集記事
export const SCENE_HREF = `${BASE}/scene/sample`; // 利用シーン・季節の記事(ヘッダーの「特集」)
export const GUIDE_HREF = `${BASE}/guide/sample`; // 業種についての記事(お役立ちコラム・初めての方へ)

/** 画像の置き場(public)。共通は ${IMG}/common/、ページごとは ${IMG}/top/・search/・shop/・feature/・article/ */
export const IMG = "/_portal/bcproto/green";
export const IMG_COMMON = `${IMG}/common`;
