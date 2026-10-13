/**
 * ボディケアの店のページの見本 3 案(?v=1 / 2 / 3)を、URL で切り替えられるか。何も import しない定数(next.config.ts からも読む)。
 * 見本・ローカルだけ true(VERCEL_ENV が preview、またはローカルの next dev。lib/portal/launch.ts の isPreviewOrLocal と同じ条件)。
 * 本番(VERCEL_ENV=production・next build)では false: ?v= は読まれず、/bodycare/shop/<id> は今の店のページのまま(出力も静的生成もそのまま)。
 */
export const BODYSHOP_PREVIEW = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV !== "production";
