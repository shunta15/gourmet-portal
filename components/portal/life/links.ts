/**
 * くらし(マチノワライフ。オーナー決定デザイン 2026-10-26 の見本)の行き先。純関数・定数(サーバー・クライアントのどちらからも使える)。
 * メニューは「トップ・場所を探す・店舗紹介・特集」(行き先 /life・/life/search・/life/shop・/life/special)。
 * 店のページ /life/shop/{id}・店の特集記事 /life/article/{id}・特集の記事 /life/special/{slug}。地図の小窓・現在地の入口は、この業種の探すページへ。
 */
export const LFL = {
  top: "/life",
  search: "/life/search",
  shops: "/life/shop",
  special: "/life/special",
  // 旧サイトの地図 /map は 2026-10-28 に消した。地図の小窓・「現在地から探す」「地図で見る」は、この業種の探すページへ（見本の配置は変えない）
  map: "/life/search",
  shop: (id: string) => `/life/shop/${encodeURIComponent(id)}`,
  article: (id: string) => `/life/article/${encodeURIComponent(id)}`,
  specialArticle: (slug: string) => `/life/special/${encodeURIComponent(slug)}`,
  /** 探すの絞り込みへのリンク(kind・region は複数可) */
  searchWith: (a: { kind?: string | string[]; region?: string | string[]; pref?: string; q?: string; page?: number }) => {
    const p = new URLSearchParams();
    for (const k of ([] as string[]).concat(a.kind ?? [])) p.append("kind", k);
    for (const r of ([] as string[]).concat(a.region ?? [])) p.append("region", r);
    if (a.pref) p.set("pref", a.pref);
    if (a.q) p.set("q", a.q);
    if (a.page && a.page > 1) p.set("page", String(a.page));
    const s = p.toString();
    return s ? `/life/search?${s}` : "/life/search";
  },
} as const;
