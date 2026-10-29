/** 共通のナビ(ヘッダー・フッターで共有)。キーは Shell の page と対応。 */
export const GN_BASE = "/proto-gourmet/n";
export const GN_NAV = [
  { key: "top", label: "トップ", href: GN_BASE },
  { key: "search", label: "さがす", href: `${GN_BASE}/search` },
  { key: "shop", label: "店舗紹介", href: `${GN_BASE}/shop/sample` },
  { key: "feature", label: "特集", href: `${GN_BASE}/feature` },
] as const;
export type GnPage = (typeof GN_NAV)[number]["key"];
