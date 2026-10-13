/**
 * ボディケアのサイト構成の切り替え(1 か所)。オーナー決定(2026-10-13)「ボディケアはビューティとサイト構成同じでいい」:
 *   "search" … 最初のページ → さがす(/bodycare/search)→ 店のページ(1 店 1 ページ)の 3 つにまとめる。
 *               最初のページの種類・エリア・利用シーンの行き先は、さがすの絞り込み。種類・エリア・利用シーン・特集のページは、さがす/店のページへの恒久の転送(308)。
 *   "legacy" … 今のまま(種類・エリア・利用シーンのページが主役。/bodycare/search は 404)。
 * いま "search"(2026-10-13 オーナー「いいよ公開して」。公開版 release/bodycare-shop)。"legacy" に戻すと本番は今までどおり(さがす 404・転送なし)。
 * 見本(Vercel のプレビュー=VERCEL_ENV が preview)と、ローカルで BODYCARE_SEARCH_PREVIEW=1 のときは、定数が "legacy" でも "search" 相当になる。
 * ビルド時に読む(next.config.ts の転送の表もここを見る)。
 */
export type BodycareStructure = "legacy" | "search";
export const BODYCARE_STRUCTURE: BodycareStructure = "search";

/**
 * ボディケアの店のページ(/bodycare/shop/<id>)の案を選ぶ(1 か所)。ビルド時に決まり、静的に出る(?v= などの引数は読まない。111 店は静的生成のまま)。
 *   "a" … 案 A「広げる」(巻いたマットが広がる)  "b" … 案 B「回す」(筒が回る)  "c" … 案 C「転がる」(床の上の物が転がる)
 *   "legacy" … 今までの店のページ(共通の枠・写真と表の作り)
 * 選ばなかった案の部品(JS・CSS)は、店のページに載らない(next.config.ts が "bodyshop-design" の行き先をここの値の 1 案だけに向ける)。
 * 見本・ローカルでは、この値と関係なく /bodycare/shop/<id>?v=1|2|3 で 3 案を見比べられる(lib/portal/vert/bodyshopPreview.ts)。
 * 案を替えるときは、下の 1 行だけ書き換える(next.config.ts を読み直すので、dev は再起動する)。
 */
export type BodycareShopDesign = "legacy" | "a" | "b" | "c";
export const BODYCARE_SHOP_DESIGN: BodycareShopDesign = "a";

export function bodycareSearchOn(): boolean {
  return BODYCARE_STRUCTURE === "search" || process.env.VERCEL_ENV === "preview" || process.env.BODYCARE_SEARCH_PREVIEW === "1";
}
