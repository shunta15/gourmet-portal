/**
 * 特集の「3 つの棚」の名称（軽いファイル。サーバー専用の import は足さない。一覧ページ・記事ページの眉書き・パンくず・入口の節が同じ文字列を読む）。
 *
 * - 特集記事 = 店 1 軒の記事（isSingleShopFeature）。一覧に出すのは featureSingle.ts の FEATURED_SINGLE_IDS の本だけ（並びもその順）。
 * - シーン別まとめ記事 = 利用シーン + 複数の店の記事（isSceneShopFeature。lib/data の FEATURES のうち）。
 * - 街歩き・コース = 上の 2 つ以外の、複数の場所を歩いてめぐる記事（lib/data の FEATURES のうち）。
 * 一覧の並びは 特集記事 → シーン別まとめ記事 → 街歩き・コース。「シーン別まとめ記事」はオーナー決定（2026-10-12）。変えるときは、ここの文字列だけを直す。
 */
export const FEATURE_KIND_SINGLE = "特集記事";
export const FEATURE_KIND_ROUNDUP = "シーン別まとめ記事";
/** 街歩き・コースの記事の棚の名称（見出しはこの語のまま） */
export const FEATURE_ROUNDUP_WALK = "街歩き・コース";
/** シーン別まとめ記事 と 街歩き・コース の両方を指すとき（絞り込みの結果・「一覧で見る」） */
export const FEATURE_KIND_ROUNDUP_ALL = `${FEATURE_KIND_ROUNDUP}・${FEATURE_ROUNDUP_WALK}`;

/** 一覧ページの棚の位置（記事ページのパンくずから /feature#… で飛べる） */
export const FEATURE_SHELF_SINGLE_ID = "tokushu";
export const FEATURE_SHELF_ROUNDUP_ID = "matome";
export const FEATURE_SHELF_WALK_ID = "walk";

/** パンくずの行き先 */
export const FEATURE_SINGLE_HREF = `/feature#${FEATURE_SHELF_SINGLE_ID}`;
export const FEATURE_ROUNDUP_HREF = `/feature#${FEATURE_SHELF_ROUNDUP_ID}`;
export const FEATURE_WALK_HREF = `/feature#${FEATURE_SHELF_WALK_ID}`;

/** 棚の説明（平易に。造語を使わない） */
export const FEATURE_SINGLE_NOTE = "店を 1 軒ずつ、視点を分けて紹介する記事です。";
export const FEATURE_ROUNDUP_NOTE = "利用シーンに合わせて、複数の店を紹介する記事です。";
export const FEATURE_WALK_NOTE = "街の歩き方や、めぐるコースをまとめた記事です。";
