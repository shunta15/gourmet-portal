/**
 * 共通のナビ(ヘッダー・フッターで共有)。キーは Shell の page と対応。
 * リンク先は `GnLinks` で差し替える: 本番(/gourmet 系)は GN_LIVE_LINKS、試作(/proto-gourmet/n)は GN_PROTO_LINKS。
 * 軽い定数と関数だけ(サーバー・クライアントのどちらからも import してよい)。
 */
export const GN_BASE = "/proto-gourmet/n";

export type GnLinks = {
  /** グルメのトップ(ロゴ・ナビ「トップ」) */
  top: string;
  /** さがす(ナビ「さがす」・ヘッダーの虫眼鏡) */
  search: string;
  /** 店舗紹介(ナビ「店舗紹介」) */
  shopList: string;
  /** 特集の一覧(ナビ「特集」) */
  feature: string;
  /** お気に入り(ヘッダーのハート) */
  saved: string;
};

/** 本番(公開スイッチ ON のとき /gourmet 系が出す URL。内部パスではなく、ブラウザに見える URL) */
export const GN_LIVE_LINKS: GnLinks = {
  top: "/gourmet",
  search: "/search",
  shopList: "/restaurant",
  feature: "/feature",
  saved: "/list",
};

/** 試作 /proto-gourmet/n 用(今までどおり) */
export const GN_PROTO_LINKS: GnLinks = {
  top: GN_BASE,
  search: `${GN_BASE}/search`,
  shopList: `${GN_BASE}/shop/sample`,
  feature: `${GN_BASE}/feature`,
  saved: `${GN_BASE}/search`,
};

export type GnPage = "top" | "search" | "shop" | "feature";

/** ナビ 4 つ(この順)をリンクから作る */
export function gnNav(links: GnLinks): ReadonlyArray<{ key: GnPage; label: string; href: string }> {
  return [
    { key: "top", label: "トップ", href: links.top },
    { key: "search", label: "さがす", href: links.search },
    { key: "shop", label: "店舗紹介", href: links.shopList },
    { key: "feature", label: "特集", href: links.feature },
  ];
}
