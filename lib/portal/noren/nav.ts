import { RELEASE_REST } from "./release";

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
  { href: RELEASE_REST ? "/videos" : "/nazatu", ja: "ショート動画" },
  { href: "/", ja: "総合トップ" },
] as const;

/** フッターの地域。表示名は行き先の地域データ（lib/regions.ts の REGIONS[key].name）と同じにする */
export const FOOT_REGIONS = [
  { href: "/region/tokyo", ja: RELEASE_REST ? "東京" : "東京・下町" },
  { href: "/region/kyoto", ja: "京都" },
  { href: "/region/osaka", ja: RELEASE_REST ? "大阪" : "大阪・ミナミ" },
  { href: "/region/fukuoka", ja: RELEASE_REST ? "福岡" : "博多" },
  { href: "/region/hokkaido", ja: RELEASE_REST ? "北海道" : "札幌" },
] as const;

export const FOOT_INFO = [
  { href: "/about", ja: "編集部" },
  { href: "/editorial/guidelines", ja: "掲載基準" },
  { href: "/contact", ja: "お問い合わせ" },
  { href: "/owner", ja: "店舗登録" },
] as const;

/**
 * フッターの暖簾（トップの章の漢字。押すとトップのその章へ）。フッターは入口以外のページにも出るので、RELEASE_REST が false のあいだは今の本番の 5 つ（麺・鮨・肉・酒・蕎）のまま。
 * 鮨・蕎の行き先 #ch-sushi・#ch-soba は、入口（7 つの章）の「和」の章の手前に置いた別名の目印に着く。true で 7 つ（lib/cuisineBroad.ts の大分類と同じ並び）。
 */
export const FOOT_NOREN: readonly { key: string; kanji: string; ja: string }[] = RELEASE_REST
  ? [
      { key: "wa", kanji: "和", ja: "和食" },
      { key: "yo", kanji: "洋", ja: "洋食" },
      { key: "chu", kanji: "中", ja: "中華・アジア" },
      { key: "men", kanji: "麺", ja: "ラーメン" },
      { key: "niku", kanji: "肉", ja: "焼肉・焼鳥" },
      { key: "sake", kanji: "酒", ja: "居酒屋・バー" },
      { key: "cha", kanji: "茶", ja: "カフェ・甘味" },
    ]
  : [
      { key: "men", kanji: "麺", ja: "ラーメン" },
      { key: "sushi", kanji: "鮨", ja: "鮨・寿司" },
      { key: "niku", kanji: "肉", ja: "焼肉" },
      { key: "sake", kanji: "酒", ja: "居酒屋" },
      { key: "soba", kanji: "蕎", ja: "蕎麦・うどん" },
    ];

/**
 * 入口のいちばん上の暖簾（最初の画面。本物の暖簾 NorenHeroReal と、WebGL が使えないときの暖簾 NorenHero）に出す章（この順）。
 * 章そのものは 7 つ（lib/cuisineBroad.ts）のまま。最初の暖簾だけ 5 枚（洋・中を除く）。押すとその章（#ch-<key>）へ行く。
 */
export const NOREN_HERO_KEYS = ["wa", "men", "niku", "sake", "cha"] as const;
