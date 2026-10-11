/**
 * 暖簾の表示の直前で通している名前（stripTabelogScore・stripTabelogScoreList）。
 * 中身は lib/otherSiteRatings.ts に移した（食べログに限らず、ほかのサイト・サービスの点数・星・評価の高さ・件数を取り除く）。
 * データを読む層（lib/data.ts・lib/db/restaurants.ts・lib/db/features.ts）でも通しているので、ここで二重に通っても結果は変わらない。
 */
export { stripOtherSiteRating as stripTabelogScore, stripOtherSiteRatingList as stripTabelogScoreList } from "@/lib/otherSiteRatings";
