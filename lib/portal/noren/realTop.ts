/**
 * グルメのトップ /gourmet の最初の画面（暖簾）を、リアル版にするスイッチ。軽いファイル（サーバー専用の import は足さない）。
 *
 * - NOREN_REAL_TOP が true: /gourmet の最初の画面が、リアル版の暖簾（WebGL の布・赤提灯。components/portal/noren-real/）になる。
 *   最初の画面より下（章・のぼり・特集・掲載方針・フッター）と、メタ情報（title・description・canonical）は変わらない。
 * - NOREN_REAL_TOP が false: 今までどおり、本番の暖簾（components/portal/noren/NorenHero.tsx）。出力は変わらない。
 * - 切り替え方: 下の値を書き替えて、再デプロイする（環境変数ではなく、コードの値。公開スイッチ PORTAL_LAUNCHED とは別）。
 * - 元に戻し方: false にして再デプロイする。
 * - なお、/gourmet が見えるのは公開スイッチ（PORTAL_LAUNCHED）が ON のときだけ（lib/portal/launch.ts）。OFF のあいだは 404 のまま。
 * - 見本 /proto-noren/real は、このスイッチと関係なく、いつでもリアル版（URL の ?dye= で色を替えられ、色の操作盤が出る）。
 *   本番では URL の ?dye= ?wrinkle= は効かず、色は NOREN_REAL_DYE に固定される。
 * - 店ページ・特集記事の布・提灯は、このスイッチでは変わらない（墨茶のまま）。揃えるスイッチは下の NOREN_REAL_INNER。
 */
export type NorenRealDye = "ai" | "kon" | "sumi" | "kakishibu" | "enji";

/** true で /gourmet の最初の画面がリアル版になる（公開するときはここを true にして再デプロイ） */
export const NOREN_REAL_TOP = false;

/** 本番で使う布の色: ai（藍）・kon（濃紺）・sumi（墨）・kakishibu（柿渋）・enji（臙脂） */
export const NOREN_REAL_DYE: NorenRealDye = "ai";

/**
 * 店ページ・特集記事・特集のトップの、布と提灯をリアル版にするスイッチ（入口 NOREN_REAL_TOP とは別。色は上の NOREN_REAL_DYE）。
 * - true: 店ページの屋号の暖簾（ShopHero）・特集記事の巻頭の暖簾（FeatureHero）の布が、入口と同じ見た目・同じ色になる。
 *   店ページ・特集記事の提灯は WebGL の赤提灯になる。CSS で描いた布（特集のカード・目次の札・フッターの暖簾など）の色も選んだ色に揃う。
 *   動き・大きさ・字の割り方・タイミングは変わらない（変わるのは見た目だけ）。
 * - false: 今までどおり（本番の暖簾。出力は変わらない）。元に戻すときは false にして再デプロイ。
 * - 実装: components/portal/noren-real/（clothInner.ts・lanternInner.ts・dye.css）。本番の暖簾の部品（cloth.ts・Lantern.tsx）は書き換えていない。
 */
export const NOREN_REAL_INNER = false;
