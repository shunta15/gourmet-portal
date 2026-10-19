/**
 * 総合トップ（本番の `/`。app/portal-home）の見た目の切り替え。この 1 つの定数だけで戻せる。
 *   "machi2"  … 「まち」改（components/portal/hproto/machi2。本番の形で出す）
 *   "nigiwai" … 従来の「にぎわいの輪」（components/portal/pages/home。部品は残してある）
 * 切り替えたあとは再デプロイが要る。app/portal-home/layout.tsx と page.tsx が読む。
 */
export const HOME_DESIGN: "machi2" | "nigiwai" = "machi2";
