/**
 * 特集の「2 つの棚」の名称（軽いファイル。サーバー専用の import は足さない。一覧ページ・記事ページの眉書き・パンくず・入口の節が同じ文字列を読む）。
 *
 * - 特集記事 = 店 1 軒の記事（isSingleShopFeature）。一覧に出すのは featureSingle.ts の FEATURED_SINGLE_IDS の本だけ（並びもその順）。
 * - まとめ記事 = 複数の店・場所が載る記事（lib/data の FEATURES）。「利用シーン別」（利用シーン+店舗紹介。isSceneShopFeature）と「街歩き・コース」（それ以外）に分ける。
 * 「まとめ記事」は仮の名称（オーナー指示 2026-10-11）。変えるときは、ここの文字列だけを直す。
 */
export const FEATURE_KIND_SINGLE = "特集記事";
export const FEATURE_KIND_ROUNDUP = "まとめ記事";
/** まとめ記事の小見出し */
export const FEATURE_ROUNDUP_SCENE = "利用シーン別";
export const FEATURE_ROUNDUP_WALK = "街歩き・コース";

/** 一覧ページの棚の位置（記事ページのパンくずから /feature#… で飛べる） */
export const FEATURE_SHELF_SINGLE_ID = "tokushu";
export const FEATURE_SHELF_ROUNDUP_ID = "matome";

/** パンくずの行き先 */
export const FEATURE_SINGLE_HREF = `/feature#${FEATURE_SHELF_SINGLE_ID}`;
export const FEATURE_ROUNDUP_HREF = `/feature#${FEATURE_SHELF_ROUNDUP_ID}`;

/** 棚の説明（平易に。造語を使わない） */
export const FEATURE_SINGLE_NOTE = "店を 1 軒ずつ、視点を分けて紹介する記事です。";
export const FEATURE_ROUNDUP_NOTE = "複数の店や、街の歩き方をまとめた記事です。";
