/**
 * 総合トップ（本番の `/`。app/portal-home）の見た目の切り替え。この 1 つの定数だけで戻せる。
 *   "machi2"  … 「まち」改（components/portal/hproto/machi2。本番の形で出す）
 *   "nigiwai" … 従来の「にぎわいの輪」（components/portal/pages/home。部品は残してある）
 * 切り替えたあとは再デプロイが要る。app/portal-home/layout.tsx と page.tsx が読む。
 */
export const HOME_DESIGN: "machi2" | "nigiwai" = "machi2";

/**
 * machi2 の「圧迫感を減らす版」(airy.css。余白を広げ、飾りと常時の動きを減らし、地を白寄りに)を本番の `/` で使うか。
 * 2026-10-20 オーナー「圧迫感無くしたのはデフォでOK」で true。false にすれば 10/20 午前の見た目(飾りの多い版)に戻る。
 */
export const HOME_AIRY = true;
