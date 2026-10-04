/**
 * 送客の計測（電話・地図・予約・店の SNS・共有のタップ数）。クライアント専用。
 *
 * Vercel Analytics の track()（@vercel/analytics。app/layout.tsx で <Analytics /> を出している）に
 * カスタムイベント shop_tap を送る。送る中身は { storeId, kind, page } の3つだけ（個人情報は送らない）。
 *   - storeId: 店 ID。店に紐づかないタップ（駅ページ・県ページの共有など）は空文字
 *   - kind:    phone | map | reserve | website | instagram | tiktok | x | facebook | line
 *              | share-line | share-x | share-facebook | share-copy | share-native
 *              | save | unsave | list-import（候補リスト。店 ID は save/unsave のときだけ。/list の共有ボタンは share-* を page=/list で送る）
 *   - page:    タップしたページのパス（クエリ・ハッシュなし。例 /restaurant/r01、/station/kyoto/祇園四条）
 * Vercel の Web Analytics が無効なとき・広告ブロックのときは window.va が無く、何も送られない（エラーにもならない）。
 * 送信の失敗でリンクの動作を止めない（try/catch）。
 */
import { track } from "@vercel/analytics";

export const TRACK_EVENT = "shop_tap";

export type TapKind =
  | "phone"
  | "map"
  | "reserve"
  | "website"
  | "instagram"
  | "tiktok"
  | "x"
  | "facebook"
  | "line"
  | "share-line"
  | "share-x"
  | "share-facebook"
  | "share-copy"
  | "share-native"
  | "save"
  | "unsave"
  | "list-import";

export interface TapPayload {
  storeId: string;
  kind: TapKind;
  page: string;
}

/** 送る値を組み立てる（テストしやすいよう送信と分けてある） */
export function tapPayload(p: { storeId?: string; kind: TapKind; page?: string }): TapPayload {
  const path = p.page ?? (typeof location !== "undefined" ? location.pathname : "");
  return { storeId: p.storeId ?? "", kind: p.kind, page: path.split(/[?#]/)[0].slice(0, 200) };
}

export function trackTap(p: { storeId?: string; kind: TapKind; page?: string }): void {
  try {
    track(TRACK_EVENT, { ...tapPayload(p) });
  } catch {
    /* 計測の失敗で画面の動作を止めない */
  }
}
