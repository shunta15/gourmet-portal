// ボディケア「グリーン案」の共通の行き先・画像の置き場。ここだけを import すれば、ページ間のリンクが揃う。
// 本番の URL(/bodycare 以下)。試作 /proto-bodycare/green のページも、いまはここの本番の URL へリンクする。
// 注意: /bodycare/<種類>・/bodycare/area/<県> などの旧 URL は 308 転送になる。探すへは必ず searchHref() で /bodycare/search?… に直接貼る。
export const BASE = "/bodycare";
export const SEARCH_HREF = `${BASE}/search`; // 探すページ
export const SHOPS_HREF = `${BASE}/shop`; // 店舗紹介の一覧(掲載中の全店の札。メニューの「店舗紹介」の行き先)
export const SPECIAL_HREF = `${BASE}/special`; // 特集(業種の特集記事の一覧。メニューの「特集」の行き先)
export const PORTAL_HREF = "/"; // マチノワ トップ(総合トップ)

// メモ: 最初のページの節 id="gr-kind" / "gr-area" / "gr-tag" は残してある。ヘッダー・フッターからの飛び先(TOP_*_HREF)は、メニューを「トップ・探す・店舗紹介・特集」の 4 つにした(2026-10-24)ので外した。

/** 店舗紹介のページ(1 店 1 ページ。店の詳細+店の特集記事)。id は bo0030 など(日本語を含まない) */
export const shopHref = (id: string) => `${BASE}/shop/${encodeURIComponent(id)}`;
/** 店舗紹介の一覧の URL(n は 1 ページぶん=20 を超えるときだけ付ける。lib/portal/vert/bodygreen/filter.ts の PAGE_SIZE と同じ) */
export const shopListHref = (n?: number) => `${SHOPS_HREF}${n && n > 20 ? `?n=${n}` : ""}`;
/** 業種の特集記事(一覧 = SPECIAL_HREF。slug は半角英数とハイフン) */
export const specialHref = (slug: string) => `${SPECIAL_HREF}/${encodeURIComponent(slug)}`;

/**
 * 探すの URL(空の項目は付けない)。軸は kind(種類 slug)・pref(都道府県 slug)・tag(こだわり 1 つ)・q・sort("name" のときだけ)の 5 つ。
 * 本番の parseFilters(lib/portal/colorplay/search.ts)と同じ引数名。クライアントからも読める(何も import しない)。
 */
export function searchHref(f: { kind?: string; pref?: string; tag?: string; q?: string; sort?: string; n?: number } = {}, hash = ""): string {
  const p = new URLSearchParams();
  if (f.kind) p.set("kind", f.kind);
  if (f.pref) p.set("pref", f.pref);
  if (f.tag) p.set("tag", f.tag);
  if (f.q) p.set("q", f.q);
  if (f.sort === "name") p.set("sort", "name");
  if (f.n && f.n > 20) p.set("n", String(f.n));
  const s = p.toString();
  return `${SEARCH_HREF}${s ? `?${s}` : ""}${hash}`;
}

// --- 試作 /proto-bodycare/green のページ(見本の再現)が使っていた名前。本番の行き先に向けてある。W1〜W4 が本番の部品に置き換えたら使わなくなる ---
export const SHOP_HREF = shopHref("bo0030");
export const FEATURE_HREF = SPECIAL_HREF;
export const SCENE_HREF = SPECIAL_HREF;
export const GUIDE_HREF = SPECIAL_HREF;

/** 画像の置き場(public)。共通は ${IMG}/common/、ページごとは ${IMG}/top/・search/・shop/・feature/・article/ */
export const IMG = "/_portal/bcproto/green";
export const IMG_COMMON = `${IMG}/common`;
