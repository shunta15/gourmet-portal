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
 * ラベルは今のグルメのトップにある言葉（おまかせ提案・写真から探す・ショート動画）。ショート動画の行き先は総合サイトの動画のページ /videos（公開スイッチ ON で開ける）。見本（/proto-noren）のフッターには足さない。
 * 「総合トップ」は、今のグルメのヘッダーのロゴ（`/`）が公開スイッチ ON で総合トップへ行っていたぶん。
 */
export const FOOT_NAV_LIVE_EXTRA = [
  { href: "/omakase", ja: "おまかせ提案" },
  { href: "/photos", ja: "写真から探す" },
  { href: "/videos", ja: "ショート動画" },
  { href: "/", ja: "総合トップ" },
] as const;

/** フッターの地域。表示名は行き先の地域データ（lib/regions.ts の REGIONS[key].name）と同じにする */
export const FOOT_REGIONS = [
  { href: "/region/tokyo", ja: "東京" },
  { href: "/region/kyoto", ja: "京都" },
  { href: "/region/osaka", ja: "大阪" },
  { href: "/region/fukuoka", ja: "福岡" },
  { href: "/region/hokkaido", ja: "北海道" },
] as const;

export const FOOT_INFO = [
  { href: "/about", ja: "編集部" },
  { href: "/editorial/guidelines", ja: "掲載基準" },
  { href: "/contact", ja: "お問い合わせ" },
  { href: "/owner", ja: "店舗登録" },
] as const;

/** フッターの七つの暖簾（トップの章の漢字。lib/cuisineBroad.ts の大分類と同じ並び）。押すとトップのその章へ */
export const FOOT_NOREN = [
  { key: "wa", kanji: "和", ja: "和食" },
  { key: "yo", kanji: "洋", ja: "洋食" },
  { key: "chu", kanji: "中", ja: "中華・アジア" },
  { key: "men", kanji: "麺", ja: "ラーメン" },
  { key: "niku", kanji: "肉", ja: "焼肉・焼鳥" },
  { key: "sake", kanji: "酒", ja: "居酒屋・バー" },
  { key: "cha", kanji: "茶", ja: "カフェ・甘味" },
] as const;
