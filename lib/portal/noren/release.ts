/**
 * 公開の範囲スイッチ（軽い定数だけ。サーバー専用の import を足さない）。
 * 【2026-10-11 夜の方針変更】本番への公開は中止。今は見本（プレビュー・ローカル）が基準なので、RELEASE_REST = true（入口以外の新しい部分も全部出る状態）。
 * 「入口 /gourmet だけが新しくなり、それ以外のページは今の本番（main）と同じ」に戻すとき（launch/1011-open の入口だけの版）は、RELEASE_REST と
 * NOREN_STRIP_OTHER_RATINGS を false にする（コミット 9407b370 はその状態。ヘッダーの 2 項目・検索の「さがす」の中心化なども、false では main と同じ 4 項目・今の検索に戻る）。
 *
 * - RELEASE_REST: false のあいだ、入口（/gourmet）と、入口の検索の押した先（/search?cuisine=… など。今の本番のデザインのまま。業種の選択肢が 7 つになるだけ）以外の
 *   「新しい部分」はすべて止まり、main と同じ見た目・同じ文言で出る。true にして再デプロイすると、止めていた部分が一度に出る。止めているもの:
 *   - 店ページ・特集記事ページの本物の布と提灯（realTop.ts の NOREN_REAL_INNER）
 *   - 店 1 軒の記事の新しい型（featureSingle.ts の NOREN_FEATURE_SINGLE）・利用シーン+店舗紹介の型（featureScene.ts の NOREN_FEATURE_SCENE）
 *   - 店ページ ⇔ 特集記事の切り替えの帯（PairSwitch。店ページ側は pair、記事側は NOREN_FEATURE_SINGLE が条件）
 *   - 店ページの評価まわり（「Google の評価」だけにした変更・DB の行に Google の評価を借りる変更）
 *   - 特集の一覧の 2 棚化と「特集記事」「まとめ記事」の言い方（記事ページの眉書き・パンくず・一覧の見出し）、特集の絞り込みのタグの表記ゆれの追加
 *   - エリア・シーン・検索の暖簾版（rewrites.ts の NOREN_SCENE_REWRITE・NOREN_REGION_REWRITE・NOREN_SEARCH_REWRITE）
 *   - 店ページの布の漢字の対応（shop.ts）、フッターの暖簾の並び・地域の言い方・「ショート動画」の行き先（nav.ts）
 *   - 号の名前（「2026年 春号」を日付から作る変更）、地域の数の表記（「16 地域」を数から作る変更）、店舗登録ページの文言、サイトマップの更新日
 *   - 地の色（灰墨）は入口だけ。入口以外のページの色は変えない（NorenFrame と ground.css。入口は :has(.vR-hero) で見分ける）
 * - NOREN_STRIP_OTHER_RATINGS: ほかのサイト・サービスの点数・星・評価の高さ・件数に触れた文／句を、表示するデータから取り除く処理（lib/otherSiteRatings.ts）を、
 *   データ層（lib/db/restaurants.ts・lib/db/features.ts）と暖簾の表示（店ページ・記事ページ）に掛けるか。RELEASE_REST とは別のスイッチ。false のあいだは main と同じ文で出る。
 */
export const RELEASE_REST = false; // true: 見本が基準（全部出る）／false: 入口だけを新しくする版（入口以外は main と同じ）
export const NOREN_STRIP_OTHER_RATINGS = true; // 2026-10-12 本番でも有効（オーナー指示「他サイトの評価を文章に入れるのやめて」「確定したところはどんどん公開」）
