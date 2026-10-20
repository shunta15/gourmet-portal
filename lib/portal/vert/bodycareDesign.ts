/**
 * ボディケア(/bodycare 以下)の見た目の切り替え。この 1 つの定数だけで戻せる(総合トップの lib/portal/homeDesign.ts の HOME_DESIGN と同じ考え方)。
 *   "green"   … 案4「グリーン」(オーナーの見本 3 枚。components/portal/bcproto/green/)。自前のヘッダー・フッター(共通のヘッダー・縦書きラベル・丸いカーソルは隠す)。
 *   "current" … これまでの本番(最初のページ=転がし lib/portal/vert/bodycareTop.ts・店のページ=案 A lib/portal/vert/bodycareStructure.ts・探す=今の BodySearch)。
 * 切り替えたあとは再デプロイが要る(ビルド時に決まる。サーバー専用の定数)。
 * 読む所: app/bodycare/(top|cp|shop|sub)/layout.tsx・(top)/page.tsx・(cp)/search/page.tsx・components/portal/vert/bodyshop/shopPage.tsx。
 * metadata・canonical・件数ゲート(lib/seo/gate.ts)・構造化データ・サイトマップ・旧ルートの 308 転送は、どちらの値でも同じ。
 */
export type BodycareDesign = "green" | "current";
export const BODYCARE_DESIGN: BodycareDesign = "green";
