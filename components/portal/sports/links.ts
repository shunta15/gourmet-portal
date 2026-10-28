/**
 * スポーツ(マチノワスポーツ。オーナー決定デザイン「見本2」)の行き先。純関数・定数(サーバー・クライアントのどちらからも使える)。
 * メニューは「トップ・施設を探す・店舗紹介・特集」(行き先 /sports・/sports/search・/sports/shop・/sports/special)。
 * 店のページ /sports/shop/{id}・店の特集記事 /sports/article/{id}・特集の記事 /sports/special/{slug}。地図の小窓・現在地の入口は、この業種の探すページへ。
 */
export const SPL = {
  top: "/sports",
  search: "/sports/search",
  shops: "/sports/shop",
  special: "/sports/special",
  // 旧サイトの地図 /map は 2026-10-28 に消した。地図の小窓・「現在地から探す」「地図で見る」は、この業種の探すページへ（見本の配置は変えない）
  map: "/sports/search",
  shop: (id: string) => `/sports/shop/${encodeURIComponent(id)}`,
  article: (id: string) => `/sports/article/${encodeURIComponent(id)}`,
  specialArticle: (slug: string) => `/sports/special/${encodeURIComponent(slug)}`,
  /** 探すの絞り込みへのリンク(kind は複数可) */
  searchWith: (a: { kind?: string | string[]; pref?: string; city?: string; q?: string; feat?: string | string[]; page?: number }) => {
    const p = new URLSearchParams();
    for (const k of ([] as string[]).concat(a.kind ?? [])) p.append("kind", k);
    if (a.pref) p.set("pref", a.pref);
    if (a.city) p.set("city", a.city);
    for (const f of ([] as string[]).concat(a.feat ?? [])) p.append("feat", f);
    if (a.q) p.set("q", a.q);
    if (a.page && a.page > 1) p.set("page", String(a.page));
    const s = p.toString();
    return s ? `/sports/search?${s}` : "/sports/search";
  },
} as const;
