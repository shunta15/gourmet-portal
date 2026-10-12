/**
 * 「さがす」まわりの見た目の切り替え（軽い定数と純関数だけ。fs・process.cwd() を使わない）。
 * - "block": 参考画像「G1 / TASTE THE BLOCK」の形（白い地・橙の差し色・紺の字・角の丸い札）。見本の既定
 * - "noren": 今までの暖簾の見た目（墨の地）
 * 見本（プレビュー・ローカル）でだけ、URL の ?look=noren|block で上書きできる。本番（VERCEL_ENV が production）では URL の指定を無視する
 * （呼び出し側のサーバーが allowUrl に VERCEL_ENV !== "production" を渡す）。RELEASE_REST が false のときは、いつも今までどおり（noren）。
 */
import { RELEASE_REST } from "./release";

export type Look = "block" | "noren";

/** 「さがす」のページ（/search の暖簾版）の見た目 */
export const SEARCH_LOOK: Look = "block";
/** 入口（/gourmet）の「店を、さがす。」の節の見た目 */
export const OPEN_SEARCH_LOOK: Look = "block";

export function resolveLook(base: Look, param: string | null | undefined, allowUrl: boolean): Look {
  if (!RELEASE_REST) return "noren";
  if (allowUrl && (param === "noren" || param === "block")) return param;
  return base;
}
