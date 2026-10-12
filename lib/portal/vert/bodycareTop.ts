/**
 * ボディケアの入口（/bodycare の最初のページ）の見た目の切り替え。サーバー専用の定数（ビルド時に決まる）。
 *   "korogashi": 「転がし」（丸めたマットの立体）。オーナー決定 2026-10-13（components/portal/vert/korogashi/KorogashiPage）。
 *   "legacy"   : これまでの、共通の入口（components/portal/VerticalHub の「整」の大きな字の画面）。
 * "legacy" にして再デプロイすれば、/bodycare はこれまでの HTML に戻る（枠は app/bodycare/(top)/layout.tsx が同じ定数で切り替える）。
 * 下の階層（種類・エリア・利用シーン・店）は、どちらでも同じ（app/bodycare/(sub)）。
 */
export type BodycareTop = "korogashi" | "legacy";
export const BODYCARE_TOP: BodycareTop = "korogashi";
