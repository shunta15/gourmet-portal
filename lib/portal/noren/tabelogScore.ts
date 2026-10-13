/**
 * 暖簾の表示の直前で通している名前（stripTabelogScore・stripTabelogScoreList）。
 * 中身は lib/otherSiteRatings.ts に移した（食べログに限らず、ほかのサイト・サービスの点数・星・評価の高さ・件数を取り除く）。
 * データを読む層（lib/data.ts・lib/db/restaurants.ts・lib/db/features.ts）でも通しているので、ここで二重に通っても結果は変わらない。
 *
 * 2026-10-13 追加: 続けて lib/thinSentences.ts の「中身の無い文」の表（分からなかったことを書く文・調べ方の舞台裏・決まり文句・行ったふり）を文ごとに取り除く。
 * こちらは画面に出す直前だけで通す（データを読む層では通さない）。表は文の完全一致で、他サイトの評価を取り除く表（OVERRIDES）とは別。
 */
import { stripOtherSiteRating, stripOtherSiteRatingList } from "@/lib/otherSiteRatings";
import { stripThinSentences, stripThinSentencesList } from "@/lib/thinSentences";

export function stripTabelogScore(text: string): string;
export function stripTabelogScore(text: string | undefined): string | undefined;
export function stripTabelogScore(text: string | undefined): string | undefined {
  return stripThinSentences(stripOtherSiteRating(text));
}

export function stripTabelogScoreList(items: string[]): string[];
export function stripTabelogScoreList(items: string[] | undefined): string[] | undefined;
export function stripTabelogScoreList(items: string[] | undefined): string[] | undefined {
  return stripThinSentencesList(stripOtherSiteRatingList(items));
}
