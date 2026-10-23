import { RELEASE_PERIPHERY, RELEASE_REST, RELEASE_SEARCH } from "./release";
import { areaIndexHref, regionHref } from "./areaLinks";
import { featureHrefOf } from "./onePage";

/**
 * フッターのナビゲーションの「トップ」の目印の行き先。NorenFooter・periphery/parts.tsx が、実際のトップの行き先（本番は /gourmet）に付け替えて使う。
 * サーバー・クライアントのどちらからも使える（軽い定数だけ）。
 */
export const NOREN_TOP = "/proto-noren";

/** 本番のグルメのトップ（公開スイッチ ON のとき暖簾のトップが出る URL） */
export const GOURMET_TOP = "/gourmet";

/**
 * 暖簾のトップ・店ページ・特集記事が出す行き先。本番（/gourmet）は本物のページ（/restaurant/<id>・/feature/<id>）へ。
 * shopBase は店ページの手前（`${shopBase}/${id}`）。サーバーコンポーネントの中でだけ使う（関数を含むのでクライアント部品へは渡さない）。
 */
export type NorenLinks = {
  top: string;
  shopBase: string;
  feature: (id: string) => string;
};
export const LIVE_LINKS: NorenLinks = {
  top: GOURMET_TOP,
  shopBase: "/restaurant",
  // 1 店 1 ページにした記事は、転送を踏まないよう、はじめから /restaurant/<店の ID> を指す（lib/portal/noren/onePage.ts。切り替えが false なら今までどおり /feature/<記事 ID>）
  feature: (id) => featureHrefOf(id),
};

/**
 * ヘッダーの行き先（トップはロゴ）。RELEASE_SEARCH が true のとき「特集・さがす」の 2 つ（エリア・シーンは「さがす」のページから入る）。
 * false のときは今までの 4 つ（特集・エリア・シーン・さがす。今の本番と同じ）。
 */
export const HEADER_NAV = RELEASE_SEARCH
  ? ([
      { href: "/feature", ja: "特集", en: "Features" },
      { href: "/search", ja: "さがす", en: "Search" },
    ] as const)
  : ([
      { href: "/feature", ja: "特集", en: "Features" },
      { href: regionHref("tokyo"), ja: "エリア", en: "Area" },
      { href: "/scene/date", ja: "シーン", en: "Scene" },
      { href: "/search", ja: "さがす", en: "Search" },
    ] as const);

/** フッターのナビゲーション。RELEASE_SEARCH が true のときはヘッダーと同じ「トップ・特集・さがす」の 3 つ（2026-10-23。地域の列・おまかせ提案などは外した）。false は今までの 5 つ */
export const FOOT_NAV = RELEASE_SEARCH
  ? ([
      // 「トップ」(/gourmet。グルメのトップ)と「総合トップ」(/。マチノワ全体のトップ)は行き先が違うので、RELEASE_PERIPHERY のあいだは違いが分かる呼び名にする
      { href: NOREN_TOP, ja: RELEASE_PERIPHERY ? "グルメのトップ" : "トップ" },
      { href: "/feature", ja: "特集" },
      { href: "/search", ja: "さがす" },
    ] as const)
  : ([
      { href: NOREN_TOP, ja: "トップ" },
      { href: "/feature", ja: "特集" },
      { href: areaIndexHref(), ja: "エリア" },
      { href: "/scene", ja: "シーン" },
      { href: "/search", ja: "検索" },
    ] as const);

/**
 * フッターの小さな文字の 1 行（メニューではない。components/portal/FootSmall が全ページのフッターに出す）。
 * 2026-10-23 オーナー決定「各業種 4 ページに収める」: ヘッダー・フッターのメニューは「トップ・さがす・特集」の 3 つだけにし、サイトとして必要なこの 5 つだけを小さな案内として残す。
 * 2026-10-24 オーナー指示「動画は共通ページ作成してまとめて」: 全業種共通の動画ページへの入口「動画」を、「マチノワ トップ」の次に足した（8 業種すべてのフッターの小さな 1 行に同じ並び）。
 * 「マチノワ トップ」は総合トップ（/）。グルメのトップ（/gourmet）はメニュー（ロゴ・FOOT_NAV の先頭）。
 * 外したもの（ページは消えていない）: 章の暖簾 5（麺・鮨・肉・酒・蕎）・地域 5（さがすの絞り込みと同じ行き先）・おまかせ提案・写真から探す・ショート動画（入口は「さがす」のページの中。lib/portal/noren/searchOther.ts）。
 */
export const FOOT_SMALL = [
  { href: "/", ja: "マチノワ トップ" },
  { href: "/videos", ja: "動画" },
  { href: "/about", ja: "編集部について" },
  { href: "/editorial/guidelines", ja: "掲載基準" },
  { href: "/contact", ja: "お問い合わせ" },
  { href: "/owner", ja: "店舗登録" },
] as const;

/**
 * 入口のいちばん上の暖簾（最初の画面。本物の暖簾 NorenHeroReal と、WebGL が使えないときの暖簾 NorenHero）に出す章（この順）。
 * 章そのものは 7 つ（lib/cuisineBroad.ts）のまま。最初の暖簾だけ 5 枚（洋・中を除く）。押すとその章（#ch-<key>）へ行く。
 */
export const NOREN_HERO_KEYS = ["wa", "men", "niku", "sake", "cha"] as const;
