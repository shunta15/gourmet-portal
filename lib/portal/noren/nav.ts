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
 * グルメのメニュー（4 つ。この順）。ヘッダーのナビ（PC・スマホ）・上端の竿の帯・フッターのナビが、すべてこの 1 つの表を読む。
 * 2026-10-23〜24 オーナー決定「各業種 4 ページに収める」: 全 8 業種のメニューは「トップ」「探す」「店舗紹介」「特集」の 4 つ。
 * 「探す」は業種の今の呼び名のまま（グルメは「さがす」）。「店舗紹介」「特集」は全業種この文字。ロゴの行き先は業種のトップのまま。
 * - トップ: グルメのトップ。href は NOREN_TOP（見本の目印）。本番の枠は GOURMET_TOP に付け替えて使う（menuWithTop）。
 * - さがす: 店をさがす /search（noindex）
 * - 店舗紹介: 掲載中の全店の札の一覧 /restaurant（app/gourmet/restaurant/page.tsx）
 * - 特集: シーン別まとめ記事・街歩き・コースの一覧 /feature（店 1 軒の記事は並べない。店は「店舗紹介」にいる）
 * 外したもの（ページは消えていない）: 地域・利用シーンのページ（さがすの絞り込みへ統合済み）・おまかせ提案・写真から探す・ショート動画（入口は「さがす」のページの中）。
 * 軽い定数だけ（サーバー・クライアントのどちらからも使える）。
 */
export const MENU_SEARCH = "/search";
export const MENU_SHOPS = "/restaurant";
export const MENU_FEATURE = "/feature";
export const GOURMET_MENU = [
  { href: NOREN_TOP, ja: "トップ", en: "Top" },
  { href: MENU_SEARCH, ja: "さがす", en: "Search" },
  { href: MENU_SHOPS, ja: "店舗紹介", en: "Shops" },
  { href: MENU_FEATURE, ja: "特集", en: "Features" },
] as const;

/** メニューの「トップ」の目印（NOREN_TOP）を、実際のトップの行き先に付け替える */
export function menuWithTop(top: string): { href: string; ja: string; en: string }[] {
  return GOURMET_MENU.map((n) => (n.href === NOREN_TOP ? { ...n, href: top } : { ...n }));
}

/** ヘッダーのナビ（PC・スマホとも。トップはロゴと、先頭の「トップ」の両方）。GOURMET_MENU と同じ 4 つ */
export const HEADER_NAV = GOURMET_MENU;

/** フッターのナビゲーション。GOURMET_MENU と同じ 4 つ（NorenFooter・周りのページの Footer が、先頭の目印を実際のトップに付け替えて使う） */
export const FOOT_NAV = GOURMET_MENU;

/**
 * フッターの小さな文字の 1 行（メニューではない。components/portal/FootSmall が全ページのフッターに出す）。
 * 2026-10-23 オーナー決定「各業種 4 ページに収める」: ヘッダー・フッターのメニューは GOURMET_MENU の 4 つだけにし、サイトとして必要なものだけを小さな案内として残す。
 * 2026-10-24 オーナー指示「動画は共通ページ作成してまとめて」: 全業種共通の動画ページへの入口「動画」を、「マチノワ トップ」の次に足した（8 業種すべてのフッターの小さな 1 行に同じ並び）。
 * 2026-10-28 オーナー指示「現状の古いものは削除でOK」: 編集部（/about）・掲載基準（/editorial/guidelines）・お問い合わせ（/contact）・店舗登録（/owner）のページと行き先を削除し、「マチノワ トップ」「動画」だけが残った。
 * 「マチノワ トップ」は総合トップ（/）。グルメのトップ（/gourmet）はメニュー（ロゴ・FOOT_NAV の先頭）。
 * 外したもの（ページは消えていない）: 章の暖簾 5（麺・鮨・肉・酒・蕎）・地域 5（さがすの絞り込みと同じ行き先）・おまかせ提案・写真から探す・ショート動画（入口は「さがす」のページの中。lib/portal/noren/searchOther.ts）。
 */
export const FOOT_SMALL = [
  { href: "/", ja: "マチノワ トップ" },
  { href: "/videos", ja: "動画" },
] as const;

/**
 * 入口のいちばん上の暖簾（最初の画面。本物の暖簾 NorenHeroReal と、WebGL が使えないときの暖簾 NorenHero）に出す章（この順）。
 * 章そのものは 7 つ（lib/cuisineBroad.ts）のまま。最初の暖簾だけ 5 枚（洋・中を除く）。押すとその章（#ch-<key>）へ行く。
 */
export const NOREN_HERO_KEYS = ["wa", "men", "niku", "sake", "cha"] as const;
