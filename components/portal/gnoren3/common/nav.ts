/** 共通のナビ(ヘッダー・フッターで共有)。キーは Shell の page と対応。 */
export const GN3_BASE = "/proto-gourmet/n3";
export const GN3_NAV = [
  { key: "top", label: "トップ", href: GN3_BASE },
  { key: "search", label: "さがす", href: `${GN3_BASE}/search` },
  { key: "shop", label: "店舗紹介", href: `${GN3_BASE}/shop/sample` },
  { key: "feature", label: "特集", href: `${GN3_BASE}/feature` },
] as const;
export type Gn3Page = (typeof GN3_NAV)[number]["key"];
