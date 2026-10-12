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

/**
 * 入口（/gourmet）の「店を、さがす。」の節（look が block のとき）の色。見本でだけ URL で替えられる（?open=dark|block。?tiles=1・?band=e|g も同じ。本番は読まない）。
 * - "dark"（既定）: 暖簾の灰墨の地・生成りの字・朱の差し色。業種のタイルは出さない（下の「七つの章」と重なるため）。帯の地図は夜の灯り（g）か、生成りの額に入れた手描き風（e）。
 * - "block": 今までの白い地・橙と紺の差し色・業種のタイルあり（帯の地図は e）。
 */
export type OpenTone = "dark" | "block";
export type OpenBand = "e" | "g";
export const OPEN_TONE: OpenTone = "dark";
/** dark のときの帯の地図の既定（?band= で替えられる） */
export const OPEN_BAND: OpenBand = "g";

export type OpenView = { tone: OpenTone; tiles: boolean; band: OpenBand };

/** URL の ?open= ?tiles= ?band= から、入口の節の見え方を決める。allowUrl が false（本番）のときは、URL を読まず既定のまま */
export function resolveOpen(p: { open?: string | null; tiles?: string | null; band?: string | null }, allowUrl: boolean): OpenView {
  const tone: OpenTone = allowUrl && (p.open === "dark" || p.open === "block") ? p.open : OPEN_TONE;
  const tiles = tone === "block" ? true : allowUrl && p.tiles === "1";
  const band: OpenBand = tone === "block" ? "e" : allowUrl && (p.band === "e" || p.band === "g") ? p.band : OPEN_BAND;
  return { tone, tiles, band };
}
