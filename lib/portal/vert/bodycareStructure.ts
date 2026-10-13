/**
 * ボディケアのサイト構成の切り替え(1 か所)。オーナー決定(2026-10-13)「ボディケアはビューティとサイト構成同じでいい」:
 *   "search" … 最初のページ → さがす(/bodycare/search)→ 店のページ(1 店 1 ページ)の 3 つにまとめる。
 *               最初のページの種類・エリア・利用シーンの行き先は、さがすの絞り込み。種類・エリア・利用シーン・特集のページは、さがす/店のページへの恒久の転送(308)。
 *   "legacy" … 今のまま(種類・エリア・利用シーンのページが主役。/bodycare/search は 404)。
 * いま "legacy"(本番は今のまま)。見本(Vercel のプレビュー=VERCEL_ENV が preview)と、ローカルで BODYCARE_SEARCH_PREVIEW=1 のときだけ "search" 相当になる。
 * 本番に出すときは、依頼者がここを "search" に替えて再デプロイする(ビルド時に読む)。
 */
export type BodycareStructure = "legacy" | "search";
export const BODYCARE_STRUCTURE: BodycareStructure = "legacy";

export function bodycareSearchOn(): boolean {
  return BODYCARE_STRUCTURE === "search" || process.env.VERCEL_ENV === "preview" || process.env.BODYCARE_SEARCH_PREVIEW === "1";
}
