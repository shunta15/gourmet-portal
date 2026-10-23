// ペット「決定案」試作の共通の行き先・画像の置き場。ここだけを import すれば、ページ間のリンクが揃う。
// 試作なので、行き先は全部 /proto-pet/decided 以下(見本の再現)。
export const BASE = "/proto-pet/decided"; // 最初のページ
export const SEARCH_HREF = `${BASE}/search`; // 探すページ(検索・カテゴリ・エリアの行き先)
export const SHOP_HREF = `${BASE}/shop/sample`; // 店舗紹介(店のカードの行き先。sora cafe)
export const SHOPS_HREF = `${BASE}/shop`; // 店舗紹介の一覧(メニューの「店舗紹介」の行き先)
export const SPECIALS_HREF = `${BASE}/special`; // 特集の一覧(メニューの「特集」の行き先)
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

/**
 * 画面の行き先を試作と本番で切り替える(2026-10-21)。
 *   "proto" … 試作(/proto-pet/decided 以下。上の定数と同じ。既定。試作の見た目・行き先は 1 つも変えない)
 *   "live"  … 本番(/pet 以下)。最初 /pet・探す /pet/search・店舗紹介の一覧 /pet/shop・店 /pet/shop/{id}・特集の一覧 /pet/special・特集の記事 /pet/special/{slug}
 * Shell / Header / Footer は mode を受け取り、中のリンクを ptLinks(mode) で決める。純関数なのでサーバー・クライアントのどちらからも呼べる。
 * 探すページの引数は、ビューティー(COLOR PLAY)と同じ名前(kind=種類のスラッグ・pref=都道府県のスラッグ・q=文字)。
 */
export type PtMode = "proto" | "live";

export const LIVE_BASE = "/pet";

export type PtSearchArgs = { kind?: string; pref?: string; q?: string };

export type PtLinks = {
  /** 最初のページ */
  home: string;
  /** 探すページ(引数なし) */
  search: string;
  /** 店舗紹介の一覧(全店の札。メニューの「店舗紹介」) */
  shops: string;
  /** 特集の一覧(利用シーン記事・業種の特集記事。メニューの「特集」) */
  specials: string;
  /** 特集の記事 1 本。proto は一覧と同じ(slug は無視)、live は /pet/special/{slug} */
  special: (slug?: string) => string;
  /** 最初のページの節への飛び先 */
  areaAnchor: string;
  categoryAnchor: string;
  /** 探すページ(引数つき。空の項目は付けない) */
  searchWith: (f: PtSearchArgs) => string;
  /** 店のページ。proto は見本の 1 枚(id は無視)、live は /pet/shop/{id} */
  shop: (id?: string) => string;
};

export function ptLinks(mode: PtMode = "proto"): PtLinks {
  if (mode === "live") {
    const search = `${LIVE_BASE}/search`;
    return {
      home: LIVE_BASE,
      search,
      shops: `${LIVE_BASE}/shop`,
      specials: `${LIVE_BASE}/special`,
      special: (slug) => (slug ? `${LIVE_BASE}/special/${encodeURIComponent(slug)}` : `${LIVE_BASE}/special`),
      areaAnchor: `${LIVE_BASE}#pt-area`,
      categoryAnchor: `${LIVE_BASE}#pt-category`,
      searchWith: (f) => {
        const p = new URLSearchParams();
        if (f.kind) p.set("kind", f.kind);
        if (f.pref) p.set("pref", f.pref);
        if (f.q) p.set("q", f.q);
        const s = p.toString();
        return s ? `${search}?${s}` : search;
      },
      shop: (id) => (id ? `${LIVE_BASE}/shop/${encodeURIComponent(id)}` : search),
    };
  }
  return {
    home: BASE,
    search: SEARCH_HREF,
    shops: SHOPS_HREF,
    specials: SPECIALS_HREF,
    special: () => SPECIALS_HREF,
    areaAnchor: TOP_AREA_HREF,
    categoryAnchor: TOP_CATEGORY_HREF,
    searchWith: () => SEARCH_HREF,
    shop: () => SHOP_HREF,
  };
}
