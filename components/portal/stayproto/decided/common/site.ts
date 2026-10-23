// ステイ「決定案」の共通の行き先・画像の置き場。ここだけを import すれば、ページ間のリンクが揃う(ペットの site.ts と同じ作り)。
// 試作(proto)の行き先は全部 /proto-stay/decided 以下(見本の再現)。本番(live)は /stay 以下。
export const BASE = "/proto-stay/decided"; // 最初のページ
export const SEARCH_HREF = `${BASE}/search`; // 探すページ(検索・宿の種類・エリアの行き先)
export const SHOP_HREF = `${BASE}/shop/sample`; // 宿の紹介(宿のカードの行き先)
export const ARTICLES_HREF = `${BASE}/article`; // 宿の記事の一覧(「特集記事」の行き先)
export const ARTICLE_HREF = `${BASE}/article/sample`; // 記事の本文
export const PORTAL_HREF = "/"; // マチノワ 総合トップ

/** 画像の置き場(public)。共通は ${IMG}/common/、ページごとは ${IMG}/top/・search/・shop/・article/ */
export const IMG = "/_portal/stayproto/decided";
export const IMG_COMMON = `${IMG}/common`;
export const IMG_TOP = `${IMG}/top`;
export const IMG_SEARCH = `${IMG}/search`;
export const IMG_SHOP = `${IMG}/shop`;
export const IMG_ARTICLE = `${IMG}/article`;

/**
 * 画面の行き先を試作と本番で切り替える。
 *   "proto" … 試作(/proto-stay/decided 以下。上の定数と同じ。既定)
 *   "live"  … 本番(/stay 以下)。最初 /stay・探す /stay/search・宿 /stay/shop/{id}・記事の一覧 /stay/article・記事 /stay/article/{id}
 * Shell / Header / Footer は mode を受け取り、中のリンクを syLinks(mode) で決める。純関数なのでサーバー・クライアントのどちらからも呼べる。
 * 探すページの引数は、ほかの新業種と同じ名前(kind=宿の種類のスラッグ・pref=都道府県のスラッグ・q=文字)。
 */
export type SyMode = "proto" | "live";

export const LIVE_BASE = "/stay";

export type SySearchArgs = { kind?: string; pref?: string; q?: string };

export type SyLinks = {
  /** 最初のページ */
  home: string;
  /** 探すページ(引数なし) */
  search: string;
  /** 記事の一覧 */
  articles: string;
  /** 編集部について(総合サイトの /about。proto は行き先が無いので #) */
  about: string;
  /** 探すページ(引数つき。空の項目は付けない) */
  searchWith: (f: SySearchArgs) => string;
  /** 宿のページ。proto は見本の 1 枚(id は無視)、live は /stay/shop/{id} */
  shop: (id?: string) => string;
  /** 記事のページ。proto は見本の 1 枚(id は無視)、live は /stay/article/{id}(日本語はそのままエンコードされる) */
  article: (id?: string) => string;
};

export function syLinks(mode: SyMode = "proto"): SyLinks {
  if (mode === "live") {
    const search = `${LIVE_BASE}/search`;
    return {
      home: LIVE_BASE,
      search,
      articles: `${LIVE_BASE}/article`,
      about: "/about",
      searchWith: (f) => {
        const p = new URLSearchParams();
        if (f.kind) p.set("kind", f.kind);
        if (f.pref) p.set("pref", f.pref);
        if (f.q) p.set("q", f.q);
        const s = p.toString();
        return s ? `${search}?${s}` : search;
      },
      shop: (id) => (id ? `${LIVE_BASE}/shop/${encodeURIComponent(id)}` : search),
      article: (id) => (id ? `${LIVE_BASE}/article/${encodeURIComponent(id)}` : `${LIVE_BASE}/article`),
    };
  }
  return {
    home: BASE,
    search: SEARCH_HREF,
    articles: ARTICLES_HREF,
    about: "#",
    searchWith: () => SEARCH_HREF,
    shop: () => SHOP_HREF,
    article: () => ARTICLE_HREF,
  };
}
