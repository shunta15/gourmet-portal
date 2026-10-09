/**
 * 暖簾の見本（/proto-noren/**）の行き先。グルメの今のヘッダー・フッターと同じ行き先（行き先は今の本物のページ）。
 * サーバー・クライアントのどちらからも使える（軽い定数だけ）。
 */
export const NOREN_TOP = "/proto-noren";
export const noRestaurant = (id: string) => `/proto-noren/restaurant/${id}`;
export const noFeature = (id: string) => `/proto-noren/feature/${encodeURIComponent(id)}`;

/** 本番のグルメのトップ（公開スイッチ ON のとき暖簾のトップが出る URL） */
export const GOURMET_TOP = "/gourmet";

/**
 * 暖簾のトップ（components/portal/pages/gourmet-noren-home.tsx）が出す行き先。
 * 見本（/proto-noren）は見本の店ページ・特集記事へ、本番（/gourmet）は本物のページ（/restaurant/<id>・/feature/<id>）へ。
 * shopBase は店ページの手前（`${shopBase}/${id}`）。サーバーコンポーネントの中でだけ使う（関数を含むのでクライアント部品へは渡さない）。
 */
export type NorenLinks = {
  top: string;
  shopBase: string;
  feature: (id: string) => string;
};
export const SAMPLE_LINKS: NorenLinks = { top: NOREN_TOP, shopBase: "/proto-noren/restaurant", feature: noFeature };
export const LIVE_LINKS: NorenLinks = {
  top: GOURMET_TOP,
  shopBase: "/restaurant",
  feature: (id) => `/feature/${encodeURIComponent(id)}`,
};

/** 今のヘッダーの行き先（トップはロゴ） */
export const HEADER_NAV = [
  { href: "/feature", ja: "特集", en: "Features" },
  { href: "/region/tokyo", ja: "エリア", en: "Area" },
  { href: "/scene/date", ja: "シーン", en: "Scene" },
  { href: "/search", ja: "さがす", en: "Search" },
] as const;

/** 今のフッターの行き先 */
export const FOOT_NAV = [
  { href: NOREN_TOP, ja: "トップ" },
  { href: "/feature", ja: "特集" },
  { href: "/region", ja: "エリア" },
  { href: "/scene", ja: "シーン" },
  { href: "/search", ja: "検索" },
] as const;

/**
 * 本番の /gourmet のフッターのナビゲーションだけに足す入口。今のグルメのトップ（暖簾に替える前）にあって、暖簾のトップに無かった行き先。
 * ラベルは今のグルメのトップにある言葉（おまかせ提案・写真から探す・ショート動画）。見本（/proto-noren）のフッターには足さない。
 * 「総合トップ」は、今のグルメのヘッダーのロゴ（`/`）が公開スイッチ ON で総合トップへ行っていたぶん。
 */
export const FOOT_NAV_LIVE_EXTRA = [
  { href: "/omakase", ja: "おまかせ提案" },
  { href: "/photos", ja: "写真から探す" },
  { href: "/nazatu", ja: "ショート動画" },
  { href: "/", ja: "総合トップ" },
] as const;

export const FOOT_REGIONS = [
  { href: "/region/tokyo", ja: "東京・下町" },
  { href: "/region/kyoto", ja: "京都" },
  { href: "/region/osaka", ja: "大阪・ミナミ" },
  { href: "/region/fukuoka", ja: "博多" },
  { href: "/region/hokkaido", ja: "札幌" },
] as const;

export const FOOT_INFO = [
  { href: "/about", ja: "編集部" },
  { href: "/editorial/guidelines", ja: "掲載基準" },
  { href: "/contact", ja: "お問い合わせ" },
  { href: "/owner", ja: "店舗登録" },
] as const;

/** フッターの五つの暖簾（トップの章の漢字）。押すとトップのその章へ */
export const FOOT_NOREN = [
  { key: "men", kanji: "麺", ja: "ラーメン" },
  { key: "sushi", kanji: "鮨", ja: "鮨・寿司" },
  { key: "niku", kanji: "肉", ja: "焼肉" },
  { key: "sake", kanji: "酒", ja: "居酒屋" },
  { key: "soba", kanji: "蕎", ja: "蕎麦・うどん" },
] as const;
