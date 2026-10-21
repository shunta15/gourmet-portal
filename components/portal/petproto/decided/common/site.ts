// ペット「決定案」試作の共通の行き先・画像の置き場。ここだけを import すれば、ページ間のリンクが揃う。
// 試作なので、行き先は全部 /proto-pet/decided 以下(見本の再現)。
export const BASE = "/proto-pet/decided"; // 最初のページ
export const SEARCH_HREF = `${BASE}/search`; // 探すページ(検索・カテゴリ・エリアの行き先)
export const SHOP_HREF = `${BASE}/shop/sample`; // 店舗紹介(店のカードの行き先。sora cafe)
export const ARTICLES_HREF = `${BASE}/article`; // 業種の記事の一覧(「すべての〜を見る」「特集記事」の行き先)
export const ARTICLE_HREF = `${BASE}/article/sample`; // 記事の本文(特集・Industry・Scene・関連記事の行き先)
export const PORTAL_HREF = "/"; // マチノワ 総合トップ(試作では使わない。必要なら)

/** 最初のページの節への飛び先(ヘッダー・フッター用)。最初のページ側の節に id="pt-area" / "pt-category" を付ける */
export const TOP_AREA_HREF = `${BASE}#pt-area`;
export const TOP_CATEGORY_HREF = `${BASE}#pt-category`;

/** 画像の置き場(public)。共通は ${IMG}/common/、ページごとは ${IMG}/top/・search/・shop/・article/ */
export const IMG = "/_portal/petproto/decided";
export const IMG_COMMON = `${IMG}/common`;
export const IMG_TOP = `${IMG}/top`;
export const IMG_SEARCH = `${IMG}/search`;
export const IMG_SHOP = `${IMG}/shop`;
export const IMG_ARTICLE = `${IMG}/article`;
